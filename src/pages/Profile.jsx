import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import "../styles/loader.css";
import EditProfileModal from "../components/modals/EditProfileModal";
import OrdersModal from "../components/modals/OrdersModal";
import MyAccountModal from "../components/modals/MyAccountModal";
import SavedAddressesModal from "../components/modals/SavedAddressesModal";
import PaymentMethodsModal from "../components/modals/PaymentMethodsModal";
import TransactionsModal from "../components/modals/TransactionsModal";
import Cart from "./Cart.jsx";

const ProfileButton = ({ label, onClick, disabled, icon }) => (
  <motion.button
    whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(59, 130, 246, 0.6)" }}
    whileTap={{ scale: 0.95 }}
    className={`w-full sm:w-64 bg-blue-600 text-white px-5 py-3 rounded-lg text-base font-semibold transition-all hover:bg-blue-700 flex items-center justify-center gap-2 ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    }`}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
  >
    {icon}
    {label}
  </motion.button>
);

const ProfilePictureUploader = ({ userPhoto, onPhotoChange, userId }) => (
  <div className="relative w-20 h-20 sm:w-24 sm:h-24">
    <div className="rounded-full overflow-hidden w-full h-full border-2 border-blue-500">
      <img src={userPhoto} alt="User profile" className="w-full h-full object-cover" />
    </div>
    <input
      type="file"
      accept="image/*"
      onChange={onPhotoChange}
      className="hidden"
      id="photoInput"
    />
    <label
      htmlFor="photoInput"
      className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 sm:p-2 rounded-full text-sm cursor-pointer hover:bg-blue-600 transition-all z-10"
      aria-label="Upload profile picture"
    >
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h3m3 0h3a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6" />
      </svg>
    </label>
  </div>
);

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPhoto, setUserPhoto] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "", password: "" });
  const [popup, setPopup] = useState(null);
  const [feedback, setFeedback] = useState("");

  const [UserDishData, setUserDishData] = useState({
    OrderedItems: [],
    CartItems: [],
    transactions: [],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        navigate("/signin", { replace: true });
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name, email, profile_picture, role")
        .eq("id", sessionData.session.user.id)
        .single();

      if (userError) {
        navigate("/signin", { replace: true });
        return;
      }

      setUser(userData);
      setUserPhoto(userData.profile_picture || "https://via.placeholder.com/150");

      const fetchUserDishData = async (userId) => {
        const { data: CartItems, error: cartError } = await supabase
          .from("cart")
          .select("*")
          .eq("user_id", userId);

        const { data: OrderedItems, error: ordersError } = await supabase
          .from("orders")
          .select("*, order_items(quantity, price, items(name, image_url))")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (cartError) console.error("Error fetching cart:", cartError);
        if (ordersError) console.error("Error fetching orders:", ordersError.message);

        setUserDishData((prev) => ({
          ...prev,
          OrderedItems: OrderedItems || [],
          CartItems: CartItems || [],
        }));

        const { data: transactionsData, error: transactionsError } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", userData.id)
          .order("created_at", { ascending: false });

        if (transactionsError) console.error("Error fetching transactions:", transactionsError);

        setUserDishData((prev) => ({ ...prev, transactions: transactionsData || [] }));
      };

      await fetchUserDishData(userData.id);
      setLoading(false);
      if (userData.role === "admin") navigate("/admin/profile", { replace: true });
    };

    fetchProfile();
  }, [navigate]);

  const handleEditClick = () => {
    setEditData({ name: user?.name, email: user?.email, password: "" });
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    const { name, email, password } = editData;
    const updates = { name, email };
    setFeedback("");
    try {
      if (password) await supabase.auth.updateUser({ password });
      const { error } = await supabase.from("users").update(updates).eq("id", user.id);
      if (error) throw error;
      setUser({ ...user, name, email });
      setIsEditing(false);
      setFeedback("Profile updated successfully");
    } catch (err) {
      console.error("Update error:", err.message);
      setFeedback("Failed to update profile");
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setFeedback("");
    setLoading(true);
    try {
      const filePath = `${user.id}/profile_pictures/${file.name}_${Date.now()}`;
      if (user.profile_picture) {
        const oldFilePath = user.profile_picture.split("/").slice(-2).join("/");
        await supabase.storage.from("profile-pictures").remove([oldFilePath]);
      }
      await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });
      const { data: publicUrlData } = supabase.storage.from("profile-pictures").getPublicUrl(filePath);
      const imageUrl = publicUrlData.publicUrl;
      await supabase.from("users").update({ profile_picture: imageUrl }).eq("id", user.id);
      setUserPhoto(imageUrl);
      setUser({ ...user, profile_picture: imageUrl });
      setFeedback("Profile picture updated successfully");
    } catch (err) {
      console.error("Photo upload error:", err.message);
      setFeedback("Failed to update profile picture");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/signin", { replace: true });
    } catch (err) {
      console.error("Logout error:", err.message);
      setFeedback("Failed to log out");
    }
  };

  const buttonConfig = useMemo(
    () => [
      { label: "My Account", popup: "myaccount", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
      { label: "Orders", popup: "orders", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
      { label: "Saved Addresses", popup: "savedaddresses", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
      { label: "Payment Methods", popup: "paymentmethods", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
      { label: "Transactions", popup: "transactions", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
      { label: "Your Cart", popup: "yourcart", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    ],
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 0116 0" />
          </svg>
          <p className="text-gray-300">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-900 flex justify-center items-center p-4 sm:p-6 lg:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl w-full max-w-md sm:max-w-lg lg:max-w-5xl border border-white/20">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border-b border-gray-500 pb-4">
          <ProfilePictureUploader userPhoto={userPhoto} onPhotoChange={handlePhotoChange} userId={user?.id} />
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">{user?.name}</h2>
            <p className="text-gray-300 text-sm sm:text-base">{user?.email}</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 capitalize">{user?.role}</p>
          </div>
        </div>

        {/* Edit and Logout Buttons */}
        <div className="flex justify-between items-center mt-4 sm:mt-6">
          <button
            className="bg-blue-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-sm sm:text-base"
            onClick={handleEditClick}
            aria-label="Edit profile"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
          <button
            className="bg-red-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-red-600 transition-all flex items-center gap-2 text-sm sm:text-base"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h3a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>

        {/* Feedback Message */}
        <AnimatePresence>
          {feedback && (
            <motion.p
              className={`mt-4 text-sm text-center ${feedback.includes("Failed") ? "text-red-400" : "text-green-400"}`}
              role="alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {feedback}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Main Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 sm:mt-8">
          {buttonConfig.map(({ label, popup, icon }) => (
            <ProfileButton
              key={label}
              label={label}
              onClick={() => setPopup(popup)}
              icon={icon}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isEditing && (
          <EditProfileModal
            editData={editData}
            setEditData={setEditData}
            onSave={handleSaveChanges}
            onClose={() => setIsEditing(false)}
          />
        )}
        {popup === "orders" && (
          <OrdersModal onClose={() => setPopup(null)} orders={UserDishData.OrderedItems} />
        )}
        {popup === "myaccount" && (
          <MyAccountModal onClose={() => setPopup(null)} user={user} />
        )}
        {popup === "savedaddresses" && (
          <SavedAddressesModal onClose={() => setPopup(null)} userId={user.id} />
        )}
        {popup === "paymentmethods" && (
          <PaymentMethodsModal onClose={() => setPopup(null)} userId={user.id} />
        )}
        {popup === "transactions" && (
          <TransactionsModal onClose={() => setPopup(null)} transactions={UserDishData.transactions || []} />
        )}
        {popup === "yourcart" && (
          <Cart onClose={() => setPopup(null)} cartItems={UserDishData.CartItems} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Profile;