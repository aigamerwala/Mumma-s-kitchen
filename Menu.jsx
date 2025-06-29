import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import NavbarOrders from "../components/NavbarOrders";

const Menu = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDish, setSelectedDish] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const scrollToDay = (day) => {
    refs[day]?.current?.scrollIntoView({ behavior: "smooth" });
  };
  const refs = days.reduce((acc, day) => {
    acc[day] = useRef(null);
    return acc;
  }, {});
  const [activeDay, setActiveDay] = useState("sunday");

  // Simulated data fetch for dishes
  useEffect(() => {
    const fetchDishes = async () => {
      setLoadingMore(true);
      try {
        const dummyDishes = [
          {
            id: `${page}-1`,
            name: "Butter Chicken",
            chef: "A. Sharma",
            category: "Non-Veg",
            description: "Creamy tomato-based chicken curry with rich spices.",
            image: "https://via.placeholder.com/300",
            price: 15.99,
            available: 10,
          },
        ];
        setDishes((prevDishes) => [...prevDishes, ...dummyDishes]);
      } catch (error) {
        console.error("Error fetching dishes:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
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
  }, [page, refs]);

  // Filter dishes
  const filteredDishes = dishes.filter((dish) => {
    return (
      dish.name.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === "" || dish.category === categoryFilter)
    );
  });

  // Handle dish order
  const handleOrderDish = (dishId, dishName, available) => {
    const token = localStorage.getItem("token");
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

  // Load more dishes
  const loadMoreDishes = () => {
    setPage((prevPage) => prevPage + 1);
  };

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
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 mt-20 text-blue-700">Order Your Favorite Dishes</h1>

          {/* Search & Filters */}
          {/*<div className="mt-4 p-4 bg-white shadow-md rounded-lg flex flex-col md:flex-row items-center gap-4">
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
              <option value="Veg">Vegetarian</option>
              < option value="Non-Veg">Non-Vegetarian</option>
              <option value="Dessert">Desserts</option>
            </select>
          </div>
        */}

          {/* Dish Collection */}
          <div className="mt-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800">
              Available Dishes
            </h2>
            {loading ? (
              <p>Loading dishes...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDishes.map((dish) => (
                  <motion.div
                    key={dish.id}
                    className="p-4 bg-gray-100 shadow-md rounded-lg"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
                  >
                    <h3 className="font-semibold text-lg">{dish.name}</h3>
                    <p className="text-sm text-gray-600">Chef: {dish.chef}</p>
                    <p className="text-sm text-gray-600">Category: {dish.category}</p>
                    <p className="text-sm text-gray-600">Price: ${dish.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Available: {dish.available}</p>
                    <div className="flex gap-4 mt-2">
                      <button
                        onClick={() => handleOrderDish(dish.id, dish.name, dish.available)}
                        className={`px-3 py-1 rounded text-white ${dish.available > 0
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gray-400 cursor-not-allowed"
                          }`}
                      >
                        {dish.available > 0 ? "Place Order" : "Out of Stock"}
                      </button>
                      <button
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => setSelectedDish(dish)}
                      >
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center items-center mt-4">
            {loadingMore && <p>Loading more dishes...</p>}
          </div>
          <button
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={loadMoreDishes}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load More Dishes"}
          </button>
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
                {selectedDish.image ? (
                  <img
                    src={selectedDish.image}
                    alt={selectedDish.name}
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
                <h2 className="text-xl font-bold mb-2">{selectedDish.name}</h2>
                <p className="text-gray-600 mb-2">
                  <strong>Chef:</strong> {selectedDish.chef}
                </p>
                <div className="flex items-center mb-2">
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="ml-2 text-gray-600">115 reviews</span>
                </div>
                <p className="text-gray-600 mb-2">
                  <strong>Category:</strong> {selectedDish.category}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Price:</strong> ${selectedDish.price.toFixed(2)}
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Description:</strong> {selectedDish.description}
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
    </div >
  );
};

export default Menu;