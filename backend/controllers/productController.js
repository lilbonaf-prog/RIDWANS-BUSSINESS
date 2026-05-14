import productModel from "../models/productModel.js";
import cloudinary from "../config/cloudinary.js";

// ADD PRODUCT
export const addProduct = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    // Multer-storage-cloudinary already uploads to Cloudinary
    const product = new productModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: req.file.path,       // ✅ Cloudinary secure_url
      publicId: req.file.filename // ✅ Cloudinary public_id
    });

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product Added",
      data: product
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ success: false, message: error.message || "Upload failed" });
  }
};

// LIST PRODUCTS
export const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({});
    return res.json({ success: true, data: products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// REMOVE PRODUCT
export const removeProduct = async (req, res) => {
  try {
    const product = await productModel.findById(req.body.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Delete image from Cloudinary
    if (product.publicId) {
      await cloudinary.uploader.destroy(product.publicId);
    }

    await productModel.findByIdAndDelete(req.body.id);

    return res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) {
      // Multer-storage-cloudinary already uploads to Cloudinary
      data.image = req.file.path;       // ✅ Cloudinary secure_url
      data.publicId = req.file.filename; // ✅ Cloudinary public_id
    }

    const updated = await productModel.findByIdAndUpdate(req.params.id, data, { new: true });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
