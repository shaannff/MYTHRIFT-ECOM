//  import module (user Model) :-
const User = require("../../models/user_model");
//  import module (otp Model) :-
const Otp = require('../../models/otp_model');
//  set nodeMailer :-
const nodemailer = require('nodemailer');

const Product = require('../../models/product_model')

const category=require('../../models/category_model')

const Wallet=require('../../models/wallet_model')

//  securely hash passwords :-

const bcrypt = require('bcrypt');

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

//===============================//


//  Load Home (Get Method) :-


const loadhome = async (req, res, next) => {

    try {
        const categoryData=await category.find({is_listed:true})

        if (req.session.user) {
            res.render("homePage", { login: req.session.user ,categoryData});
          
        } else {
            res.render("homePage",{categoryData});
          
        }
    } catch (error) {
      next(error,req,res) 
   }
}
// load login (Get Method) :-

const loadlogin = async (req, res, next) => {
    try {
        const categoryData=await category.find({is_listed:true})

        const passMsg = req.flash('passError')
        const emailMsg = req.flash('error email')

        res.render("login" , {em : emailMsg , pass : passMsg,categoryData,login: req.session.user})
    } catch (error) {
        next(error,req,res) 
    }
}
// load login (get method) :-
const loadsignup = async (req, res, next) => {
    try {
        const categoryData=await category.find({is_listed:true})

        const msg = req.flash("flash")

        res.render("signUp" , {msgg : msg,categoryData,login: req.session.user})

    } catch (error) {
        next(error,req,res) 
    }
}
// post sign up (post method) :-
const insertuser = async (req, res, next) => {
    try {
    const emailExist=await User.findOne({email:req.body.email})

    if(emailExist){

        req.flash('flash','Email already exists')
        res.redirect('/signup')

    }else{

        const sqpassword = await securePassword(req.body.password)
        const user = new User({
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
            is_admin: 0,
            is_blocked: false
        })
        console.log(user.fullName)
        const password = req.body.password
        const conformpassword = req.body.confirmPassword

        if (password == conformpassword) {
            req.session.saveuser = user
            const userData = req.session.saveuser

            if (userData) {

                const OTP = generateOTP()

                console.log('otp',OTP)

                sendmail(req.body.fullname, req.body.email, OTP , res)

                setTimeout(async () => {
                    await Otp.findOneAndDelete({ userEmail: req.body.email })
                }, 60000)

            } else {
                res.redirect('/signup')
            }
        } else {
            req.flash('flash','password not matched')
            res.redirect('/signup')
        }
    }
       
    } catch (error) {
        next(error,req,res) 
    }
}
// OTP Create function ()
const generateOTP = () => {
    const digits = '0123456789'
    let OTP = ''
    for (let i = 0; i < 4; i++) {
        OTP += digits[Math.floor(Math.random() * 10)]
    }
    return OTP
}

