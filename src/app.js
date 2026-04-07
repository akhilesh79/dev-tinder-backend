require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const { errorHandler } = require('./utils/customError');
const apiRoutes = require('./api/index');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const path = require('path');

// create a web server application
const PORT_NO = process.env.PORT || 7777;
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
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:1234'],
    credentials: true,
  }),
);

app.use('/api', apiRoutes);
app.use(errorHandler);

const initSocket = require('./utils/socket');
const server = http.createServer(app);
initSocket(server);

connectDB()
  .then(() => {
    console.log('Database connection established...');
    // listen this server on port no 7777
    server.listen(PORT_NO, () => {
      console.log('Server is suceessfully listening on port ', PORT_NO);
    });
  })
  .catch((err) => {
    console.error('Database cannot be connected', err.message);
  });
