const express = require("express");
const router = express.Router();
const { protect } = require("../../controllers/auth.controller");

const Message = require("../../models/message.model");
const User = require("../../models/user.model");

// User: Chat Interface
router.get("/chat", protect, async (req, res, next) => {
  try {
    // Redirect Admin to Admin Chat List
    if (req.user.role === 'admin') {
      return res.redirect('/admin/chats');
    }

    // Fetch history
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    }).sort("createdAt");

    // Mark messages received by this user as read
    await Message.updateMany({ receiver: req.user._id, read: false }, { read: true });

    res.render("chat/index", {
      user: req.user,
      messages: messages
    });
  } catch (error) {
    next(error);
  }
});

// Admin: List of conversations
router.get("/admin/chats", protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).render("error", { message: "Access denied" });
    }
    
    // Find distinct users who have sent messages + populate their info
    const messages = await Message.find({ role: 'user' }).sort("-createdAt");
    const uniqueSenders = [];
    const seenSenders = new Set();
    
    for (const msg of messages) {
      if (!seenSenders.has(msg.sender.toString())) {
        seenSenders.add(msg.sender.toString());
        const user = await User.findById(msg.sender);
        if(user) uniqueSenders.push({ user, lastMessage: msg });
      }
    }

    res.render("admin/chat/list", {
      user: req.user,
      conversations: uniqueSenders
    });
  } catch (error) {
    next(error);
  }
});

// Admin: Chat Detail
router.get("/admin/chats/:userId", protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).render("error", { message: "Access denied" });
    }
    
    const targetUser = await User.findById(req.params.userId);
    if(!targetUser) return res.status(404).render("error", {message: "User not found"});

    // Mark messages from this user as read
    await Message.updateMany({ sender: targetUser._id, read: false }, { read: true });

    const messages = await Message.find({
      $or: [
        { sender: targetUser._id },
        { receiver: targetUser._id } // Admin reply
      ]
    }).sort("createdAt");

    res.render("admin/chat/detail", {
      user: req.user,
      targetUser: targetUser,
      messages: messages
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
