const Users = require("../models/userModel");
const jwt = require("jsonwebtoken");

async function auth(req, res, next) {
  let token;
  try {
    token = req.header("Authorization").split("Bearer ")[1];
  } catch (error) {
    return res.status(500).send({ message: "Bad Authentication" });
  }
  if (!token) {
    return res.status(401).send("Access denied , no token provided");
  }
  try {
    const decoded = jwt.verify(token, "privateKey");
    let result = await Users.findById(decoded.userId);
    if (result) {
      req.user = result;
      next();
    } else {
      next();
    }
  } catch (ex) {
    next();
  }
}

module.exports = {
  auth,
};
