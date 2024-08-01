const  mongoose=require("mongoose");

const Order=mongoose.Schema({
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'userData'
    },
    orderAmount:{
        type:Number,
        required:true
    },
    deliveryAddress:{
        name:{type:String, required:true },
        phone:{type:String,},
        pincode:{type:Number,required:true},
        place:{type:String,required:true},
        city:{type:String,required:true},
        state:{type:String,required:true},
        
},
    payment:{
        type:String,
        required: true,
    },coupenDis: {
        
        type: Number,
        required: true,
        default: 0

    },

    percentage: {
        
        type: Number,
        required: true,
        default: 0

    },

    orderDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    
         
         products:[{
            productId:{
              type:mongoose.Schema.Types.ObjectId,
              ref:"product",
              required:true
            },
            quantity:{
                type:Number,
                required:true,
                default:1,
            },
            price:{
                type:Number,
                required:true,
            },
            orderProStatus:{
                type: String,
                required:true,
            enum: ['pending', 'shipped', 'delivered','canceled','return'], 
            default: 'pending'
            },
            canceled: { type: Boolean, default: false },
        
            reason: { type: String, default: '' },
    
            retruned: { type: Boolean, default: false },
            
        }],
})





module.exports=mongoose.model('orders',Order)