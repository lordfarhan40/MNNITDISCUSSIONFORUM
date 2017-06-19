const mongoose=require('./mongoose.js');
var mongoosePaginate = require('mongoose-paginate');

var schema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true,
    },
    mobile:{
        type:Number,
    },
    password:{
        type:String,
        required:true
    },
    level:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    banned:{
        type:Number,
        required:true
    }
});

schema.plugin(mongoosePaginate);

const userModule=mongoose.model("users",schema);

function getUserById(_id,callback){
    userModule.findById(_id,(err,user)=>
    {
        callback(err,user);
    });
}

function getUserByEmail(email,callback){
    userModule.findOne({email},(err,user)=>{
        callback(err,user);
    });
}

function getUsers(callback){
    userModule.find({},(err,users)=>
    {
        callback(err,users);
    });
}

function flipBanById(_id,callback){
    userModule.findById(_id,(err,user)=>
    {
        if(err||!user)
            return callback(err||1);
        user.banned=!user.banned;
        user.save((err)=>
        {
            callback(err,user);
        });
    });
}

function changePasswordById(_id,password,callback){
    userModule.findOneAndUpdate({_id},{$set:{password}},(err,user)=>
    {
        callback(err,user);
    });
} 

function changeDetails(_id,name,email,callback){
    userModule.findByIdAndUpdate({_id},{$set:{name,email}},(err,user)=>
    {
        callback(err,user);
    });
}

const addNewUser=(userDetails,callback)=>{
            var newUser=new userModule({
                email:userDetails.email,
                name:userDetails.name,
                mobile:userDetails.mobNo,
                password:userDetails.password,
                level:0,
                banned:0,
                date:new Date()
            });
            newUser.save((err,user)=>{
                callback(err,newUser);
            });
};


module.exports={
    getUserById,
    getUserByEmail,
    addNewUser,
    getUsers,
    flipBanById,
    changePasswordById,
    changeDetails
};


