const mongoose=require('./mongoose.js');

const postModule=mongoose.model("post",{
    content:{
        type:String,
        required:true,
    },
    postBy:{
        type:String,
        required:true
    },
    postThread:{
        type:String,
        required:true
    }
});

function getPostById(_id,callback){
    postModule.findById(_id,(err,post)=>
    {
        return callback(err,post);
    });
}

function addPost(content,postBy,postThread,callback){
    var newPost=new postModule({
        content,
        postBy,
        postThread
    });
    newPost.save((err,post)=>
    {
        callback(err,post);
    });
}

function getPostsByThread(_id,callback){
    postModule.find({postThread:_id},(err,posts)=>
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

module.exports={
    getPostById,
    addPost,
    getPostsByThread,
    deletePostById
}