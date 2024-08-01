const User = require('../../models/user_model')

const category=require('../../models/category_model')

const Address=require('../../models/address_model')

const Order=require('../../models/order_model')

const bcrypt = require('bcrypt');


const profilePage = async (req, res,next) => {

    try {
        if(req.session.user){
            const userr = req.session.user._id

            const userdata=await User.findOne({_id:userr})
    
            const categoryData=await category.find({is_listed:true})

            const msg=req.flash('error')
    
            res.render('profile',{categoryData,msg:msg,userdata,login: req.session.user})
        }else{
            res.redirect('/login')
        }

    } catch (error) {
        next(error,req,res) 
    }
}

const editProfile=async(req,res,next)=>{
    try {

        const userIdd = req.query.id

       const userDetiles=await User.findOne({_id:userIdd})

       if(userDetiles){

        const {name,phone}=req.body

        await User.findByIdAndUpdate({_id:userIdd},{$set:{fullName:name,phone:phone}});

        res.json({status:true})

       }else{

        // console.log('nooo userrr')

        res.redirect('/profile')

       }
       
    } catch (error) {
        next(error,req,res) 
    }
}

const changePass=async(req,res,next)=>{
try {
        const user=await User.findOne({_id:req.query.id})
        const {oldPass,newPass,confmPass}=req.body
        const valid=await bcrypt.compare(oldPass,user.password)
    if(valid){
        let hashpass=await bcrypt.hash(newPass,10)

        await User.findOneAndUpdate({_id:user._id},{$set:{password:hashpass}})
        res.json({status:true})

    }else{
        console.log('password is incorrect')
        req.flash('error','password is incorrect')
        res.redirect('/profile')
    }

} catch (error) {
    next(error,req,res) 
}
}

const loadAddress=async(req,res,next)=>{
    try{
        if(req.session.user){

            const userdata=await User.findOne({_id:req.session.user._id})
            const categoryData=await category.find({is_listed:true})

            const addressList=await Address.findOne({userId:req.session.user._id})||null

            res.render('address',{userdata:userdata,categoryData,addressList:addressList,msg:'',login: req.session.user})
    
        }else{
            res.redirect('/login')

        }
      
    }catch(error){
        next(error,req,res) 
    }
}

const addAddress=async(req,res,next)=>{
    try {
        const userid=req.query.id

        const {address,city,state,pincode,phone}=req.body.address

        const user=await Address.updateOne({userId:req.session.user._id},{

            $push:{
                addresss:{
                    userName:req.session.user.fullName,
                    name:address,
                    city:city,
                    state:state,
                    pincode:pincode,
                    phone:phone
                }
        }},
        {new:true ,upsert:true}

    )

        if(user.acknowledged){

            res.json({succes:true})

        }else{

            res.status(400).send({failed:false})

        }
    } catch (error) {
        next(error,req,res) 

    }
}


const deleteAddres=async(req,res,next)=>{
    try{
        const address=req.query.address

        const remove=await Address.updateOne({userId:req.session.user._id},{$pull:{addresss:{_id:address}}})

        res.json({seleted:true})

    }catch(error){
        next(error,req,res) 
    }
}

const editAddress=async(req,res,next)=>{
    try{

        const {edit}=req.body
        const editdata=await Address.findOne({'addresss._id':edit},{'addresss.$':1})

        res.json({editdata})

    }catch(error){
        next(error,req,res) 
    }
}


const uppdateAddress=async(req,res,next)=>{
    try{
        const userid=req.session.user._id
        const {address,city,state,pincode,phone,id}=req.body
      
        const updatedata=await Address.findOneAndUpdate({userId:userid,'addresss._id':id},
            {$set:{'addresss.$.name':address,
                'addresss.$.city':city,
                    'addresss.$.state':state,
                        'addresss.$.pincode':pincode,
                                'addresss.$.phone':phone}})


            if(updatedata){

                req.flash('flash','succses')
                res.redirect('/Address')

            }else{

                req.flash('flash','faild')
                res.redirect('/Address')

            }             


    }catch(error){
        next(error,req,res) 
    }
}



module.exports={
    profilePage,
    editProfile,
    changePass,
    loadAddress,
    addAddress,
    deleteAddres,
    editAddress,
    uppdateAddress,
}