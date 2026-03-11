const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');
const { validateSignUp } = require('./utils/validation');
const { CustomAPIError, errorHandler } = require('./utils/customError');
const Bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const { generateToken } = require('./utils/jwt');
const { userAuth } = require('./middlewares/auth');

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
app.use(cookieParser());
app.post('/signup', validateSignUp, async (req, res) => {
  try {
    const { firstName, lastName, password, emailId, age, gender, skills } = req.body;
    // encrypting the password , for security purposes.
    const passwordHash = await Bcrypt.hash(password, 10);

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

app.post('/login', async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const userDetails = await User.findOne({ emailId }, { password: 1, _id: 1 }).lean();

    if (!userDetails) {
      throw new CustomAPIError('login', 'Invalid Credential', 400);
    }

    const isPasswordValid = await Bcrypt.compare(password, userDetails.password);
    if (!isPasswordValid) {
      throw new CustomAPIError('login', 'Invalid Credential', 400);
    }

    const token = generateToken({ _id: userDetails._id }, 'DEV@Tinder@123', { expiresIn: '7d' });
    res.cookie('token', token, { expires: new Date(Date.now() + 7 * 24 * 3600000) });
    res.send('User loggedIn successfully');
  } catch (error) {
    throw new CustomAPIError('login', error.message, error.statusCode || 500);
  }
});

app.get('/profile', userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    throw new CustomAPIError('login', error.message, error.statusCode || 500);
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
