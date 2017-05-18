const userModel=require('./model/userModel.js');
const hasher=require('./helper/hasher.js');
const categoriesModel=require('./model/categoriesModel.js');
const sessionPassport=require('./helper/sessionPassport.js');
const postModel=require('./model/postModel.js');
const threadModel=require('./model/threadModel.js');

const brand="MNNIT DISCUSSION FORUM";

// Now this is going to be a lon code to empty the category async

function emptyCategory(_id,callback){
    threadModel.getThreadsByCategory(_id,(err,threads)=>
    {
        if(threads.length==0)
        {
            return callback();
        }
        var counter=0;
        for(var i=0;i<threads.length;++i)
        {
            deleteThreadSafely(threads[i]._id,()=>
            {
                ++counter;
                if(counter==threads.length){
                    categoriesModel.resetCount(_id,()=>
                    {
                        callback();
                    });
                }
            });
        }
    });
}

function deleteThreadSafely(_id,callback){
    postModel.getPostsByThread(_id,(err,posts)=>
    {
        var counter=0;
        for(var i=0;i<posts.length;++i)
        {
            postModel.deletePostById(posts[i]._id,()=>{
                ++counter;
                if(counter==posts.length){
                    return threadModel.deleteThreadById(_id,()=>
                    {
                        return callback();
                    });
                }
            });
        }
    });
}



// End of the long code

function setUpRoutes(app){

app.get("/manage_categories",(req,res)=>
{
    sessionPassport.adminSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        if(req.query.message){
            if(req.query.message==1)
            {
                hbsParams.nonemptyError=true;
            }
            if(req.query.message==2)
            {
                hbsParams.cleanupSuccess=true;
            }
            if(req.query.message==3)
            {
                hbsParams.deleteSuccess=true;
            }
        }
        categoriesModel.getCategoryList((err,categories)=>{
            if(err)
            {
                return res.send("Sorry error occured, try contacting admin.");
            }
            hbsParams.pageTitle="Manage Categories";
            hbsParams.categories=categories;
            res.render("manage_categories.hbs",hbsParams);
        });
    });
}); 


app.get("/edit_category",(req,res)=>
{
    sessionPassport.adminSessionPassport(req,res,(req,res,user,hbsParams)=>{
        if(req.query._id){
            categoriesModel.getCategoryById(req.query._id,(err,category)=>
            {
                hbsParams.pageTitle="Manage Categories";
                hbsParams.categoryName=category.name;
                hbsParams.description=category.description;
                hbsParams._id=category._id;
                hbsParams.edit=true;
                res.render("edit_category.hbs",hbsParams);
            });
        }
        else{
            hbsParams.pageTitle="Manage Categories";
            res.render("edit_category.hbs",hbsParams);
        }
    });
});

app.post("/edit_category",(req,res)=>
{
    sessionPassport.adminSessionPassport(req,res,(req,res,user,hbsParams)=>{
        if(req.body._id){
            categoriesModel.editCategory(req.body._id,req.body.name,req.body.description,(err,category)=>
            {
                if(err)
                {
                    return res.send("Error occured");
                }else
                {
                    return res.redirect("/manage_categories");
                }
            });
        }else
        {
            categoriesModel.addCategory(req.body.name,req.body.description,(err,category)=>{
                if(err)
                {
                    return res.send("Error occured");
                }else
                {
                    return res.redirect("/manage_categories");
                }
            });
        }
    });
});

app.get("/delete_category",(req,res)=>{
    sessionPassport.adminSessionPassport(req,res,(req,res,user,hbsParams)=>{
        threadModel.getThreadsByCategory(req.query._id,(err,threads)=>
        {
            if(threads.length>0){
                return res.redirect("/manage_categories?message=1");
            }
            categoriesModel.deleteCategory(req.query._id,(err)=>
            {
                if(err) return res.send("Error in deleting category");
                return res.redirect("/manage_categories?message=3")
            });
        });
    });
});

app.get("/empty_category",(req,res)=>{
    sessionPassport.adminSessionPassport(req,res,(req,res,user,hbsParams)=>{
        emptyCategory(req.query._id,()=>
        {
                return res.redirect("/manage_categories?message=2");
        });
    });
});

};

module.exports={
    setUpRoutes
}