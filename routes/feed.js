const express = require('express');
const bodyParser = require('body-parser');
const myRouter = express.Router();
var auth = require('../auth/authenticate');
const Feed = require("../models/Feed")
const { ObjectId } = require('mongodb');
const rs = require('randomstring')
const futils = require("../utils/fileutils")

//const Razorpay = require('razorpay');


myRouter.use(bodyParser.json());
//GET ALL
myRouter.get(`/api/feed`,auth.verifyUser, async (req, res) => {
    console.log("feed get all called")//
	var items = await Feed.find().
    skip(parseInt(req.query.off)).limit(parseInt(req.query.lim))
    .sort({ createdAt: -1 })//.select("-content")
    res.send(items)
})


myRouter.post(`/api/feed`,auth.verifyUser, async (req, res) => {
	console.log('room add called')
	var body=req.body
    var postdata=body;
    if(postdata==null){res.status(500).send("data missing");return;}
    var files = req.files;
    if (files != null) {
        if (files['photo'] != null) {
            if(Array.isArray(files['photo'])){
                console.log(files)
                //body["photo"] = await futils.getFileObject(files['photo']);
                var temp=[];
                var index=0;
                for(var file in files['photo']){
                    var f = await futils.getFileObject(files['photo'][index])
                    temp.push(f)
                    index++;
                }
                body["photo"] = temp;
                console.log(temp)
            }
            else{
                body["photo"] = await futils.getFileObject(files['photo']);
            }
            
        }
    }
    //res.status(500).send("duck");
    
    var feed = await new Feed(postdata)
    feed.save().catch((err) => {
            console.log(err);
            res.status(500).send(err);
            return;
        }).then(async (val) => {
            if (val != null) res.send("success")
        })
})

//delete room
myRouter.delete(`/api/feed/:id`,auth.verifyUser,
    async (req, res, next) =>  {
        console.log('delete called feed')
        Feed.deleteOne({_id: req.params.id}).catch((err)=>{
            console.log(err)
            res.status(500).send(err);return;
        }).then(async (val)=>{
            res.send("success")
        })
});


module.exports = myRouter