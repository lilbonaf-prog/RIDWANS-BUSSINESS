import productModel from "../models/productModel.js";
import cloudinary from "../config/cloudinary.js";


// ADD PRODUCT
export const addProduct = async (req, res) => {
  try {

    console.log("========== ADD PRODUCT ==========");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("=================================");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded"
      });
    }

    const product = new productModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,

      // Cloudinary URL
      image: req.file.path
    });

    await product.save();

    console.log("PRODUCT SAVED");

    return res.status(200).json({
      success: true,
      message: "Product Added",
      data: product
    });

  } catch (error) {

    console.log("========== CLOUDINARY ERROR ==========");
    console.log("FULL ERROR:", error);
    console.log(
      "JSON ERROR:",
      JSON.stringify(error, null, 2)
    );
    console.log("MESSAGE:", error.message);
    console.log("STACK:", error.stack);
    console.log("=====================================");

    return res.status(500).json({
      success: false,
      message: error.message || "Upload failed"
    });
  }
};


// LIST PRODUCTS
export const listProduct = async (req, res) => {
  try {

    const products = await productModel.find({});

    return res.json({
      success: true,
      data: products
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// REMOVE PRODUCT
export const removeProduct = async (req, res) => {
  try {

    const product = await productModel.findById(
      req.body.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Delete image from Cloudinary
    if (product.image) {

      const publicId = product.image
        .split("/")
        .pop()
        .split(".")[0];

      await cloudinary.uploader.destroy(
        `products/${publicId}`
      );
    }

    await productModel.findByIdAndDelete(
      req.body.id
    );

    return res.json({
      success: true,
      message: "Product Removed"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {

    const data = {
      ...req.body
    };

    if (req.file) {
      data.image = req.file.path;
    }

    const updated = await productModel.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    return res.json({
      success: true,
      data: updated
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};