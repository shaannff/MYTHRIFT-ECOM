const express = require('express');
const admin_route = express();

//  View Engine :-
admin_route.set('view engine', 'ejs');
admin_route.set('views' , './views/admin');

const path=require('path')

//  adminController 
const admin_controller = require('../controllers/admin/admin_controller');
// categoryController 
const category_controller=require('../controllers/admin/category_controller')
// product Controllered
const product_controller=require('../controllers/admin/product_controller')
// user controller 
const user_controller=require('../controllers/admin/user_controller')

const is_admin=require('../middleware/is_admin')

const multer=require('multer');
const storage = multer.diskStorage({

    destination: (req, file, cb) => {

    cb(null, path.join(__dirname, '../public/assets/images/mythrift'));
     },

      filename: (req, file, cb) => {

    const name = Date.now() + ' - ' + file.originalname;

    cb(null, name);
     },

    });


const upload = multer({

  storage: storage,
  fileFilter: (req, file, cb) => {

    cb(null, true);

  },

});


admin_route.get('/',is_admin.isLogout,admin_controller.loadsignup)
admin_route.post('/login',admin_controller.cheakadmin)
admin_route.get('/dashbord',is_admin.isLogin,admin_controller.loaddashbord)


admin_route.get('/category',is_admin.isLogin,category_controller.loadcategory)
admin_route.post('/category',category_controller.addCategory)
admin_route.put('/categoryaction',category_controller.cateAction)
admin_route.put('/category',category_controller.editcategory)

admin_route.get('/products',is_admin.isLogin,product_controller.loadproduct)
admin_route.get('/productsAdd',is_admin.isLogin,product_controller.addProduct)
admin_route.post('/productsAdd',upload.array('images', 3),product_controller.addProducts)
admin_route.get('/users',is_admin.isLogin,user_controller.loadUserList)
admin_route.get('/editproduct',is_admin.isLogin,product_controller.loadEditPage)
admin_route.post('/productedit',product_controller.verifyEditProduct)
admin_route.put('/productaction',product_controller.productAction)


admin_route.post('/userAction',user_controller.userAction)

const order_controller=require('../controllers/admin/order_controller')

admin_route.get('/orders',is_admin.isLogin,order_controller.loadOrder)
admin_route.get('/orderDetils',is_admin.isLogin,order_controller.loadOrderDetils)
admin_route.put('/orderStatus',order_controller.orderStatushandling)

const offer_controller=require('../controllers/admin/offer_controller')

admin_route.get('/Offer',is_admin.isLogin,offer_controller.loadOffer)
admin_route.post('/addOffer',offer_controller.addOffer)
admin_route.put('/offerRemove',offer_controller.removeOffer)


const coupen_controller=require('../controllers/admin/coupen_controller')

admin_route.get('/coupons',is_admin.isLogin,coupen_controller.loadCoupen)
admin_route.post('/addCoupen',upload.array('image', 1),coupen_controller.addCoupen)
admin_route.put('/copenAction',coupen_controller.coupenAction)
admin_route.put('/deletCoupen',coupen_controller.removeCoupen)

const report_controller=require('../controllers/admin/salesreport_controller')

admin_route.get('/salesReports/:id',is_admin.isLogin,report_controller.loadReport)
admin_route.put("/customReport",report_controller.customReport);

admin_route.put('/chartYear', admin_controller.chartYear);
admin_route.put('/monthChart',admin_controller.monthChart)




admin_route.post('/logout',admin_controller.logout)

module.exports = admin_route;
