const express = require('express');
const bodyParser = require('body-parser');
const myRouter = express.Router();
var auth = require('../auth/authenticate');
const Pro = require("../models/Slider")
var multer  = require('multer')
const FileUtil = require('../utils/fileutils');
//========== config ============
const fsize=2000; //in kb
const url='api/slider';
//============================

//
myRouter.use(bodyParser.json());
var filedata=[];
myRouter.route(`/${url}`)
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get(auth.verifyUser, async (req,res,next) => {
    //sort
    const sort  = {}
    if(req.query.sortby && req.query.orderby){
        sort[req.query.sortby]   = req.query.orderby;
    }
    var qry={}
    console.log("search query===="+req.query.q)
    if(req.query.q!=null){qry={ "name": { "$regex": req.query.q, "$options": "i" } }}
    //
    console.log(sort)
    var products = await Pro.find(qry).sort(sort);
    console.log("products get called")//
    //
    res.send(products)
})
.post(auth.verifyUser,FileUtil.files,
    async (req, res, next) =>  {
        var postdata=req.body;
        var files = req.files;
        if(files!=null){
            for(var i in files){
                var file = files[i]
                var myobj = await FileUtil.fileutil(file)
                filedata.push(myobj);
            }
            postdata["files"] = filedata;
        }   
    const pro = new Pro(postdata)
    await pro.save().catch((err)=>{
        console.log(err)
        filedata=[];
        res.status(500).send(err);return;
    }).then(async (val)=>{
        filedata=[];
        res.send(val);
    })
    
}).put(auth.verifyUser,
    async (req, res, next) =>  {
        var params=req.body
        var catid=params.id
        var data=params.data
        const cat = await Pro.findOne({ _id:catid});
        cat.updateOne(data).then((val)=>{
            res.send(val)
        }).catch((err)=>{
            res.status(500).send(err)
        })
    }).
delete(auth.verifyUser,
    async (req, res, next) =>  {
        console.log('delete called')
        var params=req.body
        console.log(params)
        Pro.deleteOne({_id: params["id"]}).catch((err)=>{
            console.log(err)
            res.status(500).send(err);return;
        }).then(async (val)=>{
            res.send(val)
        })
});

const handleErrors = require('../middlewares/HandleError');
myRouter.use(handleErrors)
//category Get individual item
myRouter.get(`/${url}/:id`,auth.verifyUser, async (req, res) => {
	const post = await Pro.findOne({ _id: req.params.id }).exec()
	res.send(post)
})
//Bulk delete
myRouter.route(`/${url}/deletemany`).delete(auth.verifyUser, async (req,res,next) => {
    console.log('delete many called')
        var params=req.body
        console.log(params["id"])
        Pro.deleteMany({ _id: { $in: params["id"]}}).catch((err)=>{
            console.log(err)
            res.status(500).send(err);return;
        }).then(async (val)=>{
            res.send(val)
        })
})
module.exports = myRouter