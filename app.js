//importing stuff for use

const express=require('express');
const hbs=require('hbs');
const bodyParser=require('body-parser');
const expressSession=require('express-session');
const mongoose=require('./model/mongoose.js');
const user=require("./user.js");
const admin=require("./admin.js");

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
