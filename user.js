const validator=require('./helper/validator.js');
const userModel=require('./model/userModel.js');
const sessionPassport=require('./helper/sessionPassport.js');
const categoriesModel=require('./model/categoriesModel.js');
const threadModel=require('./model/threadModel.js');
const postModel=require('./model/postModel.js');

const brand="MNNIT DISCUSSION FORUM";

function setUpRoutes(app){

app.get("/logout",(req,res)=>
{
    req.session.destroy((err)=>
    {
        res.redirect("/");
    });
});


app.get("/createThread",(req,res)=>
{
    sessionPassport.userSessionPassport(req,res,(req,res,user,hbsParams)=>{
         categoriesModel.getCategoryList((err,categories)=>
         {
            if(err||!categories){
                return res.send("Sorry but no categories are added");
            }
            hbsParams.categories=categories;
            hbsParams.pageTitle="Craete thread";
            res.render("addThread.hbs",hbsParams);
         });
         
    });
});

app.post("/createThread",(req,res)=>
{
    sessionPassport.userSessionPassport(req,res,(req,res,user,hbsParams)=>{
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
                    return res.redirect("/")
                });
            });
        });
    });
});

}

module.exports={
    setUpRoutes
}