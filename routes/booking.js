const express = require('express');
const bodyParser = require('body-parser');
const myRouter = express.Router();
var auth = require('../auth/authenticate');
const Slot = require("../models/Slot")
const Room = require("../models/Room")
const Book = require("../models/Booking")
const { ObjectId } = require('mongodb');
const rs = require('randomstring')

//const Razorpay = require('razorpay');


myRouter.use(bodyParser.json());
//GET ALL
myRouter.post(`/api/booking`,auth.verifyUser, async (req, res) => {
    console.log("booking get all called")//
    var qry = {"date":new Date(`${req.query.date} GMT`)}
    console.log(new Date(`${req.query.date} GMT`).toUTCString())
    if(req.query.room!=null && req.query.room!="null")qry["roomId"] = req.query.room
    console.log(qry)
    if(req.user.role=="su" || req.user.role=="admin"){
		var items = await Book.find(qry).
    	skip(parseInt(req.query.off)).limit(parseInt(req.query.lim))
    	.sort({ createdAt: -1 }).populate("room").populate("slot").populate("user")
    	console.log(items)
        res.send(items)
	}
	else{
		//Normal users can view their own bookings
		var items = await Book.find({"userId":req.user._id}).
    	skip(parseInt(req.query.off)).limit(parseInt(req.query.lim))
    	.sort({ createdAt: -1 }).populate("room").populate("slot").populate("user")
    	res.send(items)
	}
})


myRouter.post(`/api/booking/purchase`,auth.verifyUser, async (req, res) => {
    console.log('slot purchase called')
	var body=req.body
    var postdata=body;
    if(postdata==null){res.status(500).send("data missing");return;}
	if(postdata["date"]==null){res.status(500).send("date required");return;}
	if(postdata["amountPayed"]==null){res.status(500).send("amount payed required");return;}
	if(postdata["transactionId"]==null){res.status(500).
		send("transaction id required");return;}
    if(postdata["roomId"]==null){res.status(500).send("roomId required");return;}
    if(!ObjectId.isValid(postdata["roomId"])){res.status(500).send("invalid roomId");return;}
    //check room exists
    var temp = await Room.findById(postdata["roomId"])
    if(temp==null){res.status(500).send("Room doesn't exists");return;}
    else{
        if(temp["enabled"]==false){res.status(500).send("Room is locked by admin");return;}
    }
    //
    if(req.user.role=="user"){
        var bookingId = rs.generate({length: 6,charset: 'numeric'})
        postdata["bookingId"] = bookingId;
        postdata["userId"] = req.user.id;
        //
		//
        var slots = postdata["slots"];
		//console.log("FUCK")
        //check slots input is valid
        if (slots == null || slots.length <= 0) {
            // the array is defined and has at least one element
            res.status(500).send("Slots array is empty");return;
        }
        //check slots already booked
        var x = await Book.findOne({"date":postdata["date"],
        "roomId":postdata["roomId"],"slots":{ $in:slots}})
        if(x!=null){
            console.log(x)
            res.status(409).send("slot already booked");return;
        }
		
        postdata["slots"] = slots
        //
        var room = await new Book(postdata)
        room.save().catch((err) => {
            console.log(err);
            res.status(500).send(err);
            return;
        }).then(async (val) => {
            if (val != null) res.send("success")
            console.log('slot added')
        })
    }
    else{
        res.status(403).send("Access denied, user only feature")
    }
})
/*
myRouter.post(`/api/booking/placeorder`,auth.verifyUser, async (req, res) => {
    console.log('placeorder called')
    //
    var instance = new Razorpay({ key_id: 'YOUR_KEY_ID', key_secret: 'YOUR_SECRET' })

var options = {
  amount: 50000,  // amount in the smallest currency unit
  currency: "INR",
  receipt: "order_rcptid_11"
};
instance.orders.create(options, function(err, order) {
  console.log(order);
});
})
*/
//slot availability by date, roomId
myRouter.get(`/api/booking/status`,auth.verifyUser, async (req, res) => {
    var roomId = req.query.roomId
    if(roomId==null){res.status(500).send("roomId required");return;}
    if(req.query.date==null){res.status(500).send("date required");return;}
    if(!ObjectId.isValid(roomId)){res.status(500).send("invalid roomId");return;}
    //check room exists
    var temp = await Room.findById(roomId)
    if(temp==null){res.status(500).send("Room doesn't exists");return;}
    var slots = await Slot.find({"roomId":roomId,"enabled":true}).sort({ sortpos: 1 })
    var x = {}
	var slotno=1;
    for(var i=0;i<slots.length;i++){
        var item = slots[i]
        var y = await Book.findOne({"date":req.query.date,
        "roomId":roomId,"slots":item._id})
        //console.log(y)
        x[item._id] = {
			"isBooked":y!=null?true:false,//false - not booked, true - booked
			"name":item.name,
			"start_time":item.start_time,
			"end_time":item.end_time,
			"index":slotno,
		}
		slotno++
    }
    res.send(x)
})
myRouter.get(`/api/booking/statusall`,auth.verifyUser, async (req, res) => {
   console.log("duck called")
    if(req.query.date==null){res.status(500).send("date required");return;}
    
    var rms = await Room.find({"enabled":true})
	var rmsnew=[]
	var ind=0;
	for (var ri in rms) {
		var room = rms[ri]
		var roomId = room._id;
		//console.log(roomId)
		var slots = await Slot.find({"roomId": roomId,"enabled":true})
		var x = {}
		for (var i = 0; i < slots.length; i++) {
			var item = slots[i]
			var y = await Book.findOne({
				"date": req.query.date,
				"roomId": roomId,
				"slots": item._id
			})
			//console.log(req.query.date)
			//console.log(y)
			//console.log(y)
			x[item._id] = y != null ? true : false; //false - not booked, true - booked
		}
		//var temp2 = rms[ind]
		var temp2 = {}
		temp2["_id"] = room["_id"]
		temp2["name"] = room["name"]
		temp2["icon"] = room["icon"]
		temp2["price"] = room["price"]
		//console.log(temp2)
		Object.assign(temp2, {"bookinginfo": x});
		//console.log(x)
		//temp2["binfo"] = x
		//console.log(temp2)
		//temp2["bookinginfo"] = x
		rmsnew.push(temp2)
	}
	//console.log(rmsnew)
    res.send(rmsnew)
})




//edit room
myRouter.put(`/api/booking/:id`,auth.verifyUser, async (req, res) => {
    var data = req.body;
    if(req.params.id==null){res.status(500).send("slot id required");return;}
    if(!ObjectId.isValid(req.params.id)){res.status(500).send("invalid slotId");return;}
    const room = await Book.findOne({ _id:req.params.id});
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
myRouter.delete(`/api/booking`,auth.verifyUser,
    async (req, res, next) =>  {
        console.log('delete called slot')
        Book.deleteOne({_id: req.query.id}).catch((err)=>{
            console.log(err)
            res.status(500).send(err);return;
        }).then(async (val)=>{
            res.send("success")
        })
});


module.exports = myRouter