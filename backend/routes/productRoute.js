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


// DEBUG CLOUDINARY
console.log("CLOUD NAME:", process.env.CLOUDINARY_NAME);
console.log("API KEY:", process.env.CLOUDINARY_API_KEY);


// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,

  params: async (req, file) => {

    console.log("UPLOADING FILE:", file.originalname);

    return {
      folder: "products",
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp"
      ]
    };
  }
});


// Multer
const upload = multer({
  storage: storage
});


// Upload middleware with error handling
const uploadMiddleware = (req, res, next) => {

  upload.single("image")(req, res, function (error) {

    if (error) {

      console.log("========== MULTER/CLOUDINARY ERROR ==========");
      console.log("FULL:", error);
      console.log("MESSAGE:", error.message);
      console.log("============================================");

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    next();
  });
};


// ROUTES
productRouter.post(
  "/add",
  uploadMiddleware,
  addProduct
);

productRouter.get(
  "/list",
  listProduct
);

productRouter.post(
  "/remove",
  removeProduct
);

productRouter.put(
  "/update/:id",
  uploadMiddleware,
  updateProduct
);

export default productRouter;