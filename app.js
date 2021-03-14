//jshint esversion:6
require("dotenv").config();//put on top
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fetch = require('node-fetch');
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(session({
  secret:"This secret is used to hash the session with HMAC",
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/travelDB", {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.set("useCreateIndex",true);//deprecation warnig
const userSchema= new mongoose.Schema({
  email:String,
  password:String,
  googleId:String,
  facebookId: String
});

userSchema.plugin(passportLocalMongoose);//ADD BEFORE MONGOOSE MODEL
userSchema.plugin(findOrCreate);


const User=mongoose.model("User",userSchema);


passport.use(User.createStrategy());//bellow mongoose model

passport.serializeUser(function(user, done) {//bellow mongoose model
  done(null, user);
});
passport.deserializeUser(function(user, done) {//bellow mongoose model
  done(null, user);
});

passport.use(new GoogleStrategy({//NEED TO BE BELLOW SERIALIZER AND DESERIALIZER
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/checkout",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ username: profile.id}, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({//NEED TO BE BELLOW SERIALIZER AND DESERIALIZER
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/checkout"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ username: profile.id}, function (err, user) {
      return cb(err, user);
    });
  }
));

// ******####################country/state api##########********************************


app.get("/", function(req, res) {
  res.render("home");
});


app.get("/auth/google",
  passport.authenticate("google",{ scope: ["profile","email"]}));

app.get("/auth/facebook",
  passport.authenticate("facebook",{ scope: ["public_profile"]}));

  app.get("/auth/google/checkout",
    passport.authenticate("google", { failureRedirect: "/login"}),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect("/checkout");
    });

    app.get("/auth/facebook/checkout",
      passport.authenticate("facebook", { failureRedirect: "/login"}),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect("/checkout");
      });


app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/contact", function(req, res) {
  res.render("contact");
});

app.get("/checkout", function(req, res) {
  if(req.isAuthenticated()){
    res.render("checkout");
  }else{
    res.redirect("/login");
  };
  const requestOptions = {
  method: 'GET',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

  var myHeaders

  fetch("https://api.")

});


app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});



app.get("/about", function(req, res) {
  res.render("about");
});

app.get("/plans", function(req, res) {
  res.render("plans");


});

// *****BELLOW ITS THE CODE FOR REGISTRATION IN THE DB SECRETS
app.post("/register",function(req,res){

  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/checkout");
      });
    };
  });
});


app.route('/login')
  .get(function(req, res) {
    res.render('login');
  })
  .post(function(req, res) {
    passport.authenticate('local', {
      successRedirect: '/checkout',
      failureRedirect: '/login',
    })(req, res);
  })


app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
