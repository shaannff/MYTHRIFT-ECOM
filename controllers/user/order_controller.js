
const category=require('../../models/category_model')
const Address=require('../../models/address_model')
const Cart=require('../../models/cart_model')
const Order=require('../../models/order_model')
const Producct=require('../../models/product_model')
const User=require('../../models/user_model')
const instance=require('../../config/razorpay')
const Wallet=require('../../models/wallet_model')
const Coupon=require('../../models/coupen_model')

const loadCheakOut=async(req,res,next)=>{
    try{

        if(req.session.user){

            const userAddress=await Address.findOne({userId:req.session.user._id,'addresss': { $elemMatch: { 'states': true } }})
            const falseAddress=await Address.findOne({userId:req.session.user._id,'addresss': { $elemMatch: { 'states': false } }})

            const categoryData=await category.find({is_listed:true})

            const cart=await Cart.findOne({userId:req.session.user._id}).populate('product.productId')
            const walletData = await Wallet.findOne({userId:req.session.user._id})

            const msg = req.flash("flash")

            if(cart){

                for(let product of cart.product){

                    if(!product.productId.status||product.quantity<1){

                        product.price=0
                    }
                }
                const coupenData = await Coupon.find({ status: true });

                let totalPrice=cart.product.reduce((acc,product)=>acc+product.price,0)

                if (cart.coupenDiscount >= 0) {
                    
                    totalPrice -= cart.coupenDiscount;

                }

                const cartdata=await Cart.findOneAndUpdate({

                    userId:req.session.user._id},
                    {$set:{TotalPrice:totalPrice}},
                    {new:true,upsert:true})

                    const coupondis=cart.coupenDiscount

                    res.render('checkout',{categoryData,userAddress,walletData,login: req.session.user,falseAddress,totalPrice:cartdata.TotalPrice,msg:msg,coupondis , cart})


            }else{
                res.render('checkout',{categoryData,userAddress,walletData,login: req.session.user,falseAddress,totalPrice:0,msg,})

            }
                                                                                               
        }else{
            res.redirect('/login')

        }
       
    }catch(error){
        next(error,req,res) 
    }
}

const cheakOutAddAddress=async(req,res,next)=>{
    try{
        
        const userid=req.session.user._id
        const {username,address,city,state,pincode,phone}=req.body
        
        const user=await Address.updateOne({userId:userid},{
            $push:{
                addresss:{
                    userName:username,
                    name:address,
                    city:city,
                    state:state,
                    pincode:pincode,
                    phone:phone,
                    states:true
                }
            }
        },
        {new:true,upsert:true})

        if(user){
            res.redirect('/cheakout')
        }else{
            res.redirect('/cheakout')

        }
    }catch(error){
        next(error,req,res) 
    }
}

const chooseAddress=async(req,res,next)=>{
    try{
    const address=req.query.id
    const update=await Address.bulkWrite([
        {
            updateOne:{
                filter:{userId:req.session.user._id,'addresss.states':true},
                update:{$set:{'addresss.$.states':false}}
            }
        },{
            updateOne:{
                filter:{userId:req.session.user._id,'addresss._id':address},
                update:{$set:{'addresss.$.states':true}}
            }
        }
    ])

       if(update){

        res.json({succes:true})

       }else{

        res.json({succes:true})

       }
    }catch(error){
        next(error,req,res) 
    }
}

