const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { API_VERSION } = require("./constants");

const app = express();

// Configure Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Import Routing
const authRoutes = require("./router/auth");
const userRoutes = require("./router/user");
const followRoutes = require("./router/follow");
const publicationRoutes = require("./router/publication");
const noticeRoutes = require("./router/notice");

// Configure static folder
app.use(express.static("uploads"));

// Configure Header HTTP - CORS
app.use(cors());

//  Configure Routing
app.use(`/api/${API_VERSION}`, authRoutes);
app.use(`/api/${API_VERSION}`, userRoutes);
app.use(`/api/${API_VERSION}`, followRoutes);
app.use(`/api/${API_VERSION}`, publicationRoutes);
app.use(`/api/${API_VERSION}`, noticeRoutes);

module.exports = app;
