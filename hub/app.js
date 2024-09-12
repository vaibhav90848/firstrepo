const express=require('express');
const fs=require('fs');
const app =express();
const path=require('path');
const userModel=require('./models/user');
const postModel=require('./models/post');   
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const mongoose=require('mongoose');
//const { log } = require('console');

app.set("view engine","ejs");
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));

app.get("/",(req,res)=>{
    res.render("index");
})
app.post("/create",async(req,res)=>{
    let {username,password,email,game,height,weight}=req.body;
    let find=await userModel.findOne({email:req.body.email});
    if(find){
        res.send("Error occured");
    }
    else{
    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, async (err, hash)=>{
            let user= await userModel.create({
                username,
                email,
                password:hash,
                height,
                weight,
                game
            })
            let token=jwt.sign({email,userid:user._id},"hhehe");
            res.cookie("token",token);
           res.render(game,{name:username.toUpperCase()});
        });
    });
}
})  
app.get("/login",(req,res)=>{
    res.render("show"); 
})
app.post("/login",async (req,res)=>{  
   let user=await userModel.findOne({email:req.body.email});
  if(!user){res.send("something went wrong");}
   else{
    bcrypt.compare(req.body.password,user.password, function(err, result) {
        if(result){
            let token=jwt.sign({email:req.body.email,userid:user._id},"hhehe");
            res.cookie("token",token);
            res.render(user.game,{name:user.username});
        }
        else{res.send("something went wrong");}
    });
   }
})
app.get("/post",isLoggedIn,(req,res)=>{    
    res.render("post");
})
app.post("/post",isLoggedIn,async (req,res)=>{
    let user=await userModel.findOne({email:req.user.email});
    let post=await postModel.create({
        user:req.user.userid,
        content:req.body.content
    })
    user.posts.push(post._id);
    await user.save();
    res.redirect("/post");
})
app.get("/game",isLoggedIn,(req,res)=>{
    res.render("game");
})
app.get("/logout",(req,res)=>{
    res.cookie("token","");
    res.redirect("/");
})
app.get("/read",async(req,res)=>{
    let allusers=await userModel.find();
    res.send(allusers);
})
app.get("/profile",isLoggedIn,async(req,res)=>{
    let user=await userModel.findOne({email:req.user.email});
     res.render("profile",{users:user});
})
app.post("/update",isLoggedIn,async (req,res)=>{
    let {username,height,weight}=req.body;
    let user =await userModel.findOneAndUpdate({email:req.user.email},{username,height,weight},{new:true});
    res.redirect("/profile");

})
function isLoggedIn(req,res,next){
if(req.cookies.token===""){
    res.render("bug");
}
else{
var decoded = jwt.verify(req.cookies.token,"hhehe");
req.user=decoded
next();
}
}
app.listen(3000);