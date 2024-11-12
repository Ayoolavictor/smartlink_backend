const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config();

DB = process.env.DB.replace("<db_password>", process.env.PASSWORD);

mongoose.connect(DB).then(() => {
  console.log("Database is connected");
});

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
