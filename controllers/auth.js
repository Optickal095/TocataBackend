function register(req, res) {
  console.log("Hola Mundo");

  res.status(200).send({ msg: "TODO OK" });
}

module.exports = {
  register
};
