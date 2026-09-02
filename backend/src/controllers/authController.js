const userModel = require("../models/userModel")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userRegister = async(req,res)=>{
    const {username,email,password} = req.body

    const isUserAlreadyExists = await userModel.findOne({
        $or:[
            {email},
            {username}
        ]
    })
    if(isUserAlreadyExists){
        return res.status(401).json({
            message:"user already exist with " + (isUserAlreadyExists.email === email ? "email" : "username") 
        })
    }

    const hash = await bcrypt.hash(password,10);
    const user = await userModel.create({
        username,
        email,
        password:hash
    })

    const token = jwt.sign({
        id:user._id
    },process.env.JWT_SECRET,
    {expiresIn:"3d"})

    res.cookie("token",token)



    res.status(201).json({
        message:"user register success",
        user,
        token
    })
}

const userLogin = async(req,res)=>{
    const {username,email} = req.body

    const isUserExist =

}

module.exports ={
    userRegister
}

