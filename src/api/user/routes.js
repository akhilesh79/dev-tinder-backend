const express = require('express');
const { CustomAPIError } = require('../../utils/customError');
const ConnectionRequest = require('../../models/connectionRequest');
const User = require('../../models/user');
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
      if (String(connection.fromUserId._id) === String(loggedInUser._id)) {
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

router.get('/feeds', async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const aggregationQuery = [
      {
        $match: {
          _id: {
            $ne: loggedInUser._id,
          },
        },
      },
      {
        $lookup: {
          from: 'connectionrequests',
          let: {
            loggedInUserId: loggedInUser._id,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [{ $eq: ['$fromUserId', '$$loggedInUserId'] }, { $eq: ['$toUserId', '$$loggedInUserId'] }],
                },
              },
            },
            {
              $project: {
                fromUserId: 1,
                toUserId: 1,
              },
            },
          ],
          as: 'requests',
        },
      },
      {
        $addFields: {
          alreadyExistsConnectionRequest: {
            $setUnion: ['$requests.fromUserId', '$requests.toUserId'],
          },
        },
      },
      {
        $match: {
          $expr: {
            $not: {
              $in: ['$_id', '$alreadyExistsConnectionRequest'],
            },
          },
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          profileImage: 1,
          age: 1,
          gender: 1,
          about: 1,
          skills: 1,
        },
      },
    ];

    const totalDocs = (await User.aggregate(aggregationQuery)).length;
    const userFeeds = await User.aggregate([...aggregationQuery, { $skip: skip }, { $limit: limit }]);

    const totalPages = Math.ceil(totalDocs / limit);

    res.json({
      message: 'Feeds fetched successfully',
      docs: userFeeds,
      page: page,
      limit: limit,
      totalDocs,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    throw new CustomAPIError('feed', error.message, error.statusCode || 500);
  }
});

module.exports = router;
