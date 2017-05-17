const bcryptjs=require('bcryptjs');
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

module.exports.generateHash=generateHash;
module.exports.compare=bcryptjs.compare;