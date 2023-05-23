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
api.get(
  "/get-my-follows/:followed?",
  [md_auth.asureAuth],
  FollowController.getMyFollows
);
api.get(
  "/user-following/:id",
  [md_auth.asureAuth],
  FollowController.isFollowing
);
api.get("/counters/:id?", [md_auth.asureAuth], FollowController.getCounters);
module.exports = api;
