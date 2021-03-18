const bcrypt = require('bcrypt');
const saltRounds = 10;
const { urlDatabase, users } = require("./constants");

const generateRandomString = (urlLength) => {
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

const getUserByEmail = (email, database) => {
  //loop through the users object and check if the email provided in the form corresponds to the email in the database
  for (let userId in database) {
    const currentUser = database[userId];
    if (currentUser.email === email) {
      return currentUser;
    }
  }
  return false;
};

const authUserByEmailAndPassword = (email, password) => {
  //fetch an user with existing registered email
  //check if the user exists &&
  //check if the the password of the found user in the database corresponds to the password provided in the form
  const currentUser = getUserByEmail(email, database);
  if (currentUser && currentUser.password === password) {
    return currentUser;
  }
  return false;
};

const createUser = (email, password) => {
  //generate random ID for new user
  const id = generateRandomString(10);
  const newUser = {
    id,
    email,
    password: bcrypt.hashSync(password, saltRounds)
  };
  //add new user to a database
  users[id] = newUser;
  // console.log("newUser", newUser)
  // console.log("users", users)
  return newUser;
};

//return the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = (id, database) => {
  let usersOwnUrls = {};
  let loggedInUserId = id;
  for (let prop in database) {
    if (database[prop].userID === loggedInUserId) {
      usersOwnUrls[prop] = database[prop];
    }
  }
  return usersOwnUrls;
};

const verifyID = (userID, shortURL, database) => {
  return userID === database[shortURL].userID;
};

module.exports = {
  generateRandomString,
  checkUserByEmail,
  authUserByEmailAndPassword,
  createUser,
  urlsForUser,
  verifyID
};
