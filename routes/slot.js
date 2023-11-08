const express = require('express');
const bodyParser = require('body-parser');
const myRouter = express.Router();
var auth = require('../auth/authenticate');
const futils = require("../utils/fileutils")
const Slot = require("../models/Slot")
const Room = require("../models/Room")
const { ObjectId } = require('mongodb');
const SortUtils = require("../utils/sortutils")
const Book = require("../models/Booking")
//const {fcmpush} = require('../notifications/fcm_push.js');

myRouter.use(bodyParser.json());
//GET ALL
myRouter.get(`/api/slot`,auth.verifyUser, async (req, res) => {
    console.log("slot get all called")//
    if(req.query.roomId==null){res.status(500).send("roomId required");return;}
    var items = await Slot.find({"roomId":req.query.roomId}).
    skip(parseInt(req.query.off)).limit(parseInt(req.query.lim))
    .sort({ sortpos: 1 })
    res.send(items)
})
//GET ALL (FOR REORDERING)
myRouter.get(`/api/slot/reorder/list`,auth.verifyUser, async (req, res) => {
    //console.log("room get all called")//
	console.log(req.query.roomId)
    var items = await Slot.find({"roomId":req.query.roomId}).
	sort({ sortpos: 1 }).select("name start_time end_time")
    res.send(items)
	//var z = await db.collection("foo").find({}).toArray();
})

myRouter.post(`/api/slot`,auth.verifyUser, async (req, res) => {
    console.log('slot add called')
	var body=req.body
    var postdata=body;
    if(postdata==null){res.status(500).send("data missing");return;}
    if(postdata["roomId"]==null){res.status(500).send("roomId required");return;}
    if(!ObjectId.isValid(postdata["roomId"])){res.status(500).send("invalid roomId");return;}
    //check room exists
    var temp = await Room.findById(postdata["roomId"])
    if(temp==null){res.status(500).send("Room doesn't exists");return;}
    //
    if(req.user.role=="su"){
        var room = await new Slot(postdata)
        room.save().catch((err) => {
            console.log(err);
            res.status(500).send(err);
            return;
        }).then(async (val) => {
			
            if (val != null){
				//UPDATE SORT ORDERS
				await SortUtils.postItem("slots",postdata["roomId"],
				val._id,{"roomId":postdata["roomId"]})
				res.send("success")
            	console.log('slot added')
			}else{res.status(500).send("Internal server error")}
        })
    }
    else{
        res.status(403).send("Access denied, super user only feature")
    }
})


//edit room
myRouter.put(`/api/slot/:id`,auth.verifyUser, async (req, res) => {
    var data = req.body;
    if(req.params.id==null){res.status(500).send("slot id required");return;}
    if(!ObjectId.isValid(req.params.id)){res.status(500).send("invalid slotId");return;}
    const room = await Slot.findOne({ _id:req.params.id});
    if(room!=null){
        room.updateOne(data).then((val)=>{
            res.send(val)
        }).catch((err)=>{
            res.status(500).send(err)
        })
    }
    else{
        res.status(400).send("slot not found")
    }
})

//delete room
myRouter.delete(`/api/slot/:id`,auth.verifyUser,
    async (req, res, next) =>  {
        console.log('delete called slot')
		//check any booking exists
		var bookings = await Book.find({"slots": req.params.id})
		//
		if (Array.isArray(bookings) && bookings.length) {
			res.status(500).send("booking exists in this slot, unable to delete,delete bookings first")
			return;
		} else {
			var slot = await Slot.findById(req.params.id)
			Slot.deleteOne({
				_id: req.params.id
			}).catch((err) => {
				console.log(err)
				res.status(500).send(err);
				return;
			}).then(async (val) => {
				//UPDATE SORT ORDERS
				await SortUtils.deleteItem("slots", slot.roomId,
					req.params["id"], {
						"roomId": slot.roomId
					})
				res.send("success")
			})
		}
});

//change order bulk
myRouter.route('/api/slot/changeorder/all').delete(auth.verifyUser, async (req,res,next) => {
    console.log('changeorder called')
        var params=req.body
        console.log(params["vals"])
        var result = await SortUtils.changeOrderAll("slots",req.query.roomId,
		params["vals"],{"roomId":req.query.roomId})
		result==true?res.send('success'):res.status(500).
		send("Unable to change order, check position correct")
})


module.exports = myRouter