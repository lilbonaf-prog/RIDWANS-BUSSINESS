import express from "express";
import crypto from "crypto";
import mongoose from "mongoose";

import orderModel from "../models/orderModel.js";

import authMiddleware from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

import {
  placeOrder,
  verifyOrder,
  confirmPaystackPayment,
  userOrders,
  listOrders,
  updateStatus,
} from "../controllers/orderController.js";

// ==========================================
// RIDWAN BUSINESS
// SECURE ORDER & PAYMENT ROUTES
// ==========================================

const router = express.Router();

// ==========================================
// 1. ADMIN: UPDATE ORDER STATUS
// ==========================================

router.post(
  "/status",
  adminAuth,
  updateStatus
);

// ==========================================
// 2. ADMIN: LIST ALL ORDERS
// ==========================================

router.get(
  "/list",
  adminAuth,
  listOrders
);

// ==========================================
// 3. CUSTOMER: VIEW OWN ORDERS
// ==========================================

router.post(
  "/userorders",
  authMiddleware,
  userOrders
);

// ==========================================
// 4. PAYSTACK WEBHOOK
// ==========================================

// Paystack sends payment notifications here.
//
// This endpoint cannot require a customer
// JWT because Paystack calls it directly.
//
// Security is provided by validating
// Paystack's HMAC-SHA512 signature.

router.post("/webhook", async (req, res) => {
  try {
    const secretKey =
      process.env.PAYSTACK_SECRET_KEY;

    // ======================================
    // CHECK PAYSTACK CONFIGURATION
    // ======================================

    if (!secretKey) {
      console.error(
        "PAYSTACK_SECRET_KEY is missing."
      );

      return res.sendStatus(503);
    }

    // ======================================
    // CHECK ORIGINAL WEBHOOK BODY
    // ======================================

    // server.js captures the original
    // request body as req.rawBody.

    if (!Buffer.isBuffer(req.rawBody)) {
      console.error(
        "Paystack webhook raw body is missing."
      );

      return res.sendStatus(400);
    }

    // ======================================
    // VALIDATE RECEIVED SIGNATURE
    // ======================================

    const receivedSignature =
      req.headers["x-paystack-signature"];

    if (
      typeof receivedSignature !== "string" ||
      !/^[a-f0-9]{128}$/i.test(
        receivedSignature
      )
    ) {
      return res.sendStatus(401);
    }

    // ======================================
    // GENERATE EXPECTED SIGNATURE
    // ======================================

    const expectedSignature = crypto
      .createHmac("sha512", secretKey)
      .update(req.rawBody)
      .digest();

    const providedSignature = Buffer.from(
      receivedSignature,
      "hex"
    );

    // ======================================
    // CONSTANT-TIME SIGNATURE CHECK
    // ======================================

    if (
      expectedSignature.length !==
        providedSignature.length ||
      !crypto.timingSafeEqual(
        expectedSignature,
        providedSignature
      )
    ) {
      console.warn(
        "Rejected invalid Paystack webhook signature."
      );

      return res.sendStatus(401);
    }

    // ======================================
    // READ VERIFIED WEBHOOK EVENT
    // ======================================

    const event = req.body;

    // Only process successful charges.

    if (event?.event !== "charge.success") {
      return res.sendStatus(200);
    }

    const reference =
      event?.data?.reference;

    // ======================================
    // VALIDATE PAYMENT REFERENCE
    // ======================================

    if (
      typeof reference !== "string" ||
      !/^[A-Za-z0-9._=-]{1,150}$/.test(
        reference
      )
    ) {
      console.error(
        "Paystack webhook contains an invalid reference."
      );

      return res.sendStatus(400);
    }

    // ======================================
    // VERIFY PAYMENT DIRECTLY
    // ======================================

    // The controller verifies:
    //
    // - Transaction reference
    // - Paystack payment status
    // - Amount paid
    // - Currency (GHS)
    // - Duplicate payment processing
    //
    // Only the controller marks orders paid.

    const result =
      await confirmPaystackPayment(reference);

    // ======================================
    // SUCCESSFUL VERIFICATION
    // ======================================

    if (result.success) {
      console.log(
        "Paystack payment confirmed:",
        reference
      );

      return res.sendStatus(200);
    }

    // ======================================
    // TERMINAL VALIDATION FAILURES
    // ======================================

    if (
      result.httpStatus === 400 ||
      result.httpStatus === 404 ||
      result.httpStatus === 409
    ) {
      console.error(
        "Paystack payment requires investigation:",
        reference,
        result.message
      );

      // Do not mark the order as paid.
      //
      // Acknowledge these validation failures
      // to avoid repeated delivery of the
      // same invalid notification.

      return res.sendStatus(200);
    }

    // ======================================
    // TEMPORARY VERIFICATION FAILURE
    // ======================================

    console.error(
      "Paystack verification incomplete:",
      reference,
      result.message
    );

    // Allow Paystack to retry.

    return res.sendStatus(503);

  } catch (error) {
    console.error(
      "Paystack webhook processing error:",
      error.response?.data ||
        error.message
    );

    return res.sendStatus(500);
  }
});

// ==========================================
// 5. CUSTOMER: PLACE ORDER
// ==========================================

// Customers must be authenticated.
//
// The controller independently calculates
// order totals using MongoDB product prices.

router.post(
  "/place",
  authMiddleware,
  placeOrder
);

// ==========================================
// 6. PAYMENT REFERENCE VALIDATION
// ==========================================

const isValidPaymentReference = (reference) => {
  return (
    typeof reference === "string" &&
    /^[A-Za-z0-9._=-]{1,150}$/.test(
      reference
    )
  );
};

// ==========================================
// 7. PAYSTACK BROWSER CALLBACK
// ==========================================

// Paystack can redirect a customer's browser
// to /api/order/verify?reference=...
//
// The browser may not send a JWT during
// this navigation.
//
// IMPORTANT:
//
// This handler ONLY redirects the browser.
//
// It does NOT:
// - Verify a transaction
// - Modify an order
// - Mark an order as paid
// - Return private customer information
//
// The frontend PaymentSuccess.jsx performs
// authenticated verification afterward.

const redirectBrowserCallback = (
  req,
  res,
  next
) => {
  const acceptsHTML =
    String(req.headers.accept || "")
      .includes("text/html");

  // API requests continue to authentication.

  if (!acceptsHTML) {
    return next();
  }

  const reference =
    req.query?.reference ||
    req.query?.trxref;

  // ========================================
  // VALIDATE CALLBACK REFERENCE
  // ========================================

  if (!isValidPaymentReference(reference)) {
    return res.status(400).send(
      "Invalid payment reference."
    );
  }

  // ========================================
  // CHECK FRONTEND CONFIGURATION
  // ========================================

  const frontendURL =
    process.env.FRONTEND_URL;

  if (!frontendURL) {
    console.error(
      "FRONTEND_URL is missing."
    );

    return res.status(503).send(
      "Payment redirect is not configured."
    );
  }

  // ========================================
  // REDIRECT TO PAYMENT STATUS PAGE
  // ========================================

  try {
    const redirectURL = new URL(
      "/payment-success",
      frontendURL
    );

    redirectURL.searchParams.set(
      "reference",
      reference
    );

    // Never report payment success here.
    //
    // The frontend must verify the payment
    // through the authenticated API.

    return res.redirect(
      302,
      redirectURL.toString()
    );

  } catch (error) {
    console.error(
      "Payment callback redirect error:",
      error.message
    );

    return res.status(503).send(
      "Payment redirect is temporarily unavailable."
    );
  }
};

// ==========================================
// 8. VERIFY CUSTOMER ORDER OWNERSHIP
// ==========================================

// This middleware runs AFTER authMiddleware.
//
// It prevents customers from accessing or
// verifying orders belonging to other users.

const verifyCustomerOrderOwnership = async (
  req,
  res,
  next
) => {
  try {
    const reference =
      req.query?.reference ||
      req.body?.reference;

    // ======================================
    // VALIDATE PAYMENT REFERENCE
    // ======================================

    if (!isValidPaymentReference(reference)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment reference.",
      });
    }

    // ======================================
    // CHECK AUTHENTICATED CUSTOMER
    // ======================================

    const userId =
      req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication is required.",
      });
    }

    // ======================================
    // CHECK ORDER OWNERSHIP
    // ======================================

    const order = await orderModel
      .findOne({
        reference,
        userId,
        paymentMethod: "Online",
      })
      .select("_id")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Payment order not found.",
      });
    }

    // ======================================
    // CONTINUE TO PAYMENT VERIFICATION
    // ======================================

    return next();

  } catch (error) {
    console.error(
      "Payment access verification error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify payment access.",
    });
  }
};

// ==========================================
// 9. VERIFY PAYSTACK PAYMENT (GET)
// ==========================================

// Browser navigation:
// Redirect to the frontend only.
//
// API request:
// Require JWT and order ownership.

router.get(
  "/verify",
  redirectBrowserCallback,
  authMiddleware,
  verifyCustomerOrderOwnership,
  verifyOrder
);

// ==========================================
// 10. VERIFY PAYSTACK PAYMENT (POST)
// ==========================================

// POST verification is always authenticated.

router.post(
  "/verify",
  authMiddleware,
  verifyCustomerOrderOwnership,
  verifyOrder
);

// ==========================================
// 11. ADMIN: DELETE ORDER
// ==========================================

// Administrators may delete unpaid
// Cash on Delivery orders only.
//
// Paid orders and all Online orders
// are protected against permanent deletion.

router.delete(
  "/delete/:id",
  adminAuth,
  async (req, res) => {
    try {
      const orderId = req.params.id;

      // ====================================
      // VALIDATE ORDER ID
      // ====================================

      if (!mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID.",
        });
      }

      // ====================================
      // GET ORDER
      // ====================================

      const order =
        await orderModel.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      // ====================================
      // PROTECT PAYMENT RECORDS
      // ====================================

      // Never permanently delete:
      //
      // 1. Confirmed paid orders
      // 2. Pending online-payment orders
      // 3. Failed online-payment orders
      //
      // A pending payment may complete
      // after the administrator checks it.

      if (
        order.payment === true ||
        order.paymentMethod === "Online"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Paid and online-payment orders cannot be permanently deleted.",
        });
      }

      // ====================================
      // DELETE UNPAID COD ORDER
      // ====================================

      // Restrict deletion to unpaid
      // Cash on Delivery records.

      if (
        order.paymentMethod !==
        "CashOnDelivery"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This order cannot be deleted.",
        });
      }

      await order.deleteOne();

      return res.json({
        success: true,
        message:
          "Order deleted successfully.",
      });

    } catch (error) {
      console.error(
        "Delete order error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete order.",
      });
    }
  }
);

// ==========================================
// EXPORT ORDER ROUTER
// ==========================================

export default router;