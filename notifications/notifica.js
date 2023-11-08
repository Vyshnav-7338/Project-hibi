const express = require('express');
const bodyParser = require('body-parser');
const myRouter = express.Router();
var auth = require('../auth/authenticate');
var multer  = require('multer')

const {fcmpush} = require('./fcm_push.js');
var randomstring = require("randomstring");
const Track = require('../app/tracking');

//========== config ============
const fsize=15000; //in kb (15MB)
//============================
var multer  = require('multer')
var fstorage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './public/files')
    },
    filename: function (req, file, cb) {
        var extension = file.originalname.split('.')[file.originalname.split('.').length -1]
        var nname = randomstring.generate();
        var fname = nname+"."+extension
        cb(null,fname )
    }
});
//multi
var files = multer({ storage:fstorage,
    limits: { fileSize: fsize*1024 },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|pdf|doc|xls|ppt|txt|docx|xlsx)/)){
            cb(new Error('unsupported file format'))
        }
        else{
            cb(undefined,true)
        }
        
    }
 }).array('files')
const sharp = require('sharp');
const { ObjectId } = require('mongodb');
//
myRouter.use(bodyParser.json());

//GET ALL
myRouter.get(`/api/notification`,auth.verifyUser, async (req, res) => {
    var db = req.db;
    console.log(req.query)
    var qry={orgid:req.user.orgid,cla:{ $in: [req.query.cla,'all'] } ,div:{ $in: [req.query.div,'all'] }}
    //var items = await db.collection("notifications").find(qry).toArray()
    var items = await db.collection("notifications").aggregate([
        {$match : qry}
        ]).
        sort({ createdAt: -1 }).
    skip(parseInt(req.query.off)).
    limit(parseInt(req.query.lim)).toArray();
    console.log("notification get called")//
    //
    res.send(items)
    //Track.addtrack(req,"notifica.js","notification get called")
    
})
var filedata=[];
myRouter.post(`/api/notification`,auth.verifyUser,files, async (req, res) => {
    console.log('notification post called')
    var db = req.db;
	var body=req.body
    console.log(req.body)
    var postdata=body;
    if(postdata==null){res.status(500).send("data missing");return;}
    var files = req.files;
    if(files!=null){
        for(var i in files){
            var file = files[i]
            await fileutil(file)
        }
        postdata["files"] = filedata;
    }   
    if(req.user!=null){
        postdata["owner"] = {_id:req.user._id,name:req.user.name};
        postdata["orgid"] = req.user.orgid;
    }
    postdata["createdAt"] = Date.now();
    //all class
    if(postdata["allcla"]==true||postdata["allcla"]=="true"){
        console.log('========== its all class =============')
        var myobj={}
        var returnedTarget = Object.assign(myobj, postdata);
        myobj["cla"]="all"
        myobj["div"]="all"
        await db.collection("notifications").insertOne(myobj).catch((err)=>{
            console.log(err)
            filedata=[];
        }).then((val)=>{filedata=[];})
        res.send("success")
        fcmpush(postdata["title"],postdata["description"],req.user.orgid)
    }
    else{
        //all divisons
    var divs=["A","B","C","D","E","F","G"]
    if(postdata["alldiv"]==true||postdata["alldiv"]=="true"){
        console.log("======== its all div man")
        for(var i in divs){
            var myobj={}
            var returnedTarget = Object.assign(myobj, postdata);
            var div = divs[i];
            myobj["div"]=div;
            console.log(myobj)
            await db.collection("notifications").insertOne(myobj).catch((err)=>{
                console.log(err)
                filedata=[];
            }).then((val)=>{filedata=[];})
            fcmpush(postdata["title"],postdata["description"],postdata["cla"]+myobj["div"]+req.user.orgid)
            fcmpush(postdata["title"]+"div:"+myobj["div"],postdata["description"],"developer"+req.user.orgid)
        }
        res.send("success")
        //Track.addtrack(req,"notifica.js","notification posted to all div called")
    }
    else{
        await db.collection("notifications").insertOne(postdata).catch((err)=>{
            console.log(err)
            filedata=[];
            res.status(500).send(err);return;
        }).then(async (val)=>{
            res.send(val)
            filedata=[];
            //sendpush
            fcmpush(postdata["title"],postdata["description"],postdata["cla"]+postdata["div"]+req.user.orgid)
            fcmpush(postdata["title"],postdata["description"],"developer"+req.user.orgid)
        })
    }
    }
    
    //Track.addtrack(req,"notifica.js","notification post called")
    
})
async function fileutil(file){
    var extension = file.filename.split('.')[file.filename.split('.').length -1]
    //GENERATE IMAGE THUMBNAIL
    if(extension=="jpg"||extension=="jpeg"||extension=="png"){
        var thumbname="./public/files/thumb/"+"thumb-"+file.filename;
        sharp(file.path).rotate().resize({width:120,height:120}).png({quality:50}).toFile(thumbname)
    }
    //SAVE TO DATABASE
    var myobj = { name:file.filename,thumb:"/thumb/thumb-"+file.filename,size:file.size,
        mime:file.mimetype,
        md5:file.md5,
        orgname:file.originalname
    };
    filedata.push(myobj);
}
myRouter.put(`/crud/:collid/:id`,auth.verifyUser,
    async (req, res, next) =>  {
        console.log('edit called')
        var db = req.db;
        var data=req.body;
        console.log(`DATA: ${data}`)
        var newvalues = { $set: data };
        db.collection(req.params.collid).updateOne({_id: ObjectId(req.params["id"])},newvalues).catch((err)=>{
            console.log(err)
            res.status(500).send(err);return;
        }).then(async (val)=>{
            res.send(val)
        })
});
myRouter.delete(`/crud/:collid/:id`,auth.verifyUser,
    async (req, res, next) =>  {
        console.log('delete called')

        var db = req.db;
        
        db.collection(req.params.collid).deleteOne({_id: ObjectId(req.params["id"])}).catch((err)=>{
            console.log(err)
            res.status(500).send(err);return;
        }).then(async (val)=>{
            res.send(val)
        })
});
//crud Get individual item
myRouter.post(`/cruditemget/:collid/:id`,auth.verifyUser, async (req, res) => {
    body = req.body;
    console.log(`body: ${JSON.stringify(body)}`)
    var db = req.db;
    //
    var crudfields=body["crudfields"]
    var item = await db.collection(req.params.collid).
    findOne({ _id: ObjectId(req.params.id) },{ pwd:0 });
    //
    if(crudfields!=null)for(var i in crudfields){
        var zx = await db.collection(crudfields[i]).
            findOne({ _id: ObjectId(item[crudfields[i]]) },{ pwd:0 });
        console.log(zx);
        item[crudfields[i]]=zx
    }
    console.log("crud individaul get called")//
    console.log(req.params.id)
    
    //
    res.send(item)
	//const post = await Pro.findOne({ _id: req.params.id }).exec()
	//res.send(post)
})
module.exports = myRouter