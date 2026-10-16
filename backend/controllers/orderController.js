import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";

import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

// ==========================================
// RIDWAN BUSINESS
// ORDER & PAYMENT CONTROLLER
// ==========================================

const PAYSTACK_URL = "https://api.paystack.co";

// ==========================================
// HELPERS
// ==========================================

const cleanText = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeEmail = (value) =>
  cleanText(value).toLowerCase();

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const isValidProductId = (value) =>
  typeof value === "string" &&
  /^[a-f0-9]{24}$/i.test(value);

const isValidCheckoutKey = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );

const toPesewas = (amount) => {
  const value = Number(amount);
  const result = Math.round(value * 100);

  if (
    !Number.isFinite(value) ||
    value < 0 ||
    !Number.isSafeInteger(result) ||
    Math.abs(result / 100 - value) > 0.000001
  ) {
    throw createError("Invalid product price.");
  }

  return result;
};

// ==========================================
// VALIDATE REQUESTED PRODUCTS
// ==========================================

const normalizeItems = (items) => {
  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    items.length > 100
  ) {
    throw createError("Your order must contain valid products.");
  }

  const requestedItems = new Map();

  for (const item of items) {
    const productId = cleanText(item?.productId).toLowerCase();
    const quantity = Number(item?.quantity);

    if (
      !isValidProductId(productId) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 1000 ||
      requestedItems.has(productId)
    ) {
      throw createError("Invalid product or quantity.");
    }

    requestedItems.set(productId, quantity);
  }

  return requestedItems;
};

// ==========================================
// NORMALIZE DELIVERY ADDRESS
// ==========================================

const normalizeAddress = (address, email) => {
  const recipientName =
    cleanText(address?.recipientName) ||
    [
      cleanText(address?.firstName),
      cleanText(address?.lastName),
    ]
      .filter(Boolean)
      .join(" ");

  const result = {
    recipientName,
    street: cleanText(address?.street),
    city: cleanText(address?.city),
    region: cleanText(address?.region),
    digitalAddress: cleanText(address?.digitalAddress),
    phone: cleanText(address?.phone),
    email: normalizeEmail(email),
    notes: cleanText(address?.notes),
  };

  if (
    !result.recipientName ||
    !result.street ||
    !result.city ||
    !result.region ||
    !result.phone ||
    !result.email
  ) {
    throw createError("Please complete your delivery information.");
  }

  return result;
};

// ==========================================
// CHECK SAVED CART
// ==========================================

const cartMatchesRequest = (cartData, requestedItems) => {
  const savedItems = Object.entries(cartData || {}).filter(
    ([, quantity]) => Number(quantity) > 0
  );

  if (savedItems.length !== requestedItems.size) {
    return false;
  }

  return savedItems.every(
    ([productId, quantity]) =>
      requestedItems.get(productId.toLowerCase()) ===
      Number(quantity)
  );
};

// ==========================================
// CHECK REPEATED CHECKOUT REQUEST
// ==========================================

const orderMatchesRequest = (
  order,
  requestedItems,
  address,
  paymentMethod
) => {
  if (order.paymentMethod !== paymentMethod) {
    return false;
  }

  if (!Array.isArray(order.items)) {
    return false;
  }

  if (order.items.length !== requestedItems.size) {
    return false;
  }

  const productsMatch = order.items.every(
    (item) =>
      item.productId &&
      requestedItems.get(String(item.productId)) ===
        Number(item.quantity)
  );

  if (!productsMatch) {
    return false;
  }

  const savedAddress = order.address || {};

  return [
    "recipientName",
    "street",
    "city",
    "region",
    "digitalAddress",
    "phone",
    "email",
    "notes",
  ].every(
    (field) =>
      cleanText(savedAddress[field]) ===
      cleanText(address[field])
  );
};

// ==========================================
// MONGODB TRANSACTION HELPER
// ==========================================

const runTransaction = async (operation) => {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(
      async () => {
        result = await operation(session);
      },
      {
        readConcern: {
          level: "snapshot",
        },
        writeConcern: {
          w: "majority",
        },
      }
    );

    return result;
  } finally {
    await session.endSession();
  }
};

// ==========================================
// REMOVE PURCHASED CART QUANTITIES
// ==========================================

// Must be called inside a transaction.
//
// This does not clear the whole cart.
// It subtracts only the purchased quantities
// from the current cart.

const removePurchasedItems = async (
  userId,
  items,
  session
) => {
  if (items.some((item) => !item.productId)) {
    // Legacy orders may not contain product IDs.
    // Do not guess which cart items to remove.

    return false;
  }

  const user = await userModel
    .findById(userId)
    .select("cartData")
    .session(session)
    .lean();

  if (!user) {
    throw createError("Customer account not found.", 404);
  }

  const increments = {};
  const unsetFields = {};

  for (const item of items) {
    const productId = String(item.productId);
    const purchased = Number(item.quantity);
    const available = Number(user.cartData?.[productId] || 0);

    if (!Number.isInteger(purchased) || purchased < 1) {
      throw createError("Invalid purchased quantity.");
    }

    if (available <= 0) {
      continue;
    }

    const field = `cartData.${productId}`;

    if (available > purchased) {
      increments[field] = -purchased;
    } else {
      unsetFields[field] = "";
    }
  }

  const update = {};

  if (Object.keys(increments).length > 0) {
    update.$inc = increments;
  }

  if (Object.keys(unsetFields).length > 0) {
    update.$unset = unsetFields;
  }

  if (Object.keys(update).length > 0) {
    await userModel.updateOne(
      { _id: userId },
      update,
      { session }
    );
  }

  return true;
};

// ==========================================
// HANDLE EXISTING CHECKOUT
// ==========================================

const respondToExistingCheckout = (
  res,
  order,
  requestedItems,
  address,
  paymentMethod
) => {
  if (
    !orderMatchesRequest(
      order,
      requestedItems,
      address,
      paymentMethod
    )
  ) {
    return res.status(409).json({
      success: false,
      message:
        "This checkout key belongs to a different order. Please review your checkout.",
    });
  }

  // Cash on Delivery order already created.

  if (paymentMethod === "CashOnDelivery") {
    return res.status(200).json({
      success: true,
      message: "This order has already been placed.",
      orderId: order._id,
      alreadyExists: true,
      cartSynchronized: true,
    });
  }

  // Online payment already confirmed.

  if (order.payment === true) {
    return res.status(409).json({
      success: false,
      message:
        "This order has already been paid. Please check My Orders.",
    });
  }

  // Return the original payment link.

  if (order.paymentAuthorizationUrl) {
    return res.status(200).json({
      success: true,
      message: "Existing checkout recovered.",
      orderId: order._id,
      reference: order.reference,
      authorization_url: order.paymentAuthorizationUrl,
      alreadyExists: true,
    });
  }

  // Do not create a second transaction when
  // the previous initialization is uncertain.

  return res.status(409).json({
    success: false,
    message:
      "This checkout already exists, but its payment link is not available. Please check My Orders or contact support before trying again.",
  });
};

// ==========================================
// 1. PLACE ORDER
// ==========================================

