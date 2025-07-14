import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const StatusBadge = ({ status }) => {
  const badgeStyles = {
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
  };
  const icons = {
    accepted: "✅",
    rejected: "❌",
    completed: "🎉",
    pending: "⏳",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeStyles[status] || "bg-gray-100 text-gray-800"}`}
    >
      {icons[status] || "📌"} {status}
    </span>
  );
};

const ActionButton = ({ onClick, children, color, disabled, ariaLabel }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 transition ${disabled ? "bg-gray-400 cursor-not-allowed" : `${color} hover:${color.replace("500", "600")}`
      }`}
    disabled={disabled}
    aria-label={ariaLabel}
  >
    {children}
  </button>
);

const OrderCard = ({ order, updateOrderStatus, onMarkCompleted }) => {

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleAccept = async (id) => {
    if (!window.confirm("Are you sure you want to accept this order?")) return;
    setIsLoading(true);
    setFeedback("");
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "accepted", rejection_reason: null })
        .eq("id", id);
      if (error) throw error;
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
    if (!window.confirm("Are you sure you want to reject this order?")) return;
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

  const handleComplete = async (id) => {
    if (!window.confirm("Are you sure you want to mark this order as completed?")) return;
    setIsLoading(true);
    setFeedback("");
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "completed", rejection_reason: null })
        .eq("id", id);
      if (error) throw error;
      setFeedback("Order marked as completed");
      setTimeout(() => onMarkCompleted(id), 1500);
    } catch (err) {
      console.error("Complete error:", err.message);
      setFeedback("Failed to mark order as completed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div
        className="bg-white p-4 sm:p-6 rounded-lg shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-2">
          <p className="text-gray-800 font-medium">
            <strong>Customer:</strong> {order.users?.name || "Unknown"} ({order.users?.email || "N/A"})
          </p>
          <p className="text-gray-800 font-medium">
            <strong>Order ID:</strong> {order.id}
          </p>
          <p className="text-gray-800 font-medium">
            <strong>Transaction ID:</strong> {order.manual_payments?.transaction_id || "N/A"}
          </p>
          <p className="text-gray-800 font-medium">
            <strong>Address:</strong> {order.address}
          </p>
          <p className="text-gray-800 font-medium">
            <strong>Status:</strong> <StatusBadge status={order.status} />
          </p>
          {order.rejection_reason && (
            <p className="text-gray-800 font-medium">
              <strong>Rejection Reason:</strong> {order.rejection_reason}
            </p>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
          {order.status === "pending" && (
            <>
              <ActionButton
                onClick={() => handleAccept(order.id)}
                color="bg-green-500"
                disabled={isLoading}
                ariaLabel={`Accept order ${order.id}`}
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Accept
              </ActionButton>
              <ActionButton
                onClick={() => setShowRejectModal(true)}
                color="bg-red-500"
                disabled={isLoading}
                ariaLabel={`Reject order ${order.id}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </ActionButton>
            </>
          )}
          {order.status === "accepted" && (
            <ActionButton
              onClick={() => handleComplete(order.id)}
              color="bg-blue-500"
              disabled={isLoading}
              ariaLabel={`Mark order ${order.id} as completed`}
              >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mark completed
            </ActionButton>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {feedback && (
          <motion.p
          className={`mt-2 text-sm ${feedback.includes("Failed") ? "text-red-500" : "text-green-500"}`}
          role="alert"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          >
            {feedback}
          </motion.p>
        )}
      </AnimatePresence>

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
                    className={`px-4 py-2 text-white rounded-md transition ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
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
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
    .from("orders")
    .select("*, users(name, email), manual_payments(transaction_id)")
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
    setOrders((prev) => {
      const updatedOrders = prev.map((order) =>
        order.id === id ? { ...order, status: newStatus, rejection_reason: rejectionReason } : order
    );
    return updatedOrders
  });
};
  
  const handleMarkCompleted = async (id) => {
    if (!window.confirm("Are you sure you want to mark this order as completed?")) return;
    setLoading(true);
    try {
      const { error } = await supabase
      .from("orders")
        .update({ status: "completed", rejection_reason: null })
        .eq("id", id);
        if (error) throw error;
        updateOrderStatus(id, "completed", null);
      } catch (err) {
        console.error("Complete error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    
    const filteredAndSortedOrders = useMemo(() => {
      console.log("Statuses: ", orders.map(o => o.status));
      return orders
      .filter((order) => filter === "All" || order.status === filter)
      .filter(
        (order) =>
          order.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
        order.users?.email?.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const statusA = a.status?.toLowerCase().trim();
        const statusB = b.status?.toLowerCase().trim();
        const priority = {
          accepted: 0,
          pending: 1,
          completed: 2,
          rejected: 3,
        };
        return (priority[statusA] || 0) - (priority[statusB] || 0);
      });
      
  }, [orders, filter, search]);
  
  useEffect(() => {
    // if (!user || user.role !== "admin") {
      //   navigate("/not-authorized");
      //   return;
      // }
    fetchOrders();
  }, [user, navigate]);
  
  return (
    <motion.div
    className="container mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span>🍽️ Manage Orders</span>
          </h1>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center gap-2"
            aria-label="Refresh order list"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        <Link
          to="/admin/dashboard"
          className=" text-blue-600 hover:text-blue-800 font-medium mb-6 flex items-center gap-2"
          aria-label="Back to admin dashboard"
          >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full sm:w-1/2">
            <input
              type="text"
              placeholder="Search by customer name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
              aria-label="Search orders"
              />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "pending", "accepted", "rejected", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${filter === f ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                aria-label={`Filter by ${f} orders`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table View for Desktop */}
        <div className="hidden lg:block overflow-x-auto mb-8">
          <table className="w-full table-auto bg-white rounded-lg shadow-lg">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Transaction ID</th>
                <th className="px-4 py-3 font-medium">Address</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedOrders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="px-4 py-3">{order.users?.name || "Unknown"} ({order.users?.email || "N/A"})</td>
                  <td className="px-4 py-3">{order.id}</td>
                  <td className="px-4 py-3">{order.manual_payments?.transaction_id || "N/A"}</td>
                  <td className="px-4 py-3">{order.address}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {order.status === "pending" && (
                      <>
                        <ActionButton
                          onClick={() => handleAccept(order.id)}
                          color="bg-green-500"
                          disabled={loading}
                          ariaLabel={`Accept order ${order.id}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Accept
                        </ActionButton>
                        <ActionButton
                          onClick={() => setShowRejectModal(true)}
                          color="bg-red-500"
                          disabled={loading}
                          ariaLabel={`Reject order ${order.id}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </ActionButton>
                      </>
                    )}
                    {order.status === "accepted" && (
                      <ActionButton
                        onClick={() => handleComplete(order.id)}
                        color="bg-blue-500"
                        disabled={loading}
                        ariaLabel={`Mark order ${order.id} as Completed`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Mark Completed
                      </ActionButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card View for Mobile/Tablet */}
        {loading ? (
          <div className="text-center py-10 text-gray-600 flex items-center justify-center gap-2">
            <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 0116 0" />
            </svg>
            Loading orders...
          </div>
        ) : filteredAndSortedOrders.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No orders found.</p>
        ) : (
          <div className="space-y-6 lg:hidden">
            {filteredAndSortedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                updateOrderStatus={updateOrderStatus}
                onMarkCompleted={handleMarkCompleted}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminOrders;