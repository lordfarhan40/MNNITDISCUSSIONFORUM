const validator=require('./helper/validator.js');
const userModel=require('./model/userModel.js');
const hasher=require('./helper/hasher.js');

const brand="MNNIT DISCUSSION FORUM";


function userSessionPassport(req,res,next){
    console.log(req.session);
    if(!req.session._id)
    {
        return res.redirect("/");
    }
    userModel.getUserById(req.session._id,(err,user)=>
    {
        if(err||!user)
        {
            return req.session.destroy(()=>
            {
                return res.redirect("/");
            });
        }

        if(user.level==0)
            return next(req,res,user);

        if(user.level==1)
            return res.redirect("/home_admin");
        
        return req.session.destroy(()=>
        {
            return res.redirect("/");
        });
    });
}



function setUpRoutes(app){

app.get("/home",(req,res)=>
{
    userSessionPassport(req,res,(req,res,user)=>
    {
        res.render("home.hbs",{
            pageTitle:"home",
            name:user.name,
            brand,
        })
    });
});


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
            console.log(req.session);
            return res.redirect("/home");
        });
    })
});

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

}

module.exports={
    setUpRoutes
}