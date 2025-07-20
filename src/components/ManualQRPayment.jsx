import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const PaymentForm = ({ orderId, totalAmount, user, error, setError, setSuccess,loading, setLoading, navigate }) => {
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const fileInputRef = useRef(null);

  const handleScreenshotChange = (e) => {
    setScreenshot(e.target.files[0]);
  };

  const handleCustomFileClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId || !screenshot) {
      setError("Please enter transaction ID and upload a screenshot");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const filePath = `${user.id}/manual_payments/${Date.now()}_${screenshot.name}`;
      const { error: uploadError } = await supabase
        .storage
        .from("payment-screenshots")
        .upload(filePath, screenshot);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase
        .storage
        .from("payment-screenshots")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from("manual_payments")
        .insert([{
          user_id: user.id,
          order_id: orderId,
          transaction_id: transactionId,
          screenshot_url: publicUrl,
          status: "pending"
        }]);

      if (insertError) throw insertError;

      setSuccess("Payment proof submitted! We’ll verify and update status shortly.");
      setTimeout(() => navigate("/profile"), 2000); // Redirect after 2 seconds
    } catch (err) {
      console.error("Payment error:", err.message);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="transactionId" className="block text-gray-700 font-medium mb-1">
          UPI Transaction ID
        </label>
        <input
          type="text"
          id="transactionId"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          className={`w-full px-4 py-2 rounded-md border ${
            !transactionId && error ? "border-red-500" : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-green-500`}
          required
          aria-required="true"
          placeholder="Enter UPI Transaction ID"
        />
      </div>
      <div>
        <label htmlFor="screenshot" className="block text-gray-700 font-medium mb-1">
          Upload Payment Screenshot
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            id="screenshot"
            accept="image/*"
            onChange={handleScreenshotChange}
            className="hidden"
            required
            aria-required="true"
            ref={fileInputRef}
          />
          <button
            type="button"
            onClick={handleCustomFileClick}
            className={`w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md border ${
              !screenshot && error ? "border-red-500" : "border-gray-300"
            } hover:bg-gray-200 transition text-left`}
          >
            {screenshot ? screenshot.name : "Choose an image"}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 text-white rounded-md transition text-lg font-medium ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
        }`}
        aria-label="Submit payment proof"
      >
        {loading ? "Submitting..." : "Submit Payment Proof"}
      </button>
    </form>
  );
};

const ManualQRPayment = ({ orderId, totalAmount }) => {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div
      className="container mx-auto py-16 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pay via UPI QR</h2>
        <p className="text-gray-600 mb-4">
          Scan the QR code below to make a payment of ₹{totalAmount.toFixed(2)}
        </p>
        <img
          src="/QR.jpg" 
          alt="UPI QR Code for payment"
          className="w-64 mx-auto my-6 border border-gray-300 rounded-lg shadow-md"
        />
        {error && (
          <p className="text-red-500 mb-4" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-500 mb-4" role="alert">
            {success}
          </p>
        )}
        <PaymentForm
          orderId={orderId}
          totalAmount={totalAmount}
          user={user}
          error={error} // Pass error as a prop
          setError={setError}
          setSuccess={setSuccess}
          setLoading={setLoading}
          navigate={navigate}
        />
        <Link
          to="/profile"
          className="mt-4 inline-block text-blue-500 hover:text-blue-700 font-medium"
        >
          Back to Profile
        </Link>
      </div>
    </motion.div>
  );
};

export default ManualQRPayment;