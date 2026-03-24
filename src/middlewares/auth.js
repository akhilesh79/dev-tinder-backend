const { CustomAPIError } = require('../utils/customError');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new CustomAPIError('userAuth', 'Token is not valid', 401);
    }

    const decodedObj = jwt.verify(token, process.env.JWT_SECRET_ID);
    const { _id: userId } = decodedObj;

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomAPIError('userAuth', 'User not found', 400);
    }

    req.user = user;
    next();
  } catch (error) {
    throw new CustomAPIError('userAuth', error.message, error.statusCode || 500);
  }
};

module.exports = {
  userAuth,
};
