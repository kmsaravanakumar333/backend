const { response } = require('express')
const express =require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/SignInModels')
const signInTemplateCopy = require('../models/SignInModels')

router.post('/signin',async(req,res)=>{
    try{
        const{username,email,password} = req.body;
        const user = await User.findOne({email:email})
        if(user) return res.status(400).json({msg:"The email already exists."})
        
        const passwordHash = await bcrypt.hash(password, 10)
        const signedInUser = new signInTemplateCopy({
           username: username,
           email:email,
           password:passwordHash
          
        })
        await signedInUser.save()
        res.json({msg:"sign in sucsess"})
    }catch(err){
        return res.status(500).json({msg:err.message})
    }
    
})

router.post('/login',async(req,res)=>{
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email:email})
        if(!user) return res.status(400).json({msg:"User does not exist."})

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) return res.status(400).json({msg:"Incorrect password"})
        
        const payload = { id:user._id, name:user.username}
        const token = jwt.sign(payload,process.env.TOKEN_SECRET, {expiresIn:"1d"})
        
        res.json({token})
   
        }catch(err){
        return res.status(500).json({msg:err.message})
    }
    
})

router.get('/verify',async(req,res)=>{
    try{
        const token = req.header("Authorization")
        if(!token) return res.send(false)

        jwt.verify(token,process.env.TOKEN_SECRET, async (err,verified)=>{
            if(err) return res.send(false)

            const user = await User.findById(verified.id)
            if(!user) return res.send(false)

            return res.send({user: user})
        })
    }catch(err){
        return res.status(500).json({msg:err.message})
    }
    
})


module.exports = router