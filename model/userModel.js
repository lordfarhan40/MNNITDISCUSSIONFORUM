const mongoose=require('./mongoose.js');

const userModule=mongoose.model("users",{
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
    }

});

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


const addNewUser=(userDetails,callback)=>{
            var newUser=new userModule({
                email:userDetails.email,
                name:userDetails.name,
                mobile:userDetails.mobNo,
                password:userDetails.password,
                level:0,
                date:new Date()
            });
            newUser.save((err,user)=>{
                callback(err,newUser);
            });
};


module.exports={
    getUserById,
    getUserByEmail,
    addNewUser
};


