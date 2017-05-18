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



user.setUpRoutes(app);
admin.setUpRoutes(app);

const brand="MNNIT DISCUSSION FORUM";

app.get("/logout",(req,res)=>
{
    req.session.destroy((err)=>
    {
        res.redirect("/");
    });
});

app.get("/login",(req,res)=>
{
    if(req.session._id)
        return res.redirect("/");
    res.render("lands.hbs",{
        pageTitle:"MNNIT DISCUSSION FORUM",
        error:req.query.error
    });
});


app.post("/login",(req,res)=>
{
    if(req.session._id)
        return res.redirect("/");
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
    })
});


//////////////////////////////////////////////////////////////////////////////////////////////
//     Function that creates a new user
//////////////////////////////////////////////////////////////////////////////////////////////

app.post("/signup",(req,res)=>
{
    if(req.session._id)
        return res.redirect("/");
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

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////
//         Stuff from now on is common to all users so it requires passport method
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

app.get("/category",(req,res)=>
{
    sessionPassport.guestSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        var curCat=req.query._id;
        var curPage=req.query.page||1;

        categoriesModel.getCategoryById(curCat,(err,category)=>{
            
            hbsParams.catName=category.name;
            hbsParams.pagination=htmlGenerator.generatePagination(category._id,category.count,curPage,"category");
            console.log("i get here");
            threadModel.getThreadsByCategoryPaginate(curCat,15,curPage,"threadBy",(err,threads)=>
            {
                hbsParams.threads=threads;
                res.render("category.hbs",hbsParams);
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
