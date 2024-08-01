const mongoose=require('mongoose')

const whishlistSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'userData',
        requires:true
    },
    products:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product'
        }
    }]
})

module.exports=mongoose.model('whishlist',whishlistSchema)