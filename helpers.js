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

module.exports = { generateRandomString} ;