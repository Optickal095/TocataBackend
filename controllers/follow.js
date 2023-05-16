//const path = require('path')
//const fs = require('fs');
const User = require("../models/user");
const Follow = require("../models/follow");

async function saveFollow(req, res) {
  const params = req.body;

  const { user_id } = req.user;

  const follow = new Follow({
    user: user_id,
    followed: params.followed,
  });

  follow.save((error, followStored) => {
    if (error) {
      res.status(400).send({ msg: "Error al guardar el seguimiento" });
    } else if (!followStored) {
      res.status(404).send({ msg: "El seguimiento no se ha guardado" });
    } else {
      res.status(200).send(followStored);
    }
  });
}

async function deleteFollow(req, res) {
  try {
    const { user_id } = req.user;
    const followId = req.params.id;

    const result = await Follow.findOneAndRemove({
      user: user_id,
      followed: followId,
    }).exec();

    if (result === null) {
      throw new Error("El follow no existe o ya ha sido eliminado");
    }

    res.status(200).send({ msg: "El follow se ha eliminado" });
  } catch (error) {
    res
      .status(400)
      .send({ msg: "Error al dejar de seguir", error: error.message });
  }
}

async function getFollowingUsers(req, res) {
  try {
    const { user_id } = req.user;
    let page = parseInt(req.params.page);
    const itemsPerPage = 10;

    const options = {
      page,
      limit: itemsPerPage,
      populate: "followed",
      sort: { createdAt: -1 }, // Ordenar por fecha de creación descendente
    };

    const total = await Follow.countDocuments({ user: user_id });

    const totalPages = Math.ceil(total / itemsPerPage);

    // Ajustar el número de página si es mayor al número total de páginas
    if (page > totalPages) {
      page = totalPages;
    }

    const result = await Follow.find({ user: user_id })
      .populate("followed")
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .exec();

    if (result.length === 0) {
      throw new Error("No sigues a ningún usuario");
    }

    res.status(200).send({ follows: result, total, currentPage: page });
  } catch (error) {
    res.status(400).send({
      msg: "Error al obtener los usuarios que sigues",
      error: error.message,
    });
  }
}

async function getFollowedUsers(req, res) {
  try {
    const { user_id } = req.user;
    let page = parseInt(req.params.page);
    const itemsPerPage = 10;

    const options = {
      page,
      limit: itemsPerPage,
      populate: "followed",
      sort: { createdAt: -1 }, // Ordenar por fecha de creación descendente
    };

    const total = await Follow.countDocuments({ user: user_id });

    const totalPages = Math.ceil(total / itemsPerPage);

    // Ajustar el número de página si es mayor al número total de páginas
    if (page > totalPages) {
      page = totalPages;
    }

    const result = await Follow.find({ followed: user_id })
      .populate("user followed")
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .exec();

    if (result.length === 0) {
      throw new Error("No te sigue ningún usuario");
    }

    res.status(200).send({ follows: result, total, currentPage: page });
  } catch (error) {
    res.status(400).send({
      msg: "Error al obtener los usuarios que sigues",
      error: error.message,
    });
  }
}

module.exports = {
  saveFollow,
  deleteFollow,
  getFollowingUsers,
  getFollowedUsers,
};
