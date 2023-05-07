const mongoose = require("mongoose");
const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  IP_SERVER,
  API_VERSION
} = require("./constants");

mongoose.connect(
  `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/`,
  (error) => {
    if (error) throw error;

    console.log("La conexion con la base de datos ha sido exitosa");
  }
);
