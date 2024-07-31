const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const secretKey = 'fingerprint_customer';

const isValid = (username) => {
  return typeof username === 'string' && username.trim() !== '';
}

const authenticatedUser = (username, password) => {
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  return user !== undefined;
}

// only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password required!' });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(400).json({ message: 'invalid username or password' });
  }

  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

  return res.status(200).json({ message: "successful logged in", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.user.username; // Asegúrate de que req.user esté disponible después de la autenticación

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  delete books[isbn].reviews[username]; // Eliminar la reseña del usuario autenticado

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;