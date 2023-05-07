const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("../utils/jwt");
const user = require("../models/user");

// Register Function
function register(req, res) {
  const { firstname, lastname, email, nick, password } = req.body;
  // If email or password is missing...
  if (!email) res.status(400).send({ msg: "El email es obligatorio" });
  if (!password) res.status(400).send({ msg: "La contraseña es obligatoria" });

  // New User
  const user = new User({
    firstname,
    lastname,
    nick,
    email: email.toLowerCase(),
    role: "user",
    active: false
  });

  // Password encryption
  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(password, salt);
  user.password = hashPassword;

  // Save into DB
  user.save((error, userStorage) => {
    if (error) {
      res.status(400).send({ msg: "Error al crear el usuario" });
    } else {
      res.status(200).send(userStorage);
    }
  });
}

function login(req, res) {
  const { email, password } = req.body;

  if (!email) res.status(400).send({ msg: "El email es obligatorio" });
  if (!password) res.status(400).send({ msg: "La contraseña es obligatoria" });

  const emailLowerCase = email.toLowerCase();

  User.findOne({ email: emailLowerCase }, (error, userStorage) => {
    if (error) {
      res.status(500).send({ msg: "Error del servidor" });
    } else {
      bcrypt.compare(password, userStorage.password, (bcryptError, check) => {
        if (bcryptError) {
          res.status(500).send({ msg: "Error del servidor" });
        } else if (!check) {
          res.status(400).send({ msg: "Contraseña incorrecta" });
        } else if (!userStorage.active) {
          res.status(401).send({ msg: "Usuario no autorizado" });
        } else {
          res.status(200).send({
            access: jwt.createAccessToken(userStorage),
            refresh: jwt.createRefreshToken(userStorage)
          });
        }
      });
    }
  });
}

function test() {
  console.log(test);
}

module.exports = {
  register,
  login
};
