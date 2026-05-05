import express from "express";
import axios from "axios";
import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import { verifyOrder, userOrders, listOrders, updateStatus } from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";
import crypto from "crypto";

const router = express.Router();

router.post("/status", updateStatus);

// list orders in admin panel
router.get("/list", listOrders);

// ✅ Fetch user orders (requires token)
router.post("/userorders", authMiddleware, userOrders);

// ✅ Paystack webhook
router.post("/webhook", express.json(), async (req, res) => {
  const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash === req.headers["x-paystack-signature"]) {
    const event = req.body;

    if (event.event === "charge.success") {
      const reference = event.data.reference;

      await orderModel.findOneAndUpdate(
        { reference },
        { status: "Paid", payment: true },
        { returnDocument: "after" }
      );

      console.log("Webhook verified payment:", reference);
    }
  }

  res.sendStatus(200);
});

// ✅ Place order (requires token)
router.post("/place", authMiddleware, async (req, res) => {
  try {
    const { email, items, address, paymentMethod } = req.body;
    const userId = req.user.id;

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let reference = null;
    let authorization_url = null;

    if (paymentMethod === "Online") {
      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email,
          amount: totalAmount * 100,
          currency: "GHS",
          callback_url: "https://api.ridwanbusiness.com/api/order/verify"
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

    const newOrder = new orderModel({
      userId,
      items,
      amount: totalAmount,
      address,
      status: paymentMethod === "CashOnDelivery" ? "Pending Delivery" : "Pending",
      payment: false,
      reference,
      paymentMethod
    });

    await newOrder.save();
    await cartModel.deleteMany({ userId });

    res.json({
      success: true,
      authorization_url
    });
  } catch (error) {
    console.error("Place order error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Payment initialization failed" });
  }
});

// ✅ Single verify route (works for both Paystack redirect and frontend POST)
router.all("/verify", verifyOrder);

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
