const express = require('express');
const paymentRouter = express.Router();
const instance = require('../../utils/razorpay');
const { CustomAPIError } = require('../../utils/customError');
const { membershipAmount } = require('../../utils/constants');
const Payments = require('../../models/payments');

paymentRouter.post('/order', async (req, res) => {
  try {
    const { mememberShipType } = req.body;

    if (!mememberShipType || !['gold', 'silver', 'bronze'].includes(mememberShipType)) {
      throw new CustomAPIError('payment-order', 'Invalid Membership Type', 400);
    }

    const { firstName, lastName, emailId, _id: userId } = req.user;

    const order = await instance.orders.create({
      amount: membershipAmount[mememberShipType] * 100,
      currency: 'INR',
      receipt: `receipt#1`,
      notes: {
        firstName,
        lastName,
        emailId,
        mememberShipType,
      },
    });

    if (!order) {
      throw new CustomAPIError('payment-order', 'Unable to create order', 500);
    }

    // we need update the db with order details and user details, so that when payment is successful we can update the payment status in db
    const paymentPayloadObj = {
      userId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
      orderCreatedAt: new Date(order.created_at),
      status: 'created',
    };

    const payment = new Payments(paymentPayloadObj);
    const response = await payment.save();

    res.json({
      ...(response?._doc || {}),
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    throw new CustomAPIError('payment-order', error?.message || error?.error?.reason, error.statusCode || 500);
  }
});

paymentRouter.get('/verify', async (req, res) => {
  try {
    const user = req.user;
    const isPremiumUser = user.isPremiumUser;
    res.json({
      user,
      message: isPremiumUser ? 'User is a premium member' : 'User is not a premium member',
    });
  } catch (error) {
    throw new CustomAPIError('payment-verify', error.message, error.statusCode || 500);
  }
});

module.exports = paymentRouter;
