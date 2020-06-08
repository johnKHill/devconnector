const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
// MODElS
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// const { check, validationResult } = require("express-validator/check"); // Deprecated
// still can use the check method with express-validator
const { check, validationResult } = require("express-validator");

// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.post(
  "/",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    // Checking for errors in the body
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // get the user
      const user = await User.findById(req.user.id).select("-password");

      // Create a new post object
      const newPost = new Post ({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      // Save the new promised post to the DB
      const post = await newPost.save();

      // Next, get the post back in the response
      res.json(post)
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error")
    }



  }
);

module.exports = router;
