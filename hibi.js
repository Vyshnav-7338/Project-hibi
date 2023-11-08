const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();
const port = 7000
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const fileUpload = require('express-fileupload');
app.use(fileUpload());

const handleErrors = require('./middlewares/HandleError');
app.use(handleErrors)

app.use(express.static("public"));
mongoose.connect(
  "mongodb+srv://hibi:hibi@cluster0.x4b5gwa.mongodb.net/User?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true }
);

//Registion Form API

const regroute = require("./auth/register");
app.use("/", regroute);

//Login Form Api
const loginroute = require("./auth/login");
app.use("/api/login", loginroute);
//Home Page API

const seedroute = require('./auth/default_setup.js');
app.use('/auth/setup', seedroute);

const userroute = require('./routes/user');
app.use('/', userroute);
const roomroute = require('./routes/room');
app.use('/', roomroute);
const slotroute = require('./routes/slot');
app.use('/', slotroute);
/*
const sliderroute = require('./routes/slider.js');
app.use('/', sliderroute);
*/
const bookingroute = require('./routes/booking.js');
app.use('/', bookingroute);
const reportsroute = require('./routes/reports.js');
app.use('/', reportsroute);
const notificaroute = require('./routes/notifica.js');
app.use('/', notificaroute);
const emailotproute = require('./routes/emailotp.js');
app.use('/', emailotproute);
const feedroute = require('./routes/feed.js');
app.use('/', feedroute);
const cdnroute = require('./routes/cdn.js');
app.use('/', cdnroute);
const excelroute = require('./routes/excelexporter.js');
app.use('/', excelroute);

app.listen(port, () => console.log(`hibi app listening at http://localhost:${port}`))
process.env["NTBA_FIX_350"] = 1;
