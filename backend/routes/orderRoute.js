import express from "express";
import axios from "axios";
import crypto from "crypto";

import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import authMiddleware from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

import {
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus
} from "../controllers/orderController.js";

const router = express.Router();

// Update order status (Admin)
router.post("/status", adminAuth, updateStatus);

// List all orders (Admin)
router.get("/list", adminAuth, listOrders);

// Get logged in user orders
router.post("/userorders", authMiddleware, userOrders);

// ✅ Paystack webhook
router.post("/webhook", express.json(), async (req, res) => {
  try {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash === req.headers["x-paystack-signature"]) {
      const event = req.body;

      if (event.event === "charge.success") {
        const reference = event.data.reference;

        await orderModel.findOneAndUpdate(
          { reference },
          { status: "Paid", payment: true },
          { new: true }
        );

        console.log("Webhook payment verified:", reference);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.sendStatus(500);
  }
});

// ✅ Place order
router.post("/place", authMiddleware, async (req, res) => {
  const { email, items, address, paymentMethod } = req.body;
  const userId = req.user.id;

  try {
    // Calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    let reference = null;
    let authorization_url = null;

    if (paymentMethod === "Online") {
      try {
        const payload = {
          email,
          amount: totalAmount * 100, // Paystack expects amount in kobo/pesewas
          currency: "GHS",
          callback_url: process.env.PAYSTACK_CALLBACK_URL,
        };

        const response = await axios.post(
          "https://api.paystack.co/transaction/initialize",
          payload,
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        reference = response.data.data.reference;
        authorization_url = response.data.data.authorization_url;
      } catch (paystackError) {
        console.error("Paystack init error:", paystackError.response?.data || paystackError.message);
        return res.status(500).json({
          success: false,
          message: "Payment initialization failed",
        });
      }
    }

    // Save order
    const newOrder = new orderModel({
      userId,
      items,
      amount: totalAmount,
      address,
      status: paymentMethod === "CashOnDelivery" ? "Pending Delivery" : "Pending",
      payment: false,
      reference,
      paymentMethod,
    });

    await newOrder.save();

    // Clear cart
    await cartModel.updateMany({ userId }, { items: [] });

    // ✅ Separate responses
    if (paymentMethod === "CashOnDelivery") {
      return res.json({
        success: true,
        message: "Order placed successfully with Cash on Delivery",
      });
    } else {
      return res.json({
        success: true,
        authorization_url,
      });
    }
  } catch (error) {
    console.error("Place order error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to place order",
    });
  }
});

// Verify payment
router.all("/verify", verifyOrder);

// Delete order
router.delete("/delete/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    await orderModel.findByIdAndDelete(orderId);

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
    });
  }
});

export default router;
