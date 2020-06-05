const jwt = require("jsonwebtoken");
const config = require("config");

// Verify the jsonwebtoken from the client - Authenticate users:
// Middleware function has access to the request and response cycle/objects
// And, the next param means, once done, move on to the next piece of middleware

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  // Check if no token at all
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
