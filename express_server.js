const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession ({
  name: "session",
  keys: ["fnjdsiox3nk8nsh3bhcsamhj52"]
}));

const urlDatabase = {
  "b2xVn2": {
    urlID: "b2xVn2",
    url: "https://www.lighthouselabs.ca",
    uid: "userRandomID"
  },
  "9sm5xK": {
    urlID: "9sm5xK",
    url: "https://www.google.ca",
    uid: "user2RandomID"
  },
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "1"
  },
  "user2Random": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function checkURLForUser(url, userId){
  for(var key in urlDatabase){
    if(urlDatabase[key].urlID===url && urlDatabase[key].uid === userId){
      return true;
    }
  }
}

function checkShortURL(shortURL) {
  if(urlDatabase.hasOwnProperty(shortURL)){
    return true;
  }
}

function urlsForUser(id) {
  let userURLs = {};
  for (let shortURLs in urlDatabase) {
    if(id === urlDatabase[shortURLs].uid) {
      userURLs[shortURLs] = urlDatabase[shortURLs].url;
    }
  }
  return userURLs;
}

function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
}

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (req.session.user_ID) {
    let user_id = req.session.user_ID;
    let currentUser = users[user_id];
    let userURLs = urlsForUser(user_id);
    let templateVars = {
      urls: userURLs,
      user: currentUser
  };
  res.render("urls_index", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_ID) {
    let user_id = req.session.user_ID;
    let currentUser = users[user_id];
    let userURLs = urlsForUser(user_id);
    let templateVars = {
      urls: userURLs,
      user: currentUser
  };
  res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  let user_id = req.session.user_ID;
  let currentUser = users[user_id];
  let userURLs = urlsForUser(user_id);
  var result = checkURLForUser(req.params.id, user_id);
  if(result){
    let templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].url,
      urls: userURLs,
      user: currentUser,
      creatingUser: urlDatabase[req.params.id].uid
    };
    res.render("urls_show", templateVars);
  } else {
    res.send('url does not belong to you');
  }

});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body</html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  let test = checkShortURL(req.params.shortURL);
  if(test){
    let longURL = urlDatabase[req.params.shortURL].url
    res.redirect(longURL);
  } else {
    res.send("Short url does not exist");
  }
})

app.get("/login", (req, res) => {
  let templateVars = { user: req.session.user_ID };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  res.render("register")
});

app.post("/urls", (req, res) => {
  var key = generateRandomString()
  urlDatabase[key] = {urlID: key, url: req.body.longURL, uid: req.session.user_ID};
  if(req.session.user_ID){
    res.redirect(`http://localhost:8080/urls/${key}`);
  } else {
    res.send("Please login");
  }
});


app.post("/urls/:id/delete", (req, res) => {
  if(req.session.user_ID) {
   delete urlDatabase[req.params.id];
   res.redirect("/urls");
  } else {
    res.send("<h1>Please login</h1>");
  }
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].url = req.body.newURL;
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
    res.status(403);
    res.redirect("/register")
  };

  for(let user of Object.values(users)) {
    if(user.password === req.body.password) {
      if(!correctPassword) {
        res.status(403);
        res.redirect("/login");
      };
      correctPassword = true;
    };
  };



  for(let user of Object.values(users)) {
    if(registeredEmail === true && bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_ID = userID;
    };
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const {email, password} = req.body;

  for(let user of Object.values(users)) {
    if (user.email === email) {
      res.status(400);
      return res.send("<h1>Email already exists</h1>");
    };
  };

  if (email && password) {
    let userID = generateRandomString();
    req.session.user_ID = userID;
    users[userID] = {id: userID, email, password: bcrypt.hashSync(password, 10)};
    return res.redirect("/urls");
  } else {
    res.status(400);
    return res.send("<h1>Email or password cannot be empty. Please try again.</h1>");
  };
});

app.listen(PORT, () => {
  console.log (`Example app listening on port ${PORT}!`);
});
