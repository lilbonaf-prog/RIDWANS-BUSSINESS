import axios from "axios";
import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js"; // ✅ import product model

// Place order (initialize Paystack payment)
export const placeOrder = async (req, res) => {
  try {
    const { email, items, address } = req.body;

    // ✅ Enrich items with product details from DB
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

    console.log("Paystack key being used:", process.env.PAYSTACK_SECRET_KEY);

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: totalAmount * 100,
        currency: "GHS",
        // ✅ Redirect user to frontend after payment
         callback_url: "http://localhost:4000/api/order/verify"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }

    );





    // ✅ Save order with enriched items
    const newOrder = new orderModel({
      userId: req.user.id, // decoded from token middleware
      email,
      items: enrichedItems,
      address,
      amount: totalAmount, // ✅ use "amount" to match schema
      reference: response.data.data.reference,
      status: "Pending",
      payment: false
    });

    await newOrder.save();

    res.json({
      success: true,
      authorization_url: response.data.data.authorization_url
    });
  } catch (error) {
    console.error("Paystack init error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Payment initialization failed" });
  }
};

// Verify order (after Paystack callback)
export const verifyOrder = async (req, res) => {
  const { reference } = req.body;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
    

    if (response.data.data.status === "success") {
      // ✅ Convert amount from pesewas/kobo to main currency unit
      const amountPaid = response.data.data.amount / 100;

      // ✅ Mark order as paid and update amount
      const order = await orderModel.findOneAndUpdate(
        { reference },
        { status: "Paid", payment: true, amount: amountPaid },
        { returnDocument: 'after' }
      );

      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      // ✅ Clear cart after successful payment
      await cartModel.findOneAndUpdate(
        { userId: order.userId },
        { items: {} }
      );

      return res.json({ success: true, order });
    } else {
      // ❌ Mark order as failed
      const order = await orderModel.findOneAndUpdate(
        { reference },
        { status: "Failed", payment: false },
         { returnDocument: 'after' }
      );

      return res.json({ success: false, order });
    }
  } catch (error) {
    console.error("Payment verification error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Server error during verification" });
  }
};


// User orders for frontend
export const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.user.id });
        // 🔍 Debug log
    console.log("Orders fetched for user:", orders);

    res.json({ success: true, data: { orders } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Listing orders for admin panel
export const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// api for updating order status
export const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status })
    res.json({ success: true, message: "Status Updated" })
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Errror" })

  }
}