// Mail Sending function ()
const sendmail = async (username, email, sendOTP , res) => {
    try {

        const transport = nodemailer.createTransport({

            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        const maildetils = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'for otp verification',
            html: `<h3>Hello ${username},Welcome To MYTHRIFT</h3><br><h4>Enter : ${sendOTP} on the OTP Box to register</h4>`
        }

        transport.sendMail(maildetils, function (error, info) {
            if (error) {
                console.log(error.message, 'error mail sending')
            } else {
                console.log(' Email has been sended', info)
            }
        })

        const userOTP = new Otp({
            userEmail: email,
            otp: sendOTP
        })
        console.log()
        await userOTP.save()
        res.redirect(`/verify?email=${email}`)


    } catch (error) {
        console.log(error.message, 'sendmail error')
    }
}
// load OTP page :-
const loadotppage = async (req, res, next) => {
    try {
        const token = req.query.tokenid || null
        const queryemail = req.query.email
        const msg = req.flash("flash")

        const categoryData=await category.find({is_listed:true})


        res.render('otp', { emailQuery: queryemail, token,msgg : msg,categoryData ,login: req.session.user})

    } catch (error) {
        next(error,req,res) 
    }
}
// OTP verification (post method) :-
const verifyOtp = async (req, res, next) => {

    try {

        const getQueryEmail = req.body.emaill

        const { inp1, inp2, inp3, inp4 } = req.body

        const enteredOTP = `${inp1}${inp2}${inp3}${inp4}`

        console.log(enteredOTP, 1223)

        const verifyedOTP = await Otp.findOne({ userEmail:getQueryEmail, otp:enteredOTP }).sort('-1')

        console.log(verifyOtp,44)
        
        
        if(getQueryEmail&&req.body.token){

            const forget=await Otp.findOne({otp:enteredOTP,userEmail:getQueryEmail,token:req.body.token})

            console.log(forget,22)

            if(forget){
                console.log(enteredOTP,1223)

                res.redirect(`/passwordVerify?email=${getQueryEmail}`);

            }else{
                req.flash("flash", "Invalid OTP...!");
                res.redirect(`/verify?email=${getQueryEmail}&&tokenid=${req.body.token}`);
            }
        }else{
            if (verifyedOTP) {

                const sqpassword = await securePassword(req.session.saveuser.password)
                const newUser = User({
                    fullName: req.session.saveuser.fullName,
                    email: req.session.saveuser.email,
                    phone: req.session.saveuser.phone,
                    password: sqpassword,
                    is_admin: 0,
                    is_blocked: false
                })

                const userdata = await newUser.save()
                req.session.otp = undefined
                await User.findByIdAndUpdate({ _id: userdata._id }, { $set: { is_verified: true } })
                req.session.user = userdata

                res.redirect('/')

            } else {

                req.flash('flash',' invalid OTP ')
                res.redirect(`/verify?email=${getQueryEmail}`)
                console.log('veryOtp not entered')
            }
        }        

    } catch (error) {
        next(error,req,res) 
    }
}
// load forget Password  (get method) :-
const loaddashboard = async (req, res, next) => {
    try {
        const categoryData=await category.find({is_listed:true})

        const msg=req.flash('errr')

        res.render('forgotpass',{categoryData,msg})

    } catch (error) {
        next(error,req,res) 
    }
}
// verification login (post method) :-
const postlogin = async (req, res, next) => {

    try {
        
    const { email, password } = req.body

    const user = await User.findOne({ email: email , is_admin : false});


    if (user) {
        
        if(user.is_blocked==false){
            const verifiyed = await bcrypt.compare(password, user.password)
    
            if (verifiyed) {
                req.session.user = user
                res.redirect('/')
            } else {
                req.flash("passError" , "Invalid Password")
                res.redirect('/login')    
            }
        }else{
            req.flash("passError" , "your email has blocked use another email")
            res.redirect('/login')
       }

    } else {

        req.flash("error email" , "Invalid Email")
        res.redirect('/login')

    }
    } catch (error) {
        next(error,req,res) 
    }

}
// Resend OTP (post method) :-
const resendOtp = async (req, res, next) => {

    try {

        queryMail = req.query.email
        console.log(queryMail);

        const curruntUserDetils = req.session.saveuser

        if (queryMail == curruntUserDetils.email) {

            const OTP = generateOTP()

            console.log(OTP + " Resend OTP")

            sendmail(curruntUserDetils.fullName,curruntUserDetils.email,OTP , res)

        } 

    } catch (error) {

        next(error,req,res) 
    }

}
// verifiy forget pass(post method) :-
const forrgotPass = async (req, res, next) => {
    try {
        forgetmail = req.body.email
        const cheakemail = await User.findOne({ email: forgetmail })
        req.session.forgetdata = cheakemail
        if (cheakemail) {
            const user = cheakemail.fullName
            if (cheakemail) {
                const OTP = generateOTP()
                console.log('forget pass otp ', OTP)
                const generatetoken = generateToken()
                await forgototpmail(forgetmail, user, OTP, generatetoken, res)

            } else {
                req.flash('errr','you dont have account')
                res.redirect('/forgotPass')
            }
        }else{
            res.redirect('/forgotPass')

        }
    } catch (error) {
        next(error,req,res) 
    }
}
// Create token for forget pass 
const generateToken = () => {
    const digits = '0123456789'
    let token = ''
    for (let i = 0; i < 4; i++) {
        token += digits[Math.floor(Math.random() * 10)]
    }
    return token
}
// Mail sending forget pass function ()
const forgototpmail = async (email, user, sendotp, tokenNo, res) => {
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        const maildetils = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'for otp verification',
            html: `<h3>Hello ${user},Welcome To MYTHRIFT</h3><br><h4>Enter : ${sendotp} on the OTP Box to  to change your forgotten pawssword</h4>`
        }
        transport.sendMail(maildetils, function (error, info) {
            if (error) {
                console.log(error.message, 'error mail sending')
            } else {
                console.log(' Email has been sended')
            }
        })
        const hashtokon = await securePassword(tokenNo)

        const forgetotp = new Otp({
            userEmail: email,
            otp: sendotp,
            token: hashtokon
        })
        await forgetotp.save();
        res.redirect(`/verify?tokenid=${hashtokon}&&email=${email}`)

    } catch (error) {
        console.log(error.message, 'sendmail error')
    }
}
// change password page (get method) :-
const passmatch = async (req, res,next) => {
    try {
        const categoryData=await category.find({is_listed:true})

        const email = req.query.email
        const msg = req.flash('error pass')

        res.render("resetpass", { msg, email,categoryData })

    } catch (error) {
        next(error,req,res) 
    }
}
// Update new password (post method) :-
const passmatchsave = async (req, res, next) => {
    try {
        console.log(1)
        
        
        const email = req.body.email

        const passwordbody = req.body.password

        const conformpass = req.body.re_password

        const hashpass = await securePassword(conformpass)

        if (passwordbody == conformpass) {

            const userupdate = await User.findOneAndUpdate({ email: email }, { $set: { password: hashpass } })

            res.redirect('/login')

        } else {

            req.flash("error pass" , "password is not match")

        }
    } catch (error) {
        next(error,req,res) 
    }

}
// logout :-
const logout=async(req, res, next)=>{
    try{

        req.session.destroy()

        res.redirect('/')

    }catch(error){

        next(error,req,res) 

    }
   
}
// load product :-
const loadproduct=async(req,res,next)=>{
    try{
        const categoryData=await category.find({is_listed:true})

        const Productt = await Product.find({status : true}).populate('category')
            const productData = Productt.filter(product => product.category.is_listed&&product.stock>=1)


    res.render('products' , {productData,categoryData,login: req.session.user})
    }catch(error){
        next(error,req,res) 
    }
}
// load about  :-

