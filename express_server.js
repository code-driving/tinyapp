const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const { render } = require("ejs");

const PORT = process.env.PORT || 8080;
const app = express();

app.use(
  cookieSession({
    name: "session",
    keys: ["user_id"],
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// set the view engine to ejs
app.set("view engine", "ejs");

//import the helper functions
const {
  generateRandomString,
  getUserByEmail,
  createUser,
  authUserByEmailAndPassword,
  urlsForUser,
  verifyID,
  isAvailable,
} = require("./helpers");

//import databases
const { urlDatabase, users } = require("./constants");

//create a middleware function
const setUser = (req, res, next) => {
  const newUserId = req.session["user_id"];
  const userObj = users[newUserId] || null;
  req.user = userObj;

  next();
};

app.use(setUser);

app.get("/", (req, res) => {
  const newUserId = req.session["user_id"];
  const user = users[newUserId];
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = { user };
    res.render("login_page", templateVars);
  }
});

//show the register page
app.get("/register", (req, res) => {
  const newUserId = req.session["user_id"];
  const user = users[newUserId];
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = { user };
    res.render("registration_page", templateVars);
  }
  // const templateVars = { user: null };
});

//create registration handler
app.post("/register", (req, res) => {
  //extract the information from the form
  const { email, password } = req.body;
  //check by email if the user already exists
  const userExists = getUserByEmail(email, users);
  if (email === "") {
    res.status(400).send("Please enter your email");
  } else if (password === "") {
    res.status(400).send("Please enter your password");
  } else if (userExists) {
    res.status(400).send("This email is already registered");
  } else {
    const user = createUser(email, password);
    req.session["user_id"] = user;
    res.redirect("/urls");
  }
});

//show the login page
app.get("/login", (req, res) => {
  const newUserId = req.session["user_id"];
  const user = users[newUserId];
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = { user };
    res.render("login_page", templateVars);
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = authUserByEmailAndPassword(email, password);
  if (user) {
    req.session["user_id"] = user.id;
    res.redirect("/urls");
  } else {
    res.status(401).send("Your email and password do not match");
  }
});

app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const newUserId = req.session["user_id"];
  const user = users[newUserId];
  const userUrls = urlsForUser(newUserId, urlDatabase);
  const templateVars = { urls: userUrls, user: user };
  // check if the user is logged in
  if (!user) {
    return res.render("error", templateVars);
  } else {
    res.render("urls_index", templateVars);
  }
});

//receive the form submission
app.post("/urls", (req, res) => {
  const newUserId = req.session["user_id"];
  const user = users[newUserId];
  if (!user) {
    res.redirect("/login");
    return;
  }
  //update shortURL with a generated value
  const shortURL = generateRandomString(6);
  //update longURL
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: newLongURL, userID: newUserId };
  //redirect the client to the short url page
  res.redirect(`/urls/${shortURL}`);
});

//show the url submission form

app.get("/urls/new", (req, res) => {
  const newUserId = req.session["user_id"];
  const user = users[newUserId];
  if (!user) {
    res.redirect("/login");
    return;
  }
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const newUserId = req.session["user_id"];
  const user = users[newUserId];
  const userUrls = urlsForUser(newUserId, urlDatabase);
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL]) {
      if (user.id !== urlDatabase[shortURL].userID) {
        res.send("This URL does not belong to you");
      } else {
        const longURL = userUrls[shortURL]["longURL"];
        const templateVars = {
          shortURL,
          longURL,
          user
        };
        res.render("urls_show", templateVars);
      }
    } else {
    res.send("This url does not exist");
  }
});
// app.get("/urls/:shortURL", (req, res) => {
//   const newUserId = req.session["user_id"];
//   const user = users[newUserId];
//   if (!user) {
//     res.redirect("/register");
//     return;
//   }
//   const userUrls = urlsForUser(newUserId, urlDatabase);
//   const shortURL = req.params.shortURL;
//   const longURL = userUrls[shortURL]["longURL"];
//   const templateVars = {
//     shortURL,
//     longURL,
//     user,
//   };
//   res.render("urls_show", templateVars);
// });

app.get("/u/:shortURL", (req, res) => {
  //get the value of the shortURL from req.params
  const shortURL = req.params.shortURL;
  //retrieve the value of the longURL from the database object
  const newLongURL = urlDatabase[shortURL].longURL;
  //redirect the client to the longURL webpage
  res.redirect(newLongURL);
});

//delete URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  const newUserId = req.session["user_id"];
  const user = users[newUserId];
  //get the value of the shortURL  from req.params
  const shortURL = req.params.shortURL;
  //delete it from the user's urls
  if (!verifyID(newUserId, shortURL, urlDatabase)) {
    res.status(401).send("Sorry. You cannot delete it.");
  }
  delete urlDatabase[shortURL];
  //redirect the client to the urls_index page
  res.redirect("/urls");
});

//update a URL recourse
app.post("/urls/:shortURL", (req, res) => {
  //get the value of the id from req.params
  const shortURL = req.params.shortURL;
  //get the value of longURL from the input from req.body
  const longURL = req.body.longURL;
  //set cookies
  const newUserId = req.session["user_id"];
  const user = users[newUserId];
  if (!verifyID(newUserId, shortURL, urlDatabase)) {
    res.status(401).send("Sorry. You cannot update it.");
  }
  //update the url in the database
  urlDatabase[shortURL]["longURL"] = longURL;
  //redirect the client to the urls_index page
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
