const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return !users.some(user => user.username === username);
  };

  const authenticatedUser = (username, password) => {
    return users.some(
      user => user.username === username && user.password === password
    );
  };

//only registered users can login
regd_users.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;
  
    // validate input
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }
  
    // check credentials
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({
        message: "Invalid login credentials"
      });
    }
  
    // create JWT token
    let accessToken = jwt.sign(
      { username: username },
      "access",
      { expiresIn: 60 * 60 }
    );
  
    // store session
    req.session.authorization = {
      accessToken,
      username
    };
  
    return res.status(200).json({
      message: "Login successful",
      token: accessToken
    });
  
  });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;
  
    // validate review input
    if (!review) {
      return res.status(400).json({
        message: "Review is required"
      });
    }
  
    // check if book exists
    if (!books[isbn]) {
      return res.status(404).json({
        message: "Book not found"
      });
    }
  
    // add or update review (same user overwrites, different users add new entry)
    books[isbn].reviews[username] = review;
  
    return res.status(200).json({
      message: "Review added/updated successfully"
    });
  
  });

    // delete review
    regd_users.delete("/auth/review/:isbn", (req, res) => {

        const isbn = req.params.isbn;
        const username = req.session.authorization.username;
      
        // check if book exists
        if (!books[isbn]) {
          return res.status(404).json({
            message: "Book not found"
          });
        }
      
        // check if review exists for this user
        if (!books[isbn].reviews[username]) {
          return res.status(404).json({
            message: "Review not found for this user"
          });
        }
      
        // delete only this user's review
        delete books[isbn].reviews[username];
      
        return res.status(200).json({
          message: "Review deleted successfully"
        });
      
      });


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
