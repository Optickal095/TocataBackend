const moment = require("moment");
const Publication = require("../models/publication");

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

module.exports = {
  savePublication,
};
