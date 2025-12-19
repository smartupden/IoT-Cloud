// Package Importing

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const { config } = require("dotenv");
const { router } = require("./src/Routes/routes")

// Env Acess

require("dotenv").config();

// Port Intialize

const port = process.env.PORT

// Database Url

const url = process.env.MONGODB_URL

// Body Parser

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Cors Enable

app.use(cors())

// Database Connection

mongoose.connect(url)
    .then(() => { return console.log("Database Connected Successfully") })
    .catch((e) => { return console.error(e) })

// Endpoints Enable

app.use(router);


// Image Upload Enable

app.use("/",express.static("build"))

// Port Enable

app.listen(port , () => {return console.log(`Server run in this Port ${port} `)})