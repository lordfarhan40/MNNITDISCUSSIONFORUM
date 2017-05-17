const validator=require('./helper/validator.js');
const userModel=require('./model/userModel.js');
const hasher=require('./helper/hasher.js');
const categoriesModel=require('./model/categoriesModel.js');
const sessionPassport=require('./helper/sessionPassport.js');
const postModel=require('./model/postModel.js');
const threadModel=require('./model/threadModel.js');

const brand="MNNIT DISCUSSION FORUM";


function setUpRoutes(app){

app.get("/home_admin",(req,res)=>
{
    sessionPassport.adminSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        hbsParams.pageTitle="Home";
        res.render("home.hbs",hbsParams);
    });
});

app.get("/manage_categories",(req,res)=>
{
    sessionPassport.adminSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
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

app.get("/createThread_admin",(req,res)=>
{
    sessionPassport.adminSessionPassport(req,res,(req,res,user,hbsParams)=>{
         categoriesModel.getCategoryList((err,categories)=>
         {
            if(err||!categories){
                return res.send("Sorry but no categories are added");
            }
            hbsParams.categories=categories;
            res.render("addThread.hbs",hbsParams);
         });
         
    });
});

app.post("/createThread_admin",(req,res)=>
{
    sessionPassport.adminSessionPassport(req,res,(req,res,user,hbsParams)=>{
        var curThread=req.body
        threadModel.addThread(curThread.subject,user._id,curThread.category,parseInt(curThread.subscriptionModel),(err,thread)=>
        {
            if(err||!thread)
            {
                console.log(err);
                return res.send("Thread creation error");
            }
            categoriesModel.incrementCounter(curThread.category,1,(err,category)=>
            {
                if(err||!category){
                    console.log(err,category);
                }
                postModel.addPost(curThread.post,user._id,thread._id,(err,post)=>
                {
                    if(err||!post)
                    {
                        return res.send("Post creation failed");
                    }
                    return res.redirect("/home_admin")
                });
            });
        });
    });
});

};

module.exports={
    setUpRoutes
}