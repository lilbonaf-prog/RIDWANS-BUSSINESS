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
router.post("/status", authMiddleware, adminAuth, updateStatus);


// List all orders (Admin)
router.get("/list", authMiddleware, adminAuth, listOrders);


// Get logged in user orders
router.post("/userorders", authMiddleware, userOrders);


// Paystack webhook
router.post("/webhook", express.json(), async (req, res) => {
  try {

    const hash = crypto
      .createHmac(
        "sha512",
        process.env.PAYSTACK_SECRET_KEY
      )
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash === req.headers["x-paystack-signature"]) {

      const event = req.body;

      if (event.event === "charge.success") {

        const reference =
          event.data.reference;

        await orderModel.findOneAndUpdate(
          { reference },
          {
            status: "Paid",
            payment: true
          },
          { new: true }
        );

        console.log(
          "Webhook payment verified:",
          reference
        );
      }
    }

    res.sendStatus(200);

  } catch (error) {

    console.log(
      "Webhook error:",
      error.message
    );

    res.sendStatus(500);
  }
});


// Place order
router.post(
  "/place",
  authMiddleware,
  async (req, res) => {

    try {

      const {
        email,
        items,
        address,
        paymentMethod
      } = req.body;

      const userId =
        req.user.id;

      // Calculate total
      const totalAmount =
        items.reduce(
          (sum, item) =>
            sum +
            Number(item.price) *
            Number(item.quantity),
          0
        );

      let reference = null;
      let authorization_url = null;

      // Online payment
      if (paymentMethod === "Online") {

        const response =
          await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
              email,
              amount: totalAmount * 100,
              currency: "GHS",
              callback_url:
                process.env.PAYSTACK_CALLBACK_URL
            },
            {
              headers: {
                Authorization:
                  `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type":
                  "application/json"
              }
            }
          );

        reference =
          response.data.data.reference;

        authorization_url =
          response.data.data.authorization_url;
      }

      // Save order
      const newOrder =
        new orderModel({
          userId,
          items,
          amount: totalAmount,
          address,
          status:
            paymentMethod === "CashOnDelivery"
              ? "Pending Delivery"
              : "Pending",
          payment: false,
          reference,
          paymentMethod
        });

      await newOrder.save();

      // Clear cart
      await cartModel.updateMany(
        { userId },
        { items: [] }
      );

      res.json({
        success: true,
        authorization_url
      });

    } catch (error) {

      console.log(
        "Place order error:",
        error.response?.data ||
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Payment initialization failed"
      });
    }
  }
);


// Verify payment
router.all(
  "/verify",
  verifyOrder
);


// Delete order
router.delete(
  "/delete/:id",
  async (req, res) => {

    try {

      const orderId =
        req.params.id;

      await orderModel.findByIdAndDelete(
        orderId
      );

      res.json({
        success: true,
        message:
          "Order deleted successfully"
      });

    } catch (error) {

      console.log(
        "Delete order error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete order"
      });
    }
  }
);

export default router;