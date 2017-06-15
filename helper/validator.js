function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function checkPassword(password){
    return !(password.trim().length==0);
}

function validateDetails(userDetail){
    if(!userDetail.name||!userDetail.password||!userDetail.email)
        return 0;
    
    console.log("user details ok");

    if(userDetail.name.trim().length==0)
        return 0;

    console.log("name ok");

    if(!checkPassword(userDetail.password))
        return 0;
    
    console.log("password ok");

    return validateEmail(userDetail.email);
}



module.exports={
    validateDetails,
    checkPassword
}