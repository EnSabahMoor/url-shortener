var express = require('express');
var app = express();
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var crypto = require('crypto');
var PORT = process.env.PORT || 8080 //default port 8080 



let urlDatabase = [
    {longURL:'http://www.lighthouselabs.ca', shortURL:'b2xVn2'},
    {longURL: 'http://www.google.com', shortURL: '9sm5xK'},
    {longURL: 'http://www.twitter.com', shortURL: '29ru23'}
];

app.get("/", (req, res) => {
    res.redirect("/urls");
});

function generateRandomString() {
    let urlHash = crypto.randomBytes(3).toString('hex');
    return urlHash
}

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
 });

app.get("/urls/:id", (req, res) => {
    let templateVars = { shortURL: req.params.id, longURL: urlDatabase.longURL };
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

app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});