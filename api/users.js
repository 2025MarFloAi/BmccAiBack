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
        process.env.NODE_ENV === "production"
          ? "Check your database connection"
          : `Check your database connection: ${error.message}`,
    });
  }
});

module.exports = router;