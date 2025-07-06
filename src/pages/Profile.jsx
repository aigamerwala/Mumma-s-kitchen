import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import "../styles/loader.css";

// ✅ Modal imports
import EditProfileModal from "../components/modals/EditProfileModal";
import OrdersModal from "../components/modals/OrdersModal";
import MyAccountModal from "../components/modals/MyAccountModal";
import SavedAddressesModal from "../components/modals/SavedAddressesModal";
import PaymentMethodsModal from "../components/modals/PaymentMethodsModal";
import TransactionsModal from "../components/modals/TransactionsModal";
import Cart from "./Cart.jsx"
import CartModal from "../components/modals/CartModal";

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userPhoto, setUserPhoto] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: "", email: "", password: "" });
    const [popup, setPopup] = useState(null);

    const [UserDishData, setUserDishData] = useState({
        OrderedItems: [],
        CartItems: [],
        transactions: [],
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !sessionData.session) return navigate("/signin", { replace: true });

            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("id, name, email, profile_picture, role")
                .eq("id", sessionData.session.user.id)
                .single();

            if (userError) return navigate("/signin", { replace: true });

            setUser(userData);
            setUserPhoto(userData.profile_picture || "https://via.placeholder.com/150");

            const fetchUserDishData = async (userId) => {
                const { data: CartItems, error: cartError } = await supabase
                    .from("cart")
                    .select("*")
                    .eq("user_id", userId);

                const { data: OrderedItems, error: ordersError } = await supabase
                    .from('orders')
                    .select(`*, 
                        order_items( quantity, price,
                        items( name, image_url
                            ))`)
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });


                if (cartError) {
                    console.error("Error fetching cart:", cartError);
                }
                if (ordersError) {
                    console.error("Error fetching orders:", ordersError.message);
                }
                setUserDishData(prev => ({
                    ...prev,
                    OrderedItems: OrderedItems || [],
                    CartItems: CartItems || [],
                }));
            };
            console.log("User Dish Data:", UserDishData);

            const { data: transactionsData, error: transactionsError } = await supabase
                .from("transactions")
                .select("*")
                .eq("user_id", userData.id)
                .order("created_at", { ascending: false });
            if (transactionsError) {
                console.error("Error fetching transactions:", transactionsError);
            }

            setUserDishData(prev => ({ ...prev, transactions: transactionsData || [] }));

            await fetchUserDishData(userData.id);
            setLoading(false);
            if (userData.role === "admin") navigate("/adminprofile", { replace: true });
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
        if (password) await supabase.auth.updateUser({ password });
        const { error } = await supabase.from("users").update(updates).eq("id", user.id);
        if (!error) {
            setUser({ ...user, name, email });
            setIsEditing(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;
        const filePath = `${user.id}/profile_pictures/${file.name}_${Date.now()}`;
        if (user.profile_picture) {
            const oldFilePath = user.profile_picture.split("/").slice(-2).join("/");
            await supabase.storage.from("profile-pictures").remove([oldFilePath]);
        }
        await supabase.storage.from("profile-pictures").upload(filePath, file, { cacheControl: "3600", upsert: true });
        const { data: publicUrlData } = supabase.storage.from("profile-pictures").getPublicUrl(filePath);
        const imageUrl = publicUrlData.publicUrl;
        await supabase.from("users").update({ profile_picture: imageUrl }).eq("id", user.id);
        setUserPhoto(imageUrl);
        setUser({ ...user, profile_picture: imageUrl });
        alert("Profile picture updated successfully!");
    };

    if (loading) return (<div className="flex justify-center items-center h-64">
        <div className="loader"></div>
    </div>);
    const openPopup = (type) => setPopup(type);

    return (
        <div className="min-h-screen w-full bg-gray-900 flex justify-center items-center p-6">
            {/* ✅ Main profile content (unchanged) */}
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl w-full max-w-4xl relative border border-white/20">
                {/* Profile Header */}
                <div className="flex items-center gap-6 border-b border-gray-500 pb-4">
                    <div className="relative w-24 h-24">
                        <div className="rounded-full overflow-hidden w-full h-full">
                            <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                            id="photoInput"
                        />
                        <label
                            htmlFor="photoInput"
                            className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 bg-blue-500 text-white p-2 rounded-full text-sm cursor-pointer hover:bg-blue-600 transition-all z-10"
                        >
                            📷
                        </label>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-white">{user?.name}</h2>
                        <p className="text-gray-300">{user?.email}</p>
                        <p className="text-gray-400 text-sm mt-1 capitalize">{user?.role}</p>
                    </div>
                </div>

                {/* Edit Button */}
                <div className="absolute top-25 right-7 text-right">
                    <button
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-all duration-300"
                        onClick={handleEditClick}
                    >
                        ✏️ Edit
                    </button>
                </div>

                {/* Main Buttons */}
                <div className="flex flex-col items-center mt-6 gap-4">
                    {["My Account", "Orders", "Saved Addresses", "Payment Methods", "Transactions", "Your Cart"].map((label) => (
                        <motion.button
                            key={label}
                            whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(0, 255, 255, 0.6)" }}
                            className={`w-64 bg-gray-800 text-white px-5 py-3 rounded-lg text-lg font-semibold transition-all hover:bg-gray-700 ${label === "Late Fees" && totalLateFees === 0 ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            onClick={() => {
                                if (label === "My Account") openPopup("myaccount");
                                if (label === "Orders") openPopup("orders");
                                if (label === "Saved Addresses") openPopup("savedaddresses");
                                if (label === "Transactions") openPopup("transactions");
                                if (label === "Payment Methods") openPopup("paymentmethods");
                                if (label === "Your Cart") openPopup("yourcart");
                            }}
                        >
                            {label}
                        </motion.button>
                    ))}
                </div>
            </div>
            {/* ✅ Edit Modal */}
            <AnimatePresence>
                {isEditing && (
                    <EditProfileModal
                        editData={editData}
                        setEditData={setEditData}
                        onSave={handleSaveChanges}
                        onClose={() => setIsEditing(false)}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {popup === "orders" && (
                    <OrdersModal
                        onClose={() => setPopup(null)}
                        orders={UserDishData.OrderedItems}
                    />
                )}
                {popup === "myaccount" && (
                    <MyAccountModal
                        onClose={() => setPopup(null)}
                        user={user}
                    />
                )}
                {popup === "savedaddresses" && (
                    <SavedAddressesModal
                        onClose={() => setPopup(null)}
                        userId={user.id}
                    />
                )}
                {popup === "paymentmethods" && (
                    <PaymentMethodsModal
                        onClose={() => setPopup(null)}
                        userId={user.id}
                    />
                )}
                {popup === "transactions" && (
                    <TransactionsModal
                        onClose={() => setPopup(null)}
                        transactions={UserDishData.transactionsData || []}
                    />
                )}
                {popup === "yourcart" && (
                    <Cart
                        onClose={() => setPopup(null)}
                        cartItems={UserDishData.CartItems}
                    />
                )}
            </AnimatePresence>
            {/* ✅ Loader for async operations */}
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="loader"></div>
                </div>
            )}
        </div>
    );
}

export default Profile;