//COLLECTION FOR STORING SORTING ORDER OF ROOMS AND SLOTS

const mongoose = require("mongoose")


const schema = mongoose.Schema({
	name: {type:String,required: true,unique : true},
    vals:[{
        type: mongoose.Schema.Types.Mixed//, ref: "subcats"
     }]
    //sub:[childSchema]
    
},{
    timestamps: true
})

module.exports = mongoose.model("SortOrder", schema ,'sort_orders')
