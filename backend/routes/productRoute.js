import express from "express";
import multer from "multer";

import { CloudinaryStorage } from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";

// Product controllers
import {
  addProduct,
  listProduct,
  removeProduct,
  updateProduct,
} from "../controllers/productController.js";

// Administrator authentication
import adminAuth from "../middleware/adminAuth.js";

// ==========================================
// RIDWAN BUSINESS
// SECURE PRODUCT MANAGEMENT ROUTES
// ==========================================

const productRouter = express.Router();

// ==========================================
// CLOUDINARY STORAGE CONFIGURATION
// ==========================================

const storage = new CloudinaryStorage({
  cloudinary,

  params: {
    folder: "products",

    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
    ],
  },
});

// ==========================================
// MULTER CONFIGURATION
// ==========================================

const upload = multer({
  storage,
});

// ==========================================
// IMAGE UPLOAD MIDDLEWARE
// ==========================================

const uploadMiddleware = (req, res, next) => {
  upload.single("image")(
    req,
    res,
    function (error) {
      if (error) {
        console.error(
          "Product image upload failed:",
          error.message
        );

        return res.status(500).json({
          success: false,
          message: "Unable to upload product image.",
        });
      }

      next();
    }
  );
};

// ==========================================
// 1. PUBLIC: VIEW PRODUCTS
// ==========================================

// Customers can view available products
// without administrator authentication.

productRouter.get(
  "/list",
  listProduct
);

// ==========================================
// 2. ADMIN: ADD PRODUCT
// ==========================================

// Verify administrator before allowing
// image uploads or product creation.

productRouter.post(
  "/add",
  adminAuth,
  uploadMiddleware,
  addProduct
);

// ==========================================
// 3. ADMIN: UPDATE PRODUCT
// ==========================================

// Only administrators can update product
// information or replace product images.

productRouter.put(
  "/update/:id",
  adminAuth,
  uploadMiddleware,
  updateProduct
);

// ==========================================
// 4. ADMIN: REMOVE PRODUCT
// ==========================================

// Only administrators can remove products
// from the database.

productRouter.post(
  "/remove",
  adminAuth,
  removeProduct
);

// ==========================================
// EXPORT PRODUCT ROUTER
// ==========================================

export default productRouter;