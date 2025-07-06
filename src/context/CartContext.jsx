// 📁 src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);

  // ✅ Fetch user ID when available
  useEffect(() => {
    const getUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const id = sessionData?.session?.user?.id;
      if (id) {
        setUserId(id);
        fetchCartFromDB(id);
      }
    };
    getUser();
  }, []);

  // ✅ Fetch cart items from Supabase
  const fetchCartFromDB = async (id) => {
    const { data, error } = await supabase
      .from("cart")
      .select("*, items(*)")
      .eq("user_id", id);

    if (data) {
      const formatted = data.map((item) => ({
        id: item.item_id,
        name: item.items.name,
        price: item.items.price,
        image_url: item.items.image_url,
        quantity: item.quantity,
      }));
      setCartItems(formatted);
    } else {
      console.error("Failed to fetch cart:", error);
    }
  };
  useEffect(() => {
    if (userId) {
      fetchCartFromDB(userId);
    }
  }, [userId]);


  // ✅ Add item to cart
  const addToCart = async (item) => {
    const exists = cartItems.find((ci) => ci.id === item.id);
    if (exists) {
      await updateQuantity(item.id, exists.quantity + 1);
      return;
    }

    setCartItems((prev) => [...prev, { ...item, quantity: 1 }]);

    await supabase.from("cart").insert({
      user_id: userId,
      item_id: item.id,
      quantity: 1,
    });
  };

  // ✅ Remove item from cart
  const removeFromCart = async (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));

    await supabase
      .from("cart")
      .delete()
      .eq("user_id", userId)
      .eq("item_id", itemId);
  };

  // ✅ Update quantity
  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) return removeFromCart(itemId);

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
    const { error } = await supabase
      .from("cart")
      .update({ quantity })
      .eq("user_id", userId)
      .eq("item_id", itemId);
    if (error) {
      console.error("Failed to update quantity:", error);
    }
  };
  const clearCart = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) return;

    // Delete from Supabase cart table
    await supabase.from("cart").delete().eq("user_id", userId);

    // Clear from local state
    setCartItems([]);
  };
  // useEffect(() => {
  //   const handleAuthChange = async () => {
  //     const { data: sessionData } = await supabase.auth.getSession();
  //     const id = sessionData?.session?.user?.id;
  //     setUserId(id);
  //     if (id) {
  //       fetchCartFromDB(id);
  //     } else {
  //       setCartItems([]);
  //     }
  //   };

  //   const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, []);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
