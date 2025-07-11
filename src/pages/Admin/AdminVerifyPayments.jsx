import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const PaymentCard = ({ payment, updateStatus }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);

  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this payment as ${newStatus}?`)) return;

    setIsLoading(true);
    setFeedback("");

    try {
      const { error } = await supabase
        .from("manual_payments")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      setFeedback(`Payment marked as ${newStatus}`);
      setTimeout(() => updateStatus(id, newStatus), 1500); // Refresh after showing feedback
    } catch (err) {
      console.error("Update error:", err.message);
      setFeedback("Failed to update payment status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div
        className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-gray-800">
            <strong>User:</strong> {payment.users?.name || "Unknown"} ({payment.users?.email || "N/A"})
          </p>
          <p className="text-gray-800">
            <strong>Order ID:</strong> {payment.order_id}
          </p>
          <p className="text-gray-800">
            <strong>Txn ID:</strong> {payment.transaction_id}
          </p>
          <p className="text-gray-800">
            <strong>Status:</strong>{" "}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                payment.status === "Approved"
                  ? "bg-green-100 text-green-800"
                  : payment.status === "Rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {payment.status}
            </span>
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3">
          <button
            onClick={() => setShowScreenshotModal(true)}
            className="text-blue-600 hover:text-blue-800 font-medium"
            aria-label="View payment screenshot"
          >
            View Screenshot
          </button>
          <button
            onClick={() => handleUpdateStatus(payment.id, "Approved")}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
            disabled={isLoading}
            aria-label={`Approve payment ${payment.id}`}
          >
            Approve
          </button>
          <button
            onClick={() => handleUpdateStatus(payment.id, "Rejected")}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
            }`}
            disabled={isLoading}
            aria-label={`Reject payment ${payment.id}`}
          >
            Reject
          </button>
        </div>
      </motion.div>
      {feedback && (
        <p
          className={`mt-2 text-sm ${feedback.includes("Failed") ? "text-red-500" : "text-green-500"}`}
          role="alert"
        >
          {feedback}
        </p>
      )}

      {/* Screenshot Preview Modal */}
      <AnimatePresence>
        {showScreenshotModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowScreenshotModal(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-2xl max-w-lg w-full relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="screenshot-modal-title"
            >
              <h3 id="screenshot-modal-title" className="text-lg font-semibold text-gray-900 mb-4">
                Payment Screenshot
              </h3>
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => setShowScreenshotModal(false)}
                aria-label="Close screenshot modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={payment.screenshot_url}
                alt={`Payment screenshot for ${payment.transaction_id}`}
                className="w-full h-auto rounded-md"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const AdminVerifyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("manual_payments")
      .select("*, users(name, email)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error.message);
      setPayments([]);
    } else {
      setPayments(data);
    }
    setLoading(false);
  };

  const handleUpdateStatus = (id, newStatus) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === id ? { ...payment, status: newStatus } : payment
      )
    );
  };

  useEffect(() => {
    // if (!user || user.role !== "admin") {
    //   navigate("/not-authorized");
    //   return;
    // }
    fetchPayments();
  }, [user, navigate]);

  return (
    <motion.div
      className="container mx-auto py-16 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🧾 Manual Payments Verification</h1>
          <button
            onClick={fetchPayments}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            aria-label="Refresh payment list"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-600">Loading payments...</div>
        ) : payments.length === 0 ? (
          <p className="text-gray-600 text-center">No payment requests.</p>
        ) : (
          <div className="space-y-6">
            {payments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                updateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminVerifyPayments;