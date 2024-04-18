const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.query.username;
  const password = req.query.password;
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: '1h' });
    req.session.authorization = {
      accessToken,username
  }
  req.session.username = username;
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  console.log('Logged in user:', req.session.username);

  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.username; // Ensure that username is stored in session when user logs in

  if (!username) {
    return res.status(401).json({ message: "User must be logged in." });
    }
  if (!review) {
    return res.status(400).json({ message: "Review content is required,its empty" });
  }
  
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found..."});
  }

  // Add or update the review
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: `Review added or updated to book ISBN # ${isbn}`,
    reviews: books[isbn].reviews
  });
  
});

regd_users.delete("/auth/review/:isbn", (req,res) => {
    //delete the book review here
    const isbn = req.params.isbn;
    const username = req.session.username;

    if(!books[isbn]) {
        return res.json({message:"no book found"});
    }
    if(!books[isbn].reviews[username]) {
        return res.json({message: `No reviews found for book isbn # ${isbn} for user ${username}.`})
    }
    delete books[isbn].reviews[username];
    return res.json({message: `Delete review for user: ${username} for book ibsn # ${isbn}.`});

});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
