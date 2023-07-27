const express = require("express");
const NoticeController = require("../controllers/notice");
const md_auth = require("../middlewares/authenticated");

const api = express.Router();

api.post("/notice", [md_auth.asureAuth], NoticeController.saveNotice);
api.get("/notices/:page?", [md_auth.asureAuth], NoticeController.getNotices);
api.get("/notice/:id", [md_auth.asureAuth], NoticeController.getNotice);
api.delete("/notice/:id", [md_auth.asureAuth], NoticeController.deleteNotice);
api.get(
  "/noticescounter",
  [md_auth.asureAuth],
  NoticeController.getNoticesCounter
);

module.exports = api;
