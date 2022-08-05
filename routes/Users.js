const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { Users } = require("../models");

router.post("/register", async (req, res) => {
  const password = req.body.password;
  const email = req.body.email;

  Users.findOne({ where: { email: email } })
    .then((result) => {
      if (result) {
        res.json({
          error: "Email already exist",
        });
      } else {
        bcrypt.hash(password, 10, (err, hash) => {
          const user = {
            firstname: req.body.firstname,
            surname: req.body.surname,
            email: req.body.email,
            password: hash,
          };

          Users.create(user)
            .then((result) => {
              res.json({
                success: "User created successfully",
                message: result,
              });
            })
            .catch((error) => {
              res.json({
                error: error,
                message: "Something went wrong while creating user",
              });
            });
        });
      }
    })
    .catch((error) => {
      res.json({
        error,
      });
    });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await Users.findOne({ where: { email: email } });

  try {
    if (user) {
      bcrypt.compare(password, user.password).then((match) => {
        if (!match) {
          res.json({ error: "wrong username and password combination" });
        } else {
          res.json({ success: "you logged in" });
        }
      });
    }
  } catch (error) {
    res.json({ error: "something went wrong while logging in" });
  }
});

module.exports = router;
