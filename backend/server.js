import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB } from "./config/db.js";

import productRouter from "./routes/productRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import adminRoutes from "./routes/admin.js";

const app = express();

// Port
const port = process.env.PORT || 4000;


// Middlewares
app.use(express.json());


// CORS
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL
    ],
    credentials: true
  })
);


// Database
connectDB();


// API Routes
app.use("/api/product", productRouter);

app.use(
  "/images",
  express.static("uploads")
);

app.use("/api/user", userRouter);

app.use("/api/cart", cartRouter);

app.use("/api/order", orderRouter);

app.use("/api/admin", adminRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("API Working");
});


// Start server
app.listen(port, () => {
  console.log(
    `Server Started on port ${port}`
  );
});