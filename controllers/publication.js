const moment = require("moment");
const Publication = require("../models/publication");
const Follow = require("../models/follow");
const image = require("../utils/image");
const fs = require("fs");
const path = require("path");

function savePublication(req, res) {
  const { user_id } = req.user;
  const { text } = req.body;

  if (!text) {
    return res.status(400).send({ msg: "Debes enviar texto!" });
  }

  const publication = new Publication({
    text,
    file: null,
    created_at: moment().unix(),
    user: user_id,
  });

  publication.save((error, publicationStored) => {
    if (error) {
      console.error(error);
      res.status(400).send({ msg: "Error al crear publicación" });
    } else {
      res.status(201).send(publicationStored);
    }
  });
}

function getPublications(req, res) {
  const { user_id } = req.user;
  let page = 1;

  if (req.params.page) {
    page = req.params.page;
  }

  let itemsPerPage = 5;

  Follow.find({ user: user_id })
    .populate("followed")
    .exec((error, follows) => {
      if (error) {
        res.status(500).send({ msg: "Error al devolver el seguimiento" });
      }

      let follows_clean = [];

      follows.forEach((follow) => {
        follows_clean.push(follow.followed);
      });
      follows_clean.push(user_id);

      Publication.find({ user: { $in: follows_clean } })
        .populate("user")
        .sort({ created_at: -1 })
        .exec((error, publications) => {
          if (error) {
            res.status(500).send({ msg: "Error al devolver publicaciones" });
          } else if (!publications || publications.length === 0) {
            res.status(404).send({ msg: "No hay publicaciones" });
          } else {
            const paginatedPublications = paginateArray(
              publications,
              page,
              itemsPerPage
            );

            res.status(200).send({
              total_items: publications.length,
              pages: Math.ceil(publications.length / itemsPerPage),
              page: page,
              itemsPerPage: itemsPerPage,
              publications: paginatedPublications,
            });
          }
        });
    });
}

function getPublicationsUser(req, res) {
  const { user_id } = req.user;
  let page = 1;

  if (req.params.page) {
    page = req.params.page;
  }

  let user = req.user.user_id;
  if (req.params.user) {
    user = req.params.user;
  }

  let itemsPerPage = 5;

  Publication.find({ user: user })
    .populate("user")
    .sort({ created_at: -1 })
    .exec((error, publications) => {
      if (error) {
        res.status(500).send({ msg: "Error al devolver publicaciones" });
      } else if (!publications || publications.length === 0) {
        res.status(404).send({ msg: "No hay publicaciones" });
      } else {
        const paginatedPublications = paginateArray(
          publications,
          page,
          itemsPerPage
        ); // Paginación de las publicaciones

        res.status(200).send({
          total_items: publications.length,
          pages: Math.ceil(publications.length / itemsPerPage),
          page: page,
          itemsPerPage: itemsPerPage,
          publications: paginatedPublications,
        });
      }
    });
}

// Función para paginar un array
function paginateArray(array, page, itemsPerPage) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return array.slice(startIndex, endIndex);
}

function getPublication(req, res) {
  const publicationId = req.params.id;

  Publication.findById(publicationId, (error, publication) => {
    if (error) {
      res.status(500).send({ msg: "Error en la petición" });
    } else if (!publication) {
      res.status(404).send({ msg: "No existe la publicación" });
    } else {
      res.status(200).send({ publication });
    }
  });
}

function getMyPublications(req, res) {
  const { user_id } = req.user;
  let { page, perPage } = req.query;

  // Configuración predeterminada para paginación
  page = parseInt(page) || 1;
  perPage = parseInt(perPage) || 30;

  Publication.find({ user: user_id })
    .sort("-created_at")
    .select("-user") // Excluir el campo 'user'
    .skip((page - 1) * perPage)
    .limit(perPage)
    .exec((error, publications) => {
      if (error) {
        res.status(500).send({ msg: "Error al obtener publicaciones" });
      } else if (!publications || publications.length === 0) {
        res.status(404).send({ msg: "No se encontraron publicaciones" });
      } else {
        Publication.countDocuments({ user: user_id }).exec(
          (error, totalCount) => {
            if (error) {
              res
                .status(500)
                .send({ msg: "Error al contar las publicaciones" });
            } else {
              const totalPages = Math.ceil(totalCount / perPage);
              res.status(200).send({
                totalItems: totalCount,
                totalPages,
                currentPage: page,
                publications,
              });
            }
          }
        );
      }
    });
}

