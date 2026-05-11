import mongoose from "mongoose";

// Define item schema
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },       // product name
  description: { type: String },                // ✅ product description
  quantity: { type: Number, required: true },   // how many
  price: { type: Number, required: true }       // unit price
});

// Define address schema
const addressSchema = new mongoose.Schema({
  recipientName: { type: String, required: true },   // Full name
  street: { type: String, required: true },
  city: { type: String, required: true },
  region: { type: String, required: true },
  digitalAddress: { type: String },                  // GhanaPost GPS / Digital Address
  phone: { type: String, required: true },
  email: { type: String },                           // Optional
  notes: { type: String }                            // Optional
});

// Define order schema
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [itemSchema],
  amount: { type: Number, required: true },
  address: addressSchema,
  status: { type: String, default: "Product Processing" },
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, default: false },
  reference: { type: String },  // optional
  paymentMethod: {              // payment type
    type: String,
    enum: ["Online", "CashOnDelivery"],
    default: "Online"
  }
}, { timestamps: true });

const orderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default orderModel;
