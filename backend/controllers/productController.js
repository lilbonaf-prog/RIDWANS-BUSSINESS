import productModel from "../models/productModel.js";
import fs from "fs";

// add product item
const addProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image uploaded" });
        }

        const image_filename = req.file.filename;

        const product = new productModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename
        });

        await product.save();

        res.json({ success: true, message: "Product Added" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

// all product list
const listProduct = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({ success: true, data: products });
    } catch (error) {
  console.error("Error fetching products:", error.message);
  res.status(500).json({ success: false, message: "Server error while fetching products" });
}
};

// remove product item
const removeProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.body.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (product.image) {
            fs.unlink(`uploads/${product.image}`, (err) => {
                if (err) console.log(err);
            });
        }

        await productModel.findByIdAndDelete(req.body.id);

        res.json({ success: true, message: "Product Removed" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

export { addProduct, listProduct, removeProduct };