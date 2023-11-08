//NOtification

const mongoose = require('mongoose')

const schema = mongoose.Schema({
    title:{type:mongoose.Schema.Types.String,required:true},
    content:{type:mongoose.Schema.Types.String},
    owner:{type:mongoose.Schema.Types.ObjectId},
    
},{
    timestamps: true
})

schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Notifica", schema)
