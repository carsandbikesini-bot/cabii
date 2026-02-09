/***********************
 * CABII BACKEND SERVER
 * FULL PRODUCTION WORKING BUILD
 ***********************/

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");
const fs = require("fs");
const MongoStore = require("connect-mongo");
const app = express();
app.set("trust proxy", 1);
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    req.headers["x-forwarded-proto"] = "https";
  }
  next();
});
const PORT = process.env.PORT || 8080;

/* ================= CORS ================= */

app.use(cors({
  origin: [
  "https://carsandbikesinindia.com",
  "https://www.carsandbikesinindia.com"
],
credentials: true
}));
app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({extended:true,limit:"50mb"}));

/* ================= FRONTEND SERVE ================= */
const frontendPath = path.join(__dirname, "public");
app.use(express.static(frontendPath));

/* ================= UPLOADS ================= */
const uploadDir = path.join(__dirname,"uploads");
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir,{recursive:true});

/* ================= SESSION ================= */

/* ================= EMAIL ================= */
const transporter=nodemailer.createTransport({
  host:process.env.EMAIL_HOST,
  port:Number(process.env.EMAIL_PORT),
  secure:false,
  auth:{user:process.env.EMAIL_USER,pass:process.env.EMAIL_PASS}
});

/* ================= DATABASE ================= */

/* ================= MODELS ================= */
const User=mongoose.model("User",new mongoose.Schema({
  name:String,
  email:{type:String,unique:true},
  password:String,
  resetToken:String,
  resetTokenExpiry:Date,
  membership:{type:String,default:"Free"}
},{timestamps:true}));

const Ad=mongoose.model("Ad",new mongoose.Schema({
  title:String,
  city:String,
  brand:String,
  model:String,
  manufacturerYear:Number,
  fuel:String,
  transmission:String,
  km:Number,
  owner:String,
  description:String,
  images:[String],
  price:Number,
  sellername:String,
  contactNumber:String,
  location:String,
  userId:String
},{timestamps:true}));

const Sell48Ad=mongoose.model("Sell48Ad",new mongoose.Schema({
  userId:String,
  brand:String,
  model:String,
  year:Number,
  price:Number,
  city:String,
  description:String,
  photos:[String]
},{timestamps:true}));

const Dealer=mongoose.model("Dealer",new mongoose.Schema({
  userId:String,
  membershipPlan:String,
  leadLimit:Number,
  leadUsed:{type:Number,default:0},
  expiryDate:Date,
  isActive:{type:Boolean,default:true}
}));

const Lead=mongoose.model("Lead",new mongoose.Schema({
  dealerId:String,
  adId:{type:mongoose.Schema.Types.ObjectId,ref:"Ad"},
  assignedAt:{type:Date,default:Date.now}
}));


/* ================= SERVER START ================= */

mongoose.connect(process.env.MONGO_URI)
.then(()=>{

  console.log("✅ MongoDB connected");

  /* ===== SESSION AFTER DB ===== */
app.use(
  session({
    name: "cabii.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,

    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      ttl: 60 * 60 * 24 * 7,
    }),

    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
/* ================= AUTH ================= */
function isLoggedIn(req,res,next){
 if(!req.session || !req.session.userId)
  return res.status(401).json({message:"Login required"});
 req.userId=req.session.userId.toString();
 next();
}

app.get("/api/auth/me",(req,res)=>{
 res.json({userId:req.session?.userId||null});
});

/* ================= REGISTER ================= */
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "User exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });

    req.session.regenerate(err => {
      if (err) {
        console.error("SESSION REGENERATE ERROR:", err);
        return res.status(500).json({ success: false, message: "Session error" });
      }

      req.session.userId = user._id.toString();

      req.session.save(err => {
        if (err) {
          console.error("SESSION SAVE ERROR:", err);
          return res.status(500).json({ success: false, message: "Session error" });
        }
        res.json({ success: true, user });
      });
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= LOGIN ================= */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email & password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Wrong password" });
    }

    req.session.regenerate(err => {
      if (err) {
        console.error("SESSION REGENERATE ERROR:", err);
        return res.status(500).json({ success: false, message: "Session error" });
      }

      req.session.userId = user._id.toString();

      req.session.save(err => {
        if (err) {
          console.error("SESSION SAVE ERROR:", err);
          return res.status(500).json({ success: false, message: "Session error" });
        }
        res.json({ success: true, user });
      });
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= LOGOUT ================= */
app.post("/api/logout", (req, res) => {
  if (!req.session) {
    return res.json({ success: true });
  }

  req.session.destroy(err => {
    if (err) {
      console.error("LOGOUT ERROR:", err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }

    res.clearCookie("cabii.sid", {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      secure: true,
      sameSite: "none"
    });

    res.json({ success: true, message: "Logged out successfully" });
  });
});

/* ================= FORGOT PASSWORD ================= */
const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});

app.post("/api/auth/forgot-password", forgotLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ success: true });

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const link = `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;

    await transporter.sendMail({
      from: `CABII <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Password",
      html: `Click here to reset password:<br><a href="${link}">${link}</a>`
    });

    res.json({ success: true });
  } catch (e) {
    console.error("FORGOT PASSWORD ERROR:", e);
    res.status(500).json({ success: false, message: "Email send failed" });
  }
});

