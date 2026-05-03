const express = require("express");
const { getChatHistory, getActiveChats } = require("../controllers/message.controller");
const { protect } = require("../controllers/auth.controller");

const router = express.Router();

router.use(protect);

// بدون userId (لمستخدم العادي أو القائمة العامة)
router.get("/", getChatHistory);

// قائمة المحادثات النشطة (للأدمن)
router.get("/active-chats", getActiveChats);

// مع userId (للأدمن لجلب شات مستخدم معين)
router.get("/:userId", getChatHistory);

module.exports = router;
