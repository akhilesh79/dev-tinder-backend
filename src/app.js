const express = require('express');

// create a web server application
const PORT_NO = 7777;
const app = express();

// request handlers this server will responds
// one route can handle mutiple request handlers, and using next() given by express, we can move to next request handler
app.use(
  '/test',
  [
    (req, res, next) => {
      console.log('First Request Handler');
      next();
    },
    (req, res, next) => {
      console.log('Second Request Handler');
      //   res.send('Hello form DEV Tinder');
      next();
    },
  ],
  (req, res, next) => {
    console.log('Third Request Handler');
    res.send('Third Response');
  },
  (req, res, next) => {
    console.log('forth Request Handler');
  },
);

// listen this server on port no 7777
app.listen(PORT_NO, () => {
  console.log('Server is suceessfully listening on port ', PORT_NO);
});
