import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import librarybg from "./../assets/logo.jpg";

const Main = () => {
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(
    new Date().toLocaleString("en-US", { weekday: "long" })
  ); // Default to current day

  const handleOrderDish = (dishName) => {
    const token = localStorage.getItem("supabase_token");
    if (!token) {
      alert("Please log in to order a dish.");
      return;
    }
    alert(`You have successfully ordered "${dishName}"!`);
  };

  useEffect(() => {
    const fetchFeaturedDishes = async () => {
      try {
        setFeaturedLoading(true);
        const { data, error } = await supabase
          .from("featured_dishes")
          .select("*,items(*)");
        if (error) throw error;
        setFeaturedDishes(data || []);
      } catch (error) {
        console.error("Error fetching featured dishes:", error);
        setFeaturedDishes([]);
      } finally {
        setFeaturedLoading(false);
      }
    };

    const fetchDishes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("specials")
          .select("*,items(*)")
          .eq("day", selectedDay);
        if (error) throw error;
        setDishes(data || []);
      } catch (error) {
        console.error("Error fetching dishes:", error);
        setDishes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDishes();
    fetchDishes();
  }, [selectedDay]);

  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section
        className="relative h-[200px] sm:h-[300px] md:h-[400px] bg-cover bg-center flex items-center justify-center text-white text-center"
        style={{ backgroundImage: `url(${librarybg})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold drop-shadow-lg">
            Welcome to Mumma's Kitchen
          </h1>
          <p className="mt-2 text-sm sm:text-lg md:text-xl">
            Discover Delicious Dishes and Special Offers!
          </p>
        </motion.div>
      </section>

      {/* Featured Dishes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 text-center mb-8">
          Featured Dishes
        </h2>
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredLoading ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center text-gray-600 text-lg"
              >
                Loading featured dishes...
              </motion.p>
            ) : featuredDishes.length > 0 ? (
              featuredDishes.map((dish, index) => (
                <motion.div
                  key={dish.id || index}
                  className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                >
                  <img
                    src={dish.items.image_url}
                    alt={dish.items.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => (e.target.src = "/placeholder.jpg")}
                  />
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                      {dish.items.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">by {dish.items.chef}</p>
                    <button
                      className="mt-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() => handleOrderDish(dish.items.name)}
                    >
                      Order Now
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center text-gray-600 text-lg"
              >
                No featured dishes available right now.
              </motion.p>
            )}
          </div>
        </AnimatePresence>
      </section>

      {/* Daily Specials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 text-center mb-8">
          Explore Our Daily Specials
        </h2>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
            (day) => (
              <button
                key={day}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDay === day
                    ? "bg-blue-700 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </button>
            )
          )}
        </div>
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center text-gray-600 text-lg"
              >
                Loading...
              </motion.p>
            ) : dishes.length > 0 ? (
              dishes.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                >
                  <img
                    src={item.items.image_url}
                    alt={item.items.name}
                    className="h-48 object-cover"
                    onError={(e) => (e.target.src = "/placeholder.jpg")}
                  />
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                      {item.items.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{item.items.description}</p>
                    <p className="text-sm text-gray-600 mt-1">Chef: {item.items.chef}</p>
                    <button
                      className="mt-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() => handleOrderDish(item.items.name)}
                    >
                      Order Now
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center text-gray-600 text-lg"
              >
                No specials available for {selectedDay}.
              </motion.p>
            )}
          </div>
        </AnimatePresence>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 text-center mb-8">
          About Mumma's Kitchen
        </h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Mumma's Kitchen is your go-to place for authentic Indian cuisine, offering a variety
              of dishes made with love and tradition.
            </p>
            <h4 className="mt-6 text-lg font-semibold text-blue-600">🍽️ Wide Variety</h4>
            <p className="text-gray-600 text-sm sm:text-base">
              From North to South India, we cater to all taste buds.
            </p>
            <h4 className="mt-4 text-lg font-semibold text-blue-600">🥗 Fresh Ingredients</h4>
            <p className="text-gray-600 text-sm sm:text-base">
              Prepared with the freshest ingredients for quality and taste.
            </p>
            <h4 className="mt-4 text-lg font-semibold text-blue-600">🚀 Fast Delivery</h4>
            <p className="text-gray-600 text-sm sm:text-base">
              Enjoy meals delivered to your doorstep in no time.
            </p>
          </div>
          <div className="md:w-1/2">
            <img
              src="/assets/kitchen.jpg"
              alt="Mumma's Kitchen"
              className="h-100 w-150 rounded-xl shadow-md"
              onError={(e) => (e.target.src = "/placeholder.jpg")}
            />
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 text-center mb-8">
          Customer Reviews
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "John Doe", review: "Amazing food! The Butter Chicken is to die for!" },
            { name: "Eva Lichi", review: "Loved the Masala Dosa. Great service!" },
            { name: "Robert Brown", review: "Best Indian restaurant in town!" },
          ].map((review, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <h3 className="text-lg font-semibold text-gray-800">{review.name}</h3>
              <p className="text-sm text-gray-600 mt-2">{review.review}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Main;