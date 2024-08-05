const category = require('../../models/category_model')

const product = require('../../models/product_model')

// load product (get method)
const loadproduct = async (req, res, next) => {
  try { 
        const limit = 5;
        const page = parseInt(req.query.page) || 1
        const skip = (page -1 ) * limit;
  
        const totalProductCount = await product.countDocuments()
        const totalPages = Math.ceil(totalProductCount / limit)

    const productdetils = await product.find({}).populate('category')

    .skip(skip)
    .limit(limit)

    res.render('product', { productsData: productdetils ,currentPage: page,totalPages})
  } catch (error) {
    next(error,req,res) 
  }
}
//  load add product(get method)
const addProduct = async (req, res, next) => {
  try {
    const listedcategory = await category.find({ is_listed: true })
    console.log('profuctr add')
    res.render('productadd1', { listcategory: listedcategory })
  } catch (error) {
    console.log(error.message);
    next(error,req,res) 
  }
}
// add products
const addProducts = async (req, res, next) => {
  try {
    let images = [];
    const image = req.files;

    const price=req.body.price
    image.forEach((file) => {
      images.push(file.filename);
    });

    console.log(req.body.radio);

    const currntdate = Date()
    const offerPorice = Math.round((price / 100) * (100 - req.body.Discountprice));
    const categorys = await category.findOne({ name: req.body.category })

    const products = product.create({
      name: req.body.product,
      price: req.body.price,
      stock: req.body.stock,
      status: req.body.radio,
      image: images,
      category: categorys._id,
      descripition: req.body.description,
      createdAt: currntdate,
      discount_price: offerPorice,
      discount:req.body.Discountprice,


    })

    res.redirect('/admin/products')
  } catch (error) {
    next(error,req,res) 
  }
}
// load edit products(get method)
const loadEditPage = async (req, res ,next) => {
  try {
    const id = req.query.id
    const productddetils = await product.findById({ _id: id })

    res.render('productEdit', { productsData: productddetils })


  } catch (error) {
    next(error,req,res) 
  }
}
// edit products
const verifyEditProduct = async (req, res, next) => {

  try {

    const productid = req.query.id

    const { products, price, Discountprice, stock, description } = req.body



    const editProduct = await product.findById({ _id: productid })
    let imag = []

    for (let i = 0; i < 3; i++) {

      const key = `k${i}`;

      if (req.body[key]) {


        imag.push(editProduct.image[i]);

      } else {

        imag.push(req.files[`image${i}`][0].filename);
        fs.unlinkSync(path.join(__dirname, '../', editProduct.image[i]));

      }

    }

    editProduct.image = imag

    await product.findOneAndUpdate({ _id: productid }, { $set: { name: products, price: price, discount_price: Discountprice, stock: stock, description: description } });
    console.log('updatedsss')

    editProduct.save();
    res.redirect("/admin/products");

  } catch (error) {
    next(error,req,res) 
  }
}
// products action
const productAction = async (req, res,next) => {
  try{
    id=req.query.id

    const verified=await product.findOne({_id:id})

    verified.status=!verified.status

    verified.save()
    
    res.send({set:true})

  }catch(error){
    next(error,req,res) 
  }

}
// load products detils
const productdetils=async(req,res,next)=>{
  try {
    const categoryData=await category.find({is_listed:true})
    id=req.query.id
   const  productdata=await product.findOne({_id:id})
    res.render('produtDetils',{productData:productdata,categoryData})
  } catch (error) {
    next(error,req,res) 
  }
}

module.exports = {
  loadproduct,
  addProduct,
  addProducts,
  loadEditPage,
  verifyEditProduct,
  productAction,
  productdetils

}