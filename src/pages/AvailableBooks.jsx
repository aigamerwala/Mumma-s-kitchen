import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import NavbarBooks from "../components/NavbarOrders";

const AvailableBooks = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [editionFilter, setEditionFilter] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const issueDate = new Date();
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + 14);
  // ✅ Fetch all books (available & unavailable)
  const fetchBooks = async () => {
    const { data, error } = await supabase.from("books").select("*");
    if (error) {
      console.error("🔥 Error fetching books:", error.message);
    } else {
      setBooks(data);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchBooks();
  }, []);

  // ✅ Filter Books based on Search & Dropdown Filters
  const filteredBooks = books.filter((book) => {
    return (
      book.title.toLowerCase().includes(search.toLowerCase()) &&
      (genreFilter === "" || book.genre === genreFilter) &&
      (languageFilter === "" || book.language === languageFilter) &&
      (editionFilter === "" || book.edition === editionFilter)
    );
  });

  // ✅ Handle Book Issue
  const handleIssueBook = async (bookId, copies) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("🔥 Error fetching user:", userError?.message || "No user found");
      alert("You must be logged in to issue a book.");
      navigate("/SignIn");
      return;
    }

    if (copies <= 0) {
      alert("Sorry, this book is currently unavailable.");
      return;
    }


    try {
      const { data, error } = await supabase.from("issued_books").insert([
        {
          user_id: user.id,
          book_id: bookId,
          issue_date: issueDate.toISOString(),
          due_date: dueDate.toISOString(),
        },
      ]);

      if (error) throw error;
      const { error: updatecopyerror } = await supabase
        .from("books")
        .update({
          copies: copies - 1,
        })
        .eq("id", bookId);
      if (updatecopyerror) throw updatecopyerror;
      await supabase.from("notifications").insert([
        {
          user_id: user.id,
          message: `You have successfully issued the book! Due date: ${dueDate.toDateString()}`,
        },
      ]);
      alert("Book issued successfully!");
      fetchBooks(); // Refresh the book list after issuing
    } catch (error) {
      console.error("🔥 Error issuing book:", error.message);
      alert("Failed to issue book.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`fixed top-16 left-0 h-full bg-gray-800 text-white transition-all duration-300 ${sidebarOpen ? "w-64" : "w-0 overflow-hidden"}`}>
          {sidebarOpen && <NavbarBooks />}
        </div>

        <button
          className="fixed top-20 left-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition duration-300 z-50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "⬅" : "➡"}
        </button>

        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
          <h1 className="text-2xl font-bold mb-4 mt-20 text-blue-700">📚 Library Books</h1>

          {/* Search & Filters */}
          <div className="mt-4 p-4 bg-white shadow-md rounded-lg flex flex-col md:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="🔍 Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)} className="border p-2 rounded-md">
              <option value="">All Genres</option>
              <option value="Fiction">Fiction</option>
              <option value="Mystery">Mystery</option>
              <option value="Science">Science</option>
            </select>
            <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} className="border p-2 rounded-md">
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
            <select value={editionFilter} onChange={(e) => setEditionFilter(e.target.value)} className="border p-2 rounded-md">
              <option value="">All Editions</option>
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
            </select>
          </div>

          {/* Book Collection */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">📖 Book Collection</h2>
            {loading ? (
              <p>Loading books...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <motion.div
                    key={book.id}
                    className={`p-4 bg-gray-100 shadow-md rounded-lg transition duration-300 ${book.copies === 0 ? "border-red-500 border-2" : "hover:shadow-xl"
                      }`}
                    whileHover={{ scale: 1.03 }}
                  >
                    <h3 className="font-semibold text-lg">{book.title}</h3>
                    <p className="text-sm text-gray-600">Author: {book.author}</p>
                    <p className="text-sm text-gray-600">Genre: {book.genre}</p>
                    <p className="text-sm text-gray-600">Language: {book.language}</p>
                    <p className="text-sm text-gray-600">Edition: {book.edition}</p>
                    <p className="text-sm text-gray-600">
                      📚 Copies Available:{" "}
                      <span className={book.copies === 0 ? "text-red-500 font-bold" : ""}>
                        {book.copies === 0 ? "Currently Unavailable" : book.copies}
                      </span>
                    </p>

                    <button
                      onClick={() => handleIssueBook(book.id, book.copies)}
                      className={`mt-2 px-3 py-1 rounded text-white ${book.copies > 0 ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"
                        }`}
                      disabled={book.copies === 0}
                    >
                      {book.copies > 0 ? "Issue Book" : "Unavailable"}
                    </button>
                    <button
                      className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => setSelectedBook(book)}
                    >
                      View Details
                    </button>
                    <AnimatePresence>
                      {selectedBook && (
                        <motion.div
                          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }} // Faster animation
                        >
                          <motion.div
                            className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full flex flex-col md:flex-row gap-4"
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            transition={{ duration: 0.2 }} // Faster animation
                          >
                            {/* Book Cover (Left Side) */}
                            <div className="w-full md:w-1/3">
                              {selectedBook.coverImage ? (
                                <img
                                  src={selectedBook.coverImage}
                                  alt={selectedBook.title}
                                  className="w-full h-64 object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded">
                                  No Cover Available
                                </div>
                              )}
                            </div>

                            {/* Book Details (Right Side) */}
                            <div className="w-full md:w-2/3">
                              <h2 className="text-xl font-bold mb-2">{selectedBook.title}</h2>
                              <p className="text-gray-600 mb-2">
                                <strong>Authors:</strong> {selectedBook.author}
                              </p>
                              <div className="flex items-center mb-2">
                                <span className="text-yellow-500">★★★★★</span>
                                <span className="ml-2 text-gray-600">115 reviews</span>
                              </div>
                              <p className="text-gray-600 mb-2">
                                <strong>First Published:</strong> {selectedBook.firstPublishYear}
                              </p>
                              <p className="text-gray-600 mb-2">
                                <strong>Number of Pages:</strong> {selectedBook.numberOfPages}
                              </p>
                              <p className="text-gray-600 mb-2">
                                <strong>Subjects:</strong> {selectedBook.subjects}
                              </p>
                              <p className="text-gray-600 mb-4">
                                Grimm's Complete Fairy Tales collects more than 200 tales set down by Jacob and Wilhelm Grimm in the early decades of the nineteenth century, among them some of the best-loved and most famous fairy tales in all literature: "Little Red Riding Hood," "Snow-White and the Seven Dwarfs," "Cinderella," "Sleeping Beauty," "Rapunzel," "Rumpelstiltskin," and "Tom Thumb." Voluminous and exhaustive, this collection ranges from the familiar to the obscure. First published in 1812-1815, the Brothers Grimm made a career of preserving and retelling these oral stories that in turn inspired generations of storytelling, both written and oral.
                              </p>
                              <button
                                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => setSelectedBook(null)}
                              >
                                Cancel
                              </button>
                              <button
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                onClick={() => setSelectedBook(null)}
                              >
                                ✕
                              </button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableBooks;
