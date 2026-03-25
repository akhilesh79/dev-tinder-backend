const { required } = require('joi');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paymentDetails: { type: Object },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    receipt: { type: String, required: true },
    notes: { type: Object },
    status: { type: String, required: true },
    orderCreatedAt: { type: Date },
  },
  { timestamps: true },
);

const Payments = mongoose.model('Payments', paymentSchema);

module.exports = Payments;
