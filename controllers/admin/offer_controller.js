const Offer=require('../../models/offer_model')

const product=require('../../models/product_model')

const Category=require('../../models/category_model')

const order=require('../../models/order_model')



const loadOffer=async(req,res,next)=>{
try{

    const category = await Category.find({ is_listed: true })

    const offer = await Offer.find().populate('category')
    console.log(offer)

    res.render('offer' , {category , offer});
}catch(error){
    next(error,req,res) 
}
}

const addOffer=async(req,res,next)=>{
    try{
        const { offname, category, offer } = req.body;

      const findcategory = await Category.findOne({name:category})

      const findproduct=await product.find({'category':findcategory._id}).populate('category')


      const exist=await Offer.findOne({
        $or:[
            { name: { $regex: new RegExp(offname, 'i') } },

            { category: findcategory._id } 

        ]
      }).populate('category')


      if (!exist) {
            
        findproduct.forEach(async (val) => {
        
            const offerPorice = Math.round((val.price / 100) * (100 - offer));
            await product.findOneAndUpdate({ _id: val._id }, { $set: { discount: offer, discount_price: offerPorice } });

        })

        const offerAdd = new Offer({

            name: offname,
            offer: offer,
            category: findcategory._id

        })
        offerAdd.save();
        res.redirect("/admin/Offer");
    }else{
        console.log('fail')
    }

    }catch(error){
        next(error,req,res) 
    }
}
const removeOffer=async(req,res,next)=>{
    try{
        
        const offerId = req.query.id
        
        const removed = await Offer.findOneAndDelete({ _id: offerId });

        const cateId = removed.category._id

        if (removed) {
            
            const r = await product.updateMany({ category: cateId }, { $set: { discount: 0, discount_price: 0 } });

            res.send({ succ: true })

        } else {

            res.send({ fail: true })

        }
    }catch(error){
        next(error,req,res) 
    }
}

module.exports={
loadOffer,
addOffer,
removeOffer
}