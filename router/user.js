const express = require("express");
const UserController = require("../controllers/user");

const api = express.Router();

api.get("/user/me", UserController.getMe);

module.exports = api;
