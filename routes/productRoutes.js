const express = require("express");
const productRouter = express.Router();

const {
  addCategory,
  deleteCategory,
  addProducts,
  deleteProducts,
  updateProduct,
  getProduct,
  getAllProducts,
  getAllCategories,
  uploadProductImage,
  resizeProductImage,
  uploadProductVideos,
  resizeProductVideos,
} = require("../controller/productController");
const {
  authentication,
  restrictTo,
} = require("../middlewares/authenticationMiddleware");

productRouter
  .post("/addCategory", authentication, restrictTo("admin"), addCategory)
  .post(
    "/deleteCategory/:id",
    authentication,
    restrictTo("admin"),
    deleteCategory
  )
  .post("/addProducts", authentication, restrictTo("admin"), addProducts)
  .delete(
    "/deleteProducts/:id",
    authentication,
    restrictTo("admin"),
    deleteProducts
  )
  .patch(
    "/updateProduct/:id",
    authentication,
    restrictTo("admin"),
    uploadProductImage,
    resizeProductImage,
    // uploadProductVideos,
    // resizeProductVideos,
    updateProduct
  )
  .get("/getProduct/:id", authentication, getProduct)
  .get("/getAllProducts", authentication, getAllProducts)
  .get("/getAllCategories", authentication, getAllCategories);

module.exports = productRouter;