export const placeOrder = async (req, res) => {
  let checkoutKey;

  try {
    const userId = req.user.id;

    const {
      items,
      address,
      paymentMethod,
    } = req.body || {};

    checkoutKey = cleanText(req.body?.checkoutKey);

    // ======================================
    // VALIDATE CHECKOUT KEY
    // ======================================

    if (!isValidCheckoutKey(checkoutKey)) {
      return res.status(400).json({
        success: false,
        message:
          "A valid checkout key is required. Please refresh the checkout page.",
      });
    }

    // ======================================
    // VALIDATE PAYMENT METHOD
    // ======================================

    if (
      paymentMethod !== "Online" &&
      paymentMethod !== "CashOnDelivery"
    ) {
      throw createError("Invalid payment method.");
    }

    // ======================================
    // VALIDATE ITEMS
    // ======================================

    const requestedItems = normalizeItems(items);

    // ======================================
    // LOAD CUSTOMER
    // ======================================

    const user = await userModel.findById(userId);

    if (!user) {
      throw createError("Customer account not found.", 404);
    }

    const email = normalizeEmail(
      req.body.email || address?.email || user.email
    );

    const deliveryAddress = normalizeAddress(
      address,
      email
    );

    // ======================================
    // CHECK EXISTING ORDER FIRST
    // ======================================

    // This must happen before cart validation.
    //
    // The cart may already have been updated
    // after the original successful order.

    const existingOrder = await orderModel.findOne({
      userId,
      checkoutKey,
    });

    if (existingOrder) {
      return respondToExistingCheckout(
        res,
        existingOrder,
        requestedItems,
        deliveryAddress,
        paymentMethod
      );
    }

    // ======================================
    // VALIDATE CURRENT CART
    // ======================================

    if (!cartMatchesRequest(user.cartData, requestedItems)) {
      return res.status(409).json({
        success: false,
        message:
          "Your shopping cart has changed. Please refresh your cart and try again.",
      });
    }

    // ======================================
    // GET TRUSTED PRODUCT PRICES
    // ======================================

    const productIds = [...requestedItems.keys()];

    const products = await productModel
      .find({
        _id: { $in: productIds },
      })
      .lean();

    if (products.length !== productIds.length) {
      throw createError(
        "Some products are no longer available."
      );
    }

    const productMap = new Map(
      products.map((product) => [
        String(product._id),
        product,
      ])
    );

    let totalPesewas = 0;

    const trustedItems = productIds.map((productId) => {
      const product = productMap.get(productId);
      const quantity = requestedItems.get(productId);

      const unitPesewas = toPesewas(product.price);

      totalPesewas += unitPesewas * quantity;

      return {
        productId: product._id,
        name: product.name,
        description: product.description || "",
        quantity,
        price: unitPesewas / 100,
      };
    });

    if (
      totalPesewas <= 0 ||
      !Number.isSafeInteger(totalPesewas)
    ) {
      throw createError("Invalid order total.");
    }

    const totalAmount = totalPesewas / 100;

    // ======================================
    // CASH ON DELIVERY
    // ======================================

    if (paymentMethod === "CashOnDelivery") {
      const order = await runTransaction(async (session) => {
        // Check the cart again inside the
        // transaction to avoid stale reads.

        const currentUser = await userModel
          .findById(userId)
          .session(session)
          .lean();

        if (!currentUser) {
          throw createError(
            "Customer account not found.",
            404
          );
        }

        if (
          !cartMatchesRequest(
            currentUser.cartData,
            requestedItems
          )
        ) {
          throw createError(
            "Your shopping cart has changed. Please refresh it.",
            409
          );
        }

        const [createdOrder] = await orderModel.create(
          [
            {
              userId,
              email,
              items: trustedItems,
              amount: totalAmount,
              address: deliveryAddress,
              paymentMethod: "CashOnDelivery",
              checkoutKey,
              payment: false,
              status: "Pending Delivery",
            },
          ],
          { session }
        );

        await removePurchasedItems(
          userId,
          trustedItems,
          session
        );

        return createdOrder;
      });

      return res.status(201).json({
        success: true,
        message: "Cash on Delivery order placed successfully.",
        orderId: order._id,
        cartSynchronized: true,
      });
    }

    // ======================================
    // PAYSTACK ONLINE PAYMENT
    // ======================================

    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw createError(
        "Online payment is temporarily unavailable.",
        503
      );
    }

    const reference =
      `RB-${crypto.randomBytes(16).toString("hex")}`;

    // Create the order before contacting Paystack.

    const order = await orderModel.create({
      userId,
      email,
      items: trustedItems,
      amount: totalAmount,
      address: deliveryAddress,
      paymentMethod: "Online",
      checkoutKey,
      reference,
      payment: false,
      status: "Pending",
    });

    // ======================================
    // INITIALIZE PAYSTACK
    // ======================================

    try {
      const payload = {
        email,
        amount: totalPesewas,
        currency: "GHS",
        reference,
      };

      if (process.env.PAYSTACK_CALLBACK_URL) {
        payload.callback_url =
          process.env.PAYSTACK_CALLBACK_URL;
      }

      const response = await axios.post(
        `${PAYSTACK_URL}/transaction/initialize`,
        payload,
        {
          headers: {
            Authorization:
              `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      const paymentData = response.data?.data;

      if (
        response.data?.status !== true ||
        !paymentData?.authorization_url ||
        paymentData.reference !== reference
      ) {
        throw new Error(
          "Unexpected Paystack initialization response."
        );
      }

      // Save the payment link for future
      // retries of this same checkout.

      await orderModel.updateOne(
        { _id: order._id },
        {
          $set: {
            paymentAuthorizationUrl:
              paymentData.authorization_url,
            paymentInitializedAt: new Date(),
          },
        }
      );

      // Do not clear the cart here.

      return res.status(201).json({
        success: true,
        message: "Payment initialized.",
        orderId: order._id,
        reference,
        authorization_url:
          paymentData.authorization_url,
      });

    } catch (error) {
      console.error(
        "Paystack initialization error:",
        error.response?.data || error.message
      );

      // A timeout does not prove that
      // Paystack rejected the transaction.
      //
      // Keep the order and reference so
      // its status can be investigated.

      await orderModel.updateOne(
        {
          _id: order._id,
          payment: false,
        },
        {
          $set: {
            status: "Payment Initialization Uncertain",
          },
        }
      ).catch((updateError) => {
        console.error(
          "Unable to record initialization status:",
          updateError.message
        );
      });

      return res.status(502).json({
        success: false,
        message:
          "We could not confirm payment initialization. Please check My Orders or contact support before creating another checkout.",
      });
    }

  } catch (error) {
    // ======================================
    // DUPLICATE CHECKOUT KEY
    // ======================================

    if (
      error.code === 11000 &&
      checkoutKey
    ) {
      try {
        const existingOrder = await orderModel.findOne({
          userId: req.user.id,
          checkoutKey,
        });

        if (existingOrder) {
          const requestedItems = normalizeItems(
            req.body?.items
          );

          const address = normalizeAddress(
            req.body?.address,
            req.body?.email || req.body?.address?.email
          );

          return respondToExistingCheckout(
            res,
            existingOrder,
            requestedItems,
            address,
            req.body?.paymentMethod
          );
        }
      } catch (lookupError) {
        console.error(
          "Duplicate checkout lookup error:",
          lookupError.message
        );
      }

      return res.status(409).json({
        success: false,
        message:
          "This checkout is already being processed. Please check My Orders.",
      });
    }

    console.error("Place order error:", error.message);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.status && error.status < 500
          ? error.message
          : "Unable to process your order.",
    });
  }
};

// ==========================================
// 2. CONFIRM PAYSTACK PAYMENT
// ==========================================

export const confirmPaystackPayment = async (reference) => {
  if (
    typeof reference !== "string" ||
    !/^[A-Za-z0-9._=-]{1,150}$/.test(reference)
  ) {
    return {
      success: false,
      httpStatus: 400,
      message: "Invalid payment reference.",
    };
  }

  const order = await orderModel.findOne({
    reference,
    paymentMethod: "Online",
  });

  if (!order) {
    return {
      success: false,
      httpStatus: 404,
      message: "Order not found.",
    };
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack configuration is missing.");
  }

  // ========================================
  // VERIFY DIRECTLY WITH PAYSTACK
  // ========================================

  const response = await axios.get(
    `${PAYSTACK_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization:
          `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      timeout: 15000,
    }
  );

  const paymentData = response.data?.data;

  if (
    response.data?.status !== true ||
    !paymentData ||
    paymentData.reference !== reference
  ) {
    return {
      success: false,
      httpStatus: 502,
      message: "Unable to verify payment.",
    };
  }

  if (paymentData.status !== "success") {
    return {
      success: false,
      httpStatus: 200,
      message: "Payment has not been confirmed.",
      paymentStatus: paymentData.status,
    };
  }

  // ========================================
  // VERIFY AMOUNT AND CURRENCY
  // ========================================

  if (
    Number(paymentData.amount) !==
      toPesewas(order.amount) ||
    paymentData.currency !== "GHS"
  ) {
    console.error(
      "Paystack amount or currency mismatch:",
      reference
    );

    return {
      success: false,
      httpStatus: 409,
      message:
        "Payment details do not match the order.",
    };
  }

  // ========================================
  // ATOMIC DATABASE TRANSACTION
  // ========================================

  const result = await runTransaction(async (session) => {
    const currentOrder = await orderModel
      .findById(order._id)
      .session(session);

    if (!currentOrder) {
      throw new Error(
        "Order disappeared during payment verification."
      );
    }

    // Already paid: never deduct cart again.

    if (currentOrder.payment === true) {
      return {
        order: currentOrder,
        cartSynchronized: true,
      };
    }

    // Remove purchased quantities and
    // confirm payment in one transaction.

    const cartSynchronized =
      await removePurchasedItems(
        currentOrder.userId,
        currentOrder.items,
        session
      );

    currentOrder.payment = true;
    currentOrder.status = "Paid";
    currentOrder.paidAt = new Date();

    await currentOrder.save({ session });

    return {
      order: currentOrder,
      cartSynchronized,
    };
  });

  const confirmedOrder = result.order;

  return {
    success: true,
    httpStatus: 200,
    cartSynchronized: result.cartSynchronized,
    order: {
      _id: confirmedOrder._id,
      reference: confirmedOrder.reference,
      amount: confirmedOrder.amount,
      status: confirmedOrder.status,
      payment: confirmedOrder.payment,
      paymentMethod: confirmedOrder.paymentMethod,
    },
  };
};

// ==========================================
// 3. VERIFY PAYMENT ENDPOINT
// ==========================================

export const verifyOrder = async (req, res) => {
  try {
    const reference =
      req.query?.reference ||
      req.body?.reference;

    const result =
      await confirmPaystackPayment(reference);

    const browserCallback =
      req.method === "GET" &&
      String(req.headers.accept || "")
        .includes("text/html");

    // Paystack browser callback.

    if (
      browserCallback &&
      process.env.FRONTEND_URL
    ) {
      const redirectUrl = new URL(
        "/payment-success",
        process.env.FRONTEND_URL
      );

      const status = result.success
        ? "success"
        : result.paymentStatus || "unconfirmed";

      redirectUrl.searchParams.set(
        "status",
        status
      );

      if (typeof reference === "string") {
        redirectUrl.searchParams.set(
          "reference",
          reference
        );
      }

      return res.redirect(
        302,
        redirectUrl.toString()
      );
    }

    return res
      .status(result.httpStatus)
      .json(result);

  } catch (error) {
    console.error(
      "Verify payment error:",
      error.response?.data || error.message
    );

    return res.status(502).json({
      success: false,
      message:
        "Payment verification is temporarily unavailable.",
    });
  }
};

// ==========================================
// 4. CUSTOMER ORDERS
// ==========================================

export const userOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({
        userId: req.user.id,
      })
      .sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.error(
      "User orders error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve orders.",
    });
  }
};

// ==========================================
// 5. ADMIN ORDER LIST
// ==========================================

export const listOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.error(
      "List orders error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve orders.",
    });
  }
};

// ==========================================
// 6. ADMIN ORDER STATUS
// ==========================================

export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (
      !mongoose.isValidObjectId(orderId) ||
      typeof status !== "string" ||
      !status.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status request.",
      });
    }

    // Payment confirmation must happen
    // through Paystack verification.

    if (
      ["paid", "failed", "pending"].includes(
        status.trim().toLowerCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment status cannot be changed through this endpoint.",
      });
    }

    const order = await orderModel.findByIdAndUpdate(
      orderId,
      {
        status: status.trim(),
      },
      {
        new: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.json({
      success: true,
      message: "Order status updated.",
    });

  } catch (error) {
    console.error(
      "Update status error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update order status.",
    });
  }
};