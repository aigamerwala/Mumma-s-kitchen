import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes } from "react-icons/fa";

const Main = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [show2025Popup, setShow2025Popup] = useState(false);
  const [show2024Popup, setShow2024Popup] = useState(false);
  const [topDishes2025, setTopDishes2025] = useState([]);
  const [topDishes2024, setTopDishes2024] = useState([]);

  const handleOrderDish = (dishName) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to order a dish.");
      return;
    }
    alert(`You have successfully ordered "${dishName}"!`);
  };

  useEffect(() => {
    const fetchTopDishes2025 = async () => {
      const dummyData2025 = [
        { id: 1, name: "Spicy Butter Chicken", chef: "A. Sharma", image: "https://via.placeholder.com/150", link: "#" },
        { id: 2, name: "Masala Dosa Delight", chef: "B. Rao", image: "https://via.placeholder.com/150", link: "#" },
        { id: 3, name: "Paneer Tikka", chef: "C. Singh", image: "https://via.placeholder.com/150", link: "#" },
        { id: 4, name: "Hyderabadi Biryani", chef: "D. Khan", image: "https://via.placeholder.com/150", link: "#" },
        { id: 5, name: "Chole Bhature", chef: "E. Gupta", image: "https://via.placeholder.com/150", link: "#" },
      ];
      setTopDishes2025(dummyData2025);
    };

    const fetchTopDishes2024 = async () => {
      const dummyData2024 = [
        { id: 1, name: "Tandoori Chicken", chef: "K. Yadav", image: "https://via.placeholder.com/150", link: "#" },
        { id: 2, name: "Vada Pav", chef: "L. Mehta", image: "https://via.placeholder.com/150", link: "#" },
        { id: 3, name: "Rogan Josh", chef: "M. Ali", image: "https://via.placeholder.com/150", link: "#" },
        { id: 4, name: "Samosa Chaat", chef: "N. Reddy", image: "https://via.placeholder.com/150", link: "#" },
        { id: 5, name: "Fish Curry", chef: "O. Nair", image: "https://via.placeholder.com/150", link: "#" },
      ];
      setTopDishes2024(dummyData2024);
    };

    fetchTopDishes2025();
    fetchTopDishes2024();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section
        className="w-full h-[400px] sm:h-[500px] md:h-[600px] bg-cover bg-center relative flex flex-col justify-center items-center text-white text-center overflow-hidden"
        style={{ backgroundImage: `url(https://via.placeholder.com/1920x600?text=Mumma's+Kitchen)` }}
      >
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-lg">Welcome to Mumma's Kitchen</h1>
          <p className="mt-2 text-base sm:text-lg">Discover Delicious Dishes and Special Offers!</p>
          <div className="mt-6 flex items-center bg-white text-gray-700 px-4 py-2 rounded-lg shadow-md w-64 sm:w-80 mx-auto">
            <FaSearch className="mr-2 text-gray-500" />
            <input
              type="text"
              placeholder="Search for dish..."
              className="w-full focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Dishes Section */}
      <section className="max-w-6xl mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6">Featured Dishes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { name: "Butter Chicken", image: "https://via.placeholder.com/300", chef: "A. Sharma" },
            { name: "Masala Dosa", image: "https://via.placeholder.com/300", chef: "B. Rao" },
            { name: "Paneer Tikka", image: "https://via.placeholder.com/300", chef: "C. Singh" },
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
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center mb-6">Explore Our Daily Specials</h2>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
            <button
              key={day}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              onClick={() => setSearchQuery(day)}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col">
            <img src="https://via.placeholder.com/300" alt="Aloo Parantha" className="w-full h-48 object-cover rounded-md mb-4" />
            <h3 className="text-lg font-semibold">Aloo Parantha</h3>
            <p className="text-sm text-gray-600">Delicious parantha with spiced potato filling.</p>
            <p className="text-sm text-gray-600">Chef: John Doe</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => handleOrderDish("Aloo Parantha")}
            >
              Order Now
            </button>
          </div>
        </div>
      </div>

      {/* Top Dishes 2025 Section */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 sm:gap-10 p-6 sm:p-10 bg-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
          className="relative w-full md:w-1/2 overflow-hidden rounded-2xl shadow-lg"
        >
          <img
            src="https://via.placeholder.com/600x400?text=2025+Dishes"
            alt="2025 Dishes"
            className="w-full h-full object-cover rounded-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/2 text-center md:text-left space-y-4"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">New Year, New Flavors!</h2>
          <p className="text-gray-600 text-base sm:text-lg">Get your taste buds ready for 2025 with our must-try dishes!</p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 mt-4 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700"
            onClick={() => setShow2025Popup(true)}
          >
            View Details
          </motion.button>
        </motion.div>
      </div>

      <hr className="w-1/2 border-t-2 border-gray-300 my-4 mx-auto" />

      {/* Top Dishes 2024 Section */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 sm:gap-10 p-6 sm:p-10 bg-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
          className="relative w-full md:w-1/2 overflow-hidden rounded-2xl shadow-lg"
        >
          <img
            src="https://via.placeholder.com/600x400?text=2024+Dishes"
            alt="2024 Dishes"
            className="w-full h-full object-cover rounded-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/2 text-center md:text-left space-y-4"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Best Dishes of 2024</h2>
          <p className="text-gray-600 text-base sm:text-lg">Relive the flavors of 2024 with our top dishes of the year!</p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 mt-4 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700"
            onClick={() => setShow2024Popup(true)}
          >
            View Details
          </motion.button>
        </motion.div>
      </div>

      {/* Popup for Top Dishes 2025 */}
      <AnimatePresence>
        {show2025Popup && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-60 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShow2025Popup(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-50 w-11/12 max-w-5xl shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Top Dishes of 2025</h2>
                <button onClick={() => setShow2025Popup(false)} className="text-gray-600 hover:text-gray-800">
                  <FaTimes size={24} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {topDishes2025.map((dish, index) => (
                  <motion.div
                    key={dish.id}
                    className="bg-gray-100 rounded-lg p-4 flex flex-col items-center text-center shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <img src={dish.image} alt={dish.name} className="w-24 h-36 object-cover rounded-md mb-2" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">{dish.name}</h3>
                    <p className="text-sm text-gray-600">by {dish.chef}</p>
                    <a href={dish.link} target="_blank" rel="noopener noreferrer" className="mt-2 text-blue-600 hover:underline">
                      View More
                    </a>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Popup for Top Dishes 2024 */}
      <AnimatePresence>
        {show2024Popup && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-60 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShow2024Popup(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-50 w-11/12 max-w-5xl shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Top Dishes of 2024</h2>
                <button onClick={() => setShow2024Popup(false)} className="text-gray-600 hover:text-gray-800">
                  <FaTimes size={24} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {topDishes2024.map((dish, index) => (
                  <motion.div
                    key={dish.id}
                    className="bg-gray-100 rounded-lg p-4 flex flex-col items-center text-center shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <img src={dish.image} alt={dish.name} className="w-24 h-36 object-cover rounded-md mb-2" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">{dish.name}</h3>
                    <p className="text-sm text-gray-600">by {dish.chef}</p>
                    <a href={dish.link} target="_blank" rel="noopener noreferrer" className="mt-2 text-blue-600 hover:underline">
                      View More
                    </a>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
    </div>
  );
};

export default Main;