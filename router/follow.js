const express = require("express");
const FollowController = require("../controllers/follow");
const md_auth = require("../middlewares/authenticated");

const api = express.Router();

api.post("/follow", [md_auth.asureAuth], FollowController.saveFollow);
api.delete("/follow/:id", [md_auth.asureAuth], FollowController.deleteFollow);
api.get(
  "/following/:id?/:page?",
  [md_auth.asureAuth],
  FollowController.getFollowingUsers
);
api.get(
  "/followed/:id?/:page?",
  [md_auth.asureAuth],
  FollowController.getFollowedUsers
);

module.exports = api;
