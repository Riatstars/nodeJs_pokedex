require("dotenv").config();
var express = require("express");
const cors = require("cors");

var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var pokemonsRouter = require("./routes/pokemons");

var app = express();
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/pokemons", pokemonsRouter);

app.use((error, req, res, next) => {
  res.status(error.statusCode).send(error.message);
});

module.exports = app;
