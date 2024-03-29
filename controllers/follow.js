const User = require("../models/user");
const Follow = require("../models/follow");

async function saveFollow(req, res) {
  const params = req.body;
  const { user_id } = req.user;

  if (user_id === params.followed) {
    return res.status(400).send({ msg: "No puedes seguirte a ti mismo" });
  }

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

    const followIds = await followUsersIds(user_id); // Obtener los IDs de seguidores y seguidos

    res
      .status(200)
      .send({ follows: result, total, currentPage: page, followIds });
  } catch (error) {
    res.status(400).send({
      msg: "Error al obtener los usuarios que sigues",
      error: error.message,
    });
  }
}

async function followUsersIds(user_id) {
  var following = await Follow.find({ user: user_id })
    .select({ _id: 0, __uv: 0, user: 0 })
    .exec()
    .then((follows) => {
      var follows_clean = [];

      follows.forEach((follow) => {
        follows_clean.push(follow.followed);
      });

      return follows_clean;
    })
    .catch((err) => {
      return handleerror(err);
    });

  var followed = await Follow.find({ followed: user_id })
    .select({ _id: 0, __uv: 0, followed: 0 })
    .exec()
    .then((follows) => {
      var follows_clean = [];

      follows.forEach((follow) => {
        follows_clean.push(follow.user);
      });

      return follows_clean;
    })
    .catch((err) => {
      return handleerror(err);
    });

  return {
    following: following,

    followed: followed,
  };
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
      .populate("user")
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

async function getMyFollows(req, res) {
  const { user_id } = req.user;

  let find = Follow.find({ followed: user_id });

  if (req.params.followed) {
    find = Follow.find({ followed: user_id });
  }

  find.populate("user followed").exec((error, follows) => {
    if (error) {
      res.status(500).send({ msg: "Error en el servidor" });
    } else if (!follows) {
      res.status(404).send({ msg: "No sigues a ningún ususario" });
    } else {
      res.status(200).send({ follows });
    }
  });
}

//isFollowing Function
async function isFollowing(req, res) {
  const { id } = req.params;
  const { user_id } = req.user;

  User.findById(id, (error, user) => {
    if (error) {
      res.status(500).send({ msg: "Error en la petición" });
    } else if (!user) {
      res.status(404).send({ msg: "El usuario no existe" });
    }
    followThisUser(user_id, id).then((value) => {
      return res
        .status(200)
        .send({ user, following: value.following, followed: value.followed });
    });
  });
}

async function followThisUser(identity_user_id, user_id) {
  let following = await Follow.findOne({
    user: identity_user_id,
    followed: user_id,
  }).exec((error, follow) => {
    if (error) {
      return handleError(error);
    }
    return follow;
  });

  let followed = await Follow.findOne({
    user: user_id,
    followed: identity_user_id,
  }).exec((error, follow) => {
    if (error) {
      return handleError(error);
    }
    return follow;
  });

  return {
    following: following,
    followed: followed,
  };
}

module.exports = {
  saveFollow,
  deleteFollow,
  getFollowingUsers,
  getFollowedUsers,
  getMyFollows,
  isFollowing,
};
