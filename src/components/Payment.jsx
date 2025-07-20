import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";

// import autoTable from "jspdf-autotable"; // Import the plugin directly
// autoTable(jsPDF); // This registers the plugin with jsPDF
import "jspdf-autotable"; // ✅ this alone is enough
// import autoTable from "jspdf-autotable";
// autoTable(jsPDF);


const OrderItem = ({ item }) => (
  <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-600">
    <div className="flex items-center gap-2">
      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <span>{item.item_name}</span>
      <span className="text-gray-200 text-sm sm:text-base">Item #{item.item_name}</span>
    </div>
    <span className="text-gray-200 text-sm sm:text-base">{item.quantity} x ₹{item.price.toFixed(2)}</span>
  </div>
);

const ActionButton = ({ onClick, children, color, disabled, ariaLabel, icon }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition ${disabled ? "bg-gray-500 cursor-not-allowed" : `${color} hover:${color.replace("500", "600")}`
      }`}
    disabled={disabled}
    aria-label={ariaLabel}
  >
    {icon}
    {children}
  </motion.button>
);

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const orderId = searchParams.get("order_id");
  // useEffect(() => {
  //   // Load the plugin dynamically so it's attached to window.jspdf
  //   import('jspdf-autotable');

  // }, []);
  /*
    const generateInvoice = (order, orderItems, user) => {
      const doc = new jsPDF();
      console.log(typeof doc.autoTable); // should log: function
      doc.setFontSize(18);
      doc.text("Mumma's Kitchen Invoice", 14, 22);
      doc.setFontSize(12);
      doc.text(`Order ID: ${order.id}`, 14, 32);
      doc.text(`Customer: ${user.name}`, 14, 38);
      doc.text(`Email: ${user.email}`, 14, 44);
      doc.text(`Address: ${order.address}`, 14, 50);
      doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 14, 56);
  
      const rows = orderItems.map((item) => [
        item.item_id,
        item.quantity,
        `₹${item.price.toFixed(2)}`,
        `₹${(item.price * item.quantity).toFixed(2)}`
      ]);
  
      doc.autoTable({
        head: [["Item ID", "Quantity", "Price", "Subtotal"]],
        body: rows,
        startY: 62,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        bodyStyles: { textColor: [50, 50, 50] },
      });
  
      doc.text(`Total: ₹${order.total_amount.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);
      doc.save(`invoice_${order.id}.pdf`);
    };
  */
  const generateInvoice = (order, orderItems, user) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Mumma's Kitchen Invoice", 14, 20);

    if (typeof doc.autoTable === "function") {
      doc.autoTable({
        startY: 30,
        head: [["Item ID", "Quantity", "Price", "Subtotal"]],
        body: orderItems.map((item) => [
          item.item_id,
          item.quantity,
          `₹${item.price.toFixed(2)}`,
          `₹${(item.price * item.quantity).toFixed(2)}`
        ]),
      });
    } else {
      console.error("autoTable is not available on doc");
    }

    doc.text(`Total: ₹${order.total_amount.toFixed(2)}`, 14, doc.lastAutoTable?.finalY + 10 || 60);
    doc.save(`invoice_${order.id}.pdf`);
  };


  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !user) {
        setError("Missing order ID or user not logged in.");
        setLoading(false);
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (orderError || itemsError) {
        setError("Failed to fetch order details.");
      } else {
        setOrder(orderData);
        setOrderItems(itemsData || []);
      }
      setLoading(false);
    };

    fetchOrderDetails();
  }, [orderId, user]);

  const calculateFinalAmount = useMemo(() => {
    if (!order) return 0;
    let total = order.total_amount;
    if (paymentMethod === "Razorpay") {
      total += total * 0.04; // 4% extra
    } else if (paymentMethod === "UPI") {
      total -= 10; // ₹10 discount
    }
    return total.toFixed(2);
  }, [order, paymentMethod]);

  const handlePayment = async () => {
    if (!window.confirm(`Confirm payment of ₹${calculateFinalAmount} using ${paymentMethod}?`)) return;
    setPaymentProcessing(true);
    setFeedback("");
    setError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate payment delay
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_method: paymentMethod,
          total_amount: calculateFinalAmount,
        })
        .eq("id", orderId);

      if (updateError) throw updateError;
      if (paymentMethod === "Razorpay") {
        setFeedback("Razorpay payment is under maintainance. Please try again later.");
        // Handle Razorpay specific logic
      }
      if (paymentMethod === "UPI") {
        setFeedback("Please scan the UPI QR code to complete the payment.");
        setTimeout(() => {
          navigate("/qr-payment");
        }, 3000);
        // Handle UPI specific logic
      }
      if (paymentMethod === "COD") {
        setFeedback("Payment processed successfully via Cash on Delivery, please have the exact amount ready.");
        // Handle Cash on Delivery logic
      }
    } catch (err) {
      console.error("Payment failed:", err.message);
      setError("Payment failed. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (order && orderItems && user) {
      generateInvoice(order, orderItems, user);
    } else {
      setError("Unable to generate invoice. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 0116 0" />
          </svg>
          <p className="text-gray-300 text-sm sm:text-base">Loading payment details...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="min-h-screen bg-gray-900 flex justify-center items-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-red-400 text-sm sm:text-base p-6 text-center" role="alert">
          {error}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-900 flex justify-center items-center p-4 sm:p-6 lg:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl border border-white/20">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Confirm Your Payment
        </h1>

        {/* Order Summary */}
        <div className="bg-white/5 p-4 sm:p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Order Summary
          </h2>
          {orderItems.map((item, index) => (
            <OrderItem key={index} item={item} />
          ))}
          <div className="flex justify-between mt-4 text-sm sm:text-base">
            <span className="text-gray-200 font-medium">Original Total:</span>
            <span className="text-gray-200">₹{order.total_amount.toFixed(2)}</span>
          </div>
          {paymentMethod === "Razorpay" && (
            <div className="flex justify-between text-sm mt-2 text-yellow-400">
              <span>Razorpay Fee (4%)</span>
              <span>+₹{(order.total_amount * 0.04).toFixed(2)}</span>
            </div>
          )}
          {paymentMethod === "UPI" && (
            <div className="flex justify-between text-sm mt-2 text-green-400">
              <span>UPI Discount</span>
              <span>-₹10.00</span>
            </div>
          )}
          <div className="flex justify-between mt-4 text-base sm:text-lg font-bold text-white">
            <span>Final Amount</span>
            <span>₹{calculateFinalAmount}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label htmlFor="paymentMethod" className="text-white block mb-2 font-medium text-sm sm:text-base">
            Select Payment Method:
          </label>
          <div className="relative">
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 sm:py-3 rounded-lg border border-gray-300 bg-white/10 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              aria-label="Select payment method"
            >
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="Razorpay">Online Payment (Razorpay +4% charge)</option>
              <option value="UPI">UPI / QR (₹10 Instant Discount)</option>
            </select>
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {(feedback || error) && (
            <motion.p
              className={`mb-4 text-sm sm:text-base text-center ${error ? "text-red-400" : "text-green-400"}`}
              role="alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error || feedback}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <ActionButton
            onClick={handlePayment}
            color="bg-green-500"
            disabled={paymentProcessing}
            ariaLabel={`Pay ₹${calculateFinalAmount}`}
            icon={
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
          >
            {paymentProcessing ? "Processing Payment..." : `Pay ₹${calculateFinalAmount}`}
          </ActionButton>
          <ActionButton
            onClick={handleDownloadInvoice}
            color="bg-blue-500"
            disabled={paymentProcessing}
            ariaLabel="Download invoice"
            icon={
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
          >
            Download Invoice
          </ActionButton>
        </div>
      </div >
    </motion.div >
  );
};

export default Payment;