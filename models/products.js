const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Please input a product name"] },
  description: {
    type: String,
    required: [true, "Please input a product description"],
  },
  price: { type: Number, required: [true, "Product must have a price"] },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  stock: { type: Number, default: 0 },
  images: [String], // Array of image URLs
  video: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
