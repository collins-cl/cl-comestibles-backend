const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { Users } = require("../models");
const { sign } = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Crypto = require("crypto");

//create user(if none exits in db)
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

//login into user account
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await Users.findOne({ where: { email: email } });

  try {
    if (user) {
      bcrypt.compare(password, user.password).then((match) => {
        if (!match) {
          res
            .status(250)
            .json({ error: "wrong username and password combination" });
        } else {
          const accessToken = sign({ id: user.id }, "accessToken");
          res.json({
            success: "you logged in",
            user,
            accessToken: accessToken,
          });
        }
      });
    } else {
      res.json({
        error: "wrong username and password",
      });
    }
  } catch (error) {
    res.status(300).json({ error: "something went wrong while logging in" });
  }
});

//resetting of password
router.post("/forgetpassword", async (req, res) => {
  const { email } = req.body;

  const user = await Users.findOne({ where: { email: email } });
  const randomToken = Crypto.randomBytes(32).toString("base64");

  try {
    if (!user) {
      res.json({
        error: "Account doesnt exist",
      });
    } else {
      const link =
        "http://" +
        req.headers.host +
        "/api/users/reset" +
        user.id +
        randomToken;

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "collinsolads@gmail.com",
          pass: "kuiwjsjayemjbqhv",
        },
        logger: true,
      });

      const message = {
        from: "collinsolads@gmail.com",
        to: user.email,
        subject: "Password Reset Link",
        html: `Hi, ${user.firstname}  \n
        Please click on the following <a href=${link}>${link}</a> to reset your password.`,
      };
      try {
        transporter.sendMail(message, (error, info) => {
          res.json({ success: "Successful" });
          console.log("success" + info.response);
        });
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
