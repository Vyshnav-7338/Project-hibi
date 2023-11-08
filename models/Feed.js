const mongoose = require('mongoose')

const schema = mongoose.Schema({
    title:{type: String,required: true},
    photo:{type: Object,required: false},
    content:{type: String,required: false},
},{
    timestamps: true
})


schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Feed", schema)
