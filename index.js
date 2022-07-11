const express = require('express')
const app = express()
app.use(express.json())
require('dotenv').config()
const path = require('path')
const http = require('http')
const mongoose = require('mongoose')
const server = http.createServer(app)
const mongo_url = process.env.mongodb_url
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const facebookStrategy = require('passport-facebook').Strategy
//const User = require('../model/user.mongo')


passport.use(new facebookStrategy({
    clientID        : process.env.client_id,
    clientSecret    : process.env.client_secret,
    callbackURL     : "/facebook/callback",
    profileFields   : ['id', 'displayName', 'name', 'gender', 'picture.type(large)','email']
    
},function(accessToken, refreshToken, profile, done) {
    //console.log(profile)
    return done(null,profile)
}))

passport.serializeUser((user,done)=>{
    done(null,user.id)
})
passport.deserializeUser((id,done)=>{
    //console.log('in deserialize '+user)
    return done(id,null)
})

app.use(session({
    secret: "Harvey_Specter",
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())

app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/facebook/callback',
    passport.authenticate('facebook',{
    failureRedirect : '/',
    successRedirect: '/profile'
}),(req,res)=>{
    console.log('facebook called back')
})

app.get('/auth/facebook',passport.authenticate('facebook',{
    scope: 'user_photos,email'
}))

app.get('/logout',(req,res)=>{
    req.logOut()
    res.redirect('/')
})

function isLoggedIn(req,res,next)
{
    console.log('from log')
    if(req.isAuthenticated())
    {
        return next()
    }
    res.redirect('/')
}

app.get('/profile',isLoggedIn,(req,res)=>{
    res.send('you are authenticated')
    //res.render('profile',{user:req.user})
})

server.listen(8000,async(req,res)=>{
    await mongoose.connect(mongo_url,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(()=>{
        console.log('mongodb connected')
    }).catch(err=>console.log(err))
    console.log('server is connected')
})