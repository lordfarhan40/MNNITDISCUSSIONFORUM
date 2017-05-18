const validator=require('./helper/validator.js');
const userModel=require('./model/userModel.js');
const sessionPassport=require('./helper/sessionPassport.js');
const categoriesModel=require('./model/categoriesModel.js');
const threadModel=require('./model/threadModel.js');
const postModel=require('./model/postModel.js');

const brand="MNNIT DISCUSSION FORUM";

function createNewPost(content,postBy,postThread,callback){
    postModel.addPost(content,postBy,postThread,(err,post)=>
    {
        threadModel.incrementCounter(postThread,1,()=>{
            callback(post);
        });
    });
}

function createNewThread(subject,content,threadBy,subscriptionModel,category,callback){
    threadModel.addThread(subject,threadBy,category,subscriptionModel,(err,thread)=>
    {
        categoriesModel.incrementCounter(category,1,()=>
        {
            createNewPost(content,threadBy,thread._id,()=>{
                callback(thread);
            });
        });
    });
}


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
                return res.render("error_page.hbs",{error});
            }
            hbsParams.categories=categories;
            hbsParams.pageTitle="Create thread";
            res.render("addThread.hbs",hbsParams);
         });
         
    });
});

app.post("/createThread",(req,res)=>
{
    sessionPassport.userSessionPassport(req,res,(req,res,user,hbsParams)=>{
        var curThread=req.body;
        createNewThread(curThread.subject,curThread.post,user._id,parseInt(curThread.subscriptionModel),curThread.category,()=>
        {
            res.redirect("/");
        })
    });
});

app.post("/post_reply",(req,res)=>
{
    sessionPassport.userSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        createNewPost(req.body.content,user._id,req.body._id,(err,post)=>
        {
            res.redirect("/thread?_id="+req.body._id);
        });
    });
});

}

module.exports={
    setUpRoutes
}