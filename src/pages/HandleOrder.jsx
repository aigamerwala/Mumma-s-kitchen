import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

const CartItemSummary = ({ item }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-md rounded-lg mb-4">
      <div className="flex items-center space-x-4">
        <img
          src={item.image || "https://via.placeholder.com/80"}
          alt={item.name}
          className="w-16 h-16 object-cover rounded"
        />
        <div>
          <h3 className="text-base font-semibold text-gray-800">{item.name}</h3>
          <p className="text-gray-600">₹{item.price.toFixed(2)} × {item.quantity}</p>
          <p className="text-gray-800 font-medium">Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

const HandleOrder = () => {
  const { cartItems, clearCart } = useCart();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCheckout = async () => {
    setError("");
    setIsLoading(true);

    if (!address.trim()) {
      setError("Please enter a delivery address");
      setIsLoading(false);
      return;
    }

    if (!user) {
      setError("Please log in to place an order");
      setIsLoading(false);
      return;
    }

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{ user_id: user.id, address, total_amount: total }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItemsData = cartItems.map((item) => ({
        order_id: order.id,
        item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItemsData);

      if (itemsError) throw itemsError;

      clearCart();
      navigate("/payment");
    } catch (err) {
      console.error("Order error:", err.message);
      setError("Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
          {cartItems.length === 0 ? (
            <p className="text-gray-600">No items in cart.</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItemSummary key={item.id} item={item} />
              ))}
              <div className="flex justify-between text-lg font-semibold text-gray-900 mt-4">
                <span>Total ({cartItems.length} items):</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          )}
          <Link
            to="/cart"
            className="mt-4 inline-block text-blue-500 hover:text-blue-700 font-medium"
          >
            Back to Cart
          </Link>
        </div>

        {/* Delivery Details */}
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Details</h2>
          {error && (
            <p className="text-red-500 mb-4" role="alert">
              {error}
            </p>
          )}
          <div className="mb-4">
            <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
              Delivery Address
            </label>
            <textarea
              id="address"
              placeholder="Enter your delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                error && !address.trim() ? "border-red-500" : ""
              }`}
              rows="4"
              aria-label="Delivery address"
            />
          </div>
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className={`w-full py-3 text-white rounded-md transition ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            } text-lg font-medium`}
            aria-label="Confirm and proceed to payment"
          >
            {isLoading ? "Processing..." : "Confirm & Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HandleOrder;