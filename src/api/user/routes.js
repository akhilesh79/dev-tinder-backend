const express = require('express');
const mongoose = require('mongoose');
const { CustomAPIError } = require('../../utils/customError');
const ConnectionRequest = require('../../models/connectionRequest');
const User = require('../../models/user');
const Chat = require('../../models/chat');
const { isUserOnline } = require('../../utils/presence');
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
        select: 'firstName lastName profileImage age gender about skills lastSeen',
      },
      {
        path: 'toUserId',
        select: 'firstName lastName profileImage age gender about skills lastSeen',
      },
    ]);

    const connectionsOfLoggedInuser = connectionsMade.map((connection) => {
      if (String(connection.fromUserId._id) === String(loggedInUser._id)) {
        return connection.toUserId;
      }
      return connection.fromUserId;
    });

    const connectionIds = connectionsOfLoggedInuser.map((connection) => connection._id);
    const chats = connectionIds.length
      ? await Chat.find({
          $and: [{ participants: loggedInUser._id }, { participants: { $in: connectionIds } }],
        }).select('participants messages.sender messages.status')
      : [];

    const unreadCountsByUserId = new Map();

    chats.forEach((chat) => {
      const partnerId = chat.participants.find((participantId) => String(participantId) !== String(loggedInUser._id));

      if (!partnerId) {
        return;
      }

      const unreadCount = chat.messages.reduce((count, message) => {
        const isFromPartner = String(message.sender) === String(partnerId);
        const isUnread = message.status !== 'read';
        return isFromPartner && isUnread ? count + 1 : count;
      }, 0);

      unreadCountsByUserId.set(String(partnerId), unreadCount);
    });

    const enrichedConnections = connectionsOfLoggedInuser.map((connection) => {
      const plainConnection = connection.toObject();

      return {
        ...plainConnection,
        isOnline: isUserOnline(connection._id),
        unreadCount: unreadCountsByUserId.get(String(connection._id)) || 0,
      };
    });

    res.json({
      message: 'Data fetched successfully',
      data: enrichedConnections,
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

router.get('/chat/:targetUserId', async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { targetUserId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await Chat.aggregate([
      {
        $match: {
          participants: { $all: [loggedInUser._id, new mongoose.Types.ObjectId(targetUserId)] },
        },
      },
      {
        $project: {
          totalDocs: { $size: '$messages' },
          messages: {
            $let: {
              vars: {
                sorted: { $sortArray: { input: '$messages', sortBy: { time: 1 } } },
                total: { $size: '$messages' },
                skipFromEnd: { $multiply: [page - 1, limit] },
              },
              in: {
                $slice: [
                  '$$sorted',
                  { $max: [0, { $subtract: [{ $subtract: ['$$total', '$$skipFromEnd'] }, limit] }] },
                  { $min: [limit, { $subtract: ['$$total', '$$skipFromEnd'] }] },
                ],
              },
            },
          },
        },
      },
    ]);

    if (!result.length) {
      return res.json({
        message: 'No chat found',
        docs: [],
        page,
        limit,
        totalDocs: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    }

    const { totalDocs, messages } = result[0];
    const totalPages = Math.ceil(totalDocs / limit);

    res.json({
      message: 'Chat history fetched successfully',
      docs: messages,
      page,
      limit,
      totalDocs,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    throw new CustomAPIError('chat-history', error.message, error.statusCode || 500);
  }
});

module.exports = router;
