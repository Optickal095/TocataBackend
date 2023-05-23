const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Follow = require("../models/follow");
const image = require("../utils/image");

// getMe Function
async function getMe(req, res) {
  const { user_id } = req.user;

  const response = await User.findById(user_id);

  if (!response) {
    res.status(400).send({ msg: "No se ha encontrado usuario" });
  } else {
    res.status(200).send(response);
  }
}

// getUsers Function
async function getUsers(req, res) {
  const { active } = req.query;
  let response = null;

  if (active === undefined) {
    response = await User.find();
  } else {
    response = await User.find({ active });
  }

  res.status(200).send(response);
}

//getUser Function
async function getUser(req, res) {
  const { id } = req.params;

  User.findById(id, (error, user) => {
    if (error) {
      res.status(500).send({ msg: "Error en la petición" });
    } else if (!user) {
      res.status(404).send({ msg: "El usuario no existe" });
    } else {
      res.status(200).send({ user });
    }
  });
}

// createUser Function
async function createUser(req, res) {
  let { password, email } = req.body;
  email = email.toLowerCase(); // Convertir el email a minúsculas
  const user = new User({ ...req.body, email, active: false });

  // Crypting Password
  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(password, salt);
  user.password = hashPassword;

  // Image
  if (req.files.avatar) {
    const imagePath = image.getFilePath(req.files.avatar);
    user.avatar = imagePath;
  }

  // Save User
  user.save((error, userStorage) => {
    if (error) {
      res.status(400).send({ msg: "Error al crear el usuario" });
    } else {
      res.status(201).send(userStorage);
    }
  });
}

//updateUser Function
async function updateUser(req, res) {
  const { id } = req.params;
  const userData = req.body;

  // Crypting Password
  if (userData.password) {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(userData.password, salt);
    userData.password = hashPassword;
  } else {
    delete userData.password;
  }

  // Image
  if (req.files.avatar) {
    const imagePath = image.getFilePath(req.files.avatar);
    userData.avatar = imagePath;
  }

  // Update and Save User
  User.findByIdAndUpdate({ _id: id }, userData, (error) => {
    if (error) {
      res.status(400).send({ msg: "Error al actualizar el ususario" });
    } else {
      res.status(200).send({ msg: "Actualización correcta" });
    }
  });
}

// deleteUser Function
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const result = await User.findByIdAndDelete(id).exec();

    if (result === null) {
      throw new Error("El usuario no existe o ya ha sido eliminado");
    }

    res.status(200).send({ msg: "Usuario eliminado" });
  } catch (error) {
    res
      .status(400)
      .send({ msg: "Error al eliminar el usuario", error: error.message });
  }
}

module.exports = {
  getMe,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