const placeOrder = async (req, res, next) => {
    try {
        

    if(req.session.user){
    const  userId=req.session.user._id

    const cartData=await Cart.findOne({userId:userId})

    const addressData=await Address.findOne({userId:userId})


    if (!cartData || cartData.product.length == 0) {

            req.flash('flash','cart is empty')
            res.redirect('/cheakout')

        } else if (!addressData) {

            req.flash('flash','choose a address')
            res.redirect('/cheakout')

        } else {
            const peymentMeth=req.body.payment

            const cart= await Cart.findOne({userId:userId})

            const walletData= await Wallet.findOne({userId:userId})

            const address = await Address.findOne({ userId:userId, 'addresss.states': true }, { 'addresss.$': 1 })

            const product=cart.product

             const { userName, name, city, state, pincode, phone } = address?.addresss?.[0] ?? {};

             const order = await Order.create({

                            UserId: userId,
                            orderAmount: cart.TotalPrice,

                            deliveryAddress: {
                                name: userName,
                                phone: phone,
                                pincode: pincode,
                                place: name,
                                city: city,
                                state: state
                            },

                            payment: peymentMeth,
                            orderDate: Date.now(),
                            products: product,
                            coupenDis: cart.coupenDiscount,
                            percentage: cart.percentage
                        })

            req.session.order=order

            if(peymentMeth=='wallet'){

                const balance=walletData.balance-cart.TotalPrice
                const debitAmout=cart.TotalPrice

                await Wallet.findOne( { userId:userId },
                     { $set : { balance:balance} ,
                        $push:
                             {transaction:
                                {amount:debitAmout,creditOrDebit:'debit'}
                            }
                     })
            }

            // quntity managing

            if(order){
                order.products.forEach(async (e) => {
            
                    let productt = await Producct.findOne({ _id: e.productId });
        
                    let newStock = productt.stock - e.quantity;
        
                    await Producct.findOneAndUpdate({ _id: e.productId }, { $set: { stock: newStock } });
        
                });
                     const removedCart = await Cart.findOneAndDelete({ userId: userId });

                     if(removedCart){

                    //  console.log('Cart deleted');
                    res.redirect('/succes') 

                     }else{

                    console.log(' cart not removed')
                     }

            }else{

                 console.log('mskkwd')
                 }         
        }

}else{
    res.redirect('/login')
}
    } catch (error) {
        next(error,req,res) 

    }
}


const loadSucces=async(req,res,next)=>{
    try{
        if(req.session.user._id){

            const categoryData=await category.find({is_listed:true})

            res.render('succes',{categoryData,login: req.session.user})

        }else{
            res.redirect('/login')
        }
        
    }catch(error){
        next(error,req,res) 
    }
}


const loadorder=async(req,res,next)=>{
    try{
        if(req.session.user){


            const categoryData=await category.find({is_listed:true})

            const orderData=await Order.find({UserId:req.session.user._id})

            res.render('order',{categoryData,orderData,login: req.session.user})

        }else{
            
            res.redirect('/login')

        }
       
    }catch(error){
        next(error,req,res) 
    }
}

const loadOrderDetils=async(req,res,next)=>{
    try{
        if(req.session.user){
            const orderid=req.query.id

            const categoryData=await category.find({is_listed:true})

            const order=await Order.findOne({_id:orderid}).populate('products.productId')

            const prductdetils=order.products.map(val=>val)

            const orderstatues=order.products.map(val=>val.orderProStatus)

            res.render('orderdetils',{categoryData,order,login: req.session.user,orderstatues,prductdetils})
        }else{
            res.redirect('/login')
        }
    }catch(error){
        next(error,req,res) 
    }
}

const canncelProduct=async(req,res,next)=>{
    try{
        console.log('heeey')

        const { proId, ordId, price, reason } = req.body;

        const userIdd = req.session.user._id

        const cancelOrd = await Order.findOneAndUpdate(
        
            { _id: ordId, 'products.productId': proId },
          
            {
              
                $set: {
                
                    'products.$.orderProStatus': 'cancelled',
                    'products.$.canceled': true,
                    'products.$.reason': reason,
                
                },
                
            },

            { new: true }
            
        )

        const orderFind = await Order.findOne({ _id: ordId, "products.productId": proId, "products.canceled": true, }, { "products.$": 1, });

        let findOrd; //  Find Order Variable
        let ordVal;  //  Order Amount Variable
        let moneyDecrese // Product Price

        if (orderFind) {
            
            const getQuantity = orderFind.products[0].quantity;    

            console.log(getQuantity + 'Quantity');
    
            await Producct.findOneAndUpdate({ _id: proId }, { $inc: { stock: getQuantity } });

            //  Manage The Money :-

            moneyDecrese = orderFind.products[0].price  
            findOrd = await Order.findOne({ _id: ordId, UserId: userIdd });   //  Find Order

            ordVal = findOrd.orderAmount;     //  Find Ord Amount

            if(findOrd.percentage>=1){

                let newVal = Math.floor((ordVal) - (moneyDecrese - (moneyDecrese * findOrd.percentage / 100)));
                
                await Order.findOneAndUpdate({ _id: ordId, 'products.productId': proId }, { $set: { orderAmount: newVal } });

            }else{

                await Order.findOneAndUpdate({ _id: ordId, 'products.productId': proId }, { $inc: { orderAmount: -moneyDecrese } });
            }


            if(cancelOrd.payment != 'Cash on delivery'){
                
                if (findOrd.percentage >= 1) {
                
                    let newVall = Math.floor((moneyDecrese - (moneyDecrese * findOrd.percentage / 100)));
    
                    await Wallet.findOneAndUpdate({ userId: userIdd }, { $inc: { balance: newVall }, $push: { transaction: { amount: newVall, creditOrDebit: 'credit' } } }, { new: true, upsert: true });
    
                    res.send({ succ: true });
     
                } else {
    
                    await Wallet.findOneAndUpdate({ userId: userIdd },
                    
                        {
                            $inc: { balance: price },
                            $push: { transaction: { amount: price, creditOrDebit: 'credit' } }
                        },
                        
                        { new: true, upsert: true }
        
                    );
                }

            }

            res.send({ succ: true });

        } else {

            res.send({ fail: true });
        }



    }catch(error){
        next(error,req,res) 
    }
}

