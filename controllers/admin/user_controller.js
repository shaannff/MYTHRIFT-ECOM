
const User=require('../../models/user_model')

// load user (get method)
const loadUserList = async(req,res,next)=>{
    try {
  
        const limit = 5;
        const page = parseInt(req.query.page) || 1
        const skip = (page -1 ) * limit;
  
        const totalusercount = await User.countDocuments()
        const totalPages = Math.ceil(totalusercount / limit)
  
        const userData = await User.find({is_admin:false})
        .skip(skip)
        .limit(limit)
  
        res.render('userlist',{clint : userData,totalPages,currentPage: page})
  
  
    } catch (error) {
      next(error,req,res) 
    }
  }
// user action 
const userAction=async(req,res,next)=>{

   try {

    id=req.query.id

    const userDetils=await User.findOne({_id:id})

    userDetils.is_blocked =! userDetils.is_blocked
    userDetils.save()

    res.send({set:true})
    
   } catch (error) {

    next(error,req,res) 
    
   }

}

  module.exports={
    loadUserList,
    userAction
  }