const userModel = require("../models/userModel")
const blockListModel = require("../models/balockList.model")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const redis= require('../config/cache')

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
    const {username,email,password} = req.body

    const user = await userModel.findOne({
        $or:[
            {email},
            {username}
        ]
    }).select("+password")

    if(!user){
        return res.status(409).json({
            message:"user not found"
        })
    }

    const isPasswordMatch = await bcrypt.compare(password,user.password)
    if(!isPasswordMatch){
        return res.status(401).json({
            message:"invalid password"
        })
    }

    const token = jwt.sign({
        id:user._id
    },process.env.JWT_SECRET)

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });

   return res.status(200).json({
    message: "user login success",
    token,
    user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username
    }
});

}

const getMe = async(req,res)=>{
    const user = await userModel.findById(req.user.id);

    res.status(200).json({
        message:"user fetched success",
        user
    })
}

const logOutUser = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "token not provided"
            });
        }

        await redis.set(
            `blacklist:${token}`,
            "true",
            "EX",
            7 * 24 * 60 * 60
        );

        res.clearCookie("token");

        return res.status(200).json({
            message: "user logout success"
        });

    } catch (err) {
        console.log("Logout error:", err.message);

        return res.status(500).json({
            message: "logout failed"
        });
    }
};
module.exports ={
    userRegister,
    userLogin,
    getMe,
    logOutUser
}

