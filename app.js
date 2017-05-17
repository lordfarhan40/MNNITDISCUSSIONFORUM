//importing stuff for use

const express=require('express');
const hbs=require('hbs');
const bodyParser=require('body-parser');
const expressSession=require('express-session');
const mongoose=require('./model/mongoose.js');
const user=require("./user.js");
const admin=require("./admin.js");
const userModel=require("./model/userModel.js");
const hasher=require('./helper/hasher.js');

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

    res.render("lands.hbs",{
        pageTitle:"MNNIT DISCUSSION FORUM",
        error:req.query.error
    });
});


app.post("/login",(req,res)=>
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
            return res.redirect("/home");
        });
    })
});


//////////////////////////////////////////////////////////////////////////////////////////////
//                  Function for signup
//////////////////////////////////////////////////////////////////////////////////////////////

app.post("/signup",(req,res)=>
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

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////


app.get("/",(req,res)=>
{
    if(!req.session._id){
        res.render("index.hbs",{
            pageTitle:brand,
            brand     
        });
    }else
    {
        res.redirect("/home");
    }
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
