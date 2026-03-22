const express = require('express');
const { CustomAPIError } = require('../../utils/customError');
const bcrypt = require('bcrypt');
const { validateProfileEdit, validateEditPassword } = require('../../utils/validation');

const router = express.Router();

router.get('/view', async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    throw new CustomAPIError('profile-view', error.message, error.statusCode || 500);
  }
});

router.post('/edit', validateProfileEdit, async (req, res) => {
  try {
    const loggedInUser = req.user;
    Object.keys(req.body).every((field) => (loggedInUser[field] = req.body[field]));
    await loggedInUser.save();
    res.json({
      data: loggedInUser,
      message: 'User Data Updated Successfully',
    });
  } catch (error) {
    throw new CustomAPIError('profile-edit', error.message, error.statusCode || 500);
  }
});

router.patch('/password', validateEditPassword, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const loggedInUser = req.user;
    const isCurrentPasswordValid = await loggedInUser.validatePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new CustomAPIError('profile-password', 'Current Password is not correct', 400);
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    loggedInUser['password'] = newPasswordHash;
    await loggedInUser.save();

    res.json({
      message: 'Password Updated Successfully',
      data: loggedInUser,
    });
  } catch (error) {
    throw new CustomAPIError('profile-password', error.message, error.statusCode || 500);
  }
});

module.exports = router;
