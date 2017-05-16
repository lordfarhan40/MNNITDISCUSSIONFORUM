const mongoose=require('./mongoose.js');

const threadModule=mongoose.model("threads",{
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    }
});

function getCategoryById(_id,callback){
    categoryModule.findById(_id,(err,category)=>
    {
        if(err)
            return callback(1);
        callback(undefined,category);
    });
}

function getCategoryByName(name,callback){
    categoryModule.findOne({name},(err,category)=>
    {
        if(err)
            return calback(1);
        callback(undefined,category);
    });
}


function addCategory(name,description,callback){
        var newCategory=new categoryModule({
            name,
            description
        });
        newCategory.save((err)=>{
            callback(err);
        });
};

function getCategoryList(callback){
    categoryModule.find({},(err,categories)=>
    {
        callback(err,categories);
    });
}

module.exports={
    getCategoryById,
    getCategoryByName,
    addCategory,
    getCategoryList
}