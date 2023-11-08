const express = require('express');
const bodyParser = require('body-parser');
const myRouter = express.Router();
var auth = require('../auth/authenticate');
const futils = require("../utils/fileutils")
const Room = require("../models/Room");
const { db } = require('../models/Room');
const SortUtils = require("../utils/sortutils")
const Slot = require("../models/Slot")

//const {fcmpush} = require('../notifications/fcm_push.js');

myRouter.use(bodyParser.json());
//GET ALL (PAGINATED)
myRouter.get(`/api/room`,auth.verifyUser, async (req, res) => {
    //console.log("room get all called")//
    var items = await Room.find().
    skip(parseInt(req.query.off)).limit(parseInt(req.query.lim))
    .sort({ sortpos: 1 })
    res.send(items)
	//var z = await db.collection("foo").find({}).toArray();
})
//GET ALL (FOR REORDERING)
myRouter.get(`/api/room/reorder/list`,auth.verifyUser, async (req, res) => {
    //console.log("room get all called")//
    var items = await Room.find().sort({ sortpos: 1 }).select("name")
    res.send(items)
	//var z = await db.collection("foo").find({}).toArray();
})

//GET ALL (for user side grid view)
myRouter.get(`/api/room/stats`,auth.verifyUser, async (req, res) => {
    //get rooms with slots available count
	//outputs (enabled room only - with slots available count for 
	//particular date, price, name, icon)
    var items = await Room.find().
    skip(parseInt(req.query.off)).limit(parseInt(req.query.lim))
    .sort({ name: 1 })
    res.send(items)
})


myRouter.post(`/api/room`,auth.verifyUser, async (req, res) => {
    console.log('room add called')
	var body=req.body
    var postdata=body;
    if(postdata==null){res.status(500).send("data missing");return;}
    //
    if(req.user.role=="su"){
        var files = req.files;
        if (files != null) {
            if (files['icon'] != null) {
                body["icon"] = await futils.getFileObject(files['icon']);
            }
        }
        var room = await new Room(postdata)
        room.save().catch((err) => {
            console.log(err);
            res.status(500).send(err);
            return;
        }).then(async (val) => {
			//UPDATE SORT ORDERS
			await SortUtils.postItem("rooms","room",val._id)
			//
            if (val != null) res.send("success")
            console.log('room added')
        })
    }
    else{
        res.status(403).send("Access denied, super user only feature")
    }
})

//edit room
myRouter.put(`/api/room/:id`,auth.verifyUser, async (req, res) => {
    var data = req.body;
	console.log(data)
	var files = req.files;
	if (files != null) {
		if (files['icon'] != null) {
			data["icon"] = await futils.getFileObject(files['icon']);
		}
	}
    const room = await Room.findOne({ _id:req.params.id});
    if(room!=null){
        room.updateOne(data).then((val)=>{
            res.send(val)
        }).catch((err)=>{
            res.status(500).send(err)
        })
    }
    else{
        res.status(400).send("room not found")
    }
})

//delete room
myRouter.delete(`/api/room/:id`,auth.verifyUser,
    async (req, res, next) =>  {
        console.log('delete called room')
        var params=req.params
        console.log(params)
        //check slots present
		var slots = await Slot.find({"roomId":params["id"]});
		if(Array.isArray(slots) && slots.length){
			res.status(500).send("slots exists in this room, unable to delete,try disabling instead")
		}
		else{
			Room.deleteOne({_id: params["id"]}).catch((err)=>{
				console.log(err)
				res.status(500).send(err);return;
			}).then(async (val)=>{
				//UPDATE SORT ORDERS
				await SortUtils.deleteItem("rooms","room",params["id"])
				res.send("success")
			})
		}
});

//change order single
myRouter.route('/api/room/changeorder').delete(auth.verifyUser, async (req,res,next) => {
    console.log('changeorder called')
        var params=req.body
        console.log(params["id"])
        var result = await SortUtils.changeOrder("rooms","room",
		params["id"],params["pos"])
		result==true?res.send('success'):res.status(500).send("Unable to change order, check position correct")
})
//change order bulk
myRouter.route('/api/room/changeorder/all').delete(auth.verifyUser, async (req,res,next) => {
    console.log('changeorder called')
        var params=req.body
        console.log(params["vals"])
        var result = await SortUtils.changeOrderAll("rooms","room",
		params["vals"])
		result==true?res.send('success'):res.status(500).
		send("Unable to change order, check position correct")
})


module.exports = myRouter