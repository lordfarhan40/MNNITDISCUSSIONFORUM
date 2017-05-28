const bcryptjs=require('bcryptjs');
var crypto = require('crypto');
const saltRounds=13;

function generateHash(str,callback){
    bcryptjs.genSalt(saltRounds,(err,salt)=>{
        if(err)
        {
            return callback(1);
        }
        bcryptjs.hash(str,salt,(err,hash)=>
        {
            if(err)
            {
                return callback(1);
            }
            callback(undefined,hash);
        });
    });
}

function getmd5(str,callback){
    return crypto.createHash('md5').update(str).digest("hex");    
}

module.exports.generateHash=generateHash;
module.exports.getmd5=getmd5;
module.exports.compare=bcryptjs.compare;