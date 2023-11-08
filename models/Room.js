const mongoose = require('mongoose')

const schema = mongoose.Schema({
    name:{type: String,required: true},
    icon:{type: Object,required: false},
    enabled:{type:mongoose.Schema.Types.Boolean,default:true},
	price:{type:mongoose.Schema.Types.Number, required: true},
	sortpos:{type:mongoose.Schema.Types.Number},//user defined sort position
    
},{
    timestamps: true
})


schema.index({ name:1}, { unique: true });
schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Room", schema)
