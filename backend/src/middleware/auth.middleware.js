const jwt = require('jsonwebtoken');
const blockListModel = require('../models/balockList.model');
const redis = require('../config/cache')


const authUser = async(req,res,next)=>{
    
try{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({
            message:"token not provided"
        })
    }

    // const isTokenBlockListed = await blockListModel.findOne(token);
    // if(isTokenBlockListed){
    //     return res.status(401).json({
    //         message:"invalid token"
    //     })
    // }

    

    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.user = decoded;
    next()

}
catch(err){
    return res.status(404).json({
        message:"invalid token"
    })

}
}

module.exports = {
    authUser
}
