// src/pages/HandleOrder.jsx
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext"; 

const HandleOrder = () => {
  const { cartItems, clearCart } = useCart();
  const [address, setAddress] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const handleCheckout = async () => {
    if (!address.trim()) {
      alert("Please enter delivery address");
      return;
    }

    if (!user) {
      alert("Please login to place an order");
      return;
    }

    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          user_id: user.id,
          address: address,
          total_amount: total
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert order_items
      const orderItemsData = cartItems.map(item => ({
        order_id: order.id,
        item_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      alert("Order placed successfully!");
      clearCart();
      navigate("/payment");
    } catch (err) {
      console.error("Order error:", err.message);
      alert("Failed to place order. Try again.");
    }
  };


  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <p className="mb-2">Total Items: {cartItems.length}</p>
      <p className="mb-2 font-semibold">Total Amount: ₹{total.toFixed(2)}</p>

      <textarea
        placeholder="Enter your delivery address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full border p-2 rounded mb-4"
        rows="4"
      />

      <button
        onClick={handleCheckout}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Confirm & Proceed to Payment
      </button>
    </div>
  );
};

export default HandleOrder;
