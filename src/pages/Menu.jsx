import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import NavbarOrders from "../components/NavbarOrders";
import { supabase } from "../supabaseClient";
import "../styles/Menu.css"; // Ensure you have the styles for the loader and other components
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";


const Menu = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const days = ["Available Dishes", "Sunday Specials", "Monday Specials", "Tuesday Specials", "Wednesday Specials", "Thursday Specials", "Friday Specials", "Saturday Specials"];
  const { addToCart } = useCart();
  const { cartItems } = useCart();
  console.log(cartItems);

  const scrollToDay = (day) => {
    refs[day]?.current?.scrollIntoView({ behavior: "smooth" });
  };
  const refs = useRef(
    days.reduce((acc, day) => {
      acc[day] = React.createRef();
      return acc;
    }, {})).current;


  const [activeDay, setActiveDay] = useState("sunday");
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

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        const today = new Date().toLocaleDateString("en-US", { weekday: "long" }); // e.g., "Monday"

        // Step 1: Fetch all specials with related items
        const { data: specials, error: specialsError } = await supabase
          .from("specials")
          .select("*, items(*)");

        if (specialsError) throw specialsError;

        // Step 2: Get item IDs used in specials
        const specialItemIds = specials.map((dish) => dish.items?.id).filter(Boolean);

        // Step 3: Fetch all items NOT in specials
        const { data: allItems, error: itemsError } = await supabase
          .from("items")
          .select("*")
          .not("id", "in", `(${specialItemIds.join(",") || "NULL"})`);

        if (itemsError) throw itemsError;

        // Step 4: Create virtual "available" section
        const availableTodaySpecials = specials
          .filter((dish) => dish.day === today)
          .map((dish) => ({
            ...dish,
            day: "Available",
          }));

        const availableOtherItems = allItems.map((item) => ({
          items: item,
          day: "Available",
        }));

        // Step 5: Combine everything
        const allDishes = [...specials, ...availableOtherItems, ...availableTodaySpecials];

        setDishes(allDishes);
      } catch (error) {
        console.error("Error fetching dishes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDishes();

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const topSection = visible[0].target.getAttribute("data-day");
          setActiveDay(topSection);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -50% 0px",
        threshold: 0.5,
      }
    );

    days.forEach((day) => {
      const el = refs[day]?.current;
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [refs]);

  const filteredDishes = dishes.filter((dish) => {
    return (
      dish.items?.name?.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === "" || dish.items?.category === categoryFilter)
    );
  });


  // Handle dish order
  const handleOrderDish = (dishId, dishName, available) => {
    const token = localStorage.getItem("supabasetoken");
    if (!token) {
      alert("You must be logged in to place an order.");
      navigate("/SignIn");
      return;
    }

    if (available <= 0) {
      alert("Sorry, this dish is currently unavailable.");
      return;
    }

    alert(`Your order for "${dishName}" has been placed successfully!`);
    setDishes((prevDishes) =>
      prevDishes.map((dish) =>
        dish.id === dishId ? { ...dish, available: dish.available - 1 } : dish
      )
    );
  };
  const dishesByDay = days.reduce((acc, dayLabel) => {
    const key = dayLabel.split(" ")[0]; // "Monday", "Available", etc.
    acc[dayLabel] = filteredDishes.filter(
      (dish) => dish.day?.toLowerCase() === key.toLowerCase()
    );
    return acc;
  }, {});

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex flex-1">
        {/* Sidebar */}
        <div
          className={`fixed top-16 left-0 h-full bg-gray-800 text-white transition-all duration-300 ${sidebarOpen ? "w-64" : "w-0 overflow-hidden"
            }`}
        >
          {sidebarOpen && <NavbarOrders days={days} activeDay={activeDay} onDayClick={scrollToDay} />}
        </div>
        <button
          className="fixed top-20 left-4 bg-blue-500 text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:bg-blue-600 z-50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "⬅" : "➡"}
        </button>

        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
          <h1 className="text-center text-2xl sm:text-3xl font-bold mb-4 mt-20 text-blue-700">Order Your Favorite Dishes</h1>

          {/* Search & Filters */}
          <div className="mt-4 p-4 bg-white shadow-md rounded-lg flex flex-col md:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border p-2 rounded-md w-full md:w-auto"
            >
              <option value="">All Categories</option>
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
              <option value="dessert">Desserts</option>
            </select>
          </div>


          {/* Dish Collection */}
          <div className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="loader"></div>
              </div>
            ) : (days.map((day) => (
              <div
                key={day}
                ref={refs[day]}
                data-day={day}
                className="p-4 bg-gray-100 shadow-md rounded-lg mb-6"
              >
                <h2 className="text-center text-xl sm:text-2xl font-semibold mb-4 text-gray-800">{day}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                  {dishesByDay[day]?.length > 0 ? (
                    dishesByDay[day].map((dish) => (
                      <motion.div
                        key={dish.id}
                        className="p-4 bg-white shadow-md rounded-lg"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <img
                          src={dish.items.image_url}
                          alt={dish.items.name}
                          className="h-48 object-cover"
                          onError={(e) => (e.target.src = "/placeholder.jpg")}
                        />
                        <h3 className="font-semibold text-lg">{dish.items.name}</h3>
                        <p className="text-sm text-gray-600">Chef: {dish.items.chef}</p>
                        <p className="text-sm text-gray-600">Category: {dish.items.category}</p>
                        <p className="text-sm text-gray-600">Price: ₹{dish.items.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Available: {(dish.items.in_stock) ? "Yes" : "No"}</p>
                        <div className="flex gap-4 mt-2">
                          <button
                            onClick={() => handleOrderDish(dish.id, dish.items.name, dish.items.in_stock)}
                            className={`px-3 py-1 rounded text-white ${dish.items.in_stock
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-400 cursor-not-allowed"
                              }`}
                          >
                            {dish.items.in_stock ? "Order Now" : "Out of Stock"}
                          </button>
                          <button
                            onClick={() => {
                              addToCart({
                                id: dish.items.id,
                                name: dish.items.name,
                                price: dish.items.price,
                                image: dish.items.image_url
                              });
                              toast.success(`${dish.items.name} added to cart!`);
                            }}
                            className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                          >
                            Add to Cart
                          </button>
                          <button
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={() => setSelectedDish(dish)}
                          >
                            View Details
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-gray-500">No dishes available.</p>
                  )}
                </div>
              </div>
            )))}
          </div>

        </div>
      </div>

      {/* View Details Popup */}
      <AnimatePresence>
        {selectedDish && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full flex flex-col md:flex-row gap-4"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ duration: 0.2 }}
            >
              {/* Dish Image */}
              <div className="w-full md:w-1/3">
                {selectedDish.items.image_url ? (
                  <img
                    src={selectedDish.items.image_url}
                    alt={selectedDish.items.name}
                    className="w-full h-64 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded">
                    No Image Available
                  </div>
                )}
              </div>

              {/* Dish Details */}
              <div className="w-full md:w-2/3 relative">
                <h2 className="text-xl font-bold mb-2">{selectedDish.items.name}</h2>
                <p className="text-gray-600 mb-2">
                  <strong>Chef:</strong> {selectedDish.items.chef}
                </p>
                <div className="flex items-center mb-2">
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="ml-2 text-gray-600">115 reviews</span>
                </div>
                <p className="text-gray-600 mb-2">
                  <strong>Category:</strong> {selectedDish.items.category}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Price:</strong> ${selectedDish.items.price.toFixed(2)}
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Description:</strong> {selectedDish.items.description}
                </p>
                <button
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => setSelectedDish(null)}
                >
                  Close
                </button>
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedDish(null)}
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Floating Cart Icon */}
      <FloatingCart className="cursor-pointer" />
    </div>
  );
};

export default Menu;