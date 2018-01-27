const express = require('express');
const app = express();
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser')
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const crypto = require('crypto');
const PORT = process.env.PORT || 8080 //default port 8080 


const urlDatabase = [
    {longURL:'http://www.lighthouselabs.ca', shortURL:'b2xVn2'},
    {longURL: 'http://www.google.com', shortURL: '9sm5xK'},
    {longURL: 'http://www.twitter.com', shortURL: '29ru23'}
];

const userDB = {
    "aji398" : {id: "aji398", email: 'bob@bob.com', password: 'test1234'}
}

// userDB["aji398"]["email"]
// userDB.aji398.email

function findUser(user_id) {
    let foundUser = null;
        foundUser = userDB[user_id];
    if (foundUser == null) {
        console.log("No user entered")
    }
    else{
        return foundUser;
    }
}

//GET FUNCTIONS BEGIN HERE
app.get("/", (req, res) => {
    if (req.cookies['user_id']) {
        let user = findUser(req.cookies["user_id"])
        let templateVars = { urls: urlDatabase, user: user}
        res.render("urls_index", templateVars)
    } else {
    res.redirect("/urls");
    }
});

function generateRandomString() {
    let urlHash = crypto.randomBytes(3).toString('hex');
    return urlHash
}

//URLs ROUTE: Shows the index page coding
app.get("/urls", (req, res) => {
    if (req.cookies['user_id']) {
        let user = findUser(req.cookies["user_id"])
        let templateVars = { urls: urlDatabase, user: user };
        res.render("urls_index", templateVars);
    } else {
        res.redirect("/register")
    }
});

app.post("/urls", (req, res) => {
    console.log(req.body);  
    var newURL = generateRandomString();
    urlDatabase.push({longURL: req.body.longURL, shortURL: newURL})
    res.redirect("/urls");    
 });

//URLs NEW ROUTE: Visitor hits or is redirected to the urls/new page
app.get("/urls/new", (req, res) => {
    let foundUser = findUser(req.cookies["user_id"]);
    let templateVars = {user: foundUser}
    res.render("urls_new", templateVars);
 });

//REDIRECT ROUTE: Visitor enters /u/Short-URL and is redirected to the desired site
 app.get("/u/:smol", (req, res) => {
    urlDatabase.forEach(function(url){
        if (req.params.smol === url.shortURL) {
         res.redirect(url.longURL);
        }
    });
   });

//ID ROUTE: Change which long URL is appended to the shortURL
app.get("/urls/:id", (req, res) => {
           foundUser = findUser(req.cookies["user_id"]); 
    let templateVars = { user: foundUser, shortURL: req.params.id, longURL: urlDatabase.longURL };
    res.render("urls_show", templateVars);
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

 //DELETE ROUTE: User can delete the short URL value

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

//REGISTER ROUTE: User can register on the site
app.get('/register', (req, res) => {
    let user = findUser(req)
    if (user) {
        res.redirect("/urls")
    } else {
        let templateVars = {user: user}
        res.render("urls_register", templateVars)
    } 
})

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
    let user = {id: generateRandomString(), email: req.body.email, password: req.body.password}
    userDB[user.id] = user
    res.cookie("user_id", user.id)
    console.log(`${req.body.email} has registered`)
    res.redirect("/urls"); 
});

//LOGIN ROUTE: User can login
app.get("/login", (req, res) => {
    if (req.cookies["user_id"] && findUser(req)){
        res.redirect("/urls")
    } else {
    // let templateVars = {id: user_id}
        res.render("urls_login")
    }
});

app.post("/login", (req, res) => {     
    
    for (let user in userDB) {
       if (req.body.email == userDB[user].email && req.body.password == userDB[user].password) {
            res.cookie("user_id", user)
            console.log(`Thanks for logging in ${req.body.email}`)
            res.redirect("/urls")
            return
       }
   }  
            res.status(400)
            res.send("Nah,son.")
        
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