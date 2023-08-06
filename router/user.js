const express = require("express");
const multiparty = require("connect-multiparty");
const UserController = require("../controllers/user");
const md_auth = require("../middlewares/authenticated");

const md_upload = multiparty({ uploadDir: "./uploads/avatar" });
const api = express.Router();

api.get("/user/me", [md_auth.asureAuth], UserController.getMe);
api.get("/users/:page", [md_auth.asureAuth], UserController.getUsers);
api.get("/user/:id", [md_auth.asureAuth], UserController.getUser);
api.post("/user", [md_auth.asureAuth, md_upload], UserController.createUser);
api.put("/user/:id", [md_auth.asureAuth, md_upload], UserController.updateUser);
api.delete("/user/:id", [md_auth.asureAuth], UserController.deleteUser);
api.get("/counters/:id?", [md_auth.asureAuth], UserController.getCounters);
api.post(
  "/upload-image-user/:id",
  [md_auth.asureAuth, md_upload],
  UserController.uploadImage
);

module.exports = api;
