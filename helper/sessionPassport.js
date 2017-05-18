const userModel=require('../model/userModel.js');
const brand="MNNIT DISCUSSION FORUM";

function guestSessionPassport(req,res,next){
    var hbsParams=new Object();
    var user=new Object();
    hbsParams.brand=brand;
    if(req.session.id){
        userModel.getUserById(req.session._id,(err,user)=>
        {
            if(err||!user)
            {
                return req.session.destroy(()=>
                {
                    return next(req,res,user,hbsParams);
                });
            }
            if(user.level==1)
                hbsParams.admin=true;
            hbsParams.name=user.name;
            hbsParams.brand=brand;
            return next(req,res,user,hbsParams);
    });
    }else
    {
        next(req,res,user,hbsParams);
    }
}

function adminSessionPassport(req,res,next){    
    if(!req.session._id)
    {
        return res.redirect("/");
    }
    userModel.getUserById(req.session._id,(err,user)=>
    {
        var hbsParams=new Object();
        hbsParams.brand=brand;
        if(err||!user)
        {
            return req.session.destroy(()=>
            {
                return res.redirect("/");
            });
        }

        if(user.level==1)
            hbsParams.admin=true;
        hbsParams.name=user.name;
        return next(req,res,user,hbsParams);
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

        var hbsParams=new Object();

        if(user.level==1)
            hbsParams.admin=true;
        hbsParams.brand=brand;
        hbsParams.name=user.name;
        return next(req,res,user,hbsParams);
    });
}

module.exports={
    adminSessionPassport,
    userSessionPassport,
    guestSessionPassport
}