const express = require("express");
const router = express.Router();
const usersRouter = require("./users");
const chatRouter = require("./chat");
const chattingRouter = require("./chatting");

router.use("/users", usersRouter);
router.use("/chat", chatRouter);
router.use("/chatting", chattingRouter);

module.exports = router;