const loadAboutPage=async(req,res,next)=>{

    try {
        const categoryData=await category.find({is_listed:true})

        res.render('about',{categoryData,login: req.session.user})
    } catch (error) {
        next(error,req,res) 
    }
}
// load contact :-

const loadcontact=async(req,res,next)=>{
    try {
        const categoryData=await category.find({is_listed:true})

        res.render('contactUs',{categoryData,login: req.session.user})
    } catch (error) {
        next(error,req,res) 
    }
}

const uniqeCategory=async(req,res,next)=>{
        try {
            console.log('heey')
          const id = req.query.id;
          const categoryName = id.replace(/%20/g, " ");
          const categoryData = await category.find({ is_listed: true });

          console.log(categoryName);

          const categoryMatch = await category.findOne({_id: categoryName})

          console.log(categoryMatch)
      
          const products = await Product.aggregate([
            { $match: { status: true } },
      
            {
              $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
              },
            },
      
            { $unwind: "$category" },
      
            { $match: { "category.name": categoryMatch.name } },
          ]);
          console.log(products)
      
          if (req.session.user) {

            res.render('category' , {products,categoryData,login: req.session.user})

          } else {
            res.render('category' , {products,categoryData,login: req.session.user})
        }
        } catch (error) {
            next(error,req,res) 
        } };

 // searchproduct
 const searchProduct = async (req, res, next) => {
    try {
        const findProduct = req.body.items;
        const searchedItem = await product.find({ name: { $regex: new RegExp(`.*${findProduct}.*`, 'i') } }).populate('category');
        res.send(searchedItem);
    } catch (error) {
        next(error,req,res) 
    }
};

const loadWallet=async(req, res, next)=>{
    try{
        const categoryData = await category.find({ is_Listed: true });
        if (req.session.user) {

            const walletData = await Wallet.findOne({ userId: req.session.user._id });

            res.render('wallet', { login: req.session.user, categoryData, walletData });

        } else {

            res.redirect('/login')

        }
    }catch(error){
        next(error,req,res) 
    }
}


const priceFillter=async(req ,res, next)=>{
    try{
        const minn = req.body.min

        const maxx = req.body.max

        if (minn && maxx) {
                
            const productPrice = await Product.find({ $and: [{ price: { $lt: Number(maxx) } }, { price: { $gt: Number(minn) } }] }).populate('category')

            if (productPrice) {

                res.send({ success: productPrice });
            } else {

                res.send({fail : "failed"})
            }

        } else {

            res.send({fail : "failed"})

        }
    }catch(error){
        next(error,req,res) 
    }
}

const fillteraAzZ=async(req,res,next)=>{
    try{
        const { status } = req.body;

        if (status) {
            
            const product = await Product.find({ status: true }).sort({ name: 1 }).populate('category');

            res.send(product);

        }
    }catch(error){
        next(error,req,res) 
    }

}

const fillterzZaA=async(req,res,next)=>{
    try{
        const { status } = req.body;

        if (status) {
            
            const product = await Product.find({ status: true }).sort({ name: -1 }).populate('category');

            res.send(product);

        }
    }catch(error){
        next(error,req,res) 
    }
}

const fillterLowToHigh=async(req,res,next)=>{
    try{
        const { status } = req.body;

        if (status) {
            
            const product = await Product.find({ status: true }).sort({ price: 1 }).populate('category');
            console.log(product)

            res.send(product)

        }
    }catch(error){
        next(error,req,res) 
    }
}

const fillterHighToLow=async(req,res,next)=>{
    try{
        const { status } = req.body;

        if (status) {
            
            const product = await Product.find({ status: true }).sort({ price: -1 }).populate('category');

            res.send(product);
        }
    }catch(error){
        next(error,req,res) 
    }
}

const error404=async(req,res)=>{
    try{
        const listedCategory = await category.find({ is_listed: true });

        const errorMessage = "An error occurred";

        res.render("/user/404", { listedCategory,errorMessage });
        
    }catch(error){
        console.log(error,'from ')
    }
}

//===============================//

module.exports = {

    loadhome,
    loadlogin,
    loadsignup,
    insertuser,
    loadotppage,
    verifyOtp,
    loaddashboard,
    postlogin,
    resendOtp,
    forrgotPass,
    passmatch,
    passmatchsave,
    logout,
    loadproduct,
    loadAboutPage,
    loadcontact,
    uniqeCategory,
    searchProduct,
    loadWallet,
    priceFillter,
    fillteraAzZ,
    fillterzZaA,
    fillterLowToHigh,
    fillterHighToLow,
    error404


};