const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { generateRandomString } = require("./helpers");
const bodyParser = require("body-parser");
const { render } = require("ejs");
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
  //create templateVars
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

//delete URLs
app.post('/urls/:shortURL/delete', (req, res) => {
  //get the value of the shortURL  from req.params
  const shortURL = req.params.shortURL;
  console.log(shortURL)
  //delete it from the database
  delete urlDatabase[shortURL];
  //redirect the client to the urls_index page
  res.redirect("/urls");
});

//update a URL recourse
app.post('/urls/:shortURL', (req, res) => {
  //get the value of the id from req.params
  const shortURL = req.params.shortURL;
  //get the value of longURL from the input from req.body
  const longURL = req.body.longURL;
  console.log(longURL)
  //update the url in the database
  updateURL(shortURL, longURL);
  //redirect the client to the urls_index page
  res.redirect("/urls");
});

app.get('/urls/:id', (req, res) => {
const id = req.params.id;
const longURL = req.body.longURL;
render('urls_show', { id: longURL });
});


//display the updated form
// app.get('urls/:id/update', (req, res) => {
//   //get the value of the id from req.params
//   const id = req.params.id
//   const updatedValue = urlDatabase[id]
//   const templateVars = { updatedValue: updatedValue}
  
//   res.render()
// })

function updateURL(id, newValue) {
  urlDatabase[id] = newValue;
};


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});