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
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/posts
// @desc     Get all posts
// @access   Private
router.get("/", auth, async (req, res) => {
  try {
    // get the post by it's most recent date
    const posts = await Post.find().sort({ date: -1 });

    // Next, get all posts back in the response
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/posts/:id
// @desc     Get post by id
// @access   Private
router.get("/:id", auth, async (req, res) => {
  try {
    // get the post by it's id from the url params
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Next, get that post back in the response
    res.json(post);
  } catch (err) {
    console.error(err.message);
    // Err prop called kind is equal to "that" object by its id - it will not
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete("/:id", auth, async (req, res) => {
  try {
    // get the post by it's id from the url params
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" })
    }
    // Remove the post from the DB
    await post.remove();

    // Next, get a remove msg back from the response
    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});


// @route    PUT api/posts/like/:id
// @desc     ULike a post
// @access   Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    // get the post by it's id from the url params
    const post = await Post.findById(req.params.id);

    // Check if post has already been liked by the logged in user
    if (post.likes.filter((like) => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    // putting the post up front "most recent" in the likes array
    post.likes.unshift({ user: req.user.id });

    // Save the post to the DB
    await post.save();

    // Next, get that post likes back in the response
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


module.exports = router;
