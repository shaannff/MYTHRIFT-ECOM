const category=require('../../models/category_model')
const Address=require('../../models/address_model')
const Cart=require('../../models/cart_model')
const Order=require('../../models/order_model')
const Producct=require('../../models/product_model')
const User=require('../../models/user_model')
const Coupon=require('../../models/coupen_model')


const loadCoupon=async(req,res,next)=>{
    try {
        const categoryData = await category.find({ is_Listed: true });

        if (req.session.user) {

            const msg = req.flash('flash')

            const coupenData = await Coupon.find({ status: true });
            
            res.render("coupon", { login: req.session.user, categoryData, coupenData, msgg: msg });

        } else {

            res.redirect('/login');

        }
    } catch (error) {
        next(error,req,res) 
    }
}

const coupenCheck = async (req, res, next) => {
    
    try {

        const inpValue = req.body.inpVal

        const checkCoupen = await Coupon.findOne({ coupenId: inpValue });

        if (checkCoupen) {
            
            res.send({ succ: true })

        } else {

            res.send({ fail: true })

        }

    } catch (error) {
        next(error,req,res) 

        
    }

};

const useCoupon=async(req,res,next)=>{
    try{
        const couponId=req.body.coupen
        const coupon=await Coupon.findOne({coupenId:couponId,status:true})

        if(coupon){
            const cartdata=await Cart.findOne({userId:req.session.user._id})
            const exist = await User.findOne({ _id: req.session.user._id, applyCoupen: { $in: [coupon.coupenId] } });

            if(!exist){

                const cartPrice=cartdata.TotalPrice
                const couponDis=coupon.discount
                
                if (coupon) {
                            
                    const offerValue = Math.round((cartPrice) - (cartPrice * couponDis / 100));
                    const discountedValue = cartPrice - offerValue
                
                    const updateCart = await Cart.findOneAndUpdate({ _id: cartdata._id }, { $set: { TotalPrice: offerValue, coupenDiscount: discountedValue, percentage: coupon.discount } }, { new: true });
                    await User.findOneAndUpdate({ _id: req.session.user._id }, { $push: { applyCoupen: coupon.coupenId } });
                
                    if (updateCart) {
                               
                        req.flash("flash", "coupen")
                        res.redirect("/cheakout")
                
                    }
                }
            }else{
                req.flash('flash', 'usedOne');
                res.redirect("/cheakout");

            }

        }else{
            console.log('nthgggg')
        }
    }catch(error){
        next(error,req,res) 
    }
}


const removecoupon=async(req,res,next)=>{
    try {
        const userIdd = req.session.user._id

        const cartData = await Cart.findOne({ userId: userIdd });

        const addPrice = cartData.coupenDiscount

        const updateCart = await Cart.findOneAndUpdate({ userId: userIdd }, { $set: { coupenDiscount: 0, percentage: 0 } }, { $inc: { TotalPrice: addPrice } });   //  Update Cart

        await User.findOneAndUpdate({ _id: userIdd }, { $pop: { applyCoupen: 1 } }); //  Remove Coupen Id in User Side
        
        if (updateCart) {
            
            res.send({ succ: true });
        }
    } catch (error) {
        next(error,req,res) 
    }
}


module.exports={
    loadCoupon,
    coupenCheck,
    useCoupon,
    removecoupon
}