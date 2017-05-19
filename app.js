//////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                          //
//      Welcome to the source code. Happy Reading                                           //
//                                                                                          //
//      app.js : contains all the routes that dont require session                          //
//                                                                                          //        
//      admin.js : contains all the routes that require admin level session                 //          
//                                                                                          //
//      user.js : contains all the routes that require user level session                   //
//                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////

//importing stuff for use
const htmlGenerator=require("./helper/htmlGenerator.js");
const validator=require('./helper/validator.js');
const express=require('express');
const hbs=require('hbs');
const bodyParser=require('body-parser');
const expressSession=require('express-session');
const mongoose=require('./model/mongoose.js');
const user=require("./user.js");
const admin=require("./admin.js");
const userModel=require("./model/userModel.js");
const hasher=require('./helper/hasher.js');
const categoriesModel=require('./model/categoriesModel.js');
const sessionPassport=require('./helper/sessionPassport.js');
const threadModel=require('./model/threadModel.js');
const postModel=require('./model/postModel.js');
//end import statements

//setting up express for use
const app=express();
const cookieKey="HelloFromTheOtherSide";
app.use(expressSession({secret:cookieKey}));
app.set('view engine','hbs');
hbs.registerPartials(__dirname+"/views/partials/");
app.use(express.static(__dirname+'/views/imports'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
//end setup express

//calling setUpRoutes for user and admin stuff
user.setUpRoutes(app);
admin.setUpRoutes(app);

/////////////////////////////////////////////////////////////
//  Handlebars registerting helper
/////////////////////////////////////////////////////////////
hbs.registerHelper('dateFormat',(date,options)=>{
    var ret="";
    ret=date.toDateString()+" "+date.toLocaleTimeString();
    return ret;
});
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

//constant declarations
const error="Occured occured, try contacting admin of the website at mohdfarhanmnnit@gmail.com.";

/////////////////////////////////////////////////////////////
//       Helpers functions that are local to the file
/////////////////////////////////////////////////////////////

function setThreadsLatestPost(threads,callback){
    var counter=0;
    if(threads.length==0)
    {
        callback(undefined);
    }
    for(var i=0;i<threads.length;++i){
        setThreadLatestPost(threads[i],(err)=>
        {
            if(err)
                return callback(err);
            ++counter;
            if(counter==threads.length)
            {
                callback(undefined);
            }
        });
    }
}

function setThreadLatestPost(thread,callback){
    postModel.getPostsByThread(thread._id,"postBy",-1,(err,posts)=>
    {
        thread.lastPost=posts[0];
        callback(err);
    });
}

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
//  Registering routes for common action
/////////////////////////////////////////////////////////////

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
        error:req.query.error
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
                    return res.render("error_page.hbs",{error});
                postModel.getPostsByThreadPaginate(thread._id,10,curPage,"postBy",1,(err,posts)=>
                {
                    hbsParams._id=thread._id;
                    hbsParams.paginate=htmlGenerator.generatePagination(curThread,thread.count,10,curPage,"thread");
                    hbsParams.threadName=thread.subject;
                    hbsParams.pageTitle=thread.subject;
                    hbsParams.posts=posts;
                    res.render("thread.hbs",hbsParams);
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
        var curPage=req.query.page||1;
        categoriesModel.getCategoryById(curCat,(err,category)=>{
            if(err||!category)
                return res.render("error_page.hbs",{error});
            threadModel.getThreadsByCategoryPaginate(curCat,15,curPage,"threadBy",-1,(err,threads)=>
            {
                setThreadsLatestPost(threads,()=>
                {
                    threads.sort(function(a,b){
                        return b.lastPost.date-a.lastPost.date;
                    });
                    hbsParams.catName=category.name;
                    hbsParams.threads=threads;
                    hbsParams.pagination=htmlGenerator.generatePagination(category._id,category.count,15,curPage,"category");
                    res.render("category.hbs",hbsParams);
                });
            });
        });
    });
});

mongoose.connectDB(()=>
{
    app.listen(3000);
});

process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    process.exit(0);
  });
});
