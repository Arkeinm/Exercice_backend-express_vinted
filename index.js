require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

const Login = require("./routes/user");
app.use(Login);

const Publish = require("./routes/offer");
app.use(Publish);

app.all("*", function (req, res) {
  res.json({ message: "command not found" });
});

app.listen(process.env.PORT, () => {
  console.log("Server has started");
});
