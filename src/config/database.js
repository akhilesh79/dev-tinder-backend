const mongoose = require('mongoose');
const MONGODB_URL = process.env.MONGODB_URI;
const connectDB = async () => {
  return mongoose.connect(MONGODB_URL);
};

module.exports = connectDB;
