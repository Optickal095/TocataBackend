const express = require("express");
const multiparty = require("connect-multiparty");
const PublicationController = require("../controllers/publication");
const md_auth = require("../middlewares/authenticated");

const md_upload = multiparty({ uploadDir: "./uploads/publication" });
const api = express.Router();

api.post(
  "/publication",
  [md_auth.asureAuth],
  PublicationController.savePublication
);

module.exports = api;
