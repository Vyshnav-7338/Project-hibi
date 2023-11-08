const express = require('express');
const bodyParser = require('body-parser');
const myRouter = express.Router();
var auth = require('../auth/authenticate');
var config = require("../config")


myRouter.use(bodyParser.json());
var cdndir = config.live?config.cdndir_live:config.cdndir_local
//GET ALL
myRouter.get(`/cdn`, async (req, res) => {
    console.log("cdn called")//
    var fileid = req.query.file;
	console.log(fileid)
	res.sendFile(cdndir+fileid)
})

module.exports = myRouter