import mongoose from "mongoose";

// ==========================================
// RIDWAN BUSINESS
// ORDER DATABASE MODEL
// ==========================================

// ==========================================
// ORDER ITEM SCHEMA
// ==========================================

const itemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },

  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    default: "",
  },

  quantity: {
    type: Number,
    required: true,
    min: 1,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

// ==========================================
// DELIVERY ADDRESS SCHEMA
// ==========================================

const addressSchema = new mongoose.Schema({
  recipientName: {
    type: String,
    required: true,
  },

  street: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },

  region: {
    type: String,
    required: true,
  },

  digitalAddress: {
    type: String,
    default: "",
  },

  phone: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    default: "",
  },

  notes: {
    type: String,
    default: "",
  },
});

// ==========================================
// MAIN ORDER SCHEMA
// ==========================================

const orderSchema = new mongoose.Schema(
  {
    // ======================================
    // CUSTOMER INFORMATION
    // ======================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // ======================================
    // ORDERED PRODUCTS
    // ======================================

    items: [itemSchema],

    // ======================================
    // ORDER AMOUNT
    // ======================================

    // Total order amount in Ghana cedis.
    // The backend must calculate this
    // using actual MongoDB product prices.

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ======================================
    // DELIVERY INFORMATION
    // ======================================

    address: addressSchema,

    // ======================================
    // ORDER STATUS
    // ======================================

    status: {
      type: String,
      default: "Product Processing",
    },

    date: {
      type: Date,
      default: Date.now,
    },

    // ======================================
    // PAYMENT CONFIRMATION
    // ======================================

    // Only set to true after successful
    // verification with Paystack.
    //
    // Cash on Delivery orders remain unpaid
    // until payment is recorded separately.

    payment: {
      type: Boolean,
      default: false,
    },

    // ======================================
    // PAYSTACK TRANSACTION REFERENCE
    // ======================================

    // Unique reference assigned to an
    // online payment transaction.
    //
    // Optional for Cash on Delivery and
    // compatibility with older orders.

    reference: {
      type: String,
    },

    // ======================================
    // PAYSTACK AUTHORIZATION URL
    // ======================================

    // Stores the payment link returned
    // when Paystack initialization succeeds.
    //
    // Allows an existing checkout attempt
    // to recover its payment link without
    // creating another order.
    //
    // This URL must only be returned to
    // the appropriate authenticated customer.

    paymentAuthorizationUrl: {
      type: String,
      default: undefined,
    },

    // ======================================
    // PAYMENT INITIALIZATION DATE
    // ======================================

    // Records when Paystack successfully
    // initialized this payment transaction.

    paymentInitializedAt: {
      type: Date,
      default: null,
    },

    // ======================================
    // CHECKOUT IDEMPOTENCY KEY
    // ======================================

    // Identifies a single checkout attempt.
    //
    // Customers must reuse the same key
    // when retrying the same checkout.
    //
    // Optional for compatibility with
    // previously created orders.
    //
    // MongoDB Atlas already has the
    // following unique partial index:
    //
    // uniq_user_checkoutKey
    //
    // Indexed fields:
    // userId + checkoutKey
    //
    // The index prevents the same customer
    // from storing multiple orders with
    // the same checkout key.

    checkoutKey: {
      type: String,
      trim: true,
      maxlength: 100,
      default: undefined,
    },

    // ======================================
    // PAYMENT METHOD
    // ======================================

    // Online = Paystack
    // CashOnDelivery = Payment on Delivery

    paymentMethod: {
      type: String,
      enum: ["Online", "CashOnDelivery"],
      default: "Online",
    },

    // ======================================
    // PAYMENT CONFIRMATION DATE
    // ======================================

    // Records when payment is successfully
    // verified and confirmed.

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    // Automatically stores:
    // createdAt
    // updatedAt

    timestamps: true,
  }
);

// ==========================================
// EXPORT ORDER MODEL
// ==========================================

// Avoid overwriting the Mongoose model
// if the application is reloaded.

const orderModel =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);

export default orderModel;