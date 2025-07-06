import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const OrdersModal = ({ onClose, ordersData }) => {
  const modalRef = useRef(null);

  // Handle Esc key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Focus trapping
  useEffect(() => {
    const modalElement = modalRef.current;
    modalElement.focus();
    const focusableElements = modalElement.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modalElement.addEventListener("keydown", handleTabKey);
    return () => modalElement.removeEventListener("keydown", handleTabKey);
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Calculate total price for an order
  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-label="Orders Modal"
    >
      <motion.div
        ref={modalRef}
        className="bg-gray-800 text-white rounded-xl p-6 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 max-h-[80vh] overflow-y-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
      >
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center">
          🧾 Your Orders
        </h2>
        {ordersData?.length === 0 ? (
          <p className="text-gray-400 text-center">No orders found.</p>
        ) : (
          <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
            {Array.isArray(ordersData) && ordersData.map((order) => (
              <li
                key={order.id}
                className="border-b border-gray-600 pb-4 last:border-b-0"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-semibold text-lg">Order #{order.id}</p>
                    <p className="text-sm text-gray-400">
                      Placed: {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === "Completed"
                        ? "bg-green-500"
                        : order.status === "Pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    } text-white`}
                  >
                    {order.status}
                  </span>
                </div>
                <ul className="space-y-2">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => (e.target.src = "/assets/placeholder.jpg")}
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">🍽 {item.name}</p>
                        <p className="text-sm text-gray-400">
                          ₹{item.price} x {item.quantity}
                        </p>
                        {item.chef && (
                          <p className="text-xs text-gray-500">Chef: {item.chef}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-sm font-semibold">
                    Total: ₹{calculateTotal(order.items)}
                  </p>
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    onClick={() => alert(`View details for Order #${order.id}`)}
                    aria-label={`View details for Order #${order.id}`}
                  >
                    View Details
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-base"
            onClick={onClose}
            aria-label="Close orders modal"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrdersModal;