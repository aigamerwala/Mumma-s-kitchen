import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const OrderCard = ({ order, updateOrderStatus }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleAccept = async (id) => {
    // if (!window.confirm("Are you sure you want to accept this order?")) return;
    console.log(order);
    setIsLoading(true);
    setFeedback("");
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "accepted" })
        .eq("id", id);

      if (error) console.log(error);
      setFeedback("Order accepted successfully");
      setTimeout(() => updateOrderStatus(id, "accepted", null), 1500);
    } catch (err) {
      console.error("Accept error:", err.message);
      setFeedback("Failed to accept order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      setFeedback("Please provide a rejection reason");
      return;
    }
    setIsLoading(true);
    setFeedback("");

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "rejected", rejection_reason: rejectionReason })
        .eq("id", id);

      if (error) throw error;
      setFeedback("Order rejected successfully");
      setShowRejectModal(false);
      setRejectionReason("");
      setTimeout(() => updateOrderStatus(id, "rejected", rejectionReason), 1500);
    } catch (err) {
      console.error("Reject error:", err.message);
      setFeedback("Failed to reject order");
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
            <strong>Customer:</strong> {order.users?.name || "Unknown"} ({order.users?.email || "N/A"})
          </p>
          <p className="text-gray-800">
            <strong>Order ID:</strong> {order.id}
          </p>
          <p className="text-gray-800">
            <strong>Transaction ID:</strong> {order.manual_payments?.transaction_id || "N/A"}
          </p>
          <p className="text-gray-800">
            <strong>Address:</strong> {order.address}
          </p>
          <p className="text-gray-800">
            <strong>Status:</strong>{" "}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === "accepted"
                  ? "bg-green-100 text-green-800"
                  : order.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.status}
            </span>
          </p>
          {order.rejection_reason && (
            <p className="text-gray-800">
              <strong>Rejection Reason:</strong> {order.rejection_reason}
            </p>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3">
          <button
            onClick={() => handleAccept(order.id)}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
            disabled={isLoading || order.status !== "pending"}
            aria-label={`Accept order ${order.id}`}
          >
            Accept
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
            }`}
            disabled={isLoading || order.status !== "pending"}
            aria-label={`Reject order ${order.id}`}
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

      {/* Rejection Reason Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="reject-modal-title"
            >
              <h3 id="reject-modal-title" className="text-lg font-semibold text-gray-900 mb-4">
                Reject Order
              </h3>
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => setShowRejectModal(false)}
                aria-label="Close rejection modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleReject(order.id);
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="rejectionReason" className="block text-gray-700 font-medium mb-1">
                    Reason for Rejection
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows="4"
                    required
                    aria-required="true"
                    placeholder="Enter reason for rejection"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                    onClick={() => setShowRejectModal(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-white rounded-md transition ${
                      isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
                    }`}
                    disabled={isLoading}
                    aria-label="Confirm order rejection"
                  >
                    {isLoading ? "Submitting..." : "Reject Order"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        users(name, email),
        manual_payments(transaction_id)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error.message);
      setOrders([]);
    } else {
      setOrders(data);
    }
    setLoading(false);
  };

  const updateOrderStatus = (id, newStatus, rejectionReason) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: newStatus, rejection_reason: rejectionReason } : order
      )
    );
  };

  useEffect(() => {
    // if (!user || user.role !== "admin") {
    //   navigate("/not-authorized");
    //   return;
    // }
    fetchOrders();
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
          <h1 className="text-3xl font-bold text-gray-900">🍽️ Manage Orders</h1>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            aria-label="Refresh order list"
          >
            Refresh
          </button>
        </div>
        <Link
          to="/admin/dashboard"
          className="inline-block text-blue-500 hover:text-blue-700 font-medium mb-4"
        >
          Back to Dashboard
        </Link>
        {loading ? (
          <div className="text-center py-10 text-gray-600">Loading orders...</div>
        ) : orders.length === 0 ? (
          <p className="text-gray-600 text-center">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                updateOrderStatus={updateOrderStatus}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminOrders;