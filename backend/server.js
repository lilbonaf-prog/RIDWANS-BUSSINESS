import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import productRouter from "./routes/productRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import 'dotenv/config';

const app = express();
const port = 4000;

app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5174",
    "http://localhost:5173",
    "https://ridwanbusiness.com",
    "https://www.ridwanbusiness.com",
    "https://ridwans-bussiness.vercel.app",
    "https://admin.ridwanbusiness.com"
  ],
  credentials: true
}));


connectDB();

// API endpoints
app.use("/api/product", productRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter); // protect inside cartRoute if needed
app.use("/api/order", orderRouter); // ✅ mount once

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});