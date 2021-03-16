const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// set the view engine to ejs
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  //SAVE TO A DATABASE???
  res.redirect(`/urls/:${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

function generateRandomString(urlLength) {
  //create a data (string) to hold the result
  //create a variable. holding letters, numbers
  //Math..floor, Math.random()
  //loop until char <= 6
  //add to a string
  let result = "";
  let characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < urlLength; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * characters.length + 1)
    );
  }
  return result;
};

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
