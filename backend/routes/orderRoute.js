import express from "express";
import axios from "axios";
import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js"; // ✅ import cart model
import { verifyOrder, userOrders, listOrders, updateStatus } from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";
import crypto from "crypto";

const router = express.Router();

router.post('/status',updateStatus)

// list oders in admin panel
router.get('/list',listOrders)

// ✅ Fetch user orders (requires token)
router.post("/userorders", authMiddleware, userOrders);



// ✅ Paystack webhook
router.post("/webhook", express.json(), async (req, res) => {
  const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
                     .update(JSON.stringify(req.body))
                     .digest("hex");

  if (hash === req.headers["x-paystack-signature"]) {
    const event = req.body;

    // Only handle successful transactions
    if (event.event === "charge.success") {
      const reference = event.data.reference;

      // ✅ Update order in MongoDB
      await orderModel.findOneAndUpdate(
        { reference },
        { status: "Paid", payment: true },
        { returnDocument: "after" }
      );

      console.log("Webhook verified payment:", reference);
    }
  }

  res.sendStatus(200); // Always respond 200 so Paystack knows you received it
});


// ✅ Place order (requires token)
router.post("/place", authMiddleware, async (req, res) => {
  try {
    const { email, items, address, paymentMethod } = req.body; // ✅ include paymentMethod
    const userId = req.user.id;

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let reference = null;
    let authorization_url = null;

    // ✅ Only initialize Paystack if Online
    if (paymentMethod === "Online") {
      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email,
          amount: totalAmount * 100,
          currency: "GHS",
          callback_url: "https://ridwanbusiness.com/payment-success"
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      reference = response.data.data.reference;
      authorization_url = response.data.data.authorization_url;
    }

    // ✅ Save order with correct paymentMethod
    const newOrder = new orderModel({
      userId,
      items,
      amount: totalAmount,
      address: {
        recipientName: address.recipientName,
        street: address.street,
        city: address.city,
        region: address.region,
        digitalAddress: address.digitalAddress,
        phone: address.phone,
        email: address.email,
        notes: address.notes
      },
      status: paymentMethod === "CashOnDelivery" ? "Pending Delivery" : "Product Processing",
      payment: false,
      reference,
      paymentMethod   // ✅ now saved correctly
    });

    await newOrder.save();
    await cartModel.deleteMany({ userId });

    res.json({
      success: true,
      authorization_url   // will be null for COD
    });
  } catch (error) {
    console.error("Place order error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Payment initialization failed" });
  }
});


// ✅ Verify order (frontend manual call)
router.post("/verify", verifyOrder);

// ✅ Verify transaction (Paystack callback)
router.get("/verify", async (req, res) => {
  const { reference } = req.query;
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

        if (response.data.data.status === "success") {
      // ✅ Mark order as paid
      await orderModel.findOneAndUpdate(
        { reference },
        { status: "Paid", payment: true },
        { returnDocument: "after" } // modern option
      );

      // ✅ Redirect to payment-success page
      return res.redirect(`https://ridwanbusiness.com/payment-success?reference=${reference}`);
    } else {
      // ❌ Mark order as failed
      await orderModel.findOneAndUpdate(
        { reference },
        { status: "Failed", payment: false },
        { returnDocument: "after" }
      );

      // ✅ Redirect to payment-success page with failure flag
      return res.redirect("http://ridwanbusiness.com/payment-success?reference=failed");
    }
  } catch (error) {
    console.error("Verification error:", error.response?.data || error.message);
    res.status(500).send("Verification error");
  }
});

// ✅ Delete order (admin only)
router.delete("/delete/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    await orderModel.findByIdAndDelete(orderId);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete order" });
  }
});

export default router;