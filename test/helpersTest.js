const { assert } = require("chai");

const { getUserByEmail } = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", () => {
  it("should return a user with valid email", (done) => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.deepEqual(user.id, expectedOutput);
    done();
  });

  it("should return a user with valid password", (done) => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "purple-monkey-dinosaur";
    assert.deepEqual(user.password, expectedOutput);
    done();
  });

  it("should return false with invalid data provided", (done) => {
    const user = getUserByEmail("user@gmail.com", testUsers);
    assert.deepEqual(user.id, undefined);
    done();
  });
});
