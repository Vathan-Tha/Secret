// jshint esversion:6
require('dotenv').config({ path: '.env' });

const express = require("express");
const bodyParser = require('body-parser');
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", async function(req, res){
    const email = req.body.email;
    const password = req.body.password;

    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email: email,
            password: hashedPassword
        });

        await newUser.save();
        res.render("secrets");
    } catch(err){
        console.error(err);
    }
});

app.post("/login", async function(req, res){
    const userEmail = req.body.email;
    const userPassword = req.body.password;

    try{
        const foundUser = await User.findOne({ email: userEmail });
        if (foundUser) {
            const match = await bcrypt.compare(userPassword, foundUser.password);
            if (match) {
                res.render("secrets");
            } else {
                console.log("Incorrect password");
            }
        } else {
            console.log("User not found");
        }
    } catch(err){
        console.log(err);
    }
});

app.listen(3000, function(){
    console.log("Server has started!");
});
