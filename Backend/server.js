require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 8080;

/* ================= TRUST PROXY ================= */
app.set("trust proxy", 1);

/* ================= BODY ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= CORS ================= */
app.use(
  cors({
    origin: [
      "https://www.carsandbikesinindia.com",
      "https://carsandbikesinindia.com",
      "https://cabii-carsandbikesinindia-production.up.railway.app"
    ],
    credentials: true,
  })
);

/* ================= STATIC ================= */
app.use(express.static(path.join(__dirname, "public")));

/* ================= DATABASE ================= */
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log("DB Error",err));

/* ================= SESSION ================= */
app.use(
  session({
    name:"cabii.sid",
    secret: process.env.SESSION_SECRET || "cabii_secret_2026",
    resave:false,
    saveUninitialized:false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI
    }),
    cookie:{
      httpOnly:true,
      secure:true,
      sameSite:"none",
      maxAge:1000*60*60*24*7
    }
  })
);

/* ================= AUTH CHECK ================= */
function isLoggedIn(req,res,next){
  if(!req.session.userId)
    return res.status(401).json({message:"Login required"});
  next();
}

/* ================= USER MODEL ================= */
const userSchema = new mongoose.Schema({
  name:String,
  email:{type:String,unique:true},
  password:String,
  resetToken:String,
  resetTokenExpiry:Date
});
const User = mongoose.model("User",userSchema);

/* ================= ADS MODEL ================= */
const adSchema = new mongoose.Schema({
  title:String,
  price:Number,
  city:String,
  description:String,
  userId:String,
  createdAt:{type:Date,default:Date.now}
});
const Ad = mongoose.model("Ad",adSchema);

/* ================= SELL48 MODEL ================= */
const sell48Schema = new mongoose.Schema({
  brand:String,
  model:String,
  year:Number,
  km:Number,
  fuel:String,
  city:String,
  expectedPrice:Number,
  phone:String,
  description:String,
  userId:String,
  status:{type:String,default:"ACTIVE"},
  createdAt:{type:Date,default:Date.now},
  expiresAt:{type:Date,default:()=> new Date(Date.now()+48*60*60*1000)}
});
const Sell48 = mongoose.model("Sell48",sell48Schema);

/* ================= REGISTER ================= */
app.post("/api/register",async(req,res)=>{
 try{
  const {name,email,password}=req.body;

  const exist=await User.findOne({email});
  if(exist) return res.json({success:false,message:"User exists"});

  const hash=await bcrypt.hash(password,10);
  const user=await User.create({name,email,password:hash});

  req.session.userId=user._id;
  res.json({success:true});

 }catch{
  res.status(500).json({success:false});
 }
});

/* ================= LOGIN ================= */
app.post("/api/login",async(req,res)=>{
 try{
  const {email,password}=req.body;

  const user=await User.findOne({email});
  if(!user) return res.json({success:false,message:"Invalid email"});

  const match=await bcrypt.compare(password,user.password);
  if(!match) return res.json({success:false,message:"Wrong password"});

  req.session.userId=user._id;

  res.json({success:true,user:{id:user._id,name:user.name,email:user.email}});

 }catch(err){
  console.log(err);
  res.status(500).json({success:false});
 }
});

/* ================= LOGOUT ================= */
app.post("/api/logout",(req,res)=>{
 req.session.destroy(()=>{
  res.json({success:true});
 });
});

/* ================= FORGOT PASSWORD ================= */
app.post("/api/auth/forgot-password",async(req,res)=>{
 try{
  const user=await User.findOne({email:req.body.email});
  if(!user) return res.json({success:true});

  const token=crypto.randomBytes(32).toString("hex");
  user.resetToken=token;
  user.resetTokenExpiry=Date.now()+15*60*1000;
  await user.save();

  console.log("RESET TOKEN:",token);
  res.json({success:true});
 }catch{
  res.status(500).json({success:false});
 }
});

/* ================= POST AD ================= */
app.post("/api/ads",isLoggedIn,async(req,res)=>{
 const ad=await Ad.create({
  ...req.body,
  userId:req.session.userId
 });
 res.json({success:true,ad});
});

/* ================= MY ADS ================= */
app.get("/api/my-ads",isLoggedIn,async(req,res)=>{
 const ads=await Ad.find({userId:req.session.userId}).sort({createdAt:-1});
 res.json(ads);
});

/* ================= DELETE AD ================= */
app.delete("/api/ads/:id",isLoggedIn,async(req,res)=>{
 await Ad.deleteOne({_id:req.params.id,userId:req.session.userId});
 res.json({success:true});
});

/* ================= EDIT AD ================= */
app.put("/api/ads/:id",isLoggedIn,async(req,res)=>{
 await Ad.updateOne({_id:req.params.id,userId:req.session.userId},req.body);
 res.json({success:true});
});

/* ================= SELL48 SUBMIT ================= */
app.post("/api/sell48",isLoggedIn,async(req,res)=>{
 const sell=await Sell48.create({
  ...req.body,
  userId:req.session.userId
 });
 res.json({success:true,id:sell._id});
});

