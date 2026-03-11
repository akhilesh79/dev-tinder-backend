const jwt = require('jsonwebtoken');
const { CustomAPIError } = require('./customError');
const generateToken = (payload, secretKey, expiresIn) => {
  const token = jwt.sign(payload, secretKey, expiresIn);
  if (!token) {
    throw new CustomAPIError('generateToken', 'Token not generated', 500);
  }
  return token;
};

const verifyToken = (token, secretKey) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
