import express from "express";
import axios from "axios";
import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js"; // ✅ import cart model
import { verifyOrder, userOrders, listOrders } from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// list oders in admin panel
router.get('/list',listOrders)

// ✅ Fetch user orders (requires token)
router.post("/userorders", authMiddleware, userOrders);

// ✅ Place order (requires token)
router.post("/place", authMiddleware, async (req, res) => {
  try {
    const { email, items, address } = req.body;
    const userId = req.user.id; // ✅ guaranteed by authMiddleware

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: totalAmount * 100, // Paystack expects amount in kobo/pesewas
        currency: "GHS",
        callback_url: "http://localhost:5173/payment-success"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reference = response.data.data.reference;

    // ✅ Save full order details
    const newOrder = new orderModel({
      userId,
      items,
      amount: totalAmount,
      address: {
        recipientName: address.recipientName,
        street: address.street,
        city: address.city,
        region: address.region,
        digitalAddress: address.digitalAddress, // GhanaPost GPS
        phone: address.phone,
        email: address.email,
        notes: address.notes
      },
      status: "Product Processing",
      payment: false,
      reference
    });

    await newOrder.save();

    // ✅ Clear cart in DB after placing order
    await cartModel.deleteMany({ userId });

    res.json({
      success: true,
      authorization_url: response.data.data.authorization_url
    });
  } catch (error) {
    console.error("Paystack init error:", error.response?.data || error.message);
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
      await orderModel.findOneAndUpdate(
        { reference },
        { status: "Paid", payment: true }
      );
      return res.redirect(`http://localhost:5173/payment-success?reference=${reference}`);
    } else {
      await orderModel.findOneAndUpdate(
        { reference },
        { status: "Failed", payment: false }
      );
      return res.redirect("http://localhost:5173/payment-success?reference=failed");
    }
  } catch (error) {
    console.error("Verification error:", error.response?.data || error.message);
    res.status(500).send("Verification error");
  }
});

export default router;