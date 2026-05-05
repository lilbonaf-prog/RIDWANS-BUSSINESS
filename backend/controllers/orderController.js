import axios from "axios";
import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";

// Place order (initialize Paystack payment)
export const placeOrder = async (req, res) => {
  try {
    const { email, items, address, paymentMethod } = req.body;

    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await productModel.findById(item.productId);
        return {
          productId: item.productId,
          name: product ? product.name : "Unknown",
          quantity: item.quantity,
          price: product ? product.price : item.price
        };
      })
    );

    const totalAmount = enrichedItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
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
      userId: req.user.id,
      email,
      items: enrichedItems,
      address,
      amount: totalAmount,
      reference,
      status: paymentMethod === "CashOnDelivery" ? "Pending Delivery" : "Pending",
      payment: false,
      paymentMethod
    });

    await newOrder.save();

    res.json({
      success: true,
      authorization_url
    });
  } catch (error) {
    console.error("Place order error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Payment initialization failed" });
  }
};

// Verify order (Paystack callback OR frontend manual call)
export const verifyOrder = async (req, res) => {
  // Accept reference from query (Paystack redirect) OR body (frontend POST)
  const reference = req.query.reference || req.body.reference;
  console.log("🔍 Verifying reference:", reference);

  // Check if secret key is loaded
  console.log("🔑 Paystack key loaded:", !!process.env.PAYSTACK_SECRET_KEY);

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    // Log full Paystack response
    console.log("📦 Paystack verify response:", response.data);

    if (response.data.data.status === "success") {
      const amountPaid = response.data.data.amount / 100;

      const order = await orderModel.findOneAndUpdate(
        { reference },
        { status: "Paid", payment: true, amount: amountPaid },
        { returnDocument: "after" }
      );

      if (!order) {
        console.log("⚠️ Order not found for reference:", reference);
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      await cartModel.updateMany({ userId: order.userId }, { items: [] });
      console.log("✅ Order updated and cart cleared for user:", order.userId);

      // If Paystack redirected, send user back to frontend
      if (req.query.reference) {
        return res.redirect(`https://ridwanbusiness.com/payment-success?status=success&reference=${reference}`);
      }

      // If frontend called manually, return JSON
      return res.json({ success: true, order });
    } else {
      await orderModel.findOneAndUpdate(
        { reference },
        { status: "Failed", payment: false },
        { returnDocument: "after" }
      );

      console.log("❌ Payment failed for reference:", reference);

      if (req.query.reference) {
        return res.redirect(`https://ridwanbusiness.com/payment-success?status=failed&reference=${reference}`);
      }

      return res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.error("💥 Payment verification error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Server error during verification" });
  }
};


// User orders
export const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.user.id });
    console.log("Orders fetched for user:", orders);
    res.json({ success: true, data: { orders } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Admin list orders
export const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Update order status
export const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
