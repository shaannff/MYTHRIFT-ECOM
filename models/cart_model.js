

const mongoose=require('mongoose')


const newcart= new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'userData',required:true},
    product:[{
        productId:{type:mongoose.Schema.Types.ObjectId,ref:'product'},
        quantity:{type:Number,required:true,default:1},
        price:{type:Number,required:true}
    }],
    TotalPrice:{type:Number},
    coupenDiscount: {
        
        type: Number,
        required: true,
        default: 0

    },

    percentage: {
        
        type: Number,
        required: true,
        default: 0
        

    }

})

module.exports=mongoose.model('cart',newcart)