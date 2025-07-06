import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../supabaseClient";

const EnquiryReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate fetching reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Simulate Supabase query
        const { data, error } = await supabase.from("enquiry").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setReviews(data);
      } catch (err) {
        setError("Failed to load reviews");
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);
  useEffect(() => {
    // Already fetched initial reviews above

    const channel = supabase
      .channel("realtime-enquiries")
      .on(
        "postgres_changes",
        {
          event: ["INSERT", "UPDATE"],
          schema: "public",
          table: "enquiry",
        },
        (payload) => {
          console.log("📥 New enquiry received:", payload.new);
          setReviews((prev) => {
            const updatedReviews = prev.filter(review => review.id !== payload.new.id);
            return [payload.new, ...updatedReviews];
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);


  // Handle marking a review as read
  const handleMarkAsRead = async (id) => {
    try {
      // Simulate Supabase update
      const { error } = await supabase.from("enquiry").update({ read_status: true }).eq("id", id);
      if (error) {
        console.error("Error updating review:", error);
        throw error;
      }
      console.log("Review marked as read:", id);

      setReviews(
        reviews.map((review) => {
          console.log("Review ID:", review.id, "Selected ID:", id); // Debugging line
          return review.id === id ? { ...review, read_status: true } : review;
        })
      );
    } catch (err) {
      console.error("Error marking as read:", err);
      setError("Failed to mark as read");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading reviews...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-6 py-10 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">Enquiry Reviews</h1>
      {reviews.length === 0 ? (
        <p className="text-center text-gray-600">No reviews available.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                className={`p-6 bg-gray-100 shadow-md rounded-lg relative transition-colors duration-300 ${review.read_status ? "bg-gray-200 opacity-75" : "bg-gray-100"
                  }`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
              >
                {review.read_status && (
                  <span className="absolute top-4 right-4 text-green-500">✓</span>
                )}
                <h3 className="font-semibold text-lg">
                  {review.firstName} {review.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  <strong>Phone:</strong> {review.phone}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {review.email}
                </p>
                <p className="mt-2 p-2 bg-blue-100 text-blue-800 font-medium rounded">
                  {review.message}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Submitted on: {new Date(review.created_at).toLocaleDateString()}
                </p>
                {!review.read_status && (
                  <>
                    <button
                      onClick={() => handleMarkAsRead(review.id)}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      Mark as Read
                    </button>
                    <span className="absolute top-4 right-4 bg-yellow-300 text-black px-2 py-1 text-xs font-semibold rounded">
                      NEW
                    </span>
                  </>
                )}

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default EnquiryReviews;