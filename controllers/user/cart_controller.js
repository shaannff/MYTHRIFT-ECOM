const cart=require('../../models/cart_model')

const Category=require('../../models/category_model')

const Product=require('../../models/product_model')


const loadCart=async(req,res,next)=>{
    try{
        if(req.session.user){

           const categoryData=await Category.find({is_listed:true})

           const cartData=await cart.findOne({userId:req.session.user._id}).populate('product.productId')

           if(cartData){

            for(let product of cartData.product){

                if(!product.productId.status||product.quantity<1){

                    product.price=0

                }
            }
               const totalPrice=cartData.product.reduce((acc,product)=>acc+product.price,0)

                const updateCart=await cart.findOneAndUpdate({
                    userId:req.session.user._id},
                    {$set:{TotalPrice:totalPrice}},
                    {new:true,upsert:true})

                    res.render('cart',{categoryData,cartData,login: req.session.user,totalPrice:updateCart.TotalPrice})

        
           }else{
            res.render('cart',{categoryData,cartData,login: req.session.user,totalPrice:0})

           }
           
        }else{
            res.redirect('/login')   
        }

    }catch(error){
        next(error,req,res) 
    }
}


const addtoCart=async(req,res,next)=>{
    try{
        if(req.session.user._id){

            const productId=req.query.id
            const qnty=req.body.qnty||1

            const findProdct=await Product.findOne({_id:productId})

            const alredyExit=await cart.findOne({userId:req.session.user._id,'product.productId':productId})

            if(!alredyExit){

                
                const total = findProdct.discount > 0 ? findProdct.discount_price * qnty : findProdct.price * qnty

    
                const data={
                    productId:productId,
                    quantity:qnty,
                    price:total
                }

                await cart.findOneAndUpdate({userId:req.session.user._id},{
                        $addToSet:{product:data}},
                            {upsert:true,new:true})
                            res.json({ success: true })
                            
    
            }else{
                res.json({ failed: 'cart already added'})
            }
        }else{
            res.redirect('/login')
        }      

    }catch(error){
        next(error,req,res) 
    }
}

const removeProductCart=async(req,res,next)=>{
    try{
        const userid=req.session.user._id
        const prdctid=req.params.id

        const removeCart=await cart.findOneAndUpdate({userId:userid},
                                                    {$pull:{product:{productId:prdctid}}},
                                                    {new:true})

             if(removeCart){
                res.json({success:true})
            }else{
                res.json({error:'product not found in cart'})

            }
    }catch(error){
        next(error,req,res) 
    }
}

const uppdateCart=async(req,res,next)=>{
    try{
        const product=await Product.findOne({_id:req.body.prodtid})

        const producttotal=product.price*req.body.quantity

        const newPrice=Number(producttotal.toFixed(1))
          
            const updateCart = await cart.findOneAndUpdate(
                { userId: req.session.user._id, 'product.productId': req.body.prodtid },
                {
                    $set: {
                        'product.$[elem].price': newPrice,
                        'product.$[elem].quantity': req.body.quantity
                    }
                },
                {
                    arrayFilters: [{ 'elem.productId': req.body.prodtid }],
                    new: true
                }
            );
            
        const total1=updateCart.product.reduce((acc,prodct)=>acc+prodct.price,0)

        const total=Number(total1.toFixed(1))

        await cart.findOneAndUpdate({_id:req.session.user._id},{$set:{TotalPrice:total}})
        res.json({success:true})


    }catch(error){
        next(error,req,res) 
    }
}


module.exports={
    loadCart,
    addtoCart,
    removeProductCart,
    uppdateCart
}