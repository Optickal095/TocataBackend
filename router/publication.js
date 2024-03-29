const express = require("express");
const multiparty = require("connect-multiparty");
const PublicationController = require("../controllers/publication");
const md_auth = require("../middlewares/authenticated");

const md_upload = multiparty({ uploadDir: "./uploads/publication" });
const md_upload_audio = multiparty({ uploadDir: "./uploads/audio" });
const api = express.Router();

api.post(
  "/publication",
  [md_auth.asureAuth, md_upload],
  PublicationController.savePublication
);
api.get(
  "/publications/:page?",
  [md_auth.asureAuth],
  PublicationController.getPublications
);
api.get(
  "/publications-user/:user/:page?",
  [md_auth.asureAuth],
  PublicationController.getPublicationsUser
);
api.get(
  "/publication/:id",
  [md_auth.asureAuth],
  PublicationController.getPublication
);
api.get(
  "/mypublications/:page?",
  [md_auth.asureAuth],
  PublicationController.getMyPublications
);
api.delete(
  "/publication/:id",
  [md_auth.asureAuth],
  PublicationController.deletePublication
);
api.get(
  "/publicationscounter",
  [md_auth.asureAuth],
  PublicationController.getPublicationsCounter
);
api.post(
  "/upload-image-pub/:id",
  [md_auth.asureAuth, md_upload],
  PublicationController.uploadImage
);
api.get("/get-image-pub/:imageFile", PublicationController.getImageFile);

api.get("/allpublications/:page?", PublicationController.getAllPublications);

api.post(
  "/upload-audio-pub/:id",
  [md_auth.asureAuth, md_upload_audio],
  PublicationController.uploadAudio
);

api.get("/get-audio-pub/:audioFile", PublicationController.getAudioFile);

module.exports = api;
