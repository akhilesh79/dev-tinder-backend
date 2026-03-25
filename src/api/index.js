const express = require('express');
const authRoutes = require('./auth/routes');
const profileRoutes = require('./profile/routes');
const connectionRequestRoutes = require('./request/routes');
const userRoutes = require('./user/routes');
const paymentRoutes = require('./payments/routes');
const webhookRoutes = require('./webhooks/routes');
const { userAuth } = require('../middlewares/auth');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/profile', userAuth, profileRoutes);
router.use('/request', userAuth, connectionRequestRoutes);
router.use('/user', userAuth, userRoutes);
router.use('/payments', userAuth, paymentRoutes);
router.use('/webhook', webhookRoutes);

module.exports = router;
