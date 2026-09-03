const mongoose =require('mongoose')

const blockListSchema = new mongoose.Schema({
    token:{
        type:String,
        required:[true,"token required for blockListing"]

    }
},{timestamps:true})

const blockListModel = mongoose.model("blockList",blockListSchema);
module.exports = blockListModel