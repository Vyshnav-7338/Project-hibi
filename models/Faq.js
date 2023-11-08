const mongoose = require('mongoose')

const schema = mongoose.Schema({
    title:{type:mongoose.Schema.Types.String,required:true},
    content:{type:mongoose.Schema.Types.String,required:true},
    owner:{type: Object},
    appid:{
        type: String,
        enum : ['upfolio','alumini','bloodapp'],
        default: 'upfolio'
    },
},{
    timestamps: true
})

schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Faq", schema)
