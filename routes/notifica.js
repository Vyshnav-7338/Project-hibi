const express = require('express');
const bodyParser = require('body-parser');
const myRouter = express.Router();
var auth = require('../auth/authenticate');

const Faq = require("../models/Notifica")
const { ObjectId } = require('bson');
const {fcmpush} = require('../notifications/fcm_push.js');



myRouter.use(bodyParser.json());
//GET ALL
myRouter.get(`/api/notification`,auth.verifyUser, async (req, res) => {
    console.log("faq get all called")//
    var items = await Faq.find({"owner":req.user._id}).
    skip(parseInt(req.query.off)).limit(parseInt(req.query.lim))
    .sort({ createdAt: -1 })
    res.send(items)
})

myRouter.post(`/api/notification`,auth.verifyUser, async (req, res) => {
    console.log('FAQ POST CALLED')
	var body=req.body
    var postdata=body;
    if(postdata==null){res.status(500).send("data missing");return;}

    if(req.user!=null){postdata["owner"] = req.user._id;}
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

myRouter.delete(`/api/notification`,auth.verifyUser,
    async (req, res, next) =>  {
        console.log('delete called')
        Faq.deleteOne({_id: req.query.id}).catch((err)=>{
            console.log(err)
            res.status(500).send(err);return;
        }).then(async (val)=>{
            res.send(val)
        })
});

myRouter.post(`/api/sendfcm`,auth.verifyUser,
    async (req, res, next) =>  {
        console.log(req.body.content);
        fcmpush(req.body.content,"Posted by admin","public")
});

module.exports = myRouter