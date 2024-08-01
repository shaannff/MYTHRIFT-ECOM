const address=require('../../models/address_model')

const cart=require('../../models/cart_model')

const category=require('../../models/category_model')

const coupen=require('../../models/coupen_model')

const offer=require('../../models/offer_model')

const user=require('../../models/user_model')

const wallet=require('../../models/wallet_model')

const loadCoupen=async(req,res,next)=>{
    try{
        const msg = req.flash("good");

        const coupenData = await coupen.find();

        res.render("coupen", { coupenData , msgg : msg});
        
    }catch(error){
        next(error,req,res) 
    }
}


const addCoupen=async(req,res,next)=>{
    try{
        const { coupon, min, max, discount } = req.body;

        const newId = generateCoupenId()

        const createCoupen = new coupen({

            name: coupon,
            discount: discount,
            form: min,
            to: max,
            coupenId: newId,
            image: req.files[0].filename

        })

        if (createCoupen) {
            
            createCoupen.save();
            req.flash("flash", "good");
            console.log(3)

            res.redirect("/admin/coupons");

        }
    }catch(error){
        next(error,req,res) 
    }
}



const generateCoupenId = () => {

    const look = '123456789ABCDEFG'
    let ID = ''
    
    for (let i = 0; i < 6; i++) {

        ID += look[Math.floor(Math.random() * 10)];

    };

    return ID

}


const coupenAction=async(req,res,next)=>{
    try{
        const copId = req.query.id

        const changeStatus = await coupen.findOne({ _id: copId });

        changeStatus.status = !changeStatus.status
        changeStatus.save()
    }catch(error){
        next(error,req,res) 
    }
}

const removeCoupen=async(req,res,next)=>{
    try{
        const copId = req.query.id

        const deletCoupen = await coupen.deleteOne({ _id: copId });

        if (deletCoupen) {
            
            res.send({ succ: true });

        } 
              

    }catch(error){
        next(error,req,res) 
    }
}

module.exports={
    loadCoupen,
    addCoupen,
    coupenAction,
    removeCoupen
}