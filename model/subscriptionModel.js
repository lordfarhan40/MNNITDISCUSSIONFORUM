const mongoose=require('./mongoose.js');

var mongoosePaginate = require('mongoose-paginate');

var schema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'users'
    },
    thread:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'threads'
    },
    accepted:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        required:true,
    }
});

schema.plugin(mongoosePaginate);

const subscriptionModule=mongoose.model("subscription",schema);

function findSubscription(user,thread,callback){
    subscriptionModule.findOne({user,thread},(err,subscription)=>
    {
        return callback(err,subscription);
    });
}

function addSubscription(user,thread,callback){
    findSubscription(user,thread,(err,subscription)=>
    {
        if(err||subscription){
            console.log("error here motha");
            return console.log(err);
        }
        subscription=new subscriptionModule({
            user,
            thread,
            accepted:false,
            date:new Date()
        });
        subscription.save((err,subscription)=>
        {
            return callback(err,subscription);
        });
    });
}

function acceptSubscription(user,thread,callback){
    subscriptionModule.update({user,thread},{$set:{accepted:true}},(err,subscription)=>
    {
        return callback(err,subscription);
    });
}

function removeSubscription(user,thread,callback){
    subscriptionModule.remove({user,thread},(err)=>
    {
        callback(err);
    });
}

function getSubscriptionsByUser(user,limit,pageNo,populate,sort,callback){
    subscriptionModule.paginate({user},{limit,sort:{date:sort},populate,page:pageNo},(err,result)=>
    {
        return callback(err,result.docs);
    });
}

function getSubscriptionsByThread(thread,limit,pageNo,populate,sort,callback){
    subscriptionModule.paginate({thread},{limit,sort:{date:sort},populate,page:pageNo},(err,result)=>
    {
        return callback(err,result.docs);
    });
}

function removeSubscriptionsByThread(thread,callback){
    subscriptionModule.remove({thread},(err)=>
    {
        callback(err);
    });
}

module.exports={
    removeSubscription,
    acceptSubscription,
    addSubscription,
    findSubscription,
    removeSubscription,
    getSubscriptionsByThread,
    getSubscriptionsByUser,
    removeSubscriptionsByThread
}