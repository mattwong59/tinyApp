var express = require ("express");
var app = express ();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require ("cookie-parser");
const bodyParser = require ("body-parser");

app.set ("view engine", "ejs");
app.use (bodyParser.urlencoded({extended: true}));
app.use (cookieParser());

var urlDatabase = {
  "b2xVn2": "https://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get ("/", (req, res) => {
  res.end ("Hello", templateVars);
});

app.get ("/urls", (req, res) => {
  console.log(req.cookies)
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get ("/urls.json", (req, res) => {
  res.json (urlDatabase);
});

app.get ("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render ("urls_new", templateVars);
});

app.get ("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
    };
  res.render ("urls_show", templateVars);
});

app.get ("/hello", (req, res) => {
  res.end ("<html><body>Hello <b>World</b></body</html>\n");
});

app.get ("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

app.post ("/urls", (req, res) => {
  var key = generateRandomString()
  urlDatabase[key] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls/${key}`);
});

app.post ("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect ("/urls");
});


app.post ("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect ("/urls");
});

app.post ("/login", (req, res) => {
  res.cookie("username",req.body.username);
  res.redirect("/urls");
});

app.post ("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.listen (PORT, () => {
  console.log (`Example app listening on port ${PORT}!`);
});

function generateRandomString () {
  return Math.random().toString(36).substr(2,6);
}
