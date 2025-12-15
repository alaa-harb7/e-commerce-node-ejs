const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        required: true
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
