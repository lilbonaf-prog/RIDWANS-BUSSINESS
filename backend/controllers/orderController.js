import axios from "axios";
import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";

// ✅ Place order
export const placeOrder = async (req, res) => {
  const { email, items, address, paymentMethod } = req.body;

  try {
    // Enrich items with product details
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await productModel.findById(item.productId);
        return {
          productId: item.productId,
          name: product?.name || "Unknown",
          description: product?.description || "",
          quantity: item.quantity,
          price: product?.price || item.price,
        };
      })
    );

    // Calculate total
    const totalAmount = enrichedItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    let reference = null;
    let authorization_url = null;

    // ✅ Online payment branch
    if (paymentMethod === "Online") {
      try {
        const response = await axios.post(
          "https://api.paystack.co/transaction/initialize",
          {
            email,
            amount: totalAmount * 100, // Paystack expects amount in pesewas/kobo
            currency: "GHS",
            callback_url: process.env.PAYSTACK_CALLBACK_URL,
          },
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

    // ✅ Save order
    const newOrder = new orderModel({
      userId: req.user.id,
      email,
      items: enrichedItems,
      address,
      amount: totalAmount,
      reference,
      status: paymentMethod === "CashOnDelivery" ? "Pending Delivery" : "Pending",
      payment: false,
      paymentMethod,
    });

    await newOrder.save();

    // Clear cart
    await cartModel.updateMany({ userId: req.user.id }, { items: [] });

    // ✅ Separate responses
    if (paymentMethod === "CashOnDelivery") {
      return res.json({
        success: true,
        message: "Order placed successfully with Cash on Delivery",
        order: newOrder,
      });
    } else {
      return res.json({
        success: true,
        authorization_url,
      });
    }
  } catch (error) {
    console.error("Place order error:", error.message);

    // ✅ Different error messages for COD vs Online
    if (paymentMethod === "CashOnDelivery") {
      return res.status(500).json({
        success: false,
        message: "Failed to place Cash on Delivery order",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Payment initialization failed",
      });
    }
  }
};

// ✅ Verify payment
export const verifyOrder = async (req, res) => {
  try {
    const reference = req.query.reference || req.body.reference;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data.data.status === "success") {
      const amountPaid = response.data.data.amount / 100;

      const order = await orderModel.findOneAndUpdate(
        { reference },
        { status: "Paid", payment: true, amount: amountPaid },
        { returnDocument: "after" }
      );

      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      await cartModel.updateMany({ userId: order.userId }, { items: [] });

      if (req.query.reference && !req.headers.token) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment-success?status=success&reference=${reference}`
        );
      }

      return res.json({ success: true, order });
    } else {
      await orderModel.findOneAndUpdate(
        { reference },
        { status: "Failed", payment: false }
      );

      if (req.query.reference && !req.headers.token) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/payment-success?status=failed&reference=${reference}`
        );
      }

      return res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.error("Verify payment error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Server error during verification",
    });
  }
};

// ✅ User orders
export const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.user.id });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("User orders error:", error.message);
    res.json({ success: false, message: "Error fetching user orders" });
  }
};

// ✅ Admin orders
export const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("List orders error:", error.message);
    res.json({ success: false, message: "Error fetching orders" });
  }
};

// ✅ Update status
export const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.error("Update status error:", error.message);
    res.json({ success: false, message: "Error updating status" });
  }
};
