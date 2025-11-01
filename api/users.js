const express = require("express");
const router = express.Router();
const { User } = require("../database");

router.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    res.send(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      error: "Failed to fetch users",
      message:
        "Check your database connection",
    });
  }
});

module.exports = router;