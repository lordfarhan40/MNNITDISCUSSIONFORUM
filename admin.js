const validator=require('./helper/validator.js');
const userModel=require('./model/userModel.js');
const hasher=require('./helper/hasher.js');
const categoriesModel=require('./model/categoriesModel.js');


const brand="MNNIT DISCUSSION FORUM";


function adminSessionPassport(req,res,next){
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

        if(user.level==1)
            return next(req,res,user);
        
        if(user.level==0)
            return res.redirect("/home");
        
        return req.session.destroy(()=>
        {
            return res.redirect("/");
        });
    });
}

function setUpRoutes(app){

app.get("/home_admin",(req,res)=>
{
    adminSessionPassport(req,res,(req,res,user)=>
    {
        res.render("home.hbs",{
            pageTitle:"home",
            name:user.name,
            brand,
            admin:true
        })
    });
});

app.get("/manage_categories",(req,res)=>
{
    adminSessionPassport(req,res,(req,res,user)=>
    {
        categoriesModel.getCategoryList((err,categories)=>{
            if(err)
            {
                return res.send("Sorry error occured, try contacting admin.");
            }
            res.render("manage_categories.hbs",{
                pageTitle:"Manage Categories",
                name:user.name,
                brand,
                admin:true,
                categories
            });
        });
    });
}); 


app.get("/edit_category",(req,res)=>
{
    adminSessionPassport(req,res,(req,res,user)=>{
        console.log(req.query);
        if(req.query._id){
            console.log("I got called");
            categoriesModel.getCategoryById(req.query._id,(err,category)=>
            {
                var name=category.name;
                var description=category.description;
                var _id=category._id;
                    res.render("edit_category.hbs",{
                    pageTitle:"Manage Categories",
                    name:user.name,
                    brand,
                    admin:true,
                    categoryName:name,
                    description,
                    _id,
                    edit:true
                });
            });
        }
        else{
            res.render("edit_category.hbs",{
                    pageTitle:"Manage Categories",
                    name:user.name,
                    brand,
                    admin:true,
            });
        }
    });
});

app.post("/edit_category",(req,res)=>
{
    adminSessionPassport(req,res,(req,res,user)=>{
        console.log(req.body);
        if(req.body._id){
            categoriesModel.editCategory(req.body._id,req.body.name,req.body.description,(err,category)=>
            {
                if(err)
                {
                    return res.send("Error occured");
                }else
                {
                    return res.redirect("/manage_categories");
                }
            });
        }else
        {
            categoriesModel.addCategory(req.body.name,req.body.description,(err,category)=>{
                if(err)
                {
                    console.log(err);
                    return res.send("Error occured");
                }else
                {
                    return res.redirect("/manage_categories");
                }
            });
        }
    });
});


}



module.exports={
    setUpRoutes
}