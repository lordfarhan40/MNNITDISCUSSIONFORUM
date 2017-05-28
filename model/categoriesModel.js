const mongoose=require('./mongoose.js');
var mongoosePaginate = require('mongoose-paginate');

var schema=mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    count:{
        type:Number,
        required:true
    }
});

schema.plugin(mongoosePaginate);

const categoryModule=mongoose.model("categories",schema);

function getCategoryById(_id,callback){
    categoryModule.findById(_id,(err,category)=>
    {
        return callback(err,category);
    });
}

function getCategoryByName(name,callback){
    categoryModule.findOne({name},(err,category)=>
    {
        return callback(err,category);
    });
}


function addCategory(name,description,callback){
        var newCategory=new categoryModule({
            name,
            description,
            count:0
        });
        newCategory.save((err,category)=>{
            return callback(err,category);
        });
}

function incrementCounter(_id,amount,callback){
    categoryModule.findByIdAndUpdate(_id,{$inc:{count:amount}},(err,category)=>
    {
        return callback(err,category);
    });
}

//also the once used to add new
function editCategory(_id,name,description,callback){
    categoryModule.findByIdAndUpdate({_id},{$set:{name,description}},(err,category)=>
    {
        return callback(err,category);
    });
}

function getCategoryList(callback){
    categoryModule.find({},(err,categories)=>
    {
        return callback(err,categories);
    });
}

function deleteCategory(_id,callback){
    categoryModule.remove({_id},(err)=>
    {
        callback(err);
    });
}

module.exports={
    getCategoryById,
    getCategoryByName,
    addCategory,
    getCategoryList,
    editCategory,
    incrementCounter,
    deleteCategory,
}