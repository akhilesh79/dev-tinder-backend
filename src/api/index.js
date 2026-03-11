const express = require('express');
const authRouters = require('./auth/routes');
const profileRouter = require('./profile/routes');
const { userAuth } = require('../middlewares/auth');

const router = express.Router();

router.use('/auth', authRouters);
router.use('/profile', userAuth, profileRouter);

module.exports = router;
