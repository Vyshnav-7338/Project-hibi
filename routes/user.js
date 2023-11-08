const express = require('express');
const bodyParser = require('body-parser');
const myRouter = express.Router();
var auth = require('../auth/authenticate');
const futils = require("../utils/fileutils")

const bcrypt = require('bcrypt');
const saltRounds = 10;
const { ObjectId } = require('mongodb');
//var ObjectID = require("mongodb").ObjectID
const User = require('../models/User');

//
myRouter.use(bodyParser.json());

//GET INDIVIDUAL PROFILE
myRouter.get(`/api/user/profile`,auth.verifyUser, async (req, res) => {
    console.log("get user profile called")//
    if(req.user.role=="su"||req.user.role=="admin"){
        if(req.query.email!=null){
            var item = await User.findOne({"email":req.query.email}).select('-password');
        }
        else if(req.query.id!=null){
            if(ObjectId.isValid(req.query.id)){
                var item = await User.findOne({"_id":req.query.id}).select('-password');
            }
            else{
                res.send("Invalid id");return;
            }
        }
        if(item==null){res.send("No users found");return;}
        else{
            res.send(item);return;
        }
    }
    else{
        var item = await User.findOne({"email":req.user.email}).select('-password');
        res.send(item);
    }
})

//GET USERS LIST(ONLY ADMIN CAN ACCESS)
myRouter.post(`/api/users`,auth.verifyUser, async (req, res) => {
    console.log("test ok")
    if (req.user.role == "su" || req.user.role == "admin") {
		var sqry = req.query.search
		console.log(sqry)
        var items = await User.find(
			{ $and:[
				//PARTIAL TEXT SEARRCH IN NAME, EMAIL AND PHONE FIELDS
				{ $or:[
					{ "name": { "$regex": sqry, "$options": "i" } },
					{ "email": { "$regex": sqry, "$options": "i" } },
					{ "phone": { "$regex": sqry, "$options": "i" } },
				]},
				
				req.body
			]}
			).select('-password')
            .skip(parseInt(req.query.off)).
        limit(parseInt(req.query.lim)).sort({
            createdAt: -1
        });
        //console.log(items)
        res.send(items)
    }
    else{
        res.status(403).send("Access denied, Admin only feature")
    }
})

//EDIT PROFILE
myRouter.put(`/api/user/profile/:id`,auth.verifyUser, async (req, res, next) => {
    console.log("EDIT PROFILE CALLED")
    //
    body = req.body;
    let files = req.files;
    if (files != null) {
        if (files['idProof'] != null) {
            body["idProof"] = await futils.getFileObject(files['idProof']);
        }
        if (files['photo'] != null) {body["photo"] = await futils.getFileObject(files['photo']);}
    }
    editUser(req,body, res, next)
})
async function editUser(req,body,res,next){
    const user = await User.findOne({
        _id: req.params.id
    });
    if (user != null) {
        user.updateOne(body).then((val) => {
            res.send(val)
        }).catch((err) => {
            res.status(500).send(err)
        })
    } else {
        res.status(400).send("user not found")
    }
}
//===================== highly secured code ===================
//change password
myRouter.put(`/api/user/chpwd/:email`, async (req, res) => {
    console.log("CHANGE PASSWORD CALLED MAN")
    var pwd = req.body.password
    var hashed = await bcrypt.hash(pwd, saltRounds);
    var spass = req.body["security_pass"];
    if(spass=="n439utb7gt74vg78v3g"){
        const user = await User.findOne({ email:req.params.email});
            if(user!=null){
                user.updateOne({"password":hashed}).then((val)=>{
                    res.send("success")
                }).catch((err)=>{
                    res.status(500).send(err)
                })
            }
            else{
                res.status(400).send("user not found")
            }
    }
    else{
        res.status(401).send("request not permitted")
    }
    
})

//==================== end of high security code ===============
/*
var filedata=[];
myRouter.post(`/api/user/photo/:id`,auth.verifyUser,FileUtil.files, async (req, res) => {
    console.log('CHANGE PROFILE PHOTO CALLED')
	var body=req.body
    var postdata={};
    if(postdata==null){res.status(500).send("data missing");return;}
    //
    var files = req.files;
    if(files!=null){
        for(var i in files){
            var file = files[i]
            var myobj = await FileUtil.fileutil(file)
            filedata.push(myobj);
        }
        postdata["files"] = filedata;
    }   
    const user = await User.findOne({ _id:req.params.id});
            if(user!=null){
                user.updateOne(postdata).then((val)=>{
                    res.send("success")
                    filedata=[];
                }).catch((err)=>{
                    res.status(500).send(err)
                    filedata=[];
                })
            }
            else{
                res.status(400).send("user not found")
                filedata=[];
            }
})
*/

//delete own account
myRouter.delete(`/api/user/delete`,auth.verifyUser,
    async (req, res, next) =>  {
        console.log('delete called slot')
		console.log(req.query);
        User.deleteOne({email: req.query.email}).catch((err)=>{
            console.log(err)
            res.status(500).send(err);return;
        }).then(async (val)=>{
            res.send("success")
        })
});


module.exports = myRouter