/* ================= MY SELL48 ================= */
app.get("/api/my-sell48",isLoggedIn,async(req,res)=>{
 const data=await Sell48.find({userId:req.session.userId});
 res.json(data);
});

/* ================= DEALER LEADS ================= */
app.get("/api/dealer/sell48-leads",async(req,res)=>{
 const leads=await Sell48.find({status:"ACTIVE"}).sort({createdAt:-1}).limit(50);
 res.json(leads);
});

/* ================= AUTO 48HR CLOSE ================= */
setInterval(async()=>{
 const now=new Date();
 await Sell48.updateMany(
  {expiresAt:{$lt:now},status:"ACTIVE"},
  {$set:{status:"EXPIRED"}}
 );
},60000);

/* ================= HOME ================= */
app.get("/",(req,res)=>{
 res.sendFile(path.join(__dirname,"public","index.html"));
});

/* ================= START ================= */
app.listen(PORT,()=>{
 console.log("CABII LIVE ON PORT "+PORT);
});
/* ================= REGISTER ================= */
app.post("/api/register",async(req,res)=>{
 try{
  const {name,email,password}=req.body;

  const exist=await User.findOne({email});
  if(exist) return res.json({success:false,message:"User exists"});

  const hash=await bcrypt.hash(password,10);
  const user=await User.create({name,email,password:hash});

  req.session.userId=user._id;
  res.json({success:true});

 }catch{
  res.status(500).json({success:false});
 }
});

/* ================= LOGIN ================= */
app.post("/api/login",async(req,res)=>{
 try{
  const {email,password}=req.body;

  const user=await User.findOne({email});
  if(!user) return res.json({success:false,message:"Invalid email"});

  const match=await bcrypt.compare(password,user.password);
  if(!match) return res.json({success:false,message:"Wrong password"});

  req.session.userId=user._id;

  res.json({success:true,user:{id:user._id,name:user.name,email:user.email}});

 }catch(err){
  console.log(err);
  res.status(500).json({success:false});
 }
});

/* ================= LOGOUT ================= */
app.post("/api/logout",(req,res)=>{
 req.session.destroy(()=>{
  res.json({success:true});
 });
});

/* ================= FORGOT PASSWORD ================= */
app.post("/api/auth/forgot-password",async(req,res)=>{
 try{
  const user=await User.findOne({email:req.body.email});
  if(!user) return res.json({success:true});

  const token=crypto.randomBytes(32).toString("hex");
  user.resetToken=token;
  user.resetTokenExpiry=Date.now()+15*60*1000;
  await user.save();

  console.log("RESET TOKEN:",token);
  res.json({success:true});
 }catch{
  res.status(500).json({success:false});
 }
});

/* ================= POST AD ================= */
app.post("/api/ads",isLoggedIn,async(req,res)=>{
 const ad=await Ad.create({
  ...req.body,
  userId:req.session.userId
 });
 res.json({success:true,ad});
});

/* ================= MY ADS ================= */
app.get("/api/my-ads",isLoggedIn,async(req,res)=>{
 const ads=await Ad.find({userId:req.session.userId}).sort({createdAt:-1});
 res.json(ads);
});

/* ================= DELETE AD ================= */
app.delete("/api/ads/:id",isLoggedIn,async(req,res)=>{
 await Ad.deleteOne({_id:req.params.id,userId:req.session.userId});
 res.json({success:true});
});

/* ================= EDIT AD ================= */
app.put("/api/ads/:id",isLoggedIn,async(req,res)=>{
 await Ad.updateOne({_id:req.params.id,userId:req.session.userId},req.body);
 res.json({success:true});
});

/* ================= SELL48 SUBMIT ================= */
app.post("/api/sell48",isLoggedIn,async(req,res)=>{
 const sell=await Sell48.create({
  ...req.body,
  userId:req.session.userId
 });
 res.json({success:true,id:sell._id});
});

/* ================= MY SELL48 ================= */
app.get("/api/my-sell48",isLoggedIn,async(req,res)=>{
 const data=await Sell48.find({userId:req.session.userId});
 res.json(data);
});

/* ================= DEALER LEADS ================= */
app.get("/api/dealer/sell48-leads",async(req,res)=>{
 const leads=await Sell48.find({status:"ACTIVE"}).sort({createdAt:-1}).limit(50);
 res.json(leads);
});

/* ================= AUTO 48HR CLOSE ================= */
setInterval(async()=>{
 const now=new Date();
 await Sell48.updateMany(
  {expiresAt:{$lt:now},status:"ACTIVE"},
  {$set:{status:"EXPIRED"}}
 );
},60000);

/* ================= HOME ================= */
app.get("/",(req,res)=>{
 res.sendFile(path.join(__dirname,"public","index.html"));
});

/* ================= START ================= */
app.listen(PORT,()=>{
 console.log("CABII LIVE ON PORT "+PORT);
});