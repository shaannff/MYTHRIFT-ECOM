 const whishlist=require('../../models/whishlist_model')

 const category=require('../../models/category_model')

 const cart=require('../../models/cart_model')

 const product=require('../../models/product_model')

 const loadWhishlist=async(req,res,next)=>{
   try{
      if(req.session.user){

         const categoryData=await category.find({is_listed:true})

         const wishlistData = await whishlist.findOne({ userId: req.session.user._id }).populate('products.productId');

         if(wishlistData){

            const proStatus=wishlistData.products.filter(val => val.productId.status === false);
         
                if (proStatus.length >= 1) {
                    
                    for (const product of proStatus) {
                        
                        var newData = await whishlist.findOneAndUpdate({ userId: req.session.user._id }, { $pull: { products: { productId: product.productId._id } } }, { new: true }).populate('products.productId');
    
                    }
                    
                    res.render("wishlist", { login: req.session.user, categoryData, wishlistData: newData });
                    
               }else{
            res.render("wishlist", { login: req.session.user, categoryData, wishlistData });

               }
       
      }else{
         res.render('wishlist',{categoryData,wishlistData,login: req.session.user})
         console.log('heeeyyy')

      }
   }else{
      res.redirect('/login')

   }
   }catch(error){
      next(error,req,res) 

   }
 }


 const addtoWhishlist=async(req,res,next)=>{
try{
   if(req.session.user){

      const prodId=req.query.id

      const userId=req.session.user._id
      
   
      const exist = await whishlist.findOne({ userId: userId, products: { $elemMatch: { productId: prodId } } });

      if(!exist){

         await whishlist.findOneAndUpdate({ userId: userId }, { $addToSet: { products: { productId: prodId } } }, { new: true, upsert: true});

         res.send({ succ: true });
   
      }else{
         res.send({ suc: true });
   
      }
   }else{

      res.redirect('/login')

   }
  
}catch(error){
   next(error,req,res) 
}
 }


 const movetoCart=async(req,res,next)=>{
   try{
   prodId=req.query.id
   userId=req.session.user._id

  const prodtData = await product.findOne({_id:prodId})

  const exist=await cart.findOne({userId:userId,product:{$elemMatch:{productid:prodId}}})

  const pricee = prodtData.price;
  const qty = 1

  if(!exist){

   await cart.findOneAndUpdate({userId:userId},{$addToSet:{product:{productid:prodId,price:pricee,quantity:qty}}},{upsert:true,new:true});

   await whishlist.findOneAndUpdate({userId:userId},{$pull:{products:{productId:prodId}}},{new:true})

   res.send({suc:true})
  }else{
   res.send({ fail: true });

  }


   }catch(error){
      next(error,req,res) 
   }
 }


 const removeFromWhishlist=async(req,res,next)=>{
   try{
     const  prodtId=req.query.id
     const userId=req.session.user._id

      const removeFromWhishlist=await whishlist.findOneAndUpdate({userId:userId},{$pull:{products:{productId:prodtId}}},{new:true})

      if (removeFromWhishlist) {
            
         res.send({ suc: true })

     } else {

         res.send({ fail: true })

     }
   }catch(error){
      next(error,req,res) 

   }
 }

 module.exports={
    loadWhishlist,
    addtoWhishlist,
    movetoCart,
    removeFromWhishlist
 }
