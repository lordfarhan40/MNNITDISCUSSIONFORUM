const validator=require('./helper/validator.js');
const userModel=require('./model/userModel.js');
const sessionPassport=require('./helper/sessionPassport.js');

const brand="MNNIT DISCUSSION FORUM";

function setUpRoutes(app){

app.get("/home",(req,res)=>
{
    sessionPassport.userSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        hbsParams.pageTitle="Home";
        res.render("home.hbs",hbsParams);
    });
});


app.get("/logout",(req,res)=>
{
    req.session.destroy((err)=>
    {
        res.redirect("/");
    });
});


app.get("/createThread",(req,res)=>{
    sessionPassport.userSessionPassport(req,res,(req,res,user,hbsParams)=>
    {
        hbsParams.pageTitle="Create thread";
        res.render("addThread.hbs",hbsParams);
    });
});

}

module.exports={
    setUpRoutes
}