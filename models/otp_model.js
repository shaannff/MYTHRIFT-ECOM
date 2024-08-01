const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({

   
    otp: { type: String, required: true },
  userEmail: { type: String, required: true },
  token:{type:String ,defult:null},
  createdAt: { type: Date, expires: 60, default: Date.now },
    
});

module.exports = mongoose.model('Otp', otpSchema);