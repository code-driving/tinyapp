const bcrypt = require("bcrypt");
const saltRounds = 10;
const { users } = require("./constants");

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
    return newUser;
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
  //fetch a user with existing registered email
  //check if the user exists &&
  //check if the the password of the found user in the database corresponds to the password provided in the form
  const currentUser = getUserByEmail(email, users);
  if (currentUser &&  bcrypt.compareSync(password, currentUser.password)) {
    return currentUser;
  }
  return false;
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
  getUserByEmail,
  authUserByEmailAndPassword,
  createUser,
  urlsForUser,
  verifyID
};
