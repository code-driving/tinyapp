const { urlDatabase, usersList, users } = require("./constants");

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

const updateURL = (id, newValue) => {
  urlDatabase[id] = newValue;
};

const checkUserByEmail = (email) => {
  //loop through the users object and check if the email provided in the form corresponds to the email in the database
  for (let userId in users) {
    const currentUser = users[userId];
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
  const currentUser = checkUserByEmail(email);
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
    password,
  };
  //add new user to a database
  users[id] = newUser;
  return id;
};


//return the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = (id, database) => {
  let usersOwnUrls = {}
  let loggedInUserId = id;
  for (let prop in database) {
    if (database[prop].userID === loggedInUserId) {
      usersOwnUrls[prop] = database[prop]
    }
  }
  return usersOwnUrls;
};

const verifyID = (userID, urlID, database) => {
  return userID === database[urlID].userID
}

module.exports = {
  generateRandomString,
  updateURL,
  checkUserByEmail,
  authUserByEmailAndPassword,
  createUser,
  urlsForUser,
  verifyID
};
