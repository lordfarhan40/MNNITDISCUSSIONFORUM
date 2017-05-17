const userModel=require('../model/userModel.js');
const brand="MNNIT DISCUSSION FORUM";

function adminSessionPassport(req,res,next){
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

        if(user.level==1){
            var hbsParams={
                name:user.name,
                brand,
                admin:true
            };
            return next(req,res,user,hbsParams);
        }
        
        if(user.level==0)
            return res.redirect("/home");
        
        return req.session.destroy(()=>
        {
            return res.redirect("/");
        });
    });
}

function userSessionPassport(req,res,next){
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

module.exports={
    adminSessionPassport,
    userSessionPassport
}