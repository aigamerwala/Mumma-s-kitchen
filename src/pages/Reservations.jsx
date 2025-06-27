import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import NavbarBooks from "../components/NavbarOrders";
import { FaBook, FaTimes, FaFilter, FaCheck, FaClock } from "react-icons/fa";

const Reservations = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch reservations for the logged-in user
  useEffect(() => {
    const fetchReservations = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("🔥 Error fetching user:", userError?.message || "No user found");
        alert("You must be logged in to view reservations.");
        navigate("/SignIn");
        return;
      }

      const { data, error } = await supabase
        .from("reservations")
        .select("*, books(title, author, genre)")
        .eq("reserved_to", user.id)
        .eq("status", "pending");
      if (error) {
        console.error("🔥 Error fetching reservations:", error.message);
      } else {
        console.log("reservation data: ",data);
        setReservations(data);
      }
      setLoading(false);
    };
    fetchReservations();
  }, [navigate]);

  // ✅ Filter Reservations based on Search & Status
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch = reservation.books.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "" || reservation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ✅ Handle Cancel Reservation
  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    console.log("Canceling reservation:", reservationId);

    try {
      const { error } = await supabase
        .from("reservations")
        .update({ status: "cancelled"})
        .eq("id", reservationId);

      if (error) throw error;
      setReservations(reservations.filter((r) => r.id !== reservationId));
      alert("Reservation canceled successfully!");
    } catch (err) {
      console.error("🔥 Cancel Reservation Error:", err);
      alert("Failed to cancel reservation.");
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
          <h1 className="text-2xl font-bold mb-4 mt-20 text-blue-700 flex items-center">
            <FaBook className="mr-2" /> 📋 Reservations
          </h1>

          {/* Search & Filters */}
          <div className="mt-4 p-4 bg-white shadow-md rounded-lg flex flex-col md:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="🔍 Search by book title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border p-2 rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="canceled">Canceled</option>
              <option value="issued">Completed</option>
            </select>
          </div>

          {/* Reservations List */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">📖 Your Reservations</h2>
            {loading ? (
              <p className="text-gray-600">Loading reservations...</p>
            ) : filteredReservations.length === 0 ? (
              <p className="text-gray-600">No reservations found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReservations.map((reservation) => (
                  <motion.div
                    key={reservation.id}
                    className={`p-4 bg-gray-100 shadow-md rounded-lg transition duration-300 ${reservation.status === "Canceled" ? "border-red-500 border-2 opacity-70" : "hover:shadow-xl"
                      }`}
                    whileHover={{ scale: 1.03 }}
                  >
                    <h3 className="font-semibold text-lg text-blue-700">{reservation.books.title}</h3>
                    <p className="text-sm text-gray-600">Author: {reservation.books.author}</p>
                    <p className="text-sm text-gray-600">Genre: {reservation.books.genre}</p>
                    <p className="text-sm text-gray-600">
                      Status:{" "}
                      <span
                        className={
                          reservation.status === "Pending"
                            ? "text-yellow-500"
                            : reservation.status === "Confirmed"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {reservation.status}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Reserved On: {new Date(reservation.reserved_at).toLocaleDateString()}
                    </p>
                    {reservation.status !== "Canceled" && (
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
                      >
                        <FaTimes className="inline mr-1" /> Cancel
                      </button>
                    )}
                    <button
                      className="mt-2 ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
                      onClick={() => setSelectedReservation(reservation)}
                    >
                      <FaFilter className="inline mr-1" /> Details
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Reservation Details Modal */}
          <AnimatePresence>
            {selectedReservation && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full flex flex-col md:flex-row gap-4"
                  initial={{ scale: 0.9, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 50 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Book Cover Placeholder */}
                  <div className="w-full md:w-1/3">
                    {selectedReservation.books.coverImage ? (
                      <img
                        src={selectedReservation.books.coverImage}
                        alt={selectedReservation.books.title}
                        className="w-full h-64 object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded">
                        No Cover Available
                      </div>
                    )}
                  </div>

                  {/* Reservation Details */}
                  <div className="w-full md:w-2/3">
                    <h2 className="text-xl font-bold mb-2 text-blue-700">{selectedReservation.books.title}</h2>
                    <p className="text-gray-600 mb-2">
                      <strong>Author:</strong> {selectedReservation.books.author}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <strong>Genre:</strong> {selectedReservation.books.genre}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <strong>Status:</strong>{" "}
                      <span
                        className={
                          selectedReservation.status === "Pending"
                            ? "text-yellow-500"
                            : selectedReservation.status === "Confirmed"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {selectedReservation.status}
                      </span>
                    </p>
                    <p className="text-gray-600 mb-2">
                      <strong>Reserved On:</strong>{" "}
                      {new Date(selectedReservation.reserved_at).toLocaleDateString()}
                    </p>
                    {selectedReservation.due_date && (
                      <p className="text-gray-600 mb-2">
                        <strong>Due Date:</strong>{" "}
                        {new Date(selectedReservation.due_date).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-gray-600 mb-4">
                      <strong>Notes:</strong> Your reservation is processed based on availability. You will be notified when the book is ready for pickup.
                    </p>
                    <button
                      className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => setSelectedReservation(null)}
                    >
                      <FaTimes className="inline mr-1" /> Close
                    </button>
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                      onClick={() => setSelectedReservation(null)}
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Reservations;