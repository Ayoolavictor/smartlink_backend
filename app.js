const express = require("express");
const app = express();
const userRouter = require("../routes/userRoutes");
const authRouter = require("../routes/authRoutes");
const productRouter = require("../routes/productRoutes");
const cartRouter = require("../routes/cartRoutes");
const orderRouter = require("../routes/orderRoutes");

app.use(express.json());
app.get("/", (req, res) => {
  res.send("This is the backend");
});
app.use("/api", userRouter);
app.use("/api", authRouter);
app.use("/api", productRouter);
app.use("/api", cartRouter);
app.use("/api", orderRouter);

module.exports = app;
