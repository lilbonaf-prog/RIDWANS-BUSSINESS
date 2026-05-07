import axios from "axios";
import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";

// Place order
export const placeOrder = async (req, res) => {
  try {
    const { email, items, address, paymentMethod } = req.body;

    // Get product details from database
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await productModel.findById(item.productId);

        return {
          productId: item.productId,
          name: product?.name || "Unknown",
          quantity: item.quantity,
          price: product?.price || item.price
        };
      })
    );

    // Calculate total
    const totalAmount = enrichedItems.reduce(
      (sum, item) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    );

    let reference = null;
    let authorization_url = null;

    // Online payment with Paystack
    if (paymentMethod === "Online") {
      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email,
          amount: totalAmount * 100, // Paystack uses pesewas
          currency: "GHS",
          callback_url: process.env.PAYSTACK_CALLBACK_URL
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

    // Save order
    const newOrder = new orderModel({
      userId: req.user.id,
      email,
      items: enrichedItems,
      address,
      amount: totalAmount,
      reference,
      status:
        paymentMethod === "CashOnDelivery"
          ? "Pending Delivery"
          : "Pending",
      payment: false,
      paymentMethod
    });

    await newOrder.save();

    res.json({
      success: true,
      authorization_url
    });

  } catch (error) {
    console.log("Place order error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Payment initialization failed"
    });
  }
};


// Verify payment
export const verifyOrder = async (req, res) => {
  try {
    const reference =
      req.query.reference || req.body.reference;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (response.data.data.status === "success") {

      const amountPaid =
        response.data.data.amount / 100;

      const order =
        await orderModel.findOneAndUpdate(
          { reference },
          {
            status: "Paid",
            payment: true,
            amount: amountPaid
          },
          { new: true }
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      // Clear cart after payment
      await cartModel.updateMany(
        { userId: order.userId },
        { items: [] }
      );

      // If Paystack redirected directly
      if (req.query.reference && !req.headers.token) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment-success?status=success&reference=${reference}`
        );
      }

      return res.json({
        success: true,
        order
      });

    } else {

      await orderModel.findOneAndUpdate(
        { reference },
        {
          status: "Failed",
          payment: false
        }
      );

      if (req.query.reference && !req.headers.token) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment-success?status=failed&reference=${reference}`
        );
      }

      return res.json({
        success: false,
        message: "Payment failed"
      });
    }

  } catch (error) {
    console.log("Verify payment error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Server error during verification"
    });
  }
};


// User orders
export const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({
      userId: req.user.id
    });

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: "Error"
    });
  }
};


// Admin orders
export const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: "Error"
    });
  }
};


// Update status
export const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(
      req.body.orderId,
      {
        status: req.body.status
      }
    );

    res.json({
      success: true,
      message: "Status Updated"
    });

  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: "Error"
    });
  }
};