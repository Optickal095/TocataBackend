const moment = require("moment");
const Notice = require("../models/notice");
const User = require("../models/user");

function saveNotice(req, res) {
  const { user_id } = req.user;
  const { title, text, datetime, region, city } = req.body;

  const notice = new Notice({
    title,
    text,
    date: moment(datetime, "DD/MM/YYYY HH:mm").unix(),
    region,
    city,
    created_at: moment().unix(),
    user: user_id,
  });

  if (!title) {
    return res.status(400).send({ msg: "Datos incompletos" });
  }

  notice.save((error, noticeStored) => {
    if (error) {
      console.error(error);
      res.status(400).send({ msg: "Error al crear aviso" });
    } else {
      res.status(201).send(noticeStored);
    }
  });
}

function getNotices(req, res) {
  let page = 1;

  if (req.params.page) {
    page = req.params.page;
  }

  let itemsPerPage = 5;

  Notice.find()
    .sort("-created_at")
    .populate("user") // Agrega esta línea para poblar los datos del usuario que publicó el aviso
    .exec((error, notices) => {
      if (error) {
        res.status(500).send({ msg: "Error al devolver avisos" });
      } else if (!notices || notices.length === 0) {
        res.status(404).send({ msg: "No hay avisos" });
      } else {
        const paginatedNotices = paginateArray(notices, page, itemsPerPage);
        res.status(200).send({
          total_items: notices.length,
          pages: Math.ceil(notices.length / itemsPerPage),
          page: page,
          itemsPerPage: itemsPerPage,
          notices: paginatedNotices,
        });
      }
    });
}

function getNotice(req, res) {
  const noticeId = req.params.id;

  Notice.findById(noticeId, (error, notice) => {
    if (error) {
      res.status(500).send({ msg: "Error en la petición" });
    } else if (!notice) {
      res.status(404).send({ msg: "No existe el aviso" });
    } else {
      res.status(200).send({ notice });
    }
  });
}

function deleteNotice(req, res) {
  const { user_id } = req.user;
  const noticeId = req.params.id;

  Notice.deleteOne({ user: user_id, _id: noticeId }, (error, noticeRemoved) => {
    if (error) {
      res.status(500).send({ msg: "Error en la petición" });
    } else if (!noticeRemoved) {
      res.status(404).send({ msg: "No existe el aviso" });
    } else {
      res.status(200).send({ noticeRemoved });
    }
  });
}

// Función para paginar un array
function paginateArray(array, page, itemsPerPage) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return array.slice(startIndex, endIndex);
}

async function getNoticesCounter(req, res) {
  try {
    const notices = await Notice.countDocuments().exec();
    const counters = { notices };
    return res.status(200).send(counters);
  } catch (error) {
    return res
      .status(400)
      .send({ msg: "Error al obtener los contadores", error: error.message });
  }
}

module.exports = {
  saveNotice,
  getNotices,
  getNotice,
  deleteNotice,
  getNoticesCounter,
};
