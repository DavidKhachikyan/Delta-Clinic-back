const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/User");

const checkAuth = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "Unauthorized" });
  }
  const verifiedToken = jwt.verify(
    token,
    config.get("jwtSecret"),
    async (err, payload) => {
      const user = await User.findOne({ _id: payload.userId });
      if (!user) {
        return res.status(401).send({ message: "Unauthorized" });
      }
      req.user = user;
      next();
    }
  );
};

exports.checkAuth = checkAuth;
