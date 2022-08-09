const express = require("express");
const router = express.Router();
const { Users } = require("../models");

//get user from db
router.get("/byId/:id", async (req, res) => {
  const id = req.params.id;
  const user = await Users.findByPk(id);
  res.json(user);
});

module.exports = router;
