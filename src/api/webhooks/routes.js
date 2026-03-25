const express = require('express');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const { CustomAPIError } = require('../../utils/customError');
const Payments = require('../../models/payments');
const User = require('../../models/user');

const router = express.Router();

router.post('/razorpay/payments', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const webhookBody = req.body;
    const webhookSignature = req.get('x-razorpay-signature');

    const isValidSignature = validateWebhookSignature(JSON.stringify(webhookBody), webhookSignature, webhookSecret);
    console.log('Webhook Signature Valid:', isValidSignature);
    if (!isValidSignature) {
      throw new CustomAPIError('webhook-razorpay', 'Invalid webhook signature', 400);
    }

    const paymentData = webhookBody.payload?.payment?.entity;
    const event = webhookBody.event;
    if (paymentData) {
      console.log('Received Razorpay webhook event:', event, 'with payment data:', paymentData);
      const { order_id, status } = paymentData;
      const paymentInfo = await Payments.findOne({ orderId: order_id });
      if (!paymentInfo) {
        throw new CustomAPIError('webhook-razorpay', 'Payment record not found for the given order ID', 404);
      }

      paymentInfo.paymentDetails = paymentData;
      paymentInfo.status = status;
      await paymentInfo.save();

      const user = await User.findById(paymentInfo.userId);
      if (event === 'payment.captured' && user) {
        user.isPremiumUser = true;
        const newValidity = new Date();
        newValidity.setMonth(newValidity.getMonth() + 1);
        user.validity = newValidity;
        user.mememberShipType = paymentInfo.notes?.mememberShipType || user.mememberShipType;
      } else {
        user.isPremiumUser = false;
        user.validity = null;
      }

      await user.save();
      // Process the payment data as needed (e.g., update database, trigger actions)
      console.log('Received valid Razorpay webhook:', paymentData);
    } else {
      console.warn('Received Razorpay webhook with missing payment data');
    }

    res.status(200).json({ message: 'Webhook received successfully' });
  } catch (error) {
    console.error('Error processing Razorpay webhook:', error);
    throw new CustomAPIError('webhook-razorpay', JSON.stringify(error), error.statusCode || 500);
  }
});

module.exports = router;
