const mongoose = require('mongoose');
const MONGODB_URL = 'mongodb+srv://makmishra99:Akhilesh99@cluster0.kszrwuf.mongodb.net/devTinder?appName=Cluster0';
const connectDB = async () => {
  return mongoose.connect(MONGODB_URL);
};

module.exports = connectDB;
