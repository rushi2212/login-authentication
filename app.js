const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const encrpypt = require('mongoose-encryption');


const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/secrets");

const trySchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = "thisisasecret;"
trySchema.plugin(encrpypt, { secret: secret, encryptedFields: ["password"] });

const item = mongoose.model("User", trySchema);

app.get('/', function (req, res) {
    res.render("home");
});

app.get('/register', function (req, res) {
    res.render("register");
});

app.post("/login", async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await item.findOne({ email: username });

        if (foundUser) {
            if (foundUser.password === password) {
                res.render("secrets");
            } else {
                res.send("Incorrect password.");
            }
        } else {
            res.send("User not found.");
        }

    } catch (err) {
        console.log(err);
        res.send("Error occurred while logging in.");
    }
});


app.get('/login', function (req, res) {
    res.render("login");
});

app.get('/logout', function (req, res) {
            res.redirect('/');
});


app.post('/register', async function (req, res) {
    try {
        const newUser = new item({
            email: req.body.username,
            password: req.body.password
        });

        await newUser.save(); 
        res.render("secrets");

    } catch (err) {
        console.log(err);
        res.send("Error occurred while registering.");
    }
});

app.listen(5000, function () {
    console.log("Server Started");
});
