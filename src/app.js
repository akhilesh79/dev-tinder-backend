const express = require('express');
const { adminAuth, userAuth } = require('./middlewares/auth');

// create a web server application
const PORT_NO = 7777;
const app = express();

// request handlers this server will responds
// one route can handle mutiple request handlers, and using next() given by express, we can move to next request handler
// app.use()  → prefix matching
// app.get()  → exact route matching
// Express executes routes top → bottom

// here use is used for handling middleware because it will check all http method with prefix matching of /admin, /user
app.use('/admin', adminAuth);

app.get('/admin/getAllData', (req, res) => {
  console.log('control coming');
  res.send('Admin data sent');
});

app.get('/user/getAllData', userAuth, (req, res) => {
  res.send('User data sent');
});

app.get('/user/login', (req, res) => {
  res.send('Login Successfully');
});

// wildcard-error handling matches all routes and throw any unhandled error.
// we have written in the last because order matters in routing
app.use('/', (err, req, res, next) => {
  if (err) {
    res.status(500).send('Something Went Wrong');
  }
});

// listen this server on port no 7777
app.listen(PORT_NO, () => {
  console.log('Server is suceessfully listening on port ', PORT_NO);
});
