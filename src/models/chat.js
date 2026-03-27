const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  text: { type: String, required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  time: { type: Date, default: Date.now },
});

const chatSchema = new Schema(
  {
    roomHash: { type: String, required: true, unique: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    messages: [messageSchema],
  },
  { timestamps: true },
);

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
