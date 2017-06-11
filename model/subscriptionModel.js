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

const subscriptionModule=mongoose.model("post",schema);

function findSubscription(user,thread,callback){
    subscriptionModule.find({user,thread},(err,subscription)=>
    {
        return callback(err,subscription);
    });
}

function addSubscription(user,thread,callback){
    findSubscription(user,thread,(err,subscription)=>
    {
        if(err||subscription)
            return callback(1);
        subscription=new subscriptionModule({
            user,
            thread,
            accepted:false,
            date:new Date()
        });
        subscription.save((err)=>
        {
            return callback(undefined,err);
        });
    });
}

function acceptSubscription(user,thread,callback){
    subscriptionModule.find({user,thread},(err,subscription)=>
    {
        if(err||!subscription)
            return callback(1);
        subscription.accepted=true;
        subscription.save(()=>
        {
            callback(undefined);
        });
    });
}

function removeSubscription(user,thread,callback){
    subscriptionModule.remove({user,thread},(err)=>
    {
        callback(err);
    });
}

function getSubscriptionsByUser(user,callback){
    subscriptionModule.find({user},(err,subscriptions)=>
    {
        return callback(err,subscription);
    });
}

function getSubscriptionsByThread(thread,callback){
    subscriptionModule.find({thread},(err,subscrptions)=>
    {
        return callback(err,subscriptions);
    });
}

module.exports={
    removeSubscription,
    acceptSubscription,
    addSubscription,
    findSubscription,
    removeSubscription,
    getSubscriptionsByThread,
    getSubscriptionsByUser
}