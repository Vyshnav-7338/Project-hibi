const express = require('express');
const bodyParser = require('body-parser');
const myRouter = express.Router();
var auth = require('../auth/authenticate');
const Slot = require("../models/Slot")
const Room = require("../models/Room")
const Book = require("../models/Booking")
const { ObjectId } = require('mongodb');
const rs = require('randomstring')


myRouter.use(bodyParser.json());
//GET ALL
myRouter.get(`/api/reports/overall/count`,auth.verifyUser, async (req, res) => {
    console.log("booking get all called")//
    var items = await Book.aggregate([
        {"$group" : {_id:"$roomId", count:{$sum:1}}}
    ])
    //
    res.send(items)
})

myRouter.get(`/api/reports/overall`,auth.verifyUser, async (req, res) => {
    console.log("booking get all called")//
    if(req.query.roomId==null){res.status(400).send("Room Id required");return;}
    var items = await Book.find({roomId: req.query.roomId}).skip(parseInt(req.query.off)).
    limit(parseInt(req.query.lim))
    //
    res.send(items)
})

myRouter.get(`/api/reports/daily/count`,auth.verifyUser, async (req, res) => {
    console.log("booking get all called")//
    if(req.query.date==null){res.status(400).send("date is required");return;}
    var dt = new Date(req.query.date+"z");
    console.log(dt)
    var items = await Book.aggregate([
        {$match:{date:dt}},
        {"$group" : {_id:"$roomId", count:{$sum:1}}}
    ])
    //
    res.send(items)
})
myRouter.get(`/api/reports/daily`,auth.verifyUser, async (req, res) => {
    console.log("booking get all called")//
    if(req.query.date==null){res.status(400).send("date is required");return;}
    if(req.query.roomId==null){res.status(400).send("Room Id required");return;}
    var dt = new Date(req.query.date+"z");
    console.log(dt)
    var items = await Book.aggregate([
        {$match:{date:dt,roomId: ObjectId(req.query.roomId),}},
    ])
    //
    res.send(items)
})

myRouter.get(`/api/reports/monthly/count`,auth.verifyUser, async (req, res) => {
    console.log("booking get all called")//
    if(req.query.month==null){res.status(400).send("month is required");return;}
    if(req.query.year==null){res.status(400).send("year is required");return;}
    
    var items = await Book.aggregate([
        {$project: {name: 1,roomId: 1,bookingId:1,userId:1, month: {$month: '$date'}, year: {$year: '$date'}}},
        {$match: {month: parseInt(req.query.month),year:parseInt(req.query.year)}},
        {"$group" : {_id:"$roomId", count:{$sum:1}}}
    ])
    //
    res.send(items)
})

myRouter.get(`/api/reports/monthly`,auth.verifyUser, async (req, res) => {
    console.log("booking get all called")//
    if(req.query.roomId==null){res.status(400).send("Room Id required");return;}
    if(req.query.month==null){res.status(400).send("month is required");return;}
    if(req.query.year==null){res.status(400).send("year is required");return;}
    var items = await Book.
    aggregate([
        {$project: {name: 1,roomId: 1,bookingId:1,userId:1, month: {$month: '$date'},
         year: {$year: '$date'}}},
        {$match: {
            roomId: ObjectId(req.query.roomId),
            month: parseInt(req.query.month),year:parseInt(req.query.year)}},
    ]).
    skip(parseInt(req.query.off)).
    limit(parseInt(req.query.lim));
    //
    res.send(items)
})


/*

myRouter.post(`/api/booking/purchase`,auth.verifyUser, async (req, res) => {
    console.log('slot purchase called')
	var body=req.body
    var postdata=body;
    if(postdata==null){res.status(500).send("data missing");return;}
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
        postdata["date"] = getCurrentDate();
        postdata["userId"] = req.user.id;
        //
        var slots;
        try {
            slots = JSON.parse(postdata["slots"]);
        } catch (e) {
            res.status(500).send("slots array format is not a valid json string")
            return;
        }
        //check slots input is valid
        if (slots == null || slots.length <= 0) {
            // the array is defined and has at least one element
            res.status(500).send("Slots array is empty");return;
        }
        //check slots already booked
        var x = await Book.findOne({"date":getCurrentDate(),
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
//slot availability by date, roomId
myRouter.get(`/api/booking/status`,auth.verifyUser, async (req, res) => {
    var roomId = req.query.roomId
    if(roomId==null){res.status(500).send("roomId required");return;}
    if(req.query.date==null){res.status(500).send("date required");return;}
    if(!ObjectId.isValid(roomId)){res.status(500).send("invalid roomId");return;}
    //check room exists
    var temp = await Room.findById(roomId)
    if(temp==null){res.status(500).send("Room doesn't exists");return;}
    var slots = await Slot.find({"roomId":roomId})
    var x = {}
    for(var i=0;i<slots.length;i++){
        var item = slots[i]
        var y = await Book.findOne({"date":getCurrentDate(),
        "roomId":roomId,"slots":item._id})
        //console.log(y)
        x[item._id] = y!=null?true:false;//false - not booked, true - booked
    }
    res.send(x)
})
*/
function getCurrentDate() {
    const t = new Date();
    const date = ('0' + t.getDate()).slice(-2);
    const month = ('0' + (t.getMonth()+1)).slice(-2);
    const year = t.getFullYear();
    return new Date(`${month}/${date}/${year}Z`)
}
/*

//edit room
myRouter.put(`/api/slot`,auth.verifyUser, async (req, res) => {
    var data = req.body;
    if(req.query.id==null){res.status(500).send("slot id required");return;}
    if(!ObjectId.isValid(req.query.id)){res.status(500).send("invalid slotId");return;}
    const room = await Slot.findOne({ _id:req.query.id});
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
myRouter.delete(`/api/slot`,auth.verifyUser,
    async (req, res, next) =>  {
        console.log('delete called slot')
        Slot.deleteOne({_id: req.query.id}).catch((err)=>{
            console.log(err)
            res.status(500).send(err);return;
        }).then(async (val)=>{
            res.send("success")
        })
});
*/

module.exports = myRouter