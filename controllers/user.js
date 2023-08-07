const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Follow = require("../models/follow");
const Publication = require("../models/publication");
const image = require("../utils/image");
const mongoosePaginate = require("mongoose-paginate");
const fs = require("fs");
const path = require("path");

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
  const { page } = req.params;

  const itemsPerPage = 5;
  const skipItems = (page - 1) * itemsPerPage;

  try {
    const users = await User.find()
      .sort("_id")
      .skip(skipItems)
      .limit(itemsPerPage)
      .exec();

    const total = await User.countDocuments();

    if (users.length > 0) {
      const value = await followUsersIds(req.user.user_id);

      res.status(200).send({
        users,
        users_following: value.following,
        users_follow_me: value.followed,
        total,
        pages: Math.ceil(total / itemsPerPage),
      });
    } else {
      res.status(404).send({ msg: "No hay usuarios disponibles" });
    }
  } catch (error) {
    res.status(500).send({ msg: "Error en la petición" });
  }
}

// Obtener los usuarios que siguen a un usuario específico
async function followUsersIds(user_id) {
  try {
    const following = await Follow.find({ user: user_id })
      .select("followed")
      .exec();

    const followed = await Follow.find({ followed: user_id })
      .select("user")
      .exec();

    const followingIds = following.map((follow) => follow.followed);
    const followedIds = followed.map((follow) => follow.user);

    return {
      following: followingIds,
      followed: followedIds,
    };
  } catch (error) {
    throw new Error(
      "Error al obtener los IDs de los usuarios que sigues y los usuarios que te siguen"
    );
  }
}

//getUser Function
async function getUser(req, res) {
  const { id } = req.params;

  User.findById(id, (error, user) => {
    if (error) return res.status(500).send({ msg: "Error en la petición" });

    if (!user) return res.status(404).send({ msg: "El usuario no existe" });

    followThisUser(req.user.user_id, id).then((value) => {
      user.password = undefined;
      return res.status(200).send({
        user,
        following: value.following,
        followed: value.followed,
      });
    });
  });
}

async function followThisUser(identity_user_id, user_id) {
  try {
    var following = await Follow.findOne({
      user: identity_user_id,
      followed: user_id,
    })
      .exec()
      .then((following) => {
        return following;
      })
      .catch((err) => {
        return handleerror(err);
      });
    var followed = await Follow.findOne({
      user: user_id,
      followed: identity_user_id,
    })
      .exec()
      .then((followed) => {
        return followed;
      })
      .catch((err) => {
        return handleerror(err);
      });
    return {
      following: following,
      followed: followed,
    };
  } catch (e) {
    console.log(e);
  }
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

//Upload image
function uploadImage(req, res) {
  const userData = req.body;
  const { id } = req.params;
  let imagePath = null;
  let image_ext = null;

  if (req.files && req.files.avatar) {
    imagePath = image.getFilePath(req.files.avatar);
    userData.avatar = imagePath;

    let ext_split = imagePath.split(".");
    image_ext = ext_split[ext_split.length - 1].toLowerCase();
  } else {
    return res.status(400).send({ msg: "No se han subido imágenes" });
  }

  if (id != req.user.user_id) {
    return removeFilesOfUploads(
      imagePath,
      res,
      "No tienes permiso para actualizar los datos de usuario"
    );
  }

  if (image_ext !== "png" && image_ext !== "jpg" && image_ext !== "jpeg") {
    return removeFilesOfUploads(imagePath, res, "Extensión no válida");
  } else {
    User.findByIdAndUpdate(
      id,
      { avatar: imagePath },
      { new: true },
      (error, userUpdated) => {
        if (error) {
          return res
            .status(500)
            .send({ msg: "Error al actualizar el usuario" });
        } else if (!userUpdated) {
          return res
            .status(404)
            .send({ msg: "No se ha podido actualizar el usuario" });
        } else {
          // Solo enviar una respuesta en caso de éxito (dentro del callback)
          return res
            .status(200)
            .send({ msg: "Imagen subida correctamente", user: userUpdated });
        }
      }
    );
  }
}

function removeFilesOfUploads(imagePath, res, message) {
  fs.stat(imagePath, (error, stats) => {
    if (error) {
      console.error("Error al obtener el estado del archivo:", error);
      return res.status(500).send({ msg: "Error al eliminar la imagen" });
    }

    if (!stats.isFile()) {
      // Si el archivo no es un archivo regular (por ejemplo, un directorio), devolvemos un error.
      return res.status(400).send({ msg: "El archivo no es válido" });
    }

    const allowedExtensions = ["png", "jpg", "jpeg"];
    const ext_split = imagePath.split(".");
    const image_ext = ext_split[ext_split.length - 1].toLowerCase();

    if (!allowedExtensions.includes(image_ext)) {
      // Si la extensión del archivo no está en la lista de extensiones permitidas, devolvemos un error.
      return res.status(400).send({ msg: "Extensión no válida" });
    }

    fs.unlink(imagePath, (error) => {
      if (error) {
        console.error("Error al eliminar la imagen:", error);
        return res.status(500).send({ msg: "Error al eliminar la imagen" });
      }
      return res.status(200).send({ msg: message });
    });
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

function probarUser(req, res) {
  console.log("Hola");
}

module.exports = {
  getMe,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getCounters,
  uploadImage,
};
