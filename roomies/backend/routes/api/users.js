const express = require("express");
const router = express.Router();

// User Model
import User from "../../models/User";

/**
 * @route   GET api/users
 * @desc    Get all users
 * @access  Private
 */

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    if (!users) throw Error("No users exist");
    res.json(users);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

export default router;