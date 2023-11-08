const express = require('express');
const bodyParser = require('body-parser');
const myRouter = express.Router();
var auth = require('../auth/authenticate');

const Faq = require("../models/Faq")
const FileUtil = require('../utils/fileutils');
const { ObjectId } = require('bson');



myRouter.use(bodyParser.json());
//GET ALL
myRouter.get(`/api/faq`, async (req, res) => {
    console.log("faq get all called")//
    var items = await Faq.find().
    skip(parseInt(req.query.off)).limit(parseInt(req.query.lim))
    .sort({ createdAt: -1 })
    res.send(items)
})


myRouter.post(`/api/faq`,auth.verifyUser,FileUtil.files, async (req, res) => {
    console.log('FAQ POST CALLED')
	var body=req.body
    var postdata=body;
    if(postdata==null){res.status(500).send("data missing");return;}

    if(req.user!=null){
        postdata["owner"] = {_id:req.user._id,name:req.user.name};
        //postdata["orgid"] = req.user.orgid;
    }
    postdata["createdAt"] = Date.now();
    //
    var feed = await new Faq(postdata)
    feed.save().catch((err)=>{
        console.log(err)
        res.status(500).send(err);return;
    }).then(async (val)=>{
        if(val!=null)res.send("success")
        console.log('feed item added')
    })
})

myRouter.delete(`/api/faq/:id`,auth.verifyUser,
    async (req, res, next) =>  {
        console.log('delete called')
        Faq.deleteOne({_id: ObjectId(req.params["id"])}).catch((err)=>{
            console.log(err)
            res.status(500).send(err);return;
        }).then(async (val)=>{
            res.send(val)
        })
});

module.exports = myRouter