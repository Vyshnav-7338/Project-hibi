const express = require('express');
const bodyParser = require('body-parser');
const myRouter = express.Router();
const { json } = require('body-parser');
const User = require("../models/User")

//PASSWORD HASH
const bcrypt = require('bcrypt');
const { ObjectId } = require('bson');
const saltRounds = 10;

var adminpwd;
myRouter.use(bodyParser.json());
myRouter.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get( (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /auth/seed');
})
.post(//auth.verifyUser, 
    async (req, res, next) =>  {
    var db = req.db;
    insertdefaultuser(db,res)
});

async function insertdefaultuser(db,res){
    var pwd1 = "8A9x3p@!Wd8wvU%";
    pwd2 = "458GdQz!jnu2NPE";
    var myobj={"name":"Super User","phone":"+917012336011",
    "email":`su@hibye.com`,"password":pwd1,
    "role":"su"}
    var myobj2={"name":"Default admin","phone":"+918547069906",
    "email":`admin@hibye`,"password":pwd2,
    "role":"admin"}
    var user = new User(myobj)
    await user.save().catch((e)=>{
        console.log(e)
    })
    //var result2 = await db.collection("users").insertOne(myobj2)
    res.send("success");
}
module.exports = myRouter