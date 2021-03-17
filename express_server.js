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
const { generateRandomString, updateURL, checkUserByEmail, authUserByEmailAndPassword, createUser } = require("./helpers");
//import databases
const { urlDatabase, usersList, users } = require("./constants");


//show the register page
app.get("/register", (req, res) => {
  const newUserId = req.cookies['user_id'];
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
  if (!userExists) {
    const newUserId = createUser(email, password);
    //set cookie
    res.cookie("user_id", newUserId);
    console.log(newUserId);
    console.log(users)
    res.redirect("/urls");
  } else {
    res.status(400).send('This username is already registered');
  }
});




app.get("/urls", (req, res) => {
  const newUserId = req.cookies['user_id'];
  const user = users[newUserId];
  const templateVars = { urls: urlDatabase, user};
  res.render("urls_index", templateVars);
  //check if the user is logged in
  // if (newUserId) {
  //   res.render(res.render("urls_index", templateVars));
  // } else {
  //   res.status(401).send('Please login');
  // }
});

//show the url submission form
app.get("/urls/new", (req, res) => {
  const newUserId = req.cookies['user_id'];
  const user = users[newUserId];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

//receive the form submission
app.post("/urls", (req, res) => {
  //update shortURL with a generated value
  const shortURL = generateRandomString(6);
  //update longURL
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  //redirect the client to the short url page
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  //get the value of the shortURL from req.params
  const shortURL = req.params.shortURL;
  //retrieve the value of the longURL from the database object
  const longURL = urlDatabase[shortURL];
  //redirect the client to the longURL webpage
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const newUserId = req.cookies['user_id'];
  const user = users[newUserId];
  //create templateVars
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user
  };
  res.render("urls_show", templateVars);
});

//delete URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  //get the value of the shortURL  from req.params
  const shortURL = req.params.shortURL;
  console.log(shortURL);
  //delete it from the database
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

// app.get('/urls/:id', (req, res) => {
// const id = req.params.id;
// const longURL = req.body.longURL;
// render('urls_show', { id: longURL });
// });


// app.post('/login', (req, res) => {
//   const usernameValue = req.body.username;
//   res.cookie('username', usernameValue);
//   console.log(usernameValue)
//   res.redirect('/urls')
// });

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
