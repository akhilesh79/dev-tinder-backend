const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../../models/user');
const { CustomAPIError } = require('../../utils/customError');
const { validateSignUp } = require('../../utils/validation');

const router = express.Router();

router.post('/signup', validateSignUp, async (req, res) => {
  try {
    const { firstName, lastName, password, emailId, age, gender, skills } = req.body;
    // encrypting the password , for security purposes.
    const passwordHash = await bcrypt.hash(password, 10);

    const userToSave = new User({
      firstName,
      lastName,
      password: passwordHash,
      emailId,
      age,
      gender,
      skills,
    });

    await userToSave.save();
    res.send('User Added Successfully');
  } catch (error) {
    throw new CustomAPIError('signup', error.message, error.statusCode || 500);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const userDetails = await User.findOne({ emailId }, { password: 1, _id: 1 });

    if (!userDetails) {
      throw new CustomAPIError('login', 'Invalid Credential', 400);
    }

    const isPasswordValid = await userDetails.validatePassword(password);
    if (!isPasswordValid) {
      throw new CustomAPIError('login', 'Invalid Credential', 400);
    }

    const token = userDetails.getJWT();
    res.cookie('token', token, { expires: new Date(Date.now() + 7 * 24 * 3600000) });
    res.send('User loggedIn successfully');
  } catch (error) {
    throw new CustomAPIError('login', error.message, error.statusCode || 500);
  }
});

router.post('/logout', async (req, res) => {
  res.cookie('token', null, { expires: new Date(Date.now()) });
  res.send('Logged Out Successfully');
});

module.exports = router;
