const adminAuth = (req, res, next) => {
  console.log('Request is getting checked');
  const token = 'sjdnkcj';
  const isAuthorised = token === 'sjdnkcj';
  if (!isAuthorised) {
    res.status(401).send('Unauthorised Request');
  } else {
    next();
  }
};
const userAuth = (req, res, next) => {
  console.log('Request is getting checked');
  const token = 'sjdnkcj';
  const isAuthorised = token === 'sjdnkcj';
  if (!isAuthorised) {
    res.status(401).send('Unauthorised Request');
  } else {
    next();
  }
};

module.exports = {
  adminAuth,
  userAuth,
};
