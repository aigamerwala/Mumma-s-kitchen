import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import librarybg from "./../assets/logo.jpg"; // Adjust the path as necessary
const Main = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDay, setSelectedDay] = useState('Monday'); // Default to Monday
  const handleOrderDish = (dishName) => {
    const token = localStorage.getItem("supabase_token");
    if (!token) {
      alert("Please log in to order a dish.");
      return;
    }
    alert(`You have successfully ordered "${dishName}"!`);
  };
  useEffect(() => {
    const fetchDishes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("specials")
        .select("*")
        .eq("day", selectedDay);

      if (error) {
        console.error("Error fetching dishes:", error);
      } else {
        setDishes(data);
      }
      setLoading(false);
    };

    fetchDishes();
  }, [selectedDay]);
  return (
    <div className="w-full min-h-screen bg-gray-200 transition-all duration-300">
      {/* Hero Section */}
      <section
        className=" h-[200px] sm:h-[300px] md:h-[400px] bg-cover bg-center relative flex flex-col justify-center items-center text-white text-center overflow-hidden"
        style={{ backgroundImage: `url(${librarybg})` }}
      >
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-lg">Welcome to Mumma's Kitchen</h1>
          <p className="mt-2 text-base sm:text-lg">Discover Delicious Dishes and Special Offers!</p>
        </motion.div>
      </section>

      {/* Featured Dishes Section */}
      <section className="max-w-6xl mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6">Featured Dishes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { name: "Aloo Parantha", image: "https://via.placeholder.com/300", chef: "Mumma's Kitchen" },
            { name: "Sabzi", image: "https://via.placeholder.com/300", chef: "Mumma's Kitchen" },
            { name: "Sabzi 2", image: "https://via.placeholder.com/300", chef: "Mumma's Kitchen" },
          ].map((dish, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <img src={dish.image} alt={dish.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{dish.name}</h3>
                <p className="text-sm text-gray-600">by {dish.chef}</p>
                <button
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => handleOrderDish(dish.name)}
                >
                  Order Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700">How It Works</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {["Search", "Order", "Enjoy", "Share"].map((step, index) => (
            <motion.div
              key={index}
              className="p-6 bg-white shadow-lg rounded-lg"
              whileHover={{ scale: 1.1 }}
            >
              <h3 className="text-lg font-semibold text-blue-600">{step}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Daily Specials Section */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center mb-6">Explore Our Daily Specials</h2>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
            <button
              key={day}
              className={`px-4 py-2 rounded-lg transition ${selectedDay === day ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {!loading && dishes.length > 0 ? (
            dishes.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-4 flex flex-col">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                <p className="text-sm text-gray-600">Chef: {item.chef}</p>
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => handleOrderDish(item.name)}
                >
                  Order Now
                </button>
              </div>
            ))
          ) : loading ? (
            <p className="text-center col-span-full text-gray-600">Loading...</p>
          ) : (
            <p className="text-center col-span-full text-gray-600">No specials available for {selectedDay}.</p>
          )}
        </div>
      </section>

      {/* About Section */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center mb-6">About Mumma's Kitchen</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <p className="text-gray-600 text-base sm:text-lg">
              Mumma's Kitchen is your go-to place for authentic Indian cuisine, offering a variety of dishes made with love and tradition.
            </p>
            <h4 className="mt-4 text-lg font-semibold">🍽️ Wide Variety of Dishes</h4>
            <p>We offer a range of dishes from North to South India, catering to all taste buds.</p>
            <h4 className="mt-4 text-lg font-semibold">🥗 Fresh Ingredients</h4>
            <p>Our dishes are prepared with the freshest ingredients to ensure quality and taste.</p>
            <h4 className="mt-4 text-lg font-semibold">🚀 Fast Delivery</h4>
            <p>Enjoy our delicious meals delivered right to your doorstep in no time.</p>
          </div>
          <div className="md:w-1/2">
            <img src="https://via.placeholder.com/600x400?text=Kitchen" alt="Kitchen" className="w-full h-auto rounded-lg" />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center mb-6">Customer Reviews</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { name: "John Doe", review: "Amazing food! The Butter Chicken is to die for!", image: "https://via.placeholder.com/100" },
            { name: "Eva Lichi", review: "Loved the Masala Dosa. Great service!", image: "https://via.placeholder.com/100" },
            { name: "Robert Brown", review: "Best Indian restaurant in town!", image: "https://via.placeholder.com/100" },
          ].map((review, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center text-center">
              <img src={review.image} alt={review.name} className="w-16 h-16 rounded-full mb-2" />
              <h3 className="text-lg font-semibold">{review.name}</h3>
              <p className="text-sm text-gray-600">{review.review}</p>
            </div>
          ))}
        </div>
      </div>
    </div >
  );
};

export default Main;