import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "../supabaseClient"; // Adjust the import path based on your project

const BookRequestModal = ({ setShowModal }) => {
  const [bookName, setBookName] = useState("");
  const [author, setAuthor] = useState("");
  const [edition, setEdition] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!bookName || !author || !edition || !category) {
      setMessage("Please fill out all fields.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.from("book_requests").insert([
      {
        title: bookName,
        author,
        edition,
        category,
        status: "pending", // Optional: default status
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Error submitting request:", error);
      setMessage("Failed to submit request. Please try again.");
    } else {
      setMessage("Book request submitted successfully!");
      setTimeout(() => {
        setShowModal(false);
      }, 1500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -50, opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-white bg-opacity-80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-96 relative border border-white/20"
      >
        <motion.button
          whileHover={{ rotate: 90, scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowModal(false)}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl font-bold transition"
        >
          &times;
        </motion.button>

        <h2 className="text-2xl font-bold text-center text-gray-800">📖 Request a Book</h2>

        <div className="mt-5 space-y-4">
          {[
            { label: "Book Name", state: bookName, setState: setBookName },
            { label: "Author", state: author, setState: setAuthor },
            { label: "Edition", state: edition, setState: setEdition },
            { label: "Category", state: category, setState: setCategory },
          ].map(({ label, state, setState }, index) => (
            <div key={index} className="relative">
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder=" "
                className="peer border border-gray-300 p-3 w-full rounded-lg bg-transparent outline-none focus:border-blue-500 transition"
              />
              <label
                className={`absolute left-3 top-3 text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-sm peer-focus:text-blue-500`}
              >
                {label}
              </label>
            </div>
          ))}
        </div>

        {message && (
          <div className="text-center text-sm mt-4 text-gray-700">{message}</div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 w-full mt-6 rounded-xl shadow-lg hover:shadow-xl transition transform disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default BookRequestModal;
