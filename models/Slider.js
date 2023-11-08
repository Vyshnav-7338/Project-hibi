const mongoose = require('mongoose')

const schema = mongoose.Schema({
	name: {type:String},
	files:{
        type: Object,
        required: false,
    },
},{
    timestamps: true
})


schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

//schema.index({name: 'text'})

module.exports = mongoose.model("Slider", schema)
