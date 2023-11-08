const mongoose = require('mongoose')

const schema = mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,required:true},
    roomId:{type:mongoose.Schema.Types.ObjectId,required:true},
    slots:{type:[mongoose.Schema.Types.ObjectId],required:true},
    date:{type:mongoose.Schema.Types.Date,required:true},
    bookingId:{type:String,required:true},
    //retreived from payment gateway
    transactionId:String,
    amountPayed:Number,
    status:{type:String,enum:['pending','occupied','completed','refunded']
	,default : 'pending'},
	
},{
    timestamps: true
})

schema.virtual('room', {
    ref: 'Room',
    localField: 'roomId',
    foreignField: '_id',
    justOne: true,
    //match: { isActive: true }
  });

  schema.virtual('slot', {
    ref: 'Slot',
    localField: 'slots',
    foreignField: '_id',
    //justOne: true,
    //match: { isActive: true }
  });
  schema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
    //match: { isActive: true }
  });

schema.index({ bookingId:1}, { unique: true });
schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Booking", schema,"bookings")
