import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState("");

  const orderId = searchParams.get("order_id");

  const generateInvoice = (order, orderItems, user) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Invoice", 14, 22);
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.id}`, 14, 32);
    doc.text(`Customer: ${user.name}`, 14, 38);
    doc.text(`Email: ${user.email}`, 14, 44);
    doc.text(`Address: ${order.address}`, 14, 50);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 14, 56);

    const rows = orderItems.map(item => [
      item.item_id,
      item.quantity,
      `₹${item.price}`,
      `₹${item.price * item.quantity}`
    ]);

    doc.autoTable({
      head: [["Item ID", "Quantity", "Price", "Subtotal"]],
      body: rows,
      startY: 62,
    });

    doc.text(`Total: ₹${order.total_amount}`, 14, doc.lastAutoTable.finalY + 10);
    doc.save(`invoice_${order.id}.pdf`);
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !user) {
        setError("Missing order ID or user not logged in.");
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
        setError("Failed to fetch order.");
      } else {
        setOrder(orderData);
        setOrderItems(itemsData || []);
      }
      setLoading(false);
    };

    fetchOrderDetails();
  }, [orderId, user]);

  const handlePayment = async () => {
    setPaymentProcessing(true);

    try {
      // Simulate payment logic
      await new Promise((resolve) => setTimeout(resolve, 2000)); // simulate delay

      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", orderId);

      if (updateError) throw updateError;

      navigate("/order-success");
    } catch (err) {
      console.error("Payment failed:", err.message);
      setError("Payment failed. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) return <p className="p-6 text-white">Loading payment details...</p>;
  if (error) return <p className="text-red-500 p-6">{error}</p>;

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-white">Confirm Your Payment</h1>

      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {orderItems.map((item, index) => (
          <div key={index} className="flex justify-between border-b border-gray-600 py-2">
            <span>{item.item_id}</span>
            <span>{item.quantity} x ₹{item.price}</span>
          </div>
        ))}
        <div className="flex justify-between mt-4 text-lg font-bold">
          <span>Total</span>
          <span>₹{order.total_amount.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={paymentProcessing}
        className={`w-full py-3 rounded-md text-white font-semibold transition ${paymentProcessing ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
          }`}
      >
        {paymentProcessing ? "Processing Payment..." : "Pay Now"}
      </button>
    </div>
  );
};
export default Payment;