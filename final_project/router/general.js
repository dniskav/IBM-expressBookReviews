const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const findBooksByKey = (key, value) => {
  return Object.values(books).filter(book => book[key].toLowerCase().includes(value.toLowerCase()));
};

const booksApi = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ data: books });
    }, 1000); // Simula un retraso de 1 segundo
  });
};

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "invalid username" });
  }

  const userExists = users.find(u => u.username === username);

  if (userExists) {
    return res.status(400).json({ message: "username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "user registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await booksApi();
    const booksLoaded = response.data;
    return res.status(200).json(booksLoaded);
  } catch (err) {
    return res.status(500).json({ message: 'server error loading books', error: err.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const response = await booksApi();
    const booksLoaded = response.data;
    return res.status(200).json(booksLoaded[req.params.isbn]);
  } catch (err) {
    return res.status(500).json({ message: 'server error loading books', error: err.message });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const { author } = req.params;
  try {
    const response = await booksApi();
    const booksLoaded = response.data;
    const total = findBooksByKey('author', author);
    return res.status(200).json(total);
  } catch (err) {
    return res.status(500).json({ message: 'server error loading books', error: err.message });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const { title } = req.params;
  try {
    const response = await booksApi();
    const booksLoaded = response.data;
    const total = findBooksByKey('title', title);
    return res.status(200).json(total);
  } catch (err) {
    return res.status(500).json({ message: 'server error loading books', error: err.message });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;