const express = require("express");
const AuthController = require("../controllers/auth");

const api = express.Router();

api.post("/auth/register", AuthController.register);
api.post("/auth/login", AuthController.login);

module.exports = api;