/* ================= RESET PASSWORD ================= */
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
/* ================= MULTER ================= */
const upload = multer({
  limits:{ fileSize:5*1024*1024 },
  storage: multer.memoryStorage()
});

/* ================= AUTO LEAD ASSIGN ================= */
async function autoAssignLead(adId){
 try{
   const dealers=await Dealer.find({
    isActive:true,
    expiryDate:{$gt:new Date()},
    $expr:{$lt:["$leadUsed","$leadLimit"]}
   }).sort({leadUsed:1});
   if(!dealers.length) return;
   const dealer=dealers[0];
   await Lead.create({ dealerId:dealer._id.toString(), adId });
 }catch(err){
   console.error("AUTO ASSIGN ERROR:",err);
 }
}

/* ================= POST AD ================= */
app.post("/api/ads", isLoggedIn, upload.array("images",10), async (req,res)=>{
  try{
    const images = (req.files || []).map(file =>
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
    );
    const ad = await Ad.create({
      ...req.body,
      images: images.slice(0,5),
      userId: req.userId
    });
    await autoAssignLead(ad._id);
    res.json({success:true,adId:ad._id});
  }catch(err){
    console.error("POST AD ERROR:",err);
    res.status(500).json({success:false,message:"Ad creation failed"});
  }
});

/* ================= MY ADS ================= */
app.get("/api/my-ads", isLoggedIn, async (req,res)=>{
  try{
    const ads = await Ad.find({userId:req.userId}).sort({createdAt:-1});
    return res.json(ads);
  }catch(err){
    console.error("MY ADS ERROR:",err);
    return res.status(500).json({success:false,message:"Unable to fetch ads"});
  }
});

/* ================= EDIT AD ================= */
app.put("/api/ads/:id",isLoggedIn,async(req,res)=>{
 try{
   const ad=await Ad.findOne({_id:req.params.id,userId:req.userId});
   if(!ad) return res.status(403).json({success:false,message:"Not owner"});
   await Ad.updateOne({_id:ad._id},req.body);
   res.json({success:true});
 }catch(err){
   console.error("EDIT AD ERROR:",err);
   res.status(500).json({success:false,message:"Update failed"});
 }
});

/* ================= DELETE AD ================= */
app.delete("/api/ads/:id",isLoggedIn,async(req,res)=>{
 try{
   const ad=await Ad.findOne({_id:req.params.id,userId:req.userId});
   if(!ad) return res.status(403).json({success:false,message:"Not owner"});
   await Ad.deleteOne({_id:ad._id});
   res.json({success:true});
 }catch(err){
   console.error("DELETE AD ERROR:",err);
   res.status(500).json({success:false,message:"Delete failed"});
 }
});

/* ================= SELL48 ================= */
app.post("/api/sell48/submit",isLoggedIn,upload.any(),async(req,res)=>{
 try{
   const photos = (req.files || []).map(file =>
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
   );

   const ad = await Sell48Ad.create({
     userId:req.userId,
     ...req.body,
     photos: photos.slice(0,8)   // ✅ अब 8 images तक allow हैं
   });

   res.json({success:true,adId:ad._id});
 }catch(err){
   console.error("SELL48 ERROR:",err);
   res.status(500).json({success:false,message:"Sell48 failed"});
 }
});