function deletePublication(req, res) {
  const { user_id } = req.user;
  const publicationId = req.params.id;

  Publication.deleteOne(
    { user: user_id, _id: publicationId },
    (error, publicationRemoved) => {
      if (error) {
        res.status(500).send({ msg: "Error en la petición" });
      } else if (!publicationRemoved) {
        res.status(404).send({ msg: "No existe la publicación" });
      } else {
        res.status(200).send({ publicationRemoved });
      }
    }
  );
}

async function getPublicationsCounter(req, res) {
  const { user_id } = req.user;
  if (req.params.id) {
    user_id = req.params.id;
  }

  try {
    const publications = await Publication.countDocuments({
      user: user_id,
    }).exec();

    const counters = { publications };

    return res.status(200).send(counters);
  } catch (error) {
    return res
      .status(400)
      .send({ msg: "Error al obtener los contadores", error: error.message });
  }
}

function uploadImage(req, res) {
  const { user_id } = req.user;
  const publicationId = req.params.id;
  console.log(req.files);

  if (req.files && req.files.file) {
    let file_path = req.files.file.path;
    console.log(file_path);

    let file_split = file_path.split("\\");
    console.log(file_split);

    let file_name = file_split[2];
    console.log(file_name);

    let ext_split = file_name.split(".");
    console.log(ext_split);

    let file_ext = ext_split[1];
    console.log(file_ext);

    if (
      file_ext == "png" ||
      file_ext == "jpg" ||
      file_ext == "jpeg" ||
      file_ext == "gif"
    ) {
      Publication.findOneAndUpdate(
        { user: user_id, _id: publicationId },
        { file: file_name }, // Actualizamos directamente el campo 'file' con el nombre de la imagen
        { new: true },
        (error, publicationUpdated) => {
          if (error) {
            return res.status(500).send({ msg: "Error en la petición" });
          } else if (!publicationUpdated) {
            return res
              .status(404)
              .send({ msg: "No se ha podido actualizar la publicación" });
          } else {
            return res.status(200).send({ publication: publicationUpdated });
          }
        }
      );
    } else {
      return removeFilesOfUploads(res, file_path, "Extensión no válida");
    }
  } else {
    return res.status(400).send({ msg: "No se han subido imágenes" });
  }
}

function removeFilesOfUploads(res, file_path, message) {
  fs.unlink(file_path, (error) => {
    return res.status(200).send({ msg: message });
  });
}

function getImageFile(req, res) {
  const image_file = req.params.imageFile;
  const path_file = "./uploads/publication/" + image_file;

  fs.access(path_file, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).send({ msg: "No existe la imagen..." });
    } else {
      res.sendFile(path.resolve(path_file));
    }
  });
}

async function getAllPublications(req, res) {
  const page = parseInt(req.query.page) || 1;
  const itemsPerPage = 20;

  try {
    const totalCount = await Publication.countDocuments();
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const publications = await Publication.aggregate([
      { $sample: { size: itemsPerPage } }, // Orden aleatorio
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ]);

    if (publications.length === 0) {
      return res.status(404).send({ msg: "No hay publicaciones" });
    }

    // Implementa una lógica de paginación manual
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;
    const paginatedPublications = publications.slice(startIndex, endIndex);

    return res.status(200).send({
      totalItems: totalCount,
      totalPages,
      currentPage: page,
      publications: paginatedPublications,
    });
  } catch (error) {
    return res.status(500).send({ msg: "Error al obtener publicaciones" });
  }
}

module.exports = {
  savePublication,
  getPublications,
  getPublication,
  getMyPublications,
  getPublicationsUser,
  deletePublication,
  getPublicationsCounter,
  uploadImage,
  getImageFile,
  getAllPublications,
};
