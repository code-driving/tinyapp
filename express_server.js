const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { render } = require("ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// set the view engine to ejs
app.set("view engine", "ejs");

//import the helper functions
const {
  generateRandomString,
  updateURL,
  checkUserByEmail,
  authUserByEmailAndPassword,
  createUser,
  urlsForUser,
  verifyID
} = require("./helpers");
//import databases
const { urlDatabase, users } = require("./constants");

app.get("/", (req, res) => {
  const newUserId = req.cookies["user_id"];
  const user = users[newUserId];
  if (user) {
    res.redirect("/urls");
    return;
  }
  res.redirect("/login");
});
//show the login page
app.get("/login", (req, res) => {
  const newUserId = req.cookies["user_id"];
  const user = users[newUserId];
  const templateVars = { user };
  res.render("login_page", templateVars);
});

//create login handler
app.post("/login", (req, res) => {
  //extract the information from the form
  const { email, password } = req.body;
  //perform the authentication of the user
  const user = authUserByEmailAndPassword(email, password);
  const templateVars = { user: user };
  if (email === "") {
    res.status(400).send("Error: Please enter your email");
  }
  if (password === "") {
    res.status(400).send("Error: Please enter your password");
  }
  if (!user) {
    // res
    //   .status(403)
    //   .send(
    //     "The user with the provided email or password cannot be found. Please try again."
    //   );
    res.render("error", templateVars);
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

//show the register page
app.get("/register", (req, res) => {
  const newUserId = req.cookies["user_id"];
  const user = users[newUserId];
  const templateVars = { user };
  res.render("registration_page", templateVars);
});

//create registration handler
app.post("/register", (req, res) => {
  //extract the information from the form
  const { email, password } = req.body;
  //check by email if the user already exists
  const userExists = checkUserByEmail(email);
  //if the user was not found => create a new one
  if (email === "") {
    res.status(400).send("Error: Please enter your email");
  }
  if (password === "") {
    res.status(400).send("Error: Please enter your password");
  }
  if (userExists) {
    res.status(400).send("This username is already registered");
  }
  const newUserId = createUser(email, password);
  //set cookie
  res.cookie("user_id", newUserId);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const newUserId = req.cookies["user_id"];
  const user = users[newUserId];
  const userUrls = urlsForUser(newUserId, urlDatabase);
  const templateVars = { urls: userUrls, user: newUserId };
  // check if the user is logged in
  if (!user) {
    return res.render("error", templateVars);
  } else {
    res.render("urls_index", templateVars);
  }
});
// app.get("/urls", (req, res) => {
//   const newUserId = req.cookies["user_id"];
//   const user = users[newUserId];
//   const templateVars = { urls: urlDatabase, user };
//   // check if the user is logged in
//   if (newUserId) {
//     res.render("urls_index", templateVars);
//   } else {
//     res.render("error", templateVars);
//   }
// });

//show the url submission form
app.get("/urls/new", (req, res) => {
  const newUserId = req.cookies["user_id"];
  const user = users[newUserId];
  const templateVars = { user };
  if (!user) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});

//receive the form submission
app.post("/urls", (req, res) => {
  const newUserId = req.cookies["user_id"];
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

app.get("/u/:shortURL", (req, res) => {
  //get the value of the shortURL from req.params
  const shortURL = req.params.shortURL;
  //retrieve the value of the longURL from the database object
  const newLongURL = urlDatabase[shortURL].longURL;
  //redirect the client to the longURL webpage
  res.redirect(newLongURL);
});


app.get("/urls/:shortURL", (req, res) => {
  const newUserId = req.cookies["user_id"];
  const user = users[newUserId];
  const userUrls = urlsForUser(newUserId, urlDatabase);
  const shortURL = req.params.shortURL;
  const longURL = userUrls[shortURL]['longURL']
  const templateVars = {
    shortURL, longURL, user 
  };
  res.render("urls_show", templateVars);
});
// app.get("/urls/:shortURL", (req, res) => {
//   const newUserId = req.cookies["user_id"];
//   const user = users[newUserId];
//   //create templateVars
//   const templateVars = {
//     shortURL: req.params.shortURL,
//     longURL: urlDatabase[req.params.shortURL],
//     user,
//   };
//   res.render("urls_show", templateVars);
// });

//delete URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  const newUserId = req.cookies["user_id"];
  const user = users[newUserId];
  //get the value of the shortURL  from req.params
  const shortURL = req.params.shortURL;
  //delete it from the user's urls
  if (!verifyID(newUserId, shortURL, urlDatabase)) {
    res.status(403).send('Unfortunately, this does not belong to you. You cannot delete it.')
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
  //update the url in the database
  updateURL(shortURL, longURL);
  //redirect the client to the urls_index page
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
