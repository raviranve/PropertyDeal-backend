const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");
const { success, error } = require("../utils/responseHandler");

exports.createMessage = async (req, res, next) => {
  try {
    const {
      chatId,
      senderId,
      receiverId,
      messageType,
      messageContent,
      propertyId,
      name,
    } = req.body;

    const message = await Message.create({
      chatId,
      senderId,
      receiverId,
      messageType,
      messageContent,
      propertyId,
    });

    await ChatRoom.findByIdAndUpdate(chatId, { lastMessage: message._id });

    success(res, message, "Message sent successfully");
  } catch (err) {
    next(err);
  }
};

exports.getMessagesByChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 }).populate('senderId');

    success(res, messages, "Messages fetched");
  } catch (err) {
    next(err);
  }
};


exports.createOrGetChatRoom = async (req, res, next) => {
  try {
    const { userId1, userId2, propertyId } = req.body;

    let chatRoom = await ChatRoom.findOne({
      members: { $all: [userId1, userId2] },
      propertyId,
    });

    if (!chatRoom) {
      chatRoom = await ChatRoom.create({
        members: [userId1, userId2],
        propertyId,
      });
    }

    res.status(200).json(chatRoom);
  } catch (err) {
    next(err);
  }
};

exports.getUserChatRooms = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const chatRooms = await ChatRoom.find({
      members: userId,
    }).populate('lastMessage').populate('members', 'name image');

    res.status(200).json(chatRooms);
  } catch (err) {
    next(err);
  }
};
