const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to read JSON request bodies
app.use(express.json());

// In-memory book records
let books = [
  {
    id: 101,
    title: "Wings of Fire",
    author: "A.P.J. Abdul Kalam",
    genre: "Autobiography",
    publishedYear: 1999,
    available: true
  },
  {
    id: 102,
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Fiction",
    publishedYear: 1988,
    available: true
  },
  {
    id: 103,
    title: "Harry Potter",
    author: "J.K. Rowling",
    genre: "Fantasy",
    publishedYear: 1997,
    available: false
  }
];

// Validate all required fields for a book
function isValidBook(book) {
  return (
    book !== null &&
    typeof book === "object" &&
    !Array.isArray(book) &&
    typeof book.title === "string" &&
    book.title.trim().length > 0 &&
    typeof book.author === "string" &&
    book.author.trim().length > 0 &&
    typeof book.genre === "string" &&
    book.genre.trim().length > 0 &&
    Number.isInteger(book.publishedYear) &&
    book.publishedYear > 0 &&
    typeof book.available === "boolean"
  );
}

// GET /api/books - return all books
app.get("/api/books", (req, res) => {
  res.status(200).json(books);
});

// POST /api/books - create a book
app.post("/api/books", (req, res) => {
  const newBook = req.body;

  if (!isValidBook(newBook)) {
    return res.status(400).json({
      message: "Invalid book data. title, author, genre, publishedYear and available are required."
    });
  }

  const nextId = Math.max(100, ...books.map((book) => book.id)) + 1;
  const createdBook = {
    title: newBook.title.trim(),
    author: newBook.author.trim(),
    genre: newBook.genre.trim(),
    publishedYear: newBook.publishedYear,
    available: newBook.available,
    id: nextId
  };

  books.push(createdBook);
  return res.status(201).json(createdBook);
});

// IMPORTANT: keep filter route before /api/books/:id
// GET /api/books/filter?author=value - filter by author
app.get("/api/books/filter", (req, res) => {
  const author = req.query.author;

  if (typeof author !== "string" || author.trim().length === 0) {
    return res.status(400).json({
      message: "Please provide an author query parameter."
    });
  }

  const filteredBooks = books.filter((book) =>
    book.author.toLowerCase().includes(author.trim().toLowerCase())
  );

  return res.status(200).json(filteredBooks);
});

// GET /api/books/:id - return one book
app.get("/api/books/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ message: "Book not found." });
  }

  const book = books.find((item) => item.id === id);

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  return res.status(200).json(book);
});

// PUT /api/books/:id - replace/update a book
app.put("/api/books/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ message: "Book not found." });
  }

  const bookIndex = books.findIndex((item) => item.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!isValidBook(req.body)) {
    return res.status(400).json({
      message: "Invalid book data. title, author, genre, publishedYear and available are required."
    });
  }

  books[bookIndex] = {
    title: req.body.title.trim(),
    author: req.body.author.trim(),
    genre: req.body.genre.trim(),
    publishedYear: req.body.publishedYear,
    available: req.body.available,
    id
  };

  return res.status(200).json(books[bookIndex]);
});

// DELETE /api/books/:id - remove a book
app.delete("/api/books/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ message: "Book not found." });
  }

  const bookIndex = books.findIndex((item) => item.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ message: "Book not found." });
  }

  books.splice(bookIndex, 1);
  return res.status(200).json({ message: "Book deleted successfully." });
});

// Handle malformed JSON bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON request body." });
  }
  return next(err);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Library API is running at http://localhost:${PORT}`);
});
