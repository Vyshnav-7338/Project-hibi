const mongoose = require('mongoose')

const timeSchema = new mongoose.Schema({
	h: {
		type: mongoose.Schema.Types.Number,
	  	maxlength: [2, 'time must not be greater than 2 characters length'],
	},
	m: {
		type: mongoose.Schema.Types.Number,
	  	maxlength: [2, 'time must not be greater than 2 characters length'],
	},
	p: {
		type:String,enum : ['am','pm'],required:true
	},
})

const schema = mongoose.Schema({
    name:{type: String,required: true},
    start_time:timeSchema,
	end_time:timeSchema,
    roomId:{type: mongoose.Schema.Types.String,required: true},
    enabled:{type:mongoose.Schema.Types.Boolean,default:true},
	sortpos:{type:mongoose.Schema.Types.Number},//user defined sort position
},{
    timestamps: true
})



schema.index({ name:1,roomId:1}, { unique: true });
schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Slot", schema)
