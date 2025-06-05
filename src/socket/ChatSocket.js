const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");

let users = {}; // userId -> Set(socketIds)
let chatParticipants = {}; // chatId -> Set(userIds)

function chatSocket(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle user joining their own userId room
    socket.on("joinRoom", ({ userId, chatId }) => {
      console.log(userId, "joined room:", chatId);

      // Track user's socket
      if (!users[userId]) users[userId] = new Set();
      users[userId].add(socket.id);
      socket.join(userId); // personal room

      // Track user in chatId room
      if (chatId) {
        if (!chatParticipants[chatId]) chatParticipants[chatId] = new Set();
        chatParticipants[chatId].add(userId);
        socket.join(chatId); // chat room
        console.log(`User ${userId} joined chat room ${chatId}`);
      }
    });

    // Handle sending messages
    socket.on("sendMessage", async (data) => {
      const {
        chatId,
        senderId,
        receiverId,
        messageContent,
        messageType,
        propertyId,
      } = data;

      const newMsg = await Message.create({
        chatId,
        senderId,
        receiverId,
        messageContent,
        messageType,
        propertyId,
      });

      await ChatRoom.findByIdAndUpdate(chatId, { lastMessage: newMsg._id });

      // Broadcast to all users in the chatId room
      const participants = chatParticipants[chatId];
      console.log(participants, "participants in chat room:", chatId);
      if (participants) {
        participants.forEach((userId) => {
          io.to(userId).emit("receiveMessage", newMsg);
        });
      } else {
        // fallback: emit to sender and receiver
        io.to(senderId).emit("receiveMessage", newMsg);
        io.to(receiverId).emit("receiveMessage", newMsg);
      }
    });

    // Clean up on disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (const userId in users) {
        users[userId].delete(socket.id);
        if (users[userId].size === 0) {
          delete users[userId];

          // Optional: remove user from all chatParticipants
          for (const chatId in chatParticipants) {
            chatParticipants[chatId].delete(userId);
            if (chatParticipants[chatId].size === 0) {
              delete chatParticipants[chatId];
            }
          }
        }
      }
    });
  });
}

module.exports = chatSocket;
