const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Message = require("../models/message.model");

module.exports = (server) => {
  const io = socketIO(server);

  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
        const cookieString = socket.handshake.headers.cookie; 
        console.log("Socket Cookie String:", cookieString); // Debug log

        if(!cookieString) return next(new Error("Authentication error: No cookies found"));

        const cookies = Object.fromEntries(cookieString.split('; ').map(c => {
            const [key, ...v] = c.split('=');
            return [key, decodeURIComponent(v.join('='))];
        }));

        const token = cookies.token;
        console.log("Socket Token:", token ? "Found" : "Not Found"); // Debug log

        if (!token) return next(new Error("Authentication error: No token found"));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.userId);

        if (!currentUser) return next(new Error("Authentication error: User not found"));

        socket.user = currentUser;
        next();
    } catch (err) {
        console.error("Socket Auth Error:", err.message);
        next(new Error("Authentication error: " + err.message));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user.role})`);

    const userId = socket.user._id.toString();
    const userRole = socket.user.role;

    // Join specific room based on user ID
    // Users join their own room: chat_USERID
    // Admins can join any room, but initially they join "admin_room" for notifications
    socket.join(`chat_${userId}`);
    
    if (userRole === 'admin') {
        socket.join('admin_room');
    }

    // Admin joins a specific user's chat room
    socket.on('admin_join_chat', (targetUserId) => {
        if(userRole === 'admin') {
            socket.join(`chat_${targetUserId}`);
            console.log(`Admin joined chat_${targetUserId}`);
        }
    });

    // Handle sending messages
    socket.on("sendMessage", async (data) => {
        console.log(`[Socket] Message received from ${socket.user.name} (${userRole}):`, data);
        
        try {
            const { content, targetUserId } = data;
            
            let roomId;
            let receiverId; 

            if(userRole === 'user') {
                roomId = `chat_${userId}`;
            } else if (userRole === 'admin') {
                if(!targetUserId) return;
                roomId = `chat_${targetUserId}`;
                receiverId = targetUserId;
            }

            console.log(`[Socket] Target Room: ${roomId}`);

            // Save to DB
            const newMessage = await Message.create({
                sender: userId,
                receiver: receiverId || null, 
                content,
                role: userRole
            });
            
            console.log(`[Socket] Message Saved: ${newMessage._id}`);

            // Emit to the specific room (User's room)
            io.to(roomId).emit("newMessage", {
                _id: newMessage._id,
                content: newMessage.content,
                sender: { _id: socket.user._id, name: socket.user.name, role: userRole },
                createdAt: newMessage.createdAt
            });
            console.log(`[Socket] Emitted newMessage to ${roomId}`);

            // If a User sent a message, notify Admins (who are in admin_room)
            if (userRole === 'user') {
                io.to('admin_room').emit("adminNotification", {
                    userId: userId,
                    userName: socket.user.name,
                    content: content
                });
                console.log(`[Socket] Emitted adminNotification to admin_room`);
            }

        } catch (error) {
            console.error("[Socket] Message Error:", error);
        }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};
