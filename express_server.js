const express = require('express');
const app = express();
app.set("view engine", "ejs");
const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['sessionkey'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const PORT = process.env.PORT || 8080 //default port 8080 

let userDB = [
    {id: "aji398", email: 'bob@bob.com', password: 'test1234', urls: `www.netflix.com`}
]

let urlDatabase = [];

function generateRandomString() {
    let urlHash = crypto.randomBytes(3).toString('hex');
    return urlHash
}

function findUser(user_id, DB) {
    let foundUser = null
    for (user of DB) {
        if (user_id === user.id) {
            foundUser = user
        return foundUser
        } 
    }
    return foundUser
}

function getUrl(shortUrl) {
    let gotUrl = null
    for (link of urlDatabase) {
        if (shortUrl === link.shortURL) {
            gotUrl = link
            return gotUrl
        }
    }
    return gotUrl
}

//GET FUNCTIONS BEGIN HERE
app.get("/", (req, res) => {
    if (req.session['user_id']) {
        let user = findUser(req.session["user_id"], userDB)
        let templateVars = {urls: urlDatabase, user: user}
        res.render("urls_index", templateVars)
    } else {
    res.redirect("/urls");
    }
});


//URLs ROUTE: Shows the index page coding
app.get("/urls", (req, res) => {
    if (req.session['user_id']) {
        let user = findUser(req.session["user_id"], userDB);
        let userUrls = []
        for (link of urlDatabase) {
            if (user.id === link.userId) {
                userUrls.push(link);
            }
        }
        let templateVars = { urls: userUrls, user: user };
        res.render("urls_index", templateVars);
    } else {
        res.redirect("/register")
    }
});

//URLs ROUTE: Shortens the URL
app.post("/urls", (req, res) => { 
    let smolURL = generateRandomString();
    urlDatabase.push({longURL: req.body.longURL, shortURL: smolURL, userId: req.session["user_id"]});
    res.redirect("/urls");    
 });

//URLs NEW ROUTE: Visitor hits or is redirected to the urls/new page
app.get("/urls/new", (req, res) => {
    if (req.session["user_id"]){
    let user = findUser(req.session["user_id"], userDB)
    let templateVars = {urls: urlDatabase, userId: req.session["user_id"], user: user}
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
    let foundUser = findUser(req.session["user_id"], userDB);
    let foundUrl = getUrl(req.params.id) 
    if (foundUser.id === foundUrl.userId) {
        let templateVars = { user: foundUser, shortURL: req.params.id, longURL: urlDatabase.longURL };
        res.render("urls_show", templateVars);
    } else {
        res.status(401);
        res.send("You are not authorized to edit this code")
    }
});

app.post("/urls/:id", (req, res) => { 
    for (links of urlDatabase) {
        if (links.shortURL === req.params.id) {
            links.longURL = req.body.longURL
            break;
        }
    }
    res.redirect("/urls");    
 });

 //DELETE ROUTE: User can delete the short URL value

 app.post("/urls/:id/delete", (req, res) => { 
    let site = req.params.id
    let newDB = []
    for (links of urlDatabase) {
        if (links.shortURL !== site) {
            newDB.push(links)
        }
    }
    urlDatabase = newDB
    res.redirect("/urls");
});

//REGISTER ROUTE: User can register on the site
app.get('/register', (req, res) => {
    if (req.session["user_id"]) {
    let user = findUser(req.session["user_id"], userDB)
        res.redirect("/urls")
    } else {
        let templateVars = {user: null}
        res.render("urls_register", templateVars)
    } 
});

app.post('/register', (req, res) => {
    for(let user_id in userDB) {
        if(userDB[user_id].email === req.body.email) {
            res.redirect("/login")
            return
        }
    }
    if (req.body.email === "" || req.body.password === "") {
        res.status(400)
        res.send("Nah,son.")
    } 
    let newId = generateRandomString()
    const password = req.body.password
    const hashedPassword = bcrypt.hashSync(password, 10);
    userDB.push({id: newId, email: req.body.email, password: hashedPassword});
    req.session["user_id"] = newId
    res.redirect("/urls"); 
});

//LOGIN ROUTE: User can login
app.get("/login", (req, res) => {
    let user = findUser(req.session["user_id"], userDB)
    if (user){
        res.redirect("/urls")
    } else {
        let templateVars = {user: user}
        res.render("urls_login", templateVars)
    }
});

app.post("/login", (req, res) => {     
    for (let user of userDB) {
       if (req.body.email == user.email && bcrypt.compareSync(req.body.password, user.password)) {
            req.session["user_id"] = user.id;
            res.redirect("/urls");
            return
       }
   }  
            res.status(400)
            res.redirect("/login")
        
    res.redirect("/urls"); 
 });

app.post ("/logout", (req, res) => {
    req.session = null;
    res.redirect("/urls");
})


//LISTEN ROUTE: Server listens on port 8080
app.listen(PORT, () => {
    console.log(`TinyApp listening on port ${PORT}!`);
});