const returnProduct=async(req,res,next)=>{
    try {

        const { proId, ordId, price, reason } = req.body;
        const userIdd=req.session.user._id

        const returnedItem = await Order.findOneAndUpdate(
            { _id: ordId, "products.productId": proId },
            {
              $set: {
                "products.$.orderProStatus": "returned",
                "products.$.reason": reason,
                "products.$.retruned": true,

              },
            },
            { new: true }
          );
    

       
            const findOrder = await Order.findOne({ _id: ordId, 'products.productId': proId, 'products.retruned': true }, { 'products.$': 1 });

            if (findOrder) {

                const findStock = findOrder.products[0].quantity;
                
                await Producct.findOneAndUpdate({ _id: proId }, { $inc: { stock: findStock } });

                //  Money Managing :-
                
                const moneyDecreses = findOrder.products[0].price;

                if(findOrder.percentage>=1){

                    let newVal = Math.floor((ordVal) - (moneyDecreses - (moneyDecreses * findOrder.percentage / 100)));
                    
                    await Order.findOneAndUpdate({ _id: ordId, 'products.productId': proId }, { $set: { orderAmount: newVal } });
    
                }else{
    
                    await Order.findOneAndUpdate({ _id: ordId, 'products.productId': proId }, { $inc: { orderAmount: -moneyDecreses } });
                }

                if(returnedItem.payment != 'Cash on delivery'){


                    if (findOrder.percentage >= 1) {
                
                        let newVall = Math.floor((moneyDecreses - (moneyDecreses * findOrder.percentage / 100)));
                        console.log('heey getl')
        
                        await Wallet.findOneAndUpdate({ userId: userIdd }, { $inc: { balance: newVall }, $push: { transaction: { amount: newVall, creditOrDebit: 'credit' } } }, { new: true, upsert: true });
        
                        res.send({ succ: true });
         
                    } else {
        
                        await Wallet.findOneAndUpdate({ userId: userIdd },
                        
                            {
                                $inc: { balance: price },
                                $push: { transaction: { amount: price, creditOrDebit: 'credit' } }
                            },
                            
                            { new: true, upsert: true }
            
                        );
                    }
                     
                        res.send({ succ: true })

                }else{
                  res.send({ fail: true })

                }

            }else{
                console.log('nooo order')
            }

    } catch (error) {
        next(error,req,res) 
    }
  

      
}

const razopay=async(req,res,next)=>{
    try{
        const userIdd = req.session.user._id;
        console.log('heey')

        if (userIdd) {

            const cartData = await Cart.findOne({ userId: userIdd });
            console.log('heey1')

            const addressData = await Address.findOne({ userId: userIdd });

            if (!cartData || cartData.product.length == 0) {
                
                res.send({ emptyCart: true });

            } else if (addressData.addresss.length == 0) {
                
                res.send({ noAddress: true });

            } else {
                console.log('heey2')

                const user = await User.findOne({ _id: req.body.userId });
                const amount = req.body.amount * 100;
        
                const options = {
        
                    amount: amount,
                    currency: "INR",
                    receipt: "absharameen625@gmail.com",
                    
                };
                console.log('heey4')

                instance.orders.create(options, (err, order) => {
        
                    if (!err) {
                        res.send({
        
                            succes: true,
                            msg: "ORDER created",
                            order_id: order.id,
                            amount: amount,
                            key_id: process.env.RAZORPAY_IDKEY,
                            name: user.fullName,
                            email: user.email,
        
                        });
        
                    } else {
        
                        console.error("Error creating order:", err);
        
                        res.status(500).send({ success: false, msg: "Failed to create order" });
                    }
        
                });

                console.log('h4')


            }

        } else {

            res.redirect('/login');

        }
    }catch(error){
        next(error,req,res) 
    }
}

