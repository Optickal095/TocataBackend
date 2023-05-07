const User = require("../models/user");
const bcrypt = require("bcryptjs");

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

module.exports = {
  register
};
