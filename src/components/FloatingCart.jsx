import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import React from "react";
const FloatingCart = () => {
    const { cartItems } = useCart();
    const navigate = useNavigate();

    return (
      <div
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer flex items-center gap-2 hover:bg-blue-700 transition-all z-50"
        onClick={() => navigate("/cart")}
      >
        🛒View Cart
        {cartItems.length > 0 && (
          <span className="bg-red-500 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {cartItems.length}
          </span>
        )}
      </div>
    );
  };
export default FloatingCart;