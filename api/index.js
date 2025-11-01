const express = require("express");
const router = express.Router();
const usersRouter = require("./users");
const chatRouter = require("./chat");

router.use("/users", usersRouter);
router.use("/chat", chatRouter);

module.exports = router;
