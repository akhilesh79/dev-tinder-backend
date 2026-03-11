const express = require('express');
const { CustomAPIError } = require('../../utils/customError');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    throw new CustomAPIError('login', error.message, error.statusCode || 500);
  }
});

module.exports = router;
