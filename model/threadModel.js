const mongoose=require('./mongoose.js');

const SECRET=1;
const PRIVATE=2;
const OPEN=3;


const threadModule=mongoose.model("threads",{
    subject:{
        type:String,
        required:true,
    },
    threadBy:{
        type:String,
        required:true
    },
    threadCategory:{
        type:String,
        required:true
    },
    subscriptionModel:{
        type:Number,
        required:true
    },
    sticky:{
        type:Boolean,
        required:true
    }
});

function getThreadById(_id,callback){
    threadModule.findById(_id,(err,category)=>
    {
        callback(err,category);
    });
}


function addThread(subject,threadBy,threadCategory,subscriptionModel,callback){
        var newThread=new threadModule({
            subject,
            threadBy,
            threadCategory,
            subscriptionModel,
            sticky:false
        });
        newThread.save((err,thread)=>{
            callback(err,thread);
        });
};

function getThreadsByCategory(categoryId,callback){
    threadModule.find({threadCategory:categoryId},(err,categories)=>{
        callback(err,categories);
    });
}

module.exports={
    getThreadById,
    getThreadsByCategory,
    addThread
}