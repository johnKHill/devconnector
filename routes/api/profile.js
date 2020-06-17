const express = require("express");
const axios = require("axios");
const request = require("request");
const config = require("config");
const router = express.Router();

const auth = require("../../middleware/auth");
// const { check, validationResult } = require("express-validator/check"); // Deprecated
// still can use the check method with express-validator
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private
router.get("/me", auth, async (req, res) => {
  // Look up user profile
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/profile
// @desc     Create or update a user profile
// @access   Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // If there are errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Destructuring/retrieve data from the req.body
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    // Build profile object to insert into Db and add the profileFields
    const profileFields = {};
    profileFields.user = req.user.id;
    // Check if fields are coming in
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    // Build/Initialize social object
    profileFields.social = {};
    // Check if fields are coming in
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    // Look up user profile
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      // if found
      if (profile) {
        // Update it
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        // And return it
        return res.json(profile);
      }
      // If not, Create a new one
      profile = new Profile(profileFields);

      // Save and return the new profile
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.massage);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get("/", async (req, res) => {
  // Look up user profiles
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err, message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get("/user/:user_id", async (req, res) => {
  // Look up user profile
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) return res.status(400).json({ msg: "Profile not found" });

    res.json(profile);
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/profile
// @desc     Delete profile, user, and posts
// @access   Private
router.delete("/", auth, async (req, res) => {
  try {
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //Remove the user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err, message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),

      check("company", "Company is required").not().isEmpty(),

      check("from", "From date required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructuring/retrieve data from the req.body
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    // This creates an object with the data the user submits
    const newEXP = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    // Look up user profile
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      // putting the new object with the data up front in the array
      profile.experience.unshift(newEXP);

      // Save and return the new profile
      await profile.save();

      // return entire profile
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  // Look up user profile
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get the remove index - to get the correct experience
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    // Splice/take out 1 experience by it's exp.id
    profile.experience.splice(removeIndex, 1);

    // Save and return the profile
    await profile.save();
    // return entire profile
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// -----------------------------------------------------------------
// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),

      check("degree", "Degree is required").not().isEmpty(),

      check("fieldofstudy", "Firld of study is required").not().isEmpty(),

      check("from", "From date required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructuring/retrive data from the req.body
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    // This creates an object with the data the user submits
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    // Look up user profile
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      // putting the new object with the data up front in the array
      profile.education.unshift(newEdu);

      // Save and return the new profile
      await profile.save();

      // return entire profile
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  // Look up user profile
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get the remove index - to get the correct education
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    // Splice/take out 1 education by it's edu.id
    profile.education.splice(removeIndex, 1);

    // Save and return the profile
    await profile.save();
    // return entire profile
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from github
// @access   Public
router.get("/github/:username", async (req, res) => {
  try {
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );
    const headers = {
      "user-agent": "node.js",
      Authorization: `token ${config.get("githubToken")}`,
    };

    const gitHubResponse = await axios.get(uri, { headers });

    res.json(gitHubResponse.data);
  } catch (err) {
    console.error(err.message);
    return res.status(404).send({ msg: "No Github profile found" });
  }
});
module.exports = router;
