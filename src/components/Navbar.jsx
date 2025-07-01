import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { supabase } from "../supabaseClient";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const popupRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async (userId) => {
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        setIsLoggedIn(false);
        setIsAdmin(false);
      } else {
        setIsLoggedIn(true);
        setIsAdmin(data?.role === "admin");
      }
    };

    const getSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setIsLoggedIn(false);
        setIsAdmin(false);
      } else {
        await checkUser(user.id);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        checkUser(session.user.id);
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.id) {
        console.error("Error fetching user:", userError);
        return;
      }

      const userId = user.id;
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
      } else {
        setNotifications(data || []);
        setUnreadCount(data?.length || 0);
      }
    };

    if (isLoggedIn) {
      fetchNotifications();
    }

    const subscription = supabase
      .channel("notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        if (payload.new.user_id === supabase.auth.getUser()?.id) {
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isLoggedIn]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowNotifications(false);
        setShowMobileNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
      setNotifications(notifications.filter((n) => n.id !== id));
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleLogin = () => {
    navigate("/signin");
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setIsAdmin(false);
      navigate("/", { replace: true });
      setIsOpen(false);
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: isAdmin ? "/dashboard" : "/menu", label: isAdmin ? "Dashboard" : "Menu" },
    { path: isAdmin ? "/enquiry-reviews" : "/support", label: isAdmin ? "Support Tickets" : "Support" },
    { path: "/profile", label: "Profile" },
  ];

  const mobileMenuItems = [
    ...navItems,
    { label: "Calendar", action: () => setShowCalendar(!showCalendar), ariaLabel: "Toggle calendar" },
    { label: "Notifications", action: () => setShowMobileNotifications(!showMobileNotifications), ariaLabel: "Toggle notifications" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#8773f7] to-[#451ed3] text-white shadow-lg z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Brand Logo */}
        <Link to="/" className="text-xl sm:text-2xl font-bold">
          Mumma's Kitchen
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-4 lg:space-x-6 text-sm lg:text-base font-semibold">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="relative text-white hover:text-blue-400 transition-colors after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[2px] after:bg-blue-400 after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="cursor-pointer relative text-white hover:text-blue-400 transition-colors after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[2px] after:bg-blue-400 after:transition-all after:duration-300 hover:after:w-full"
                aria-label="Logout"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="cursor-pointer relative text-white hover:text-blue-400 transition-colors after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[2px] after:bg-blue-400 after:transition-all after:duration-300 hover:after:w-full"
                aria-label="Login"
              >
                Login
              </button>
            )}
          </li>
        </ul>

        {/* Desktop Right Section: Time, Calendar, Notifications */}
        <div className="hidden md:flex items-center space-x-3 sm:space-x-4">
          <div className="text-sm sm:text-base font-semibold">{currentTime}</div>

          {/* Calendar */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
              aria-label="Show calendar"
            >
              📅
            </motion.button>
            <AnimatePresence>
              {showCalendar && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 bg-gray-800 p-4 rounded-lg shadow-lg z-50 w-64 sm:w-72"
                >
                  <Calendar className="text-black" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative" ref={popupRef}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
              aria-label="Show notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </motion.button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 bg-gray-800 text-white shadow-lg rounded-lg p-4 w-64 sm:w-80 max-h-96 overflow-y-auto z-50"
                >
                  <h3 className="font-semibold text-lg mb-2">Notifications</h3>
                  {notifications.length === 0 ? (
                    <p className="text-gray-400">No new notifications</p>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="border-b border-gray-600 py-2 flex justify-between items-center">
                        <p className="text-sm">{notification.message}</p>
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-400 text-xs hover:text-blue-500"
                        >
                          Mark as Read
                        </button>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Menu Button (Only for Mobile) */}
        <div className="md:hidden flex items-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-16 left-0 w-full bg-gray-800 shadow-lg z-40"
            onClick={() => setIsOpen(false)}
          >
            <ul className="flex flex-col items-center space-y-4 py-6">
              {mobileMenuItems.map((item, index) => (
                <li key={item.path || index}>
                  {item.path ? (
                    <Link
                      to={item.path}
                      className="block py-2 text-white text-lg font-semibold hover:text-blue-400 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      className="block py-2 text-white text-lg font-semibold hover:text-blue-400 transition-colors"
                      onClick={() => {
                        item.action();
                        setIsOpen(false);
                      }}
                      aria-label={item.ariaLabel}
                    >
                      {item.label} {item.label === "Notifications" && unreadCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-bold w-5 h-5 inline-flex items-center justify-center rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  )}
                </li>
              ))}
              <li>
                {isLoggedIn ? (
                  <button
                    className="block py-2 text-white text-lg font-semibold hover:text-blue-400 transition-colors"
                    onClick={handleLogout}
                    aria-label="Logout"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    className="block py-2 text-white text-lg font-semibold hover:text-blue-400 transition-colors"
                    onClick={handleLogin}
                    aria-label="Login"
                  >
                    Login
                  </button>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar Popup (Accessible from Mobile Menu) */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 right-4 mt-2 bg-gray-800 p-4 rounded-lg shadow-lg z-50 w-64 sm:w-72"
            onClick={() => setShowCalendar(false)}
          >
            <Calendar className="text-black" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Popup (Accessible from Mobile Menu) */}
      <AnimatePresence>
        {showMobileNotifications && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 right-4 mt-2 bg-gray-800 text-white shadow-lg rounded-lg p-4 w-64 sm:w-80 max-h-96 overflow-y-auto z-50"
            onClick={() => setShowMobileNotifications(false)}
          >
            <h3 className="font-semibold text-lg mb-2">Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-gray-400">No new notifications</p>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="border-b border-gray-600 py-2 flex justify-between items-center">
                  <p className="text-sm">{notification.message}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent closing popup when clicking button
                      markAsRead(notification.id);
                    }}
                    className="text-blue-400 text-xs hover:text-blue-500"
                  >
                    Mark as Read
                  </button>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;