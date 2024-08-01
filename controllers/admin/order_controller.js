
const Order=require('../../models/order_model')
const product=require('../../models/product_model')

const loadOrder=async(req,res,next)=>{
    try{

    const orders=await Order.find({}).populate('products.productId')

    res.render('order',{orders})

    }catch(error){
        next(error,req,res) 
    }
}

const loadOrderDetils=async(req,res,next)=>{
    try{

    const orderId=req.query.orderId

    const orderDetils = await Order.findOne({_id:orderId}).populate('UserId products.productId')

    res.render('orderDetils',{orderDetils})

    }catch(error){

        next(error,req,res) 
    }
}


const updateOrderStatus = async (orderId) => {

    try {
      
        const order = await Order.findById(orderId);
        
        const orderProStatusValues = order.products.map(
    
            (item) => item.orderProStatus
            
        );
        
        let newOrderStatus;
        
        if (orderProStatusValues.every((status) => status === "delivered")) {
        
            newOrderStatus = "delivered";
            
        } else if (orderProStatusValues.every((status) => status === "shipped")) {
            
            newOrderStatus = "shipped";
            
        } else if (orderProStatusValues.every((status) => status === "canceled")) {
            
            newOrderStatus = "canceled";
            
        } else {
            
            newOrderStatus = "pending";
            
        }

        order.orderStatus = newOrderStatus;
        
        await order.save();
        
    } catch (err) {
        
        console.log(err.message + " updateOrderStatus");
        
    }
    
};


const orderStatushandling=async(req,res,next)=>{
try{

    const orderId = req.body.ordId
    const productId = req.body.proId
    const bodyValue = req.body.val
  
    await Order.findOneAndUpdate(

        { _id: orderId, "products.productId": productId },

        { $set: { "products.$.orderProStatus": bodyValue } }
  
    );
    
    updateOrderStatus(orderId);
    
    res.json({ success: true });
}catch(error){
    next(error,req,res) 
}
}



module.exports={
loadOrder,
loadOrderDetils,
orderStatushandling
}