//const path = require('path')
//const fs = require('fs');
//const mongoosePaginate = require('mongoose-pagination');
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

module.exports = {
  saveFollow,
  deleteFollow,
};
