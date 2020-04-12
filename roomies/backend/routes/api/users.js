const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");

// User Model
const User = require("../../models/User");

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

/**
 * @route   POST api/users
 * @desc    Register new user
 * @access  Public
 */

router.post("/", (req, res) => {
  const { email, password, name } = req.body;

  // validate unique email
  User.findOne({ email }).then(user => {
    if (user) {
      return res.status(400).json({ error: "User already exist" });
    }

    // const newUser = new User({ name, email, password });

    // Salt & Hash
    bcrypt.genSalt(10, (err, salt) => {
      if (err) throw err;
      bcrypt.hash(password, salt, (err, passHash) => {
        if (err) throw err;
        // newUser.password = hash;

        // create new user and return user token valid for 1 hour
        User.create({ name, email, password: passHash })
          .then(user => {
            jwt.sign(
              {
                id: user._id
              },
              config.get("JWT_SECRET"),
              { expiresIn: 60 * 60 * 1000 },
              (err, token) => {
                if (err) throw err;

                res.json({
                  msg: "User was added successfully",
                  token,
                  user: {
                    _id: user._id,
                    name,
                    email
                  }
                });
              }
            );
          })
          .catch(err => {
            console.log("registration err: " + err);
            res.status(400).json({ error: "Unable to add new user" });
          });
      });
    });
  });
});

module.exports = router;
