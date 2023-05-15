const express = require("express");
const FollowController = require("../controllers/follow");
const md_auth = require("../middlewares/authenticated");

const api = express.Router();

api.post("/follow", [md_auth.asureAuth], FollowController.saveFollow);
api.delete("/follow/:id", [md_auth.asureAuth], FollowController.deleteFollow);

module.exports = api;
