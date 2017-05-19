const userModel=require('./model/userModel.js');
const hasher=require('./helper/hasher.js');
const categoriesModel=require('./model/categoriesModel.js');
const sessionPassport=require('./helper/sessionPassport.js');
const postModel=require('./model/postModel.js');
const threadModel=require('./model/threadModel.js');

const brand="MNNIT DISCUSSION FORUM";

const error="Occured occured, try contacting admin of the website at mohdfarhanmnnit@gmail.com.";

/////////////////////////////////////////////////////////////
//       Helpers functions that are local to the file
/////////////////////////////////////////////////////////////

function emptyCategory(_id,callback){
    threadModel.getThreadsByCategory(_id,"",-1,(err,threads)=>
    {
        if(threads.length==0)
        {
            return callback(undefined);
        }
        var counter=0;
        for(var i=0;i<threads.length;++i)
        {
            deleteThreadSafely(threads[i]._id,(err)=>
            {
                if(err)
                    callback(err);
                ++counter;
                if(counter==threads.length){
                    categoriesModel.resetCount(_id,(err)=>
                    {
                        callback(err);
                    });
                }
            });
        }
    });
}

function deleteThreadSafely(_id,callback){
    postModel.deletePostsByThread(_id,(err)=>
    {
        if(err)
            callback(err);
        return threadModel.deleteThreadById(_id,(err)=>
        {
            return callback(err);
        });
    });
}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

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
                return res.render("error_page.hbs",{error});
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
                if(err||!category)
                    return res.render("error_page.hbs",{error});
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
                    return res.render("error_page.hbs",{error});
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
                    return res.render("error_page.hbs",{error});
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
        threadModel.getThreadsByCategory(req.query._id,"",-1,(err,threads)=>
        {
            if(err||!threads)
            {
                return res.render("error_page.hbs",{error});
            }
            if(threads.length>0){
                return res.redirect("/manage_categories?message=1");
            }
            categoriesModel.deleteCategory(req.query._id,(err)=>
            {
                if(err) return res.render("error_page.hbs",{error});
                return res.redirect("/manage_categories?message=3")
            });
        });
    });
});

app.get("/empty_category",(req,res)=>{
    sessionPassport.adminSessionPassport(req,res,(req,res,user,hbsParams)=>{
        emptyCategory(req.query._id,(err)=>
        {
                if(err){
                    return res.render("error_page.hbs",{error});
                }
                return res.redirect("/manage_categories?message=2");
        });
    });
});

};

module.exports={
    setUpRoutes
}