import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB } from "./config/db.js";

import productRouter from "./routes/productRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import adminRoutes from "./routes/admin.js";

// ==========================================
// RIDWAN BUSINESS
// BACKEND SERVER
// ==========================================

const app = express();

const port = process.env.PORT || 4000;

// ==========================================
// JSON MIDDLEWARE
// ==========================================

// Preserve the original Paystack webhook
// request body for signature verification.

app.use(
  express.json({
    verify: (req, res, buffer) => {
      const requestPath =
        req.originalUrl.split("?")[0];

      if (requestPath === "/api/order/webhook") {
        req.rawBody = Buffer.from(buffer);
      }
    },
  })
);

// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ==========================================
// API ROUTES
// ==========================================

// Products
app.use("/api/product", productRouter);

// Product images
app.use(
  "/images",
  express.static("uploads")
);

// Users
app.use("/api/user", userRouter);

// Shopping cart
app.use("/api/cart", cartRouter);

// Orders and payments
app.use("/api/order", orderRouter);

// Admin dashboard
app.use("/api/admin", adminRoutes);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
  res.send("Ridwan Business API Working");
});

// ==========================================
// START SERVER SAFELY
// ==========================================

const startServer = async () => {
  // Wait until MongoDB is connected.

  await connectDB();

  // Start accepting requests only
  // after the database is ready.

  app.listen(port, () => {
    console.log(
      `Ridwan Business server running on port ${port}`
    );
  });
};

startServer();