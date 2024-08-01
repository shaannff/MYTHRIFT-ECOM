const mongoose = require ('mongoose')

const address = new mongoose.Schema({
    userId :{type:mongoose.Schema.Types.ObjectId,ref:'userData',required:true},
    addresss : [{
        userName:{type :String , required :true},
        name:{type : String , required:true },
        city :{type :String , required : true},
        state:{type :String , required : true},
        states:{type:Boolean,default:false},
        pincode:{type : Number, required :true},
        phone:{type :Number, required :true}
    }]
})

module.exports = mongoose.model('Address',address)