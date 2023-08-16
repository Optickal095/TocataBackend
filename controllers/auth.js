const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("../utils/jwt");
const user = require("../models/user");

// Register Function
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
    description: null,
    role: "user",
    active: true,
  });

  // Password encryption
  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(password, salt);
  user.password = hashPassword;

  // Save into DB
  user.save((err, userStored) => {
    if (err) {
      // Handle the error and send an appropriate response
      res
        .status(500)
        .send({ msg: "Error al guardar el usuario en la base de datos" });
    } else {
      // Send a success response
      res.status(200).send({ user: userStored });
    }
  });
}

function login(req, res) {
  const { email, password } = req.body;

  // Si el email o la contraseña están faltando...
  if (!email) res.status(400).send({ msg: "El email es obligatorio" });
  if (!password) res.status(400).send({ msg: "La contraseña es obligatoria" });

  // email en minúsculas
  const emailLowerCase = email.toLowerCase();

  // Encuentra el email
  User.findOne({ email: emailLowerCase }, (error, userStorage) => {
    if (error) {
      res.status(500).send({ msg: "Error del servidor" });
    } else if (!userStorage) {
      res.status(400).send({ msg: "Usuario no encontrado" });
    } else {
      // Compara la contraseña encriptada
      bcrypt.compare(password, userStorage.password, (bcryptError, check) => {
        if (bcryptError) {
          res.status(500).send({ msg: "Error del servidor" });
        } else if (!check) {
          res.status(400).send({ msg: "Contraseña incorrecta" });
        } else if (!userStorage.active) {
          res.status(401).send({ msg: "Usuario no autorizado" });
        } else {
          // Crea el token de acceso y devuelve el objeto User junto con el token
          const accessToken = jwt.createAccessToken(userStorage);
          res.status(200).send({
            user: userStorage,
            access: accessToken,
          });
        }
      });
    }
  });
}

function refreshAccessToken(req, res) {
  const { token } = req.body;

  if (!token) {
    res.status(400).send({ msg: "Token requerido" });
    return;
  }

  try {
    const decodedToken = jwt.verify(token, "secret_key"); // Reemplaza 'secret_key' con tu clave secreta

    if (!decodedToken || !decodedToken.user_id) {
      res.status(400).send({ msg: "Token inválido" });
      return;
    }

    const { user_id } = decodedToken;

    User.findOne({ _id: user_id }, (error, userStorage) => {
      if (error) {
        res.status(500).send({ msg: "Error del servidor" });
      } else {
        res.status(200).send({
          accessToken: jwt.sign({ user_id: userStorage._id }, "secret_key", {
            expiresIn: "1h",
          }), // Genera un nuevo token de acceso con una validez de 1 hora
        });
      }
    });
  } catch (error) {
    res.status(400).send({ msg: "Token inválido" });
  }
}

module.exports = {
  register,
  login,
  refreshAccessToken,
};
