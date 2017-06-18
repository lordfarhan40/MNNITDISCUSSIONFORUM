const validator=require('../helper/validator.js');
const userModel=require('../model/userModel.js');
const sessionPassport=require('../helper/sessionPassport.js');
const categoriesModel=require('../model/categoriesModel.js');
const threadModel=require('../model/threadModel.js');
const postModel=require('../model/postModel.js');
const subscriptionModel=require('../model/subscriptionModel.js');
const hasher=require('../helper/hasher.js');
/////////////////////////////////////////////////////////////
//       Helpers functions that are local to the file
/////////////////////////////////////////////////////////////

function createNewPost(content,postBy,postThread,callback){
    postModel.addPost(content,postBy,postThread,(err,post)=>
    {
        threadModel.incrementCounter(postThread,1,()=>{
            threadModel.setLatestPost(postThread,post._id,(err,post)=>{
                callback(post);
            });
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

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

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
        createNewThread(curThread.subject,curThread.post,user._id,parseInt(curThread.subscriptionModel),curThread.category,(thread)=>
        {
            subscriptionModel.addSubscription(user._id,thread._id,(err,subscription)=>
            {
                console.log(err);
                subscriptionModel.acceptSubscription(user._id,thread._id,(err)=>
                {
                    console.log(err);
                    res.redirect("/");
                });
            });
        })
    });
});

app.post("/post_reply",(req,res)=>
{
    sessionPassport.userSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        var threadId=req.body._id;
        console.log(threadId);
        threadModel.getThreadById(threadId,(err,thread)=>
        {
            subscriptionModel.findSubscription(user._id,threadId,(err,subscription)=>
            {
                if(thread.subscriptionModel==3||(subscription&&subscription.accepted==1))
                {
                    createNewPost(req.body.content,user._id,req.body._id,(err,post)=>
                    {
                        res.redirect("/thread?_id="+req.body._id);
                    });
                }else
                {
                    res.redirect("/error");
                }
            });
        });
    });
});

app.get("/subscribe",(req,res)=>
{
    sessionPassport.userSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        var threadId=req.query._id;
        subscriptionModel.addSubscription(user._id,threadId,(err,subscription)=>
        {
            if(err){
                res.redirect("/error")
                return console.log(err);
            }
            res.redirect("/thread?_id="+threadId);
        });
    });
});

app.get("/manage_subscriptions",(req,res)=>
{
    sessionPassport.userSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        var threadId=req.query._id;
        var userId=user._id;
        var curPage=req.query.page||1;
        threadModel.getThreadById(threadId,(err,thread)=>
        {
            if(userId.toString()!=thread.threadBy.toString())
            {
                return res.send("dont even try");
            }
            subscriptionModel.getSubscriptionsByThread(threadId,10,curPage,'user',1,(err,subscriptions)=>
            {
                subscriptions.shift();
                hbsParams.subscriptions=subscriptions;
                hbsParams.threadId=thread._id;
                console.log(hbsParams.user);
                console.log(hbsParams);
                res.render("manage_subscription",hbsParams);
            });
        });
    });
});

app.get("/accept_subscription",(req,res)=>
{
    sessionPassport.userSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        var threadId=req.query.threadId;
        var userId=req.query.userId;
        var redirect=req.query.redirect;
        threadModel.getThreadById(threadId,(err,thread)=>
        {
            if(user._id.toString()!=thread.threadBy.toString())
                return res.send("dont even try");
            subscriptionModel.acceptSubscription(userId,threadId,(err,thread)=>
            {
                res.redirect("/"+redirect);
            });
        });
    });
});

app.get("/remove_subscription",(req,res)=>
{
    sessionPassport.userSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        var threadId=req.query.threadId;
        var userId=req.query.userId||user._id;
        var redirect=req.query.redirect;
        threadModel.getThreadById(threadId,(err,thread)=>
        {
            if(user._id.toString()!=thread.threadBy.toString()&&userId.toString()!=user._id.toString())
                return res.send("dont even try");
            
            if(user._id.toString()==thread.threadBy.toString()&&userId.toString()==user._id.toString())
                return res.send("dont even try");
            subscriptionModel.removeSubscription(userId,threadId,(err)=>
            {
                res.redirect("/"+redirect);
            });
        });
    });
});

app.get("/manage_account",(req,res)=>
{
    sessionPassport.userSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        hbsParams.user=user;
        res.render("manage_account",hbsParams);
    });
});

app.get("/view_subscriptions",(req,res)=>
{
    sessionPassport.userSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        subscriptionModel.getSubscriptionsByUser(user._id,20,1,{path:'thread', populate: { path: 'threadBy latestPost' }},1,(err,subscriptions)=>
        {
            console.log(subscriptions);
            subscriptions.sort(function(a,b){
                return b.thread.latestPost.date-a.thread.latestPost.date;
            });
            hbsParams.subscriptions=subscriptions;
            res.render("view_subscriptions.hbs",hbsParams);
        });
    });
});

}

module.exports={
    setUpRoutes
}