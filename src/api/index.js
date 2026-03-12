const express = require('express');
const authRouters = require('./auth/routes');
const profileRouters = require('./profile/routes');
const connectionRequestRouters = require('./request/routes');
const { userAuth } = require('../middlewares/auth');

const router = express.Router();

router.use('/auth', authRouters);
router.use('/profile', userAuth, profileRouters);
router.use('/request', userAuth, connectionRequestRouters);

module.exports = router;
