const mongoose = require("mongoose");
const app = require("./app");
const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  IP_SERVER,
  API_VERSION,
} = require("./constants");

const PORT = 3977;

mongoose.connect(
  `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/`,
  (error) => {
    if (error) throw error;

    app.listen(PORT, "0.0.0.0", () => {
      console.log("##################");
      console.log("#### API REST ####");
      console.log("##################");
      console.log(`http://${IP_SERVER}:${PORT}/api/${API_VERSION}`);
    });
  }
);
