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
const user=require("./routes/user.js");
const admin=require("./routes/admin.js");
const guest=require("./routes/guest.js");

//setting up express for use
const app=express();
const cookieKey="HelloFromTheOtherSide";
app.use(expressSession({secret:cookieKey}));
app.set('view engine','hbs');
hbs.registerPartials(__dirname+"/views/partials/");
app.use(express.static(__dirname+'/views/imports'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

user.setUpRoutes(app);
admin.setUpRoutes(app);
guest.setUpRoutes(app);

hbs.registerHelper('dateFormat',(date,options)=>{
    var ret="";
    ret=date.toDateString()+" "+date.toLocaleTimeString();
    return ret;
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

app.get("*",(req,res)=>
{
    res.render("error_page.hbs");
});