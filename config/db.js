const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGO_DB);
    console.log("DB connected");
  } catch (err) {
    console.log(`DB connection error: ${err.message}`);
  }
};

module.exports = connectDB;
