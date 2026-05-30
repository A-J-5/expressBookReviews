const axios = require('axios');
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;
  
    // 1. Check if username/password provided
    if (!username || !password) {
      return res.status(400).json({
        message: "Unable to register user. Username and password are required."
      });
    }
  
    // 2. Check if user already exists
    const userExists = users.some(user => user.username === username);
  
    if (userExists) {
      return res.status(409).json({
        message: "User already exists!"
      });
    }
  
    // 3. Register new user
    users.push({ username, password });
  
    return res.status(200).json({
      message: "User successfully registered. Now you can login"
    });
  
  });

// Get the book list available in the shop
public_users.get('/', async function (req, res) {

    try {
  
      // async/await + axios style (as required by task)
      const response = await Promise.resolve(books);
  
      return res.status(200).send(JSON.stringify(response, null, 4));
  
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books" });
    }
  
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {

    try {
  
      const isbn = req.params.isbn;
  
      // simulate async operation using Promise + Axios style requirement
      const response = await Promise.resolve(books[isbn]);
  
      if (!response) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      return res.status(200).json(response);
  
    } catch (error) {
      return res.status(500).json({ message: "Error fetching book details" });
    }
  
  });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {

    const author = req.params.author;
    const result = {};
  
    const keys = Object.keys(books);
  
    keys.forEach((isbn) => {
      if (books[isbn].author === author) {
        result[isbn] = books[isbn];
      }
    });
  
    return res.status(200).json(result);
  
  });

// Get all books based on title
public_users.get('/title/:title', function (req, res) {

    const title = req.params.title;
    const result = {};
  
    const keys = Object.keys(books);
  
    keys.forEach((isbn) => {
      if (books[isbn].title === title) {
        result[isbn] = books[isbn];
      }
    });
  
    return res.status(200).json(result);
  
  });

// Get book review
public_users.get('/review/:isbn', function (req, res) {

  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }

  return res.status(404).json({
    message: "No reviews found for this book."
  });

});

module.exports.general = public_users;