/* ================= DEALER LEADS ================= */
app.get("/api/dealer/leads",isLoggedIn,async(req,res)=>{
 try{
   const dealer=await Dealer.findOne({userId:req.userId});
   if(!dealer) return res.json([]);
   const leads=await Lead.find({dealerId:dealer._id.toString()}).populate("adId");
   res.json(leads);
 }catch(err){
   console.error("DEALER LEADS ERROR:",err);
   res.status(500).json({success:false,message:"Unable to fetch leads"});
 }
});

/* ================= LEAD USE ================= */
app.post("/api/dealer/use-lead",isLoggedIn,async(req,res)=>{
 try{
   const {leadId}=req.body;
   const dealer=await Dealer.findOne({userId:req.userId});
   if(!dealer) return res.json({success:false});

   if(dealer.leadUsed>=dealer.leadLimit)
     return res.json({success:false,message:"Limit exhausted"});

   dealer.leadUsed++;
   await dealer.save();
   await Lead.findByIdAndDelete(leadId);

   res.json({success:true});
 }catch(err){
   console.error("USE LEAD ERROR:",err);
   res.status(500).json({success:false,message:"Lead use failed"});
 }
});

/* ================= LEAD EXPIRY + ROTATION ================= */
setInterval(async()=>{
 try{
   const expired=await Lead.find({assignedAt:{$lt:new Date(Date.now()-48*60*60*1000)}});
   for(const lead of expired){
     await Lead.findByIdAndDelete(lead._id);
     await autoAssignLead(lead.adId);
   }
 }catch(err){
   console.error("LEAD ROTATION ERROR:",err);
 }
},60*1000);

/* ================= RAZORPAY ================= */
let razorpay=null;
if(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET){
 razorpay=new Razorpay({
  key_id:process.env.RAZORPAY_KEY_ID,
  key_secret:process.env.RAZORPAY_KEY_SECRET
 });
}

app.post("/api/payment/create-order",isLoggedIn,async(req,res)=>{
 try{
   if(!razorpay) return res.json({disabled:true});
   const order=await razorpay.orders.create({
    amount:req.body.amount*100,
    currency:"INR",
    receipt:"cabii_"+Date.now()
   });
   res.json(order);
 }catch(err){
   console.error("CREATE ORDER ERROR:",err);
   res.status(500).json({success:false,message:"Order creation failed"});
 }
});

app.post("/api/payment/verify",isLoggedIn,async(req,res)=>{
 try{
   const {razorpay_order_id,razorpay_payment_id,razorpay_signature,plan,leads,months}=req.body;
   const expected=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id+"|"+razorpay_payment_id)
    .digest("hex");

   if(expected!==razorpay_signature)
     return res.status(400).json({success:false});

   const expiry=new Date();
   expiry.setMonth(expiry.getMonth()+Number(months));

   await Dealer.findOneAndUpdate(
    {userId:req.userId},
    {membershipPlan:plan,leadLimit:Number(leads),leadUsed:0,expiryDate:expiry,isActive:true},
    {upsert:true}
   );

   res.json({success:true});
 }catch(err){
   console.error("PAYMENT VERIFY ERROR:",err);
   res.status(500).json({success:false,message:"Payment verification failed"});
 }
});

/* ================= ADS LIST ================= */
app.get("/api/ads",async(req,res)=>{
 try{
   const ads=await Ad.find().sort({createdAt:-1}).limit(50);
   res.json(ads);
 }catch(err){
   console.error("ADS LIST ERROR:",err);
   res.status(500).json({success:false,message:"Unable to fetch ads"});
 }
});

/* ================= HEALTH ================= */
app.get("/health",(req,res)=>{
  res.status(200).json({status:"CABII LIVE"});
});

/* 404 API protection */
app.use("/api", (req,res)=>{
  res.status(404).json({message:"API route not found"});
});

/* serve homepage only */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/ping",(req,res)=>{
  res.json({status:"ok"});
});


  app.listen(PORT, ()=>{
    console.log("🚀 CABII SERVER RUNNING ON PORT " + PORT);
  });
})
.catch(err=>{
  console.error("❌ MongoDB FAILED:", err);
  process.exit(1);
});