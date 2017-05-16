//Master mongoose stuff

const mongoose=require('mongoose');

mongoose.Promise=global.Promise;

const address="mongodb://localhost:27017/MNNITFORUM";

const connectDB=(callback)=>{
    mongoose.connect(address,(err)=>
    {
        callback();
    });
}

module.exports=mongoose;
module.exports.connectDB=connectDB;
