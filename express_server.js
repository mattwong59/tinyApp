const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "https://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2Random": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.end("Hello", templateVars);
});

app.get("/urls", (req, res) => {
  const currentUser = users[req.cookies["user_ID"]];
  let templateVars = {
    urls: urlDatabase,
    user: currentUser
  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: req.cookies["user_ID"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: req.cookies["user_ID"]
    };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body</html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

app.post("/urls", (req, res) => {
  var key = generateRandomString()
  urlDatabase[key] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls/${key}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect ("/urls");
});

app.post("/login", (req, res) => {
  let registeredEmail;
  let correctPassword;
  let userID;

  for(let user of Object.values(users)) {
    if(user.email === req.body.email) {
      registeredEmail = true;
      userID = user.id;
    };
  };

  if(!registeredEmail) {
    res.setstatusCode = 401;
    res.redirect("/register")
  };

  for(let user of Object.values(users)) {
    if(user.password === req.body.password) {
      correctPassword = true;
    };
  };

  if(!correctPassword) {
    res.setstatusCode = 401;
    res.redirect("/login");
  };

  if(registeredEmail === true && correctPassword === true) {
    res.cookie("user_ID", userID);
    return res.redirect("/urls");
  };
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_ID");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("register")
});

app.post("/register", (req, res) => {

  const {email, password} = req.body;

  for (let user of Object.values(users)) {
    if (user.email === email) {
      res.statusCode = 400;
      return res.send("Email already exists");
    };
  };

  if (email && password) {
    let userID = generateRandomString();
    res.cookie("user_ID", userID);
    users[userID] = {id: userID, email, password};
    return res.redirect("/urls");
  } else {
    res.statusCode = 400;
    return res.send("Email or password cannot be empty. Please try again.");
  };
 console.log(users);
});

app.get("/login", (req, res) => {
  let templateVars = { user: req.cookies["user_ID"] };
  res.render("login");
});

app.listen(PORT, () => {
  console.log (`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
}
