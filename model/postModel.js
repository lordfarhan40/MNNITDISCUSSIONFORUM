const mongoose=require('./mongoose.js');
var mongoosePaginate = require('mongoose-paginate');

var schema=mongoose.Schema({
    content:{
        type:String,
        required:true,
    },
    postBy:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'users'
    },
    postThread:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'threads'
    },
    date:{
        type:Date,
        required:true,
    }
});

schema.plugin(mongoosePaginate);

const postModule=mongoose.model("post",schema);

function getPostById(_id,populate,callback){
    postModule.findById(_id).populate(populate).exec((err,post)=>{
        return callback(err,post);
    });
}

function addPost(content,postBy,postThread,callback){
    var newPost=new postModule({
        content,
        postBy,
        postThread,
        date:new Date(),
    });
    newPost.save((err,post)=>
    {
        callback(err,post);
    });
}

function getPostsByThread(_id,populate,sort,callback){
    postModule.find({postThread:_id}).populate(populate).sort({date:sort}).exec((err,posts)=>
    {
        callback(err,posts);
    });
}

function deletePostById(_id,callback){
    postModule.remove({_id},(err)=>
    {
        callback(err);
    });
}

function deletePostsByThread(_id,callback){
    postModule.remove({postThread:_id},(err)=>
    {
        callback(err);
    });
}

module.exports={
    getPostById,
    addPost,
    getPostsByThread,
    deletePostById,
    deletePostsByThread
}