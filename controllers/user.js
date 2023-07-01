const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Follow = require("../models/follow");
const Publication = require("../models/publication");
const image = require("../utils/image");
const mongoosePaginate = require("mongoose-paginate");

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
  try {
    let page = parseInt(req.params.page);
    const itemsPerPage = 5;

    const options = {
      page,
      limit: itemsPerPage,
    };

    const total = await User.countDocuments();

    const totalPages = Math.ceil(total / itemsPerPage);

    // Ajustar el número de página si es mayor al número total de páginas
    if (page > totalPages) {
      page = totalPages;
    }

    const result = await User.find()
      .sort("_id")
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .exec();

    if (result.length === 0) {
      throw new Error("No hay usuarios disponibles");
    }

    res.status(200).send({
      users: result,
      total,
      pages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(400).send({
      msg: "Error al obtener los usuarios",
      error: error.message,
    });
  }
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

  delete userData.password;

  // Image
  if (req.files && req.files.avatar) {
    const imagePath = image.getFilePath(req.files.avatar);
    userData.avatar = imagePath;
  }

  // Update and Save User
  User.findByIdAndUpdate(id, userData, { new: true }, (error, userUpdated) => {
    if (error) {
      res.status(500).send({ msg: "Error al actualizar el ususario" });
    } else if (!userUpdated) {
      res.status(404).send({ msg: "No se ha podido actualizar el usuario" });
    } else {
      res.status(200).send({ user: userUpdated });
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

async function getCounters(req, res) {
  let { user_id } = req.user;
  if (req.params.id) {
    user_id = req.params.id;
  }

  try {
    const following = await Follow.countDocuments({ user: user_id }).exec();
    const followed = await Follow.countDocuments({ followed: user_id }).exec();
    const publications = await Publication.countDocuments({
      user: user_id,
    }).exec();

    const counters = { following, followed, publications };

    return res.status(200).send(counters);
  } catch (error) {
    return res
      .status(400)
      .send({ msg: "Error al obtener los contadores", error: error.message });
  }
}

module.exports = {
  getMe,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getCounters,
};
