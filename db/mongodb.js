require("dotenv").config();
const mongoose = require("mongoose");

const connectMongoDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);

  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectMongoDB;
