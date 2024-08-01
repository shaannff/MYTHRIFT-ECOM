const razorpay=require('razorpay')

require("dotenv").config();

const instance = new razorpay({

  key_id: process.env.RAZORPAY_IDKEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
  
});

module.exports = instance;