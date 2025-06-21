import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // adjust if needed
import { motion, AnimatePresence } from "framer-motion";
import NavbarBooks from "../components/NavbarOrders"; // adjust if needed

const IssuedBooks = () => {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [editionFilter, setEditionFilter] = useState("");
  const [successPopup, setSuccessPopup] = useState(false);

  const fetchIssuedBooks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('issued_books')
        .select('*, books(title, author,edition)')
        .eq('returned', false) // optional: filter by status
       .eq('reserved', false); // optional: get only user's books

      if (error) {
        console.error("Error fetching issued books:", error.message);
        setIssuedBooks([]);
        setFilteredBooks([]);
      } else {
        console.log("Fetched issued books:", data);
        setIssuedBooks(data || []);
        setFilteredBooks(data || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching issued books:", err);
      setIssuedBooks([]);
      setFilteredBooks([]);
    }
    setLoading(false);
  };

  const handleReserveBook = async (book) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("🔥 Error fetching user:", userError?.message || "No user found");
      alert("You must be logged in to issue a book.");
      navigate("/SignIn");
      return;
    }
    console.log("Reserving book:", book);
    const { error: reservationerror, data: reservedto } = await supabase
      .from('reservations').insert({
        book_id: book.book_id,
        reserved_from: book.user_id,
        reserved_to: user.id,
        reserved_at: new Date().toISOString(),

      })
    if (reservationerror) {
      console.error("Error reserving book:", reservationerror.message);
      return;
    }
    else {
      console.log("Book reserved successfully:", reservedto);
    }

    await supabase
      .from('issued_books').update({ reserved: true }).eq('id', book.id);
    setSuccessPopup(true);
    setTimeout(() => setSuccessPopup(false), 2000); // Auto-close after 2 seconds
    fetchIssuedBooks();
  };

  useEffect(() => {
    fetchIssuedBooks();
  }, []);

  useEffect(() => {
    let filtered = issuedBooks;

    if (search) {
      filtered = filtered.filter((book) =>
        book.books.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredBooks(filtered);
  }, [search, issuedBooks]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 to-white">
      <div className="flex flex-1">
        {/* Sidebar */}
        <motion.div
          className={`fixed top-16 left-0 h-full bg-gray-800 text-white shadow-lg transition-all duration-300 z-50`}
          initial={{ x: -256 }}
          animate={{ x: sidebarOpen ? 0 : -256 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {sidebarOpen && <NavbarBooks />}
        </motion.div>

        <motion.button
          className="fixed top-20 left-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 z-50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
        >
          {sidebarOpen ? "⬅" : "➡"}
        </motion.button>

        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
          <motion.h2
            className="text-4xl font-bold mb-6 text-center text-blue-800 drop-shadow-lg animate-pulse"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            📚 Issued Books
          </motion.h2>

          {/* Search & Filters */}
          <motion.div
            className="mt-4 p-4 bg-white/10 backdrop-blur-md shadow-lg rounded-lg flex flex-col md:flex-row items-center gap-4 border border-blue-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <input
              type="text"
              placeholder="Search books by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded-md w-full bg-white text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-md"
            />
          </motion.div>

          {/* Book Grid */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {loading ? (
              <p className="text-center text-blue-700">Loading issued books...</p>
            ) : filteredBooks.length === 0 ? (
              <p className="text-center text-blue-700">No books issued.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <motion.div
                    key={book.id}
                    className="p-4 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex items-center justify-between"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * filteredBooks.indexOf(book) }}
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0, 0, 255, 0.2)" }}
                  >
                    <div>
                      <h3 className="font-semibold text-lg text-blue-700">{book.books.title}</h3>
                      <h4 className="font-semibold text-sm text-blue-600">Author: {book.books.author}</h4>
                      <p className="text-sm text-blue-600">Edition: {book.books.edition}</p>
                      <p className="text-sm text-blue-600">Issued: {new Date(book.issue_date).toDateString()}</p>
                      <p className="text-sm text-blue-600">Due: {new Date(book.return_date).toDateString()}</p>
                    </div>
                    <div className="flex gap-4 mt-3">
                      <motion.button
                        onClick={() => handleReserveBook(book)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 hover:scale-105 transform"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Reserve Book
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Success Popup */}
      <AnimatePresence>
        {successPopup && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSuccessPopup(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl z-50 border border-blue-300"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-blue-800">Success</h3>
              <p className="mb-4 text-blue-700">Book reserved successfully!</p>
              <motion.button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 hover:scale-105 transform w-full"
                onClick={() => setSuccessPopup(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IssuedBooks;