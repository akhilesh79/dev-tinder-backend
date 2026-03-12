const express = require('express');
const { CustomAPIError } = require('../../utils/customError');
const ConnectionRequest = require('../../models/connectionRequest');
const router = express.Router();

router.get('/requests/recieved', async (req, res) => {
  try {
    const loggedInUser = req.user;

    const recievedRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: 'interested',
    }).populate([
      {
        path: 'fromUserId',
        select: 'firstName lastName profileImage age gender about skills',
      },
      {
        path: 'toUserId',
        select: 'firstName lastName profileImage age gender about skills',
      },
    ]);

    res.json({
      message: 'Data fetched successfully',
      data: recievedRequests,
    });
  } catch (error) {
    throw new CustomAPIError('requests-recieved', error.message, error.statusCode || 500);
  }
});

router.get('/connections', async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionsMade = await ConnectionRequest.find({
      $or: [{ fromUserId: { $eq: loggedInUser._id } }, { toUserId: { $eq: loggedInUser._id } }],
      status: 'accepted',
    }).populate([
      {
        path: 'fromUserId',
        select: 'firstName lastName profileImage age gender about skills',
      },
      {
        path: 'toUserId',
        select: 'firstName lastName profileImage age gender about skills',
      },
    ]);

    const connectionsOfLoggedInuser = connectionsMade.map((connection) => {
      if (String(connection.fromUserId._id) === loggedInUser._id) {
        return connection.toUserId;
      }
      return connection.fromUserId;
    });

    res.json({
      message: 'Data fetched successfully',
      data: connectionsOfLoggedInuser,
    });
  } catch (error) {
    throw new CustomAPIError('requests-recieved', error.message, error.statusCode || 500);
  }
});

module.exports = router;
