
const express = require("express");

const app = express();
app.use(express.json());

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

let nextId = 104;

// Validate book details
function isValidBook(book) {
    return (
        book &&
        typeof book.title === "string" &&
        book.title.trim() !== "" &&
        typeof book.author === "string" &&
        book.author.trim() !== "" &&
        typeof book.genre === "string" &&
        book.genre.trim() !== "" &&
        Number.isInteger(book.publishedYear) &&
        book.publishedYear > 0 &&
        typeof book.available === "boolean"
    );
}

// 1. GET all books
app.get("/api/books", (req, res) => {
    res.status(200).json(books);
});

// 2. POST - Add a new book
app.post("/api/books", (req, res) => {
    if (!isValidBook(req.body)) {
        return res.status(400).json({
            message: "Invalid book details"
        });
    }

    const newBook = {
        id: nextId++,
        title: req.body.title.trim(),
        author: req.body.author.trim(),
        genre: req.body.genre.trim(),
        publishedYear: req.body.publishedYear,
        available: req.body.available
    };

    books.push(newBook);

    res.status(201).json({
        message: "Book added successfully",
        book: newBook
    });
});

// 3. GET books by author (filter)
app.get("/api/books/filter", (req, res) => {
    const author = req.query.author;

    if (!author) {
        return res.status(400).json({
            message: "Author query parameter is required"
        });
    }

    const filteredBooks = books.filter(book =>
        book.author.toLowerCase().includes(author.toLowerCase())
    );

    res.status(200).json(filteredBooks);
});

// 4. GET a single book by ID
app.get("/api/books/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({
            message: "Invalid book ID"
        });
    }

    const book = books.find(book => book.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.status(200).json(book);
});

// 5. PUT - Update a book
app.put("/api/books/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({
            message: "Invalid book ID"
        });
    }

    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (!isValidBook(req.body)) {
        return res.status(400).json({
            message: "Invalid book details"
        });
    }

    books[index] = {
        id: id,
        title: req.body.title.trim(),
        author: req.body.author.trim(),
        genre: req.body.genre.trim(),
        publishedYear: req.body.publishedYear,
        available: req.body.available
    };

    res.status(200).json({
        message: "Book updated successfully",
        book: books[index]
    });
});

// 6. DELETE a book
app.delete("/api/books/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({
            message: "Invalid book ID"
        });
    }

    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const deletedBook = books.splice(index, 1);

    res.status(200).json({
        message: "Book deleted successfully",
        book: deletedBook[0]
    });
});

// Handle invalid JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            message: "Invalid JSON format"
        });
    }

    next(err);
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Library API is running at http://localhost:${PORT}`);
});
