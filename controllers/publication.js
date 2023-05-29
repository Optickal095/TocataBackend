const moment = require("moment");
const Publication = require("../models/publication");
const Follow = require("../models/follow");
const publication = require("../models/publication");

function savePublication(req, res) {
  const { text, file } = req.body;
  const { user_id } = req.user;
  const created_at = moment().unix();

  if (!text) {
    return res.status(400).send({ msg: "Debes enviar un texto!" });
  }

  const publication = new Publication({
    text,
    file: null,
    created_at,
    user: user_id,
  });

  publication.save((error, publicationStored) => {
    if (error) {
      return res.status(400).send({ msg: "Error al guardar la publicación" });
    }
    if (!publicationStored) {
      return res.status(404).send({ msg: "Publicación no guardada" });
    }
    return res.status(200).send(publicationStored);
  });
}

function getPublications(req, res) {
  const { user_id } = req.user;
  var page = 1;

  if (req.params.page) {
    page = req.params.page;
  }

  var itemsPerPage = 20;

  Follow.find({ user: user_id })
    .populate("followed")
    .exec((error, follows) => {
      if (error) {
        res.status(500).send({ msg: "Error al devolver el seguimiento" });
      }

      var follows_clean = [];

      follows.forEach((follow) => {
        follows_clean.push(follow.followed);
      });

      Publication.find({ user: { $in: follows_clean } })
        .populate("user")
        .exec((error, publications) => {
          if (error) {
            res.status(500).send({ msg: "Error al devolver publicaciones" });
          } else if (!publications || publications.length === 0) {
            res.status(404).send({ msg: "No hay publicaciones" });
          } else {
            const randomizedPublications = shuffleArray(publications); // Orden aleatorio de las publicaciones
            const paginatedPublications = paginateArray(
              randomizedPublications,
              page,
              itemsPerPage
            ); // Paginación de las publicaciones

            res.status(200).send({
              total_items: publications.length,
              pages: Math.ceil(publications.length / itemsPerPage),
              page: page,
              publications: paginatedPublications,
            });
          }
        });
    });
}

// Función para ordenar aleatoriamente un array (algoritmo de Fisher-Yates)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Función para paginar un array
function paginateArray(array, page, itemsPerPage) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return array.slice(startIndex, endIndex);
}

module.exports = {
  savePublication,
  getPublications,
};
