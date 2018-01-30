const express = require('express');
const app = express();
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser')
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const crypto = require('crypto');
const PORT = process.env.PORT || 8080 //default port 8080 

let userDB = [
    {id: "aji398", email: 'bob@bob.com', password: 'test1234', urls: `www.netflix.com`}
]

let urlDatabase = [];
let ownUrlDB = []

function keyedDB(links, user){
    for (let key in links) {
        if (links[key].userId === user) {
          ownUrlDB.push(links[key]);
        }
    }
    return ownUrlDB
}

function generateRandomString() {
    let urlHash = crypto.randomBytes(3).toString('hex');
    return urlHash
}

function findUser(user_id, DB) {
    let foundUser = null
    for (user of DB) {
        console.log(user);
        if (user_id === user.id) {
            foundUser = user
        return foundUser
        } 
    }
    console.log("can't find user")
    return foundUser
}

//GET FUNCTIONS BEGIN HERE
app.get("/", (req, res) => {
    if (req.cookies['user_id']) {
        let user = findUser(req.cookies["user_id"], userDB)
        let templateVars = {urls: ownUrlDB, user: user}
        res.render("urls_index", templateVars)
    } else {
    res.redirect("/urls");
    }
});


//URLs ROUTE: Shows the index page coding
app.get("/urls", (req, res) => {
    if (req.cookies['user_id']) {
        let user = findUser(req.cookies["user_id"], userDB);
        console.log(user)
        let templateVars = { urls: ownUrlDB, user: user };
        res.render("urls_index", templateVars);
    } else {
        res.redirect("/register")
    }
});

//URLs ROUTE: Shortens the URL
app.post("/urls", (req, res) => {
    console.log(req.body);  
    let smolURL = generateRandomString();
    urlDatabase.push({longURL: req.body.longURL, shortURL: smolURL, userId: req.cookies["user_id"]});
    keyedDB(urlDatabase, req.cookies["user_id"]);
    res.redirect("/urls");    
 });

//URLs NEW ROUTE: Visitor hits or is redirected to the urls/new page
app.get("/urls/new", (req, res) => {
    if (req.cookies["user_id"]){
    let user = findUser(req.cookies["user_id"], userDB)
    let templateVars = {urls: ownUrlDB, userId: req.cookies["user_id"], user: user}
    console.log(ownUrlDB)
    res.render("urls_new", templateVars)
    } else {
    res.redirect("/login");
    }
 });

//REDIRECT ROUTE: Visitor enters /u/Short-URL and is redirected to the desired site
 app.get("/u/:smol", (req, res) => {
    urlDatabase.forEach(function(url){
        if (req.params.smol === url.shortURL) {
         res.redirect(url.longURL);
        }
    });
   });

//EDIT ROUTE: Change which long URL is appended to the shortURL
app.get("/urls/:id", (req, res) => {
    if (req.cookies['user_id'] === urlDatabase[userId]) {
    let foundUser = findUser(req.cookies["user_id"], userDB); 
    let templateVars = { user: foundUser, shortURL: req.params.id, longURL: ownUrlDB.longURL };
    res.render("urls_show", templateVars);
    } else {
        res.redirect("urls_new");
    }
});

app.post("/urls/:id", (req, res) => {
    console.log(req.body);  
    for (links of ownUrlDB) {
        if (links.shortURL === req.params.id) {
            links.longURL = req.body.longURL
            break;
        }
    }
    res.redirect("/urls");    
 });

 //DELETE ROUTE: User can delete the short URL value

 app.post("/urls/:id/delete", (req, res) => {
    console.log(req.params.id); 
    let site = req.params.id
    let newDB = []
    for (links of ownUrlDB) {
        if (links.shortURL !== site) {
            newDB.push(links)
        }
    }
    urlDatabase = newDB
    console.log(`${site} has been removed!`)
    console.log(urlDatabase)
    res.redirect("/urls");
});

//REGISTER ROUTE: User can register on the site
app.get('/register', (req, res) => {
    if (req.cookies["user_id"]) {
    let user = findUser(req.cookies["user_id"], userDB)
        res.redirect("/urls")
    } else {
        let templateVars = {user: null}
        res.render("urls_register", templateVars)
    } 
});

app.post('/register', (req, res) => {
    for(let user_id in userDB) {
        if(userDB[user_id].email === req.body.email) {
            res.send("Already registered")
            return
        }
    }
    if (req.body.email === "" || req.body.password === "") {
        res.status(400)
        res.send("Nah,son.")
    } 
    let newId = generateRandomString()
    userDB.push({id: newId, email: req.body.email, password: req.body.password});
    res.cookie("user_id", newId)
    console.log(`${req.body.email} has registered`)
    console.log(userDB)
    res.redirect("/urls"); 
});

//LOGIN ROUTE: User can login
app.get("/login", (req, res) => {
    let user = findUser(req.cookies["user_id"], userDB)
    if (user){
        res.redirect("/urls")
    } else {
        let templateVars = {user: user}
        res.render("urls_login", templateVars)
    }
});

app.post("/login", (req, res) => {     
    
    for (let user of userDB) {
       if (req.body.email == user.email && req.body.password == user.password) {
            res.cookie("user_id", user.id)
            console.log(`Thanks for logging in ${req.body.email}`)
            res.redirect("/urls")
            return
       }
   }  
            res.status(400)
            res.redirect("/login")
        
    res.redirect("/urls"); 
 });

app.post ("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect("/urls");
})


//LISTEN ROUTE: Server listens on port 8080
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});