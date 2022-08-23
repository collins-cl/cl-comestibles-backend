const express = require("express");
const dotenv = require("dotenv").config;
const cors = require("cors");
const db = require("./models");
const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors());

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
