const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');

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
app.post('/signup', async (req, res, next) => {
  try {
    if (!req.body) {
      const error = new Error('User details is required');
      error.statusCode = 400;
      throw error;
    }

    const userToSave = new User({
      ...req.body,
    });

    await userToSave.save();
    res.send('User Added Successfully');
  } catch (error) {
    res.status(error.statusCode || 500).send(`Error while signing up the user: ${error.message}`);
  }
});

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
