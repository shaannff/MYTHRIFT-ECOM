const mongoose=require('mongoose')

const productSchema=new mongoose.Schema({
   name: {type:String,required:true},
    price:{type:Number,min:0,required:true},
    stock:{type:Number,required:true},
    status:{type:Boolean,default:true},
    image:{type:Array,required:true},
    category:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'category'},
    descripition:{type:String,requried:true},
    createdAt:{type:Date,requried:true},
    discount_price: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },




})
module.exports=mongoose.model('product',productSchema)