const express = require("express");
const user_route = express();

//  View Engine
user_route.set('view engine' , 'ejs');
user_route.set('views' , './views/user');

//  userController 
const user_controller = require('../controllers/user/user_controller');
// product controller
const product_controller=require('../controllers/admin/product_controller')
// profilr controller
const is_auth=require('../middleware/is_auth')

//  home (get)
user_route.get('/', is_auth.isBlocked,user_controller.loadhome);
//  login(get)
user_route.get('/login',is_auth.loginTrue,user_controller.loadlogin)
// login (post)
user_route.post('/login',user_controller.postlogin)
// sign up page(get)
user_route.get('/signup',is_auth.loginTrue,user_controller.loadsignup)
// sing up page(post)
user_route.post('/signup',is_auth.loginTrue,user_controller.insertuser)
// otp page(get)
user_route.get('/verify',is_auth.loginTrue,user_controller.loadotppage)
// otp verifay(post)
user_route.post('/verify',is_auth.loginTrue,user_controller.verifyOtp)

user_route.get('/resOtp',is_auth.user,user_controller.loaddashboard)
user_route.get('/resendOtp',is_auth.user,user_controller.resendOtp)
user_route.get('/forgotPass',user_controller.loaddashboard)
user_route.post('/forgotpass',user_controller.forrgotPass)
user_route.get('/passwordVerify',user_controller.passmatch)
user_route.post('/passwordVerify',user_controller.passmatchsave)

user_route.post('/logout',user_controller.logout)


user_route.get('/error',user_controller.error404)

user_route.get('/product',is_auth.isBlocked,user_controller.loadproduct)
user_route.get('/about',is_auth.isBlocked,user_controller.loadAboutPage)
user_route.get('/contact',is_auth.isBlocked,user_controller.loadcontact)
user_route.get('/productDetails',is_auth.isBlocked,product_controller.productdetils)

    

const profile_controller=require('../controllers/user/profile_controller')



user_route.get('/profile',is_auth.user,profile_controller.profilePage)
user_route.post('/editProfile',profile_controller.editProfile)
user_route.post('/changePass',profile_controller.changePass)
user_route.get('/Address',is_auth.isBlocked,is_auth.user,profile_controller.loadAddress)
user_route.post('/addAddress',profile_controller.addAddress)
user_route.post('/deleteAddress',profile_controller.deleteAddres)
user_route.put('/editaddresss',profile_controller.editAddress)
user_route.post('/updateaddress',profile_controller.uppdateAddress)


const cart_controller=require('../controllers/user/cart_controller')

user_route.get('/cart',is_auth.isBlocked,is_auth.user,cart_controller.loadCart)
user_route.post('/addtoCart',cart_controller.addtoCart)
user_route.post('/removeProductCart/:id',cart_controller.removeProductCart)
user_route.put('/addQuntity',cart_controller.uppdateCart)

const order_controller=require('../controllers/user/order_controller')


user_route.get('/cheakout',is_auth.isBlocked,is_auth.user,order_controller.loadCheakOut)
user_route.post('/cheakOutAddAddres',order_controller.cheakOutAddAddress)
user_route.put('/chooseAddress',order_controller.chooseAddress)
user_route.post('/placeOrder',order_controller.placeOrder)
user_route.get('/succes',is_auth.isBlocked,is_auth.user,order_controller.loadSucces)
user_route.get('/orders',is_auth.isBlocked,is_auth.user,order_controller.loadorder)
user_route.get('/orderDetails',is_auth.isBlocked,order_controller.loadOrderDetils)
user_route.put('/cancelOrd',order_controller.canncelProduct)
user_route.put('/returnOrd',order_controller.returnProduct)
user_route.post('/razorPay',order_controller.razopay)
user_route.post('/failedRazorpay',order_controller.failedRayorpay)
user_route.post('/sucRazorpay',order_controller.SucRazorpay)
user_route.post('/changeStatus',order_controller.changeProStutes)
user_route.get('/downloadInvoice',order_controller.downloadInvoice)


const whishlist_contriller=require('../controllers/user/whishlist_controller')

user_route.get('/wishlist',is_auth.isBlocked,is_auth.user,whishlist_contriller.loadWhishlist)
user_route.put('/addtoWhishlist',whishlist_contriller.addtoWhishlist)
user_route.post('/movetoCart',whishlist_contriller.movetoCart)
user_route.put('/removeWishlist',whishlist_contriller.removeFromWhishlist)



user_route.get('/wallet',is_auth.isBlocked,is_auth.user,user_controller.loadWallet)


const coupon_controller=require('../controllers/user/coupon_controller')

user_route.get('/coupons',is_auth.isBlocked,is_auth.user,coupon_controller.loadCoupon)
user_route.post('/coupenCehck',coupon_controller.coupenCheck)
user_route.post('/useCopoun',coupon_controller.useCoupon)
user_route.put('/removeCop',coupon_controller.removecoupon)


user_route.get('/categoryyy',user_controller.uniqeCategory)
user_route.put('/searchProduct',user_controller.searchProduct)
user_route.put('/priceFilter',user_controller.priceFillter)
user_route.put('/aAzZ',user_controller.fillteraAzZ)
user_route.put('/zZaA',user_controller.fillterzZaA)
user_route.put('/lowTohigh',user_controller.fillterLowToHigh)
user_route.post('/highTolow',user_controller.fillterHighToLow)



module.exports = user_route;
