
const htmlGenerator=require("../helper/htmlGenerator.js");
const validator=require('../helper/validator.js');
const userModel=require("../model/userModel.js");
const hasher=require('../helper/hasher.js');
const categoriesModel=require('../model/categoriesModel.js');
const sessionPassport=require('../helper/sessionPassport.js');
const threadModel=require('../model/threadModel.js');
const postModel=require('../model/postModel.js');
const subscriptionModel=require('../model/subscriptionModel.js');


function addGravatarToPosts(posts){
    for(var i=0;i<posts.length;++i)
    {
        addGravatar(posts[i],posts[i].postBy.email);
    }
}

function addIndex(array,start){
    for(var i=0;i<array.length;++i){
        array[i].indexNo=start;
        ++start;
    }
}

function addGravatar(obj,email){
    obj.gravatar=hasher.getmd5(email);
}

function setUpRoutes(app){

app.get("/logout",(req,res)=>
{
    req.session.destroy((err)=>
    {
        res.redirect("/");
    });
});

app.get("/login",(req,res)=>
{
    sessionPassport.noUserAllowed(req,res,(req,res)=>
    {
        res.render("lands.hbs",{
        pageTitle:"MNNIT DISCUSSION FORUM",
        error:req.query.error,
        banned:req.query.banned
        });    
    });
});

app.post("/login",(req,res)=>
{
    sessionPassport.noUserAllowed(req,res,(req,res)=>
    {
        var curuser=req.body;
        userModel.getUserByEmail(curuser.email,(err,user)=>
        {
            if(err||!user)
            {
                return res.redirect("/login?error=1");;
            }
            hasher.compare(curuser.password,user.password,(err,answer)=>
            {
                if(!answer){
                    return res.redirect("/login?error=1");
                }
                if(user.banned==1)
                {
                    return res.redirect("/login?banned=1")
                }
                req.session._id=user._id;
                return res.redirect("/");
            });
        });
    });
});

app.post("/signup",(req,res)=>
{
    sessionPassport.noUserAllowed(req,res,(req,res)=>
    {
        var userDetail=req.body;
        if(!validator.validateDetails(userDetail))
        {
            return res.render("post_signup.hbs",{
                pageTitle:"Signup error",
                hack:true
            });
        }
        userModel.getUserByEmail(userDetail.email,(err,user)=>
        {
            if(err||user)
            {
                return res.render("post_signup.hbs",{
                    pageTitle:"Signup error",
                    emailTaken:true
                });
            }
            hasher.generateHash(userDetail.password,(err,str)=>
            {
                userDetail.password=str;
                userModel.addNewUser(userDetail,(err,addedUser)=>
                {
                    req.session._id=addedUser._id;
                    res.render("post_signup.hbs",{
                        pageTitle:"Signup successfull",
                        success:true
                    });
                });
            });
        });
    });
});

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////
//  Stuff from now on is common to all users so it requires passport method
/////////////////////////////////////////////////////////////////////////////////////////////

app.get("/",(req,res)=>
{
    sessionPassport.guestSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        categoriesModel.getCategoryList((err,categories)=>
        {
            hbsParams.categories=categories;
            hbsParams.pageTitle="Home";
            res.render("home.hbs",hbsParams);
        });
    });
});

app.get("/post",(req,res)=>
{
    sessionPassport.guestSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        var postID=req.query._id;
        postModel.getPostById(postID,"postThread postBy",(err,post)=>
        {
            if(err||!post)
            {
                return res.render("error_page.hbs",{error});
            }
            hbsParams.curPost=post;
            res.render("post.hbs",hbsParams);
        });
    });
});

app.get("/thread",(req,res)=>
{
        sessionPassport.guestSessionPassport(req,res,(req,res,user,hbsParams)=>
        {
            //get queries from the url
            var curThread=req.query._id;
            var curPage=req.query.page||1;
            threadModel.getThreadById(curThread,(err,thread)=>
            {   
                if(err||!thread)
                    return res.redirect("/error");

                subscriptionModel.findSubscription(user?user._id:0,thread._id,(err,subscription)=>
                {

                    //check status of subscription button
                    if(!subscription)
                    {
                        hbsParams.requestSubs=true;
                    }else{
                        if(subscription.accepted)
                            hbsParams.removeSubs=true;
                        else
                            hbsParams.waitSub=true;
                    }

                    if(thread.subscriptionModel==3||(subscription&&subscription.accepted==true))
                    {
                        hbsParams.allowPost=true;
                    }

                    if(thread.subscriptionModel==3||thread.subscriptionModel==2||(subscription&&subscription.accepted)){
                        postModel.getPostsByThreadPaginate(thread._id,10,curPage,"postBy",1,(err,posts)=>
                        {
                            addIndex(posts,1+(curPage-1)*10);
                            addGravatarToPosts(posts);
                            hbsParams._id=thread._id;
                            hbsParams.paginate=htmlGenerator.generatePagination(curThread,thread.count,10,curPage,"thread");
                            hbsParams.threadName=thread.subject;
                            hbsParams.pageTitle=thread.subject;
                            hbsParams.posts=posts;
                            if(user)
                            {
                                hbsParams.threadAdmin=(user._id.toString()==posts[0].postBy._id.toString());
                            }
                            console.log(hbsParams);
                            res.render("thread.hbs",hbsParams);
                        });
                    }else
                    {
                        hbsParams._id=thread._id;
                        hbsParams.threadName=thread.subject;
                        hbsParams.pageTitle=thread.subject;
                        if(user)
                        {
                            hbsParams.threadAdmin=(user._id.toString()==thread.threadBy.toString());
                        }
                        res.render("thread.hbs",hbsParams);
                    }
                });
            });
        });

});

app.get("/category",(req,res)=>
{
    sessionPassport.guestSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        //get queries from the url
        var curCat=req.query._id;
        console.log(curCat);
        var curPage=req.query.page||1;
        categoriesModel.getCategoryById(curCat,(err,category)=>{
            if(err||!category){
                return res.redirect("/error");
            }
            threadModel.getThreadsByCategoryPaginate(curCat,15,curPage,[{path:'threadBy'}, {path:'latestPost', populate: { path: 'postBy' }}],-1,(err,threads)=>
            {
                threads.sort(function(a,b){
                    if(!a.pinned&&b.pinned)
                        return 1;
                    if(a.pinned&&!b.pinned)
                        return -1;
                    return b.latestPost.date-a.latestPost.date;
                });
                hbsParams.catName=category.name;
                hbsParams.threads=threads;
                hbsParams.pagination=htmlGenerator.generatePagination(category._id,category.count,15,curPage,"category");
                res.render("category.hbs",hbsParams);
            });               
        });
    });
});

app.get("/profile",(req,res)=>
{
    sessionPassport.guestSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        var userId=req.query._id;
        if(user&&user._id.toString()==userId.toString())
        {
            hbsParams.self=true;
            hbsParams.gravatar=hasher.getmd5(user.email);
            hbsParams.userName=user.name;
            res.render("profile.hbs",hbsParams);
        }else
        {
            userModel.getUserById(userId,(err,user)=>
            {
                hbsParams.gravatar=hasher.getmd5(user.email);
                hbsParams.userName=user.name;
                res.render("profile.hbs",hbsParams);
            });
        }

    });
});

}

module.exports={
    setUpRoutes
}