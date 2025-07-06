// src/components/ManualQRPayment.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const ManualQRPayment = ({ orderId, totalAmount }) => {
  const { user } = useAuth();
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleScreenshotChange = (e) => {
    setScreenshot(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId || !screenshot) {
      setError("Please enter transaction ID and upload screenshot");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const filePath = `${user.id}/manual_payments/${Date.now()}_${screenshot.name}`;
      const { data: uploadData, error: uploadError } = await supabase
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
          status: "Pending"
        }]);

      if (insertError) throw insertError;

      alert("Payment proof submitted! We’ll verify and update status shortly.");
      navigate("/profile");
    } catch (err) {
      console.error("Payment error:", err.message);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4">Pay via UPI QR</h2>
      <p className="text-gray-600 mb-2">Scan the QR below and make a payment of ₹{totalAmount}</p>

      <img
        src="/your-qr-code.png" // Replace with your QR image path
        alt="QR Code"
        className="w-60 mx-auto my-4 border border-gray-300"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">UPI Transaction ID</label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Upload Payment Screenshot</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleScreenshotChange}
            className="w-full"
            required
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded text-white font-semibold ${loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"}`}
        >
          {loading ? "Submitting..." : "Submit Payment Proof"}
        </button>
      </form>
    </div>
  );
};

export default ManualQRPayment;
