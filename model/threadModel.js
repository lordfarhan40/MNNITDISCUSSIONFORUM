const mongoose=require('./mongoose.js');
var mongoosePaginate = require('mongoose-paginate');

const SECRET=1;
const PRIVATE=2;
const OPEN=3;

var schema=mongoose.Schema({
    subject:{
        type:String,
        required:true,
    },
    threadBy:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'users'
    },
    threadCategory:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'categories'
    },
    subscriptionModel:{
        type:Number,
        required:true
    },
    sticky:{
        type:Boolean,
        required:true
    },
    count:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        required:true,
    }
});

schema.plugin(mongoosePaginate);

const threadModule=mongoose.model("threads",schema);

function getThreadById(_id,callback){
    threadModule.findById(_id).exec((err,thread)=>
    {
        return callback(err,thread);
    });
}


function addThread(subject,threadBy,threadCategory,subscriptionModel,callback){
        var newThread=new threadModule({
            subject,
            threadBy,
            threadCategory,
            subscriptionModel,
            sticky:false,
            count:0,
            date:new Date(),
        });
        newThread.save((err,thread)=>{
            callback(err,thread);
        });
};

function getThreadsByCategory(categoryId,populate,sort,callback){
    threadModule.find({threadCategory:categoryId}).populate(populate).sort({date:sort}).exec((err,threads)=>
    {
        return callback(err,categories);
    });
}

function getThreadsByCategoryPaginate(categoryId,limit,pageNo,populate,sort,callback){
    threadModule.paginate({threadCategory:categoryId},{limit,sort:{date:sort},populate,page:pageNo},(err,result)=>
    {
        callback(err,result.docs);
    });
}

function deleteThreadById(_id,callback){
    threadModule.remove({_id},(err)=>{
        return callback(err);
    });
}

function incrementCounter(_id,amount,callback){
    threadModule.findByIdAndUpdate(_id,{$inc:{count:amount}},(err,category)=>
    {
        return callback(err,category);
    });
}

module.exports={
    getThreadById,
    getThreadsByCategory,
    addThread,
    deleteThreadById,
    incrementCounter,
    getThreadsByCategoryPaginate
}