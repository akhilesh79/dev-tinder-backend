const express = require('express');
const { validateSendConnectionRequest, validateReviewRequest } = require('../../utils/validation');
const { CustomAPIError } = require('../../utils/customError');
const User = require('../../models/user');
const ConnectionRequest = require('../../models/connectionRequest');

const router = express.Router(); // object which handles routes in our web server application, can we passed as middle in app.use(), or its own .use().

router.post('/send/:status/:toUserId', validateSendConnectionRequest, async (req, res, next) => {
  try {
    const { toUserId, status } = req.params;
    const { _id: fromUserId } = req.user;

    // check if toUserId exists as User.
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      throw new CustomAPIError('send-request', 'toUser didnt found', 404);
    }

    // check if connection already exists
    const isConnectionAlreadyExists = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (isConnectionAlreadyExists) {
      throw new CustomAPIError('send-request', 'Connection already exists', 409);
    } else {
      const connectionPayload = {
        fromUserId,
        toUserId,
        status,
      };

      const connectionRequest = new ConnectionRequest(connectionPayload);
      const response = await connectionRequest.save();

      res.json({
        message: 'Connection sent successfully!!',
        data: response,
      });
    }
  } catch (error) {
    throw new CustomAPIError('send-request', error.message, error.statusCode || 500);
  }
});

router.post('/review/:status/:requestId', validateReviewRequest, async (req, res) => {
  try {
    const { status, requestId } = req.params;
    const { _id: loggedInUserId } = req.user;

    const connectionRequestExists = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUserId,
      status: 'interested',
    });

    if (!connectionRequestExists) {
      throw new CustomAPIError('review-request', 'Connection request not exists', 400);
    }

    connectionRequestExists.status = status;
    const response = await connectionRequestExists.save();

    res.json({
      message: `Connection request: ${status}`,
      data: response,
    });
  } catch (error) {
    throw new CustomAPIError('review-request', error.message, error.statusCode || 500);
  }
});

module.exports = router;
