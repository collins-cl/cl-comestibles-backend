const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { Users } = require("../models");
const { sign } = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const smtpT = require("nodemailer-smtp-transport");

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

  try {
    if (!user) {
      res.json({
        error: "Account doesnt exist",
      });
    } else {
      const link = "http://" + req.headers.host + "/api/users/reset" + user.id;

      const transporter = nodemailer.createTransport(
        smtpT({
          service: "Gmail",
          port: 587,
          auth: {
            user: "collinsolads@gmail.com",
            password: "drzwthmjatxxsmfp",
          },
          authentication: "plain",
          enable_starttls_auto: true,
        })
      );

      const message = {
        from: "collinsolads@gmail.com",
        to: user.email,
        subject: "Password Reset Link",
        text: `Hi, ${user.firstname}  \n
        Please click on the following link ${link} to reset your password.`,
      };

      transporter.sendMail(message, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("success" + info);
        }
      });

      res.json({ success: "Successful" });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