const failedRayorpay=async(req,res,next)=>{
    try {

        const userIdd = req.session.user._id

        const cartt = await Cart.findOne({ userId: userIdd });

        const peymentMeth=req.body.payment
        console.log(peymentMeth)

        const address = await Address.findOne({ userId:userIdd, 'addresss.states': true }, { 'addresss.$': 1 })

        const product = cartt.product

        const { userName, name, city, state, pincode, phone } = address?.addresss?.[0] ?? {};

        const getFailedOrd = await Order.create({

            UserId: userIdd,
            orderAmount: cartt.TotalPrice,

            deliveryAddress: {
                name: userName,
                phone: phone,
                pincode: pincode,
                place: name,
                city: city,
                state: state
            },

            payment: peymentMeth,
            orderDate: Date.now(),
            products: product,
            coupenDis: cartt.coupenDiscount,
            percentage: cartt.percentage
        })

        await Cart.updateOne({userId : userIdd} , {$unset : {products : 1 , coupenDiscount : 0, percentage:0 , TotalPrice :0}});
        console.log(getFailedOrd)

        if (getFailedOrd) {
            
            res.redirect("/orders");

        }
        
    } catch (error) {

        next(error,req,res) 
    }

}

const SucRazorpay=async(req,res,next)=>{
    try {
        const userIdd = req.session.user._id;

        if (userIdd) {


            const user = await User.findOne({ _id: req.body.userId });
            const amount = req.body.amount * 100;
        
            const options = {
        
                amount: amount,
                currency: "INR",
                receipt: "absharameen625@gmail.com",
                    
            };
        
            instance.orders.create(options, (err, order) => {
        
                if (!err) {
        
                    res.send({
        
                        succes: true,
                        msg: "ORDER created",
                        order_id: order.id,
                        amount: amount,
                        key_id: process.env.RAZORPAY_IDKEY,
                        name: user.fullName,
                        email: user.email,
        
                    });
        
                } else {
        
                    console.error("Error creating order:", err);
        
                    res.status(500).send({ success: false, msg: "Failed to create order" });
                }
        
            });

        } else {

            res.redirect('/login');

        }
    
    } catch (error) {

        next(error, req, res);

        
    }
}
const changeProStutes=async(req,res,next)=>{
    try {
        
        const ordIdd = req.body.ordIdd
        
        const ord = await Order.findOne({ _id: ordIdd });
        
        const updation = await Order.findOneAndUpdate({ _id: ordIdd }, { $set: { 'products.$[].orderProStatus': 'shipped' } });

        //  Stock Managing :-

        ord.products.forEach(async (e) => {
            
            let productt = await Producct.findOne({ _id: e.productId });
            
            let newStock = productt.stock - e.quantity;
            
            await Producct.findOneAndUpdate({ _id: e.productId }, { $set: { stock: newStock } });
            
        });

        if (updation) {
            
            res.send({ suc: true })

        }
        
    } catch (error) {

        next(error, req, res)
        
    }
}
const downloadInvoice=async(req,res,next)=>{
    try {
        const ordId=req.query.id
        const ordData = await Order.find({ _id: ordId }).populate('products.productId UserId')
        console.log(ordData)
        res.render('invoice',{ordData})
    } catch (error) {
        next(error, req, res)

    }
}
module.exports={
    loadCheakOut,
    cheakOutAddAddress,
    chooseAddress,
    placeOrder,
    loadSucces,
    loadorder,
    loadOrderDetils,
    canncelProduct,
    returnProduct,
    razopay,
    failedRayorpay,
    SucRazorpay,
    changeProStutes,
    downloadInvoice
 
}

