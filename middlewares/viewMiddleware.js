const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Cart = require("../models/cart.model");

const Message = require("../models/message.model");

// Middleware to get user from token and pass to views
const getUserForView = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = user;
          res.locals.user = user;

          // Fetch Cart for the user
          const cart = await Cart.findOne({ user: user._id });
          res.locals.cart = cart || null;

          // Fetch Unread Messages
          let unreadCount = 0;
          if (user.role === 'admin') {
              // Admin: Count messages from users that are unread
              unreadCount = await Message.countDocuments({ role: 'user', read: false });
          } else {
              // User: Count messages addressed to this user (or generally from admin) that are unread
              // Assuming messages from admin have role: 'admin' and receiver: user._id
              // OR if we just check unread messages where receiver is this user.
              unreadCount = await Message.countDocuments({ receiver: user._id, read: false });
          }
          res.locals.unreadCount = unreadCount;

        }
      } catch (err) {
        // Token invalid or expired, continue without user
      }
    }
  } catch (err) {
    // Continue without user
  }
  if (!res.locals.user) res.locals.user = null;
  if (!res.locals.cart) res.locals.cart = null;
  if (res.locals.unreadCount === undefined) res.locals.unreadCount = 0;
  next();
};

module.exports = getUserForView;

