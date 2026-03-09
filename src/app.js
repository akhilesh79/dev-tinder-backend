const express = require('express');

// create a web server application
const PORT_NO = 7777;
const app = express();

// request handlers this server will responds
app.use('/hello', (req, res) => {
  res.send('Hello Hello Hello!!');
});

app.use('/test', (req, res) => {
  res.send('Hello form DEV Tinder');
});

app.use('/', (req, res) => {
  res.send('Namaster To DEV Tinder Node App');
});

// listen this server on port no 7777
app.listen(PORT_NO, () => {
  console.log('Server is suceessfully listening on port ', PORT_NO);
});
