const express = require("express");
const router = express.Router();
const { User } = require("../database");

router.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    console.log(`Found ${users.length} users`);
    res.json({
      message: "You successfully connected to the database 🥳",
      usersCount: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      error: "Failed to fetch users",
      message:
        "Check your database connection, and consider running your seed file: npm run seed",
    });
  }
});

module.exports = router;
