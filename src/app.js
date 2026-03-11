const express = require('express');
const connectDB = require('./config/database');
const { errorHandler } = require('./utils/customError');
const apiRoutes = require('./api/index');
const cookieParser = require('cookie-parser');

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

app.use('/api', apiRoutes);

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
