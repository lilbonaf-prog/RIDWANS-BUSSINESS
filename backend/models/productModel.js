import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },     // ✅ Cloudinary secure_url
  publicId: { type: String, required: true },  // ✅ Cloudinary public_id
  category: { type: String, required: true }
});

// Prevent model overwrite in dev hot-reload
const productModel = mongoose.models.Product || mongoose.model("Product", productSchema);

export default productModel;
