//  import module (category model) :-
const category=require('../../models/category_model')


// load category  (get method)
const loadcategory=async(req,res,next)=>{
    try{

        const categorydetils=await category.find({})

        res.render('category',{category:categorydetils})

    }catch(error){
      next(error,req,res) 
    }
}

 // add category
 const addCategory = async (req, res,next) => {
    try {
      if (req.query.inp) {

        const catecheck = await category.findOne({
          name: { $regex: new RegExp("^" + req.query.inp + "$", "i") },
        });

        if (catecheck) {

          res.send({ inp: true });

        } else {

          res.send({ inp: false });
        }

      } else if (req.query.name && req.query.radio) {
        const addCategory = new category({
          name: req.query.name,
          is_listed: req.query.radio
        });
  
       await addCategory.save();
  
        res.send({ true: true });
      }
    } catch (error) {
      next(error,req,res) 
    }
  };

  
// category action
const cateAction=async(req,res,next)=>{
    try {
      id=req.query.id

      const verified=await category.findOne({_id:id})

      verified.is_listed=!verified.is_listed

      verified.save()
      res.send({set:true})
    } catch (error) {
      next(error,req,res) 
    }

}
// edit category
const editcategory=async(req,res,next)=>{
  try {
    const id=req.query.id
    const value=req.query.value

    const edited=await category.findOneAndUpdate({_id:id},{$set:{name:value}})
    
    edited.save()

    res.send({set:true})
  } catch (error) {
    next(error,req,res) 

  }
   
   
}

module.exports={
    loadcategory,
    addCategory,
    cateAction,
    editcategory
}

