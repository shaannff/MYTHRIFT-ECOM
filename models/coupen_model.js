const mongoose=require('mongoose')

const coupenSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    form:{
        type:Number,
        required:true
    },
    to:{
        type:Number,
        required:true
    },
    coupenId:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }
})

module.exports=mongoose.model('coupen',coupenSchema)