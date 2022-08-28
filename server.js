const express = require("express");
const dotenv = require("dotenv").config;
const cors = require("cors");
const db = require("./models");
const port = process.env.PORT || 5000;
const app = express();
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
app.use(cookieParser());
app.use((req, res, next) => {
  res.header("Content-Type", "application/json;charset=UTF-8");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//Routers

const postRouter = require("./routes/Users");
app.use("/api/users", postRouter);

db.sequelize.sync().then(() => {
  try {
    app.listen(port, () => console.log(`App running on port ${port}!`));
  } catch (error) {
    console.log(error);
  }
});
