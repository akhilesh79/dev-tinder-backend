const mongoose = require('mongoose');
const { CustomAPIError } = require('../utils/customError');

const { Schema } = mongoose;

const connectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['ignored', 'interested', 'accepted', 'rejected'],
        message: '${VALUE} is not allowed as connection status',
      },
      required: true,
    },
  },
  { timestamps: true },
);

// moongoose middleware - before saving to db
connectionRequestSchema.pre('save', function () {
  const connectionRequest = this;

  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new CustomAPIError(
      'connection-request-schema-validation',
      'Connection request cannot be send to himself',
      400,
    );
  }
});

// indexes
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

// model representing the collection
const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);

module.exports = ConnectionRequest;
