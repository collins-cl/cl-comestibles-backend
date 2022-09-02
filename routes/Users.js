const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { Users } = require("../models");
const { Tokens } = require("../models");
const { sign } = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Crypto = require("crypto");
const dotenv = require("dotenv").config();
const nodeuser = process.env.NODE_MAIL_EMAIL;
const nodepassword = process.env.NODE_MAIL_PASSWORD;

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
  const randomToken = Crypto.randomBytes(6).toString("hex");

  let newTime = new Date().getTime() + 120 * 1000;

  const { email } = req.body;

  const user = await Users.findOne({ where: { email: email } });

  if (!user) {
    res.json({
      error: "Account doesnt exist",
      user,
    });
  } else {
    try {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: nodeuser,
          pass: nodepassword,
        },
        logger: true,
      });

      Tokens.findOne({ where: { email: email } }).then((result) => {
        if (!result) {
          Tokens.create({
            email,
            token: randomToken,
            expiresIn: newTime,
          }).then((result) => {
            const message = {
              from: nodeuser,
              to: user.email,
              subject: "Password Reset Token",
              text: `
                      Hi, ${user.firstname + " " + user.surname} \n
                      You requested for a change in password and this unique code was sent to you \n
                      to use as a one time password : ${result.token}\n
                      which is set to expire in 2 minutes.
                  `,
            };
            try {
              transporter.sendMail(message, (error, info) => {
                if (error) {
                  console.log(error);
                }
                return console.log("success" + info.response);
              });
              res.json({ success: "Token sent successfully" });
            } catch (error) {
              console.log(error);
            }
          });
        } else {
          let currentTime = new Date().getTime();
          let Diff = result.expiresIn - currentTime;
          if (Diff < 0) {
            Tokens.destroy({ where: { email: email } });
            res.json({ error: "Try resending another otp now" });
          } else {
            res.json({
              error: "Please wait for 120 seconds before trying again.",
            });
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
});

//reset password
router.post("/resetpassword", async (req, res) => {
  const { otpcode, password } = req.body;

  await Tokens.findOne({ where: { token: otpcode } }).then((result) => {
    if (!result) {
      res.json({
        error: "OTP incorrect",
      });
    } else {
      Users.findOne({ where: { email: result.email } }).then((match) => {
        if (!match) {
          res.json("emails doesnt match");
        }
        return Users.update({where : {password : password}})
      });
    }
  });
});

module.exports = router;
