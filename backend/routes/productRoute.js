import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

import pkg from "multer-storage-cloudinary";
const { CloudinaryStorage } = pkg;

import {
  addProduct,
  listProduct,
  removeProduct,
  updateProduct
} from "../controllers/productController.js";

const productRouter = express.Router();

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  }
});

// Multer with Cloudinary storage
const upload = multer({ storage });

// Upload middleware with error handling
const uploadMiddleware = (req, res, next) => {
  upload.single("image")(req, res, function (error) {
    if (error) {
      console.error("========== MULTER/CLOUDINARY ERROR ==========");
      console.error("FULL:", error);
      console.error("MESSAGE:", error.message);
      console.error("============================================");
      return res.status(500).json({ success: false, message: error.message });
    }
    next();
  });
};

// ROUTES
productRouter.post("/add", uploadMiddleware, addProduct);
productRouter.get("/list", listProduct);
productRouter.post("/remove", removeProduct);
productRouter.put("/update/:id", uploadMiddleware, updateProduct);

export default productRouter;
