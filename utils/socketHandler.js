const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Message = require("../models/message.model");

module.exports = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const cookieString = socket.handshake.headers.cookie;
      if (!cookieString) {
        return next(new Error("Authentication error: No cookies found"));
      }

      // Robust cookie parsing
      const cookies = cookieString.split(";").reduce((acc, curr) => {
        const [key, ...v] = curr.split("=");
        if (key) acc[key.trim()] = decodeURIComponent(v.join("="));
        return acc;
      }, {});

      const { token } = cookies;
      console.log("Socket Token:", token ? "Found" : "Not Found");

      if (!token) {
        return next(new Error("Authentication error: No token found"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.userId);

      if (!currentUser) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = currentUser;
      next();
    } catch (err) {
      console.error("Socket Auth Error:", err.message);
      next(new Error(`Authentication error: ${err.message}`));
    }
  });

  io.on("connection", (socket) => {
    // Standardize role to lowercase for consistent checks
    const userRole = socket.user.role ? socket.user.role.toLowerCase() : "user";
    console.log(`User connected: ${socket.user.name} (${userRole})`);

    const userId = socket.user._id.toString();

    socket.join(`chat_${userId}`);

    if (userRole === "admin") {
      socket.join("admin_room");
    }

    socket.on("admin_join_chat", (targetUserId) => {
      if (userRole === "admin") {
        socket.join(`chat_${targetUserId}`);
        console.log(`Admin joined chat_${targetUserId}`);
      }
    });

    socket.on("sendMessage", async (data) => {
      console.log(
        `[Socket] Message received from ${socket.user.name} (${userRole}):`,
        data
      );

      try {
        const { content, targetUserId } = data;
        let roomId;
        let receiverId;

        if (userRole === "user") {
          roomId = `chat_${userId}`;
        } else if (userRole === "admin") {
          if (!targetUserId) return;
          roomId = `chat_${targetUserId}`;
          receiverId = targetUserId;
        }

        console.log(`[Socket] Target Room: ${roomId}`);

        const newMessage = await Message.create({
          sender: userId,
          receiver: receiverId || null,
          content,
          role: userRole,
        });

        console.log(`[Socket] Message Saved: ${newMessage._id} in room ${roomId}`);

        const messageData = {
          _id: newMessage._id,
          content: newMessage.content,
          sender: {
            _id: socket.user._id,
            name: socket.user.name,
            role: userRole,
          },
          createdAt: newMessage.createdAt,
        };

        // Emit to the target room
        io.to(roomId).emit("newMessage", messageData);

        // EXTRA: If user sends to admin, and admin isn't in the specific room yet, 
        // they MUST get the notification to know there is a new message available.
        if (userRole === "user") {
          io.to("admin_room").emit("adminNotification", {
            userId,
            userName: socket.user.name,
            content,
          });
          console.log(`[Socket] Admin notification sent for user ${userId}`);
        }
      } catch (error) {
        console.error(`[Socket] Message Error: ${error.message}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};