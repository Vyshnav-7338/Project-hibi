const mongoose = require('mongoose')

const schema = mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    otp: { type: Number, default: 0},
    attempts: { type: Number, default: 0},//number of attempts done by user
    status: { type: mongoose.Schema.Types.Boolean},//success or failure
    ip:String,
    response_token:String
},{
    timestamps: true
})

module.exports = mongoose.model("ResetToken", schema)