const express = require("express");
const router = express.Router();
const messageController = require("../controllers/MessageController");
const {
  accessTokenVerify,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.post("/",accessTokenVerify, messageController.createMessage);
router.get("/:chatId", accessTokenVerify, messageController.getMessagesByChat);
router.post('/chatroom', accessTokenVerify, messageController.createOrGetChatRoom);
router.get('/user/:userId', accessTokenVerify, messageController.getUserChatRooms);



module.exports = router;
