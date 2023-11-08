const express = require('express');
const bodyParser = require('body-parser');
const myRouter = express.Router();
const { json } = require('body-parser');
var auth = require('./authenticate');
const User = require("../models/User")

//PASSWORD HASH
const bcrypt = require('bcrypt');
const { ObjectId } = require('bson');
const saltRounds = 10;

myRouter.use(bodyParser.json());
myRouter.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get( (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /login');
})
.post(async (req, res, next) =>  {
    var body = req.body;
    if(body.id==null)if(body.email==null){res.status(400).send("Email required");return;}
    if(body.password==null){res.status(400).send("Password required");return;}
    var query = {}
    if(body.id==null){
        query = {"email":body.email}
    }else{query = {"_id":ObjectId(body.id)}}
       
    var udata = await User.findOne(query);
    if(udata==null){res.status(401).send({"status":"error","message":"no users found"});return;}
    else{
            var hashcheck = await bcrypt.compare(body.password, udata.password)
            if(hashcheck){
                var payload = {id: udata._id,
                    email:udata.email,
                    name:udata.name,
                    role:udata.role};
                var token = auth.getToken(payload); 
                var resdata = {
					"id":udata._id,
					"email":udata.email,
					"phone":udata.phone,
					"dob":udata.dob,
					"gender":udata.gender,
					"name":udata.name,"role":udata.role};
                res.json({"status":"done","data":resdata,
                "token":token,"message":"user logged succesfully"});
                console.log(body)                                                                                                      
            }
            else{
                res.status(403).send("wrong password");return;
            }
    }
});

module.exports = myRouter