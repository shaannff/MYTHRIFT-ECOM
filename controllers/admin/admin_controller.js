//  import module (user Model) :-
const Admin = require("../../models/user_model");

const Order=require('../../models/order_model')

const Product=require('../../models/product_model')

//  securely hash passwords :-
const bcrypt = require('bcrypt');

const sceurePassword = async (password) => {

    try {

        const passwordHash = bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {

        console.log(error.message);

    }

};
// load login(get method) :-
const loadsignup = async (req, res,next) => {
    try {
        const msg = req.flash("flash")

        res.render('login',{msgg:msg})
        
    } catch (error) {
      next(req,res,error)
    }

}
// verifying admin (post method):-
const cheakadmin = async (req, res,next) => {
    try {
        const adminemail = req.body.email
        const adminpass = req.body.pass
        const admindetils = await Admin.findOne({ email: adminemail, is_admin: true })
        
        if (admindetils) {

            const verified = await bcrypt.compare(adminpass, admindetils.password)

            if (verified) {
                req.session.admin = admindetils
                console.log(req.session.admin);
                res.redirect('/admin/dashbord')

            } else {
                req.flash('flash','password is not matching')

                res.redirect('/')
            }
        } else {
            req.flash('flash','cheak the email')

            res.redirect('/')
        }
    } catch (error) {
      next(req,res,error)
    }
}
// load dashbord (get method):-
const loaddashbord = async (req, res,next) => {
    try {
        const order = await Order.find();   //  Order

        const totalOrdAmount = order.reduce((acc, val) => acc + val.orderAmount, 0);    //  TotalAmount
    
        const totalProduct = await Product.find()   //  Product

         //  Best Selling Products :-

    const bestSellPro = await Order.aggregate([
        
        {
          $unwind: "$products",
        },
  
        {
          $group: {
  
            _id: "$products.productId",
            ttlCount: { $sum: "$products.quantity" },
                      
          },
        },
  
        {
          $lookup: {
  
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productData",
          },
        },
  
        {
          $sort: { ttlCount: -1 },
        },
  
        {
          $limit: 5,
        },
  
      ]);

      const bestSellCate = await Order.aggregate([
    
        { $unwind: "$products" },
  
        {
          $group: {
  
            _id: "$products.productId",
            totalQuantity: { $sum: "$products.quantity" },
          },
  
        },
  
        { $sort: { totalQuantity: -1 } },
        { $limit: 3 },
  
        {
  
          $lookup: {
  
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
  
          },
  
        },
  
        { $unwind: "$productDetails" },
  
        {
          $lookup: {
  
            from: "categories",
            localField: "productDetails.category",
            foreignField: "_id",
            as: "categoryDetails",
  
          },
  
        },
  
        {
          $group: {
  
            _id: "$categoryDetails._id",
            categoryName: { $first: "$categoryDetails.name" },
            totlCate: { $sum: "$totalQuantity" },
          },
  
        },
  
        { $sort: { totalCategoryQuantity: -1 } },
  
        { $limit: 2 },
  
      ]);

      console.log(bestSellCate,12,bestSellPro);
        
        res.render('dashbord',{ order, totalOrdAmount, totalProduct, bestSellPro, bestSellCate,})
    } catch (error) {

      next(req,res,error)
    }
}

const chartYear=async(req,res,next)=>{
    try {
        const curntYear = new Date().getFullYear();

        const yearChart = await Order.aggregate([
            
          {
            
            $match: {
    
              orderDate: {
    
                $gte: new Date(`${curntYear - 5}-01-01`),
                $lte: new Date(`${curntYear}-12-31`),
    
              },
    
            },
    
          },
    
          {
            $group: {
    
              _id: { $year: "$orderDate" },
              totalAmount: { $sum: "$orderAmount" },
    
            },
    
          },
    
          {
            $sort: { _id: 1 },
          },
    
        ]);
    
        res.send({ yearChart });
    
    } catch (error) {
        next(req,res,error)
    }
}


const monthChart=async(req,res,next)=>{
    try {
        const monthName = [

            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
      
          const curntYear = new Date().getFullYear();
      
          const monData = await Order.aggregate([
          
            {
              $match: {
      
                orderDate: {
      
                  $gte: new Date(`${curntYear}-01-01`),
                  $lte: new Date(`${curntYear}-12-31`),
                  
                },
      
              },
            },
      
            {
              $group: {
                _id: { $month: "$orderDate" },
                totalAmount: { $sum: "$orderAmount" },
              },
            },
      
            {
              $sort: { _id: 1 },
            },
      
          ]);
      
          const salesData = Array.from({ length: 12 }, (_, i) => {
      
            const monthData = monData.find((item) => item._id === i + 1);
      
            return monthData ? monthData.totalAmount : 0;
      
          });
      
          res.json({ months: monthName, salesData });
      
    } catch (error) {
        next(req,res,error)
    }
}

// admin logout 
const logout=async(req,res,next)=>{
  try{
      req.session.admin=undefined
      req.flash('flash','logout succes')
      res.redirect('/admin')
  }catch(error){
    next(error,req,res) 
  }
 
}

module.exports = {
    loadsignup,
    cheakadmin,
    loaddashbord,
    chartYear,
    monthChart,
    logout
}