const Message = require("../models/message.model");
const ApiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");

// @desc    Get chat history
// @route   GET /api/v1/messages/:userId?
// @access  Protected
exports.getChatHistory = asyncHandler(async (req, res, next) => {
  let query = {};

  if (req.user.role === "admin") {
    // Admin needs to provide a userId to see their specific chat history
    const { userId } = req.params;
    if (!userId) {
      return next(new ApiError("UserId is required for admins", 400));
    }
    query = {
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    };
  } else {
    // Regular user sees their own chat history
    query = {
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    };
  }

  const messages = await Message.find(query)
    .sort("createdAt")
    .populate("sender", "name role");

  res.status(200).json({
    status: "success",
    results: messages.length,
    data: messages,
  });
});

// @desc    Get all active chats (for admin)
// @route   GET /api/v1/messages/active-chats
// @access  Protected (Admin only)
exports.getActiveChats = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ApiError("Access denied: Admins only", 403));
  }

  // Find users who sent messages (role: 'user' means the sender was a user)
  const messages = await Message.find({ role: "user" })
    .sort("-createdAt")
    .populate("sender", "name");

  const uniqueChats = [];
  const seenUsers = new Set();

  for (const msg of messages) {
    if (msg.sender && !seenUsers.has(msg.sender._id.toString())) {
      seenUsers.add(msg.sender._id.toString());
      
      uniqueChats.push({
        userId: msg.sender._id,
        userName: msg.sender.name || "User",
        content: msg.content,
        createdAt: msg.createdAt
      });
    }
  }

  res.status(200).json({
    status: "success",
    results: uniqueChats.length,
    data: uniqueChats,
  });
});
