const Product = require("../models/products");
const Category = require("../models/category");
const multer = require("multer");
const sharp = require("sharp");
const ffmpeg = require("ffmpeg");
const fs = require("fs").promises;
const path = require("path");
const stream = require("stream");
const { Storage } = require("@google-cloud/storage");

const cloudStorage = new Storage();
const bucket = cloudStorage.bucket("smartlinkbackend");
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    cb("This is not a supported image or video", false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});
exports.uploadProductVideos = upload.single("productVideos");
exports.uploadProductImage = upload.array("productImages", 3);

const streamTOGCS = async (buffer, destinationPath, contentType) => {
  return new Promise((resolve, reject) => {
    const passthroughStream = new stream.PassThrough();
    const file = bucket.file(destinationPath);
    passthroughStream.write(buffer);
    passthroughStream.end();

    passthroughStream
      .pipe(
        file.createWriteStream({
          resumable: false,
          contentType,
        })
      )
      .on("finish", () => {
        resolve(destinationPath);
      })
      .on("error", reject);
  });
};

exports.resizeProductVideos = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  const filename = `product-videos-${req.params.id}-${Date.now()}.mp4`;
  const destinationPath = `videos/${filename}`;
  try {
    await streamTOGCS(req.file.buffer, destinationPath, "video/mp4");
    req.body.video = destinationPath;
    next();
  } catch (e) {
    console.log(e);
    next(e);
  }
};
exports.resizeProductImage = async (req, res, next) => {
  if (!req.files) {
    return next();
  }
  req.body.images = [];
  await Promise.all(
    req.files.map(async (file, index) => {
      const filename = `product-${req.params.id}-${Date.now()}-${
        index + 1
      }.jpeg`;
      const destinationPath = `images/${filename}`;
      const resizedBuffer = await sharp(file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .toBuffer();
      await streamTOGCS(resizedBuffer, destinationPath, "image/jpeg");
      req.body.images.push(destinationPath);
    })
  );
  next();
};

exports.addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const data = await Category.create({ name, description });
    res.status(201).json({
      status: "success",
      data: { data },
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error,
    });
  }
};
exports.deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    await Category.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error,
    });
  }
};
exports.addProducts = async (req, res) => {
  try {
    const { name, category, price, description, stock, images, video } =
      req.body;
    const product = await Product.create({
      name,
      category,
      description,
      price,
      stock,
      images,
      video,
    });
    res.status(201).json({
      status: "success",
      message: "product created",
      data: {
        product,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error,
    });
  }
};

exports.deleteProducts = async (req, res) => {
  try {
    const id = req.params.id;
    await Product.findByIdAndDelete(id);
    res.status(200).json({
      status: "success",
      message: "product deleted",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { price, stock, images, video } = req.body;
    const data = await Product.findByIdAndUpdate(
      id,
      { price, stock, images, video },
      { returnDocument: "after" }
    );
    if (data === null) {
      return res.status(404).json({
        status: "fail",
        message: "product not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: {
        data,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Product.findById(id);
    if (data === null) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: { data },
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const data = await Product.find().populate("category");
    res.status(200).json({
      status: "success",
      data: {
        data,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error,
    });
  }
};
exports.getAllCategories = async (req, res) => {
  try {
    const data = await Category.find();
    res.status(200).json({
      status: "success",
      data: {
        data,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error,
    });
  }
};
