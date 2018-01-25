const express = require('express');
const app = express();
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser')
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const crypto = require('crypto');
const PORT = process.env.PORT || 8080 //default port 8080 


let urlDatabase = [
    {longURL:'http://www.lighthouselabs.ca', shortURL:'b2xVn2'},
    {longURL: 'http://www.google.com', shortURL: '9sm5xK'},
    {longURL: 'http://www.twitter.com', shortURL: '29ru23'}
];

let userDB = []

//GET FUNCTIONS BEGIN HERE
app.get("/", (req, res) => {
    res.redirect("/urls");
});

function generateRandomString() {
    let urlHash = crypto.randomBytes(3).toString('hex');
    return urlHash
}

//Shows the index page coding
app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase, username: req.cookies["username"], };
    res.render("urls_index", templateVars);
});

//Visitor hits or is redirected to the urls/new page
app.get("/urls/new", (req, res) => {
    let templateVars = {username: req.cookies["username"]}
    res.render("urls_new", templateVars);
 });

//Change which long URL is appended to the shortURL
app.get("/urls/:id", (req, res) => {
    let templateVars = { shortURL: req.params.id, longURL: urlDatabase.longURL };
    res.render("urls_show", templateVars);
});

//Login function
app.get("/login", (req, res) => {
    let templateVars = { login: req.body.id, username: req.cookies["username"] };
    req.cookies.forEach(function(user) {
        if (userDB.user === req.cookies["username"]) {
            console.log(`${user} is already logged in!`);
        } else {
            console.log(`${userDB.user} just logged in`)
        }
    });
    res.render("urls_index", templateVars);
});

//POST FUNCTIONS BEGIN HERE

app.post("/urls", (req, res) => {
    console.log(req.body);  
    var newURL = generateRandomString();
    urlDatabase.push({longURL: req.body.longURL, shortURL: newURL})
    res.redirect("/urls");    
 });

 //Post username
  app.post("/login", (req, res) => {
    let loginID = req.body.username.toLowerCase();
    userDB.forEach(function(user) {
         if (user === loginID) {
        console.log(`${user} is already logged in.`)
        } else {
        console.log(`${loginID} has logged in!`);  
        userDB.push(loginID)
        res.cookie('username', `${loginID}`)
        console.log(userDB, `${req.cookies["username"]} checked in`);
        }
    });
    res.redirect("/urls");    
 });
app.post("/urls/:id", (req, res) => {
    console.log(req.body);  
    for (links of urlDatabase) {
        if (links.shortURL === req.params.id) {
            links.longURL = req.body.longURL
            break;
        }
    }
    res.redirect("/urls");    
 });

app.post("/urls/:id/delete", (req, res) => {
    console.log(req.params.id); 
    let site = req.params.id
    let newDB = []
    for (links of urlDatabase) {
        if (links.shortURL !== site) {
            newDB.push(links)
        }
    }
    urlDatabase = newDB
    console.log(`${site} has been removed!`)
    res.redirect("/urls");
});

app.post("/urls", (req, res) => {
   console.log(req.body);  
   var newURL = generateRandomString();
   urlDatabase.push({longURL: req.body.longURL, shortURL: newURL})
   res.redirect("/urls");    
});


app.get("/u/:smol", (req, res) => {
   urlDatabase.forEach(function(url){
       if (req.params.smol === url.shortURL) {
        res.redirect(url.longURL);
       }
   });
  });

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});