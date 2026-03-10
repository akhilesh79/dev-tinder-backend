const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');
const { validateSignUp } = require('./utils/validation');
const { CustomAPIError, errorHandler } = require('./utils/customError');

// create a web server application
const PORT_NO = 7777;
const app = express();

// request handlers this server will responds
// one route can handle mutiple request handlers, and using next() given by express, we can move to next request handler
// app.use()  → prefix matching
// app.get()  → exact route matching
// Express executes routes top → bottom
// here app.use is used for handling middleware because it will check all http method with prefix matching of /admin, /user
// wildcard-error handling matches all routes and throw any unhandled error.
// we have written in the last because order matters in routing
app.use(express.json());
app.post('/signup', validateSignUp, async (req, res) => {
  try {
    const userToSave = new User({
      ...req.body,
    });

    await userToSave.save();
    res.send('User Added Successfully');
  } catch (error) {
    throw new CustomAPIError('signup', error.message, error.statusCode || 500);
  }
});

app.get('/user/:emailId', async (req, res) => {
  try {
    const { emailId } = req.params || {};
    if (!emailId) {
      throw new CustomAPIError('user-get', 'Email Id required', 500);
    }

    const userFound = await User.findOne({ emailId });
    res.send(userFound);
  } catch (error) {
    throw new CustomAPIError('user-get', error.message, error.statusCode || 500);
  }
});

app.get('/feeds', async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    throw new CustomAPIError('feeds', error.message, error.statusCode || 500);
  }
});

app.patch('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params || {};
    const dataToUpdate = req.body || {};
    if (!userId) {
      throw new CustomAPIError('user-patch', 'User Id required', 400);
    }

    if (!dataToUpdate) {
      throw new CustomAPIError('user-patch', 'Bad Request. Request Body is Empty', 400);
    }

    const users = await User.findByIdAndUpdate(userId, dataToUpdate, { runValidators: true });
    res.send(users);
  } catch (error) {
    throw new CustomAPIError('user-patch', error.message, error.statusCode || 500);
  }
});

app.use(errorHandler);
connectDB()
  .then(() => {
    console.log('Database connection established...');
    // listen this server on port no 7777
    app.listen(PORT_NO, () => {
      console.log('Server is suceessfully listening on port ', PORT_NO);
    });
  })
  .catch((err) => {
    console.error('Database cannot be connected', err.message);
  });
