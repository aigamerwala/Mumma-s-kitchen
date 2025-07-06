import React from 'react';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../supabaseClient";
import ReservationActionModal from "../../components/modals/ReservationActionModal";
import "../../styles/loader.css"; 

const AdminProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userPhoto, setUserPhoto] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "", password: "" });
  const [usersPopup, setUsersPopup] = useState(false);
  const [manageitemsPopup, setManageitemsPopup] = useState(false);
  const [requestsPopup, setRequestsPopup] = useState(false);
  const [returnRequestsPopup, setReturnRequestsPopup] = useState(false);
  const [reservationsPopup, setReservationsPopup] = useState(false);
  const [transactionPopup, setTransactionPopup] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [commentPopup, setCommentPopup] = useState(null); // { id, action }
  const [commentText, setCommentText] = useState("");
  const [successPopup, setSuccessPopup] = useState(false);
  const [items, setitems] = useState([]);
  const [addDishPopup, setAddDishPopup] = useState(false);
  const [isbnPopup, setIsbnPopup] = useState(false);
  const [manualAddPopup, setManualAddPopup] = useState(false);
  const [modifyitemsPopup, setModifyitemsPopup] = useState(false);
  const [edititemPopup, setEdititemPopup] = useState(null); // { id, name, author, isbn, ... }
  const [deleteitemsPopup, setDeleteitemsPopup] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [file, setFile] = useState(null);
  const [uuid, setUuid] = useState("");


  const [manualDishData, setManualDishData] = useState({
    image_url: "",
    name: "",
    description: "",
    price: "",
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

      if (userError || userData.role !== "admin") return navigate("/profile", { replace: true });

      setUser(userData);
      setUserPhoto(userData.profile_picture);
      setLoading(false);
      fetchAllUsers();
      fetchTransactions();
    };

    fetchProfile();
  }, [navigate]);
  const uploadImage = async (file) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('items-img')
      .upload(fileName, file);

    if (error) {
      console.error("Upload error", error);
      return null;
    }

    const publicUrl = supabase.storage
      .from('items-img')
      .getPublicUrl(fileName).data.publicUrl;
    return publicUrl;
  };

  const fetchAllUsers = async () => {
    const { data, error } = await supabase.from("users").select("id, name, email, role");
    if (!error) setAllUsers(data);
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase.from("transactions").select("*,users(name),items(name)");
    if (!error) {
      setTransactions(data);
    } else {
      setTransactions([]);
    }
  };

  const handleEditClick = () => {
    setEditData({ name: user?.name, email: user?.email, password: "" });
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    const { name, email, password } = editData;
    const updates = { name, email };
    if (password) updates.password = password;

    const { error } = await supabase.from("users").update(updates).eq("id", user.id);
    if (!error) {
      setUser({ ...user, name, email });
      setIsEditing(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    const filePath = `user_${user.id}/profile_pictures/${file.name}_${Date.now()}`;
    if (user.profile_picture) {
      const oldFilePath = user.profile_picture.split("/").slice(-2).join("/");
      await supabase.storage.from("profile-pictures").remove([oldFilePath]);
    }

    const { error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(filePath, file, { cacheControl: "3600", upsert: true });

    if (uploadError) return;

    const { data: publicUrlData } = supabase.storage.from("profile-pictures").getPublicUrl(filePath);
    const imageUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase.from("users").update({ profile_picture: imageUrl }).eq("id", user.id);
    if (!updateError) {
      setUserPhoto(imageUrl);
      setUser({ ...user, profile_picture: imageUrl });
    }
  };
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !uuid) {
      alert("Please provide both UUID and an image file.");
      return;
    }

    const fileName = `${uuid}_${Date.now()}_${file.name}`;

    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase
        .storage
        .from("items-img")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Image Upload error:", uploadError.message);
        throw uploadError;
      }

      // Get Public URL
      const { data: publicUrlData } = supabase
        .storage
        .from("items-img")
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData?.publicUrl;

      // Store URL in DB
      const { error: dbError } = await supabase
        .from("items")
        .update({ image_url: imageUrl })
        .eq("id", uuid);

      if (dbError) throw dbError;

      alert("Image uploaded and URL saved successfully!");
      setFile(null);
      setUuid("");
    } catch (error) {
      console.error("Modification failed:", error.message);
      alert("Failed to upload image or update database.");
    }
  };

  const handleManualAddSubmit = async () => {
    if (!manualDishData.name || !manualDishData.description || !manualDishData.price) {
      alert("Please fill in all required fields.");
      return;
    }
    console.log(manualDishData);
    const dish = {
      name: manualDishData.name || "Unknown",
      description: manualDishData.description || "Unknown",
      price: manualDishData.price || 0,
      image_url: manualDishData.image_url || "NULL",
    };
    const { error } = await supabase.from("items").insert([dish]);
    if (error) throw error;
    setSuccessPopup("Dish successfully added!");
    setTimeout(() => navigate("/profile"), 1000);
  };
  const fetchitems = async () => {
    const { data, error } = await supabase.from("items").select("*");
    if (!error) setitems(data);

  };

  const handleEdititem = (item) => {
    setEdititemPopup(item);
  };

  const handleModifyitemsubmit = async () => {
    try {
      // 🔁 Update the item in Supabase
      const { error } = await supabase
        .from("items")
        .update(edititemPopup)
        .eq("id", edititemPopup.id);

      if (error) {
        console.error("❌ Error updating item:", error.message);
        return;
      }

      // ✅ Update frontend state
      setitems(items.map(item => item.id === edititemPopup.id ? { ...edititemPopup } : item));
      setEdititemPopup(null);
      setModifyitemsPopup(false);
      setManageitemsPopup(false);
      setSuccessPopup("item successfully modified!");

      fetchitems();
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      console.error("❌ Unexpected error updating item:", err);
    }
  };


  const handleDeleteitem = async (itemId) => {
    try {
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", itemId);

      if (error) {
        console.error("❌ Error deleting item:", error.message);
        return;
      }

      setitems(items.filter(item => item.id !== itemId));
      setSuccessPopup("item successfully deleted!");
    } catch (err) {
      console.error("❌ Unexpected error deleting item:", err);
    }
    fetchitems();
  };

  const calculateTotalFee = () => {
    return transactions.reduce((total, transaction) => total + (transaction.lateFees || 0), 0);
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="min-h-screen w-full bg-gray-900 flex justify-center items-center p-6">
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl w-full max-w-4xl relative border border-white/20">
        <div className="flex items-center gap-6 border-b border-gray-500 pb-4">
          <div className="relative w-24 h-24">
            <div className="rounded-full overflow-hidden w-full h-full">
              <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photoInput" />
            <label htmlFor="photoInput" className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 bg-blue-500 text-white p-2 rounded-full text-sm cursor-pointer hover:bg-blue-600 transition-all z-10">📷</label>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">{user?.name}</h2>
            <p className="text-gray-300">{user?.email}</p>
            <p className="text-gray-400 text-sm mt-1 capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="absolute top-25 right-7 text-right">
          <button className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-all duration-300" onClick={handleEditClick}>✏️ Edit</button>
        </div>

        <div className="flex flex-col items-center mt-6 gap-4">
          <motion.button whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(0, 255, 255, 0.6)" }} className="w-64 bg-blue-600 text-white px-5 py-3 rounded-lg text-lg font-semibold transition-all hover:bg-blue-700" onClick={() => setUsersPopup(true)}>View All Users</motion.button>
          <motion.button whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(0, 255, 255, 0.6)" }} className="w-64 bg-blue-600 text-white px-5 py-3 rounded-lg text-lg font-semibold transition-all hover:bg-blue-700" onClick={() => setManageitemsPopup(true)}>Manage Dish</motion.button>
          <motion.button whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(0, 255, 255, 0.6)" }} className="w-64 bg-blue-600 text-white px-5 py-3 rounded-lg text-lg font-semibold transition-all hover:bg-blue-700" onClick={() => setRequestsPopup(true)}>Approve item Requests</motion.button>
          <motion.button whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(0, 255, 255, 0.6)" }} className="w-64 bg-blue-600 text-white px-5 py-3 rounded-lg text-lg font-semibold transition-all hover:bg-blue-700" onClick={() => setReturnRequestsPopup(true)}>Approve Return Request</motion.button>
          <motion.button whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(0, 255, 255, 0.6)" }} className="w-64 bg-blue-600 text-white px-5 py-3 rounded-lg text-lg font-semibold transition-all hover:bg-blue-700" onClick={() => setReservationsPopup(true)}>Approve Reservation</motion.button>
          <motion.button whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(0, 255, 255, 0.6)" }} className="w-64 bg-blue-600 text-white px-5 py-3 rounded-lg text-lg font-semibold transition-all hover:bg-blue-700" onClick={() => setTransactionPopup(true)}>Transaction</motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} />
            <motion.div className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-96 z-50" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-lg font-semibold mb-3">Edit Profile</h3>
              <label className="block mb-2"><span className="text-gray-400">Name</span><input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full p-2 border rounded-lg bg-gray-700 text-white" /></label>
              <label className="block mb-2"><span className="text-gray-400">Email</span><input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="w-full p-2 border rounded-lg bg-gray-700 text-white" /></label>
              <label className="block mb-2"><span className="text-gray-400">New Password</span><input type="password" value={editData.password} onChange={(e) => setEditData({ ...editData, password: e.target.value })} className="w-full p-2 border rounded-lg bg-gray-700 text-white" /></label>
              <div className="flex justify-end mt-4">
                <button className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600 transition-all" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all" onClick={handleSaveChanges}>Save Changes</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {usersPopup && (
          <>
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUsersPopup(false)} />
            <motion.div className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-[600px] z-50" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-lg font-semibold mb-4">All Users</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                <div className="flex justify-between p-3 bg-blue-600 rounded-lg font-semibold"><span className="w-1/3">Name</span><span className="w-1/3 text-center">Email</span><span className="w-1/3 text-right">Role</span></div>
                {allUsers.length > 0 ? allUsers.map((user, index) => (
                  <motion.div key={index} className="flex justify-between p-3 bg-gray-700 rounded-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <span className="w-1/3">{user.name}</span><span className="w-1/3 text-center">{user.email}</span><span className="w-1/3 text-right capitalize">{user.role}</span>
                  </motion.div>
                )) : <p className="text-gray-400">No users found</p>}
              </div>
              <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all w-full" onClick={() => setUsersPopup(false)}>Close</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {manageitemsPopup && (
          <>
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setManageitemsPopup(false)} />
            <motion.div className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-[600px] z-50" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-lg font-semibold mb-4">Manage Dishes</h3>
              <div className="flex justify-between gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(0, 255, 255, 0.6)" }}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
                  onClick={() => setAddDishPopup(true)}
                >
                  Add Dish
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(0, 255, 255, 0.6)" }}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                  onClick={() => setModifyitemsPopup(true)}
                >
                  Modify items
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(0, 255, 255, 0.6)" }}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                  onClick={() => setDeleteitemsPopup(true)}
                >
                  Delete items
                </motion.button>
              </div>
              <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all w-full" onClick={() => setManageitemsPopup(false)}>Close</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addDishPopup && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddDishPopup(false)} />
            <motion.div
              className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-96 z-60"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-lg font-semibold mb-4">Add Dish</h3>
              <div className="flex flex-col gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(0, 255, 255, 0.6)" }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                  onClick={() => setIsbnPopup(true)}
                >
                  Add Dish Image
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(0, 255, 255, 0.6)" }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                  onClick={() => setManualAddPopup(true)}
                >
                  Add Dish
                </motion.button>
              </div>
              <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all w-full" onClick={() => setAddDishPopup(false)}>Close</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isbnPopup && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAddDishPopup(false)}
          >
            <motion.div
              className="bg-gray-800 text-white p-6 rounded-xl shadow-lg w-96 z-60 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // Prevent backdrop click
            >
              <form onSubmit={handleUpload} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter UUID"
                  value={uuid}
                  onChange={(e) => setUuid(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400"
                />
                <input
                  type="file"
                  accept="image/*"
                  placeholder='Select an image'
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                  className="w-full text-white border border-gray-600 rounded-md bg-gray-700 px-4 py-2 placeholder-gray-400"
                />
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    className="bg-gray-500 px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
                    onClick={() => setIsbnPopup(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
                  >
                    Upload
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {manualAddPopup && (
          <>
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setManualAddPopup(false)} />
            <motion.div className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-96 z-70" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-lg font-semibold mb-4">Manually Add Dish</h3>
              <div className="space-y-3">
                <input type="file" accept="image/*" onChange={(e) => setManualDishData({ ...manualDishData, image_url: URL.createObjectURL(e.target.files[0]) })} className="w-full p-2 border rounded-lg bg-gray-700 text-white" />
                <input type="text" value={manualDishData.name} onChange={(e) => setManualDishData({ ...manualDishData, name: e.target.value })} placeholder="Name" className="w-full p-2 border rounded-lg bg-gray-700 text-white" />
                <input type="text" value={manualDishData.description} onChange={(e) => setManualDishData({ ...manualDishData, description: e.target.value })} placeholder="Description" className="align-text-top w-full p-3 border rounded-lg bg-gray-700 text-white" />
                <input type="text" value={manualDishData.price} onChange={(e) => setManualDishData({ ...manualDishData, price: e.target.value })} placeholder="Price" className="w-full p-2 border rounded-lg bg-gray-700 text-white" />
                {/*<span className="align-middle flex"><p className="">Is Weekly item</p>
                 <input type="checkbox" checked={manualDishData.weeklyitem} onChange={(e) => setManualDishData({ ...manualDishData, weeklyitem: e.target.checked })} placeholder="Is Weekly item" className="align-middle ml-4" /> 
                </span> */}
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all" onClick={() => setManualAddPopup(false)}>Cancel</button>
                <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all" onClick={handleManualAddSubmit}>Add</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modifyitemsPopup && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModifyitemsPopup(false)} />
            <motion.div
              className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-[600px] z-60"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-lg font-semibold mb-4">
                Modify Dishes
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                <div className="flex justify-between p-3 bg-blue-600 rounded-lg font-semibold">
                  <span className="w-1/4">Dish Name</span>
                  <span className="w-1/4 text-center">Chef Name</span>
                  <span className="w-1/4 text-center">Dish ID</span>
                  <span className="w-1/4 text-right">Price</span>
                  <span className="w-1/4 text-right">Actions</span>
                </div>
                {items.length > 0 ? items.map((item, index) => (
                  <motion.div key={index} className="flex justify-between p-3 bg-gray-700 rounded-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <span className="w-1/4">{item.name}</span>
                    <span className="w-1/4 text-center">{item.chef}</span>
                    <span className="w-1/4 text-center">{item.id}</span>
                    <span className="w-1/4 text-right">{item.price}</span>
                    <span className="w-1/4 text-right">
                      <button className="text-blue-500 hover:underline" onClick={() => handleEditItem(item)}>Edit</button>
                      <button className="text-red-500 hover:underline ml-2" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                    </span>
                  </motion.div>
                )) : <p className="text-gray-400">No dishes found</p>}
              </div>
              <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all w-full" onClick={() => setModifyitemsPopup(false)}>Close</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {edititemPopup && (
          <>
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEdititemPopup(null)} />
            <motion.div className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-96 z-70" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-lg font-semibold mb-4">Edit item</h3>
              <div className="space-y-3">
                <input type="file" accept="image/*" onChange={(e) => setEdititemPopup({ ...edititemPopup, coverImage: URL.createObjectURL(e.target.files[0]) })} className="w-full p-2 border rounded-lg bg-gray-700 text-white" />
                <input type="text" value={edititemPopup.name} onChange={(e) => setEdititemPopup({ ...edititemPopup, name: e.target.value })} placeholder="Name" className="w-full p-2 border rounded-lg bg-gray-700 text-white" />
                <input type="text" value={edititemPopup.chef} onChange={(e) => setEdititemPopup({ ...edititemPopup, chef: e.target.value })} placeholder="Chef Name" className="w-full p-2 border rounded-lg bg-gray-700 text-white" />
                <input type="text" value={edititemPopup.description} onChange={(e) => setEdititemPopup({ ...edititemPopup, description: e.target.value })} placeholder="Description" className="w-full p-2 border rounded-lg bg-gray-700 text-white" />
                <input type="text" value={edititemPopup.addition || ""} onChange={(e) => setEdititemPopup({ ...edititemPopup, addition: e.target.value })} placeholder="Addition" className="w-full p-2 border rounded-lg bg-gray-700 text-white" />
                <input type="number" value={edititemPopup.price || ""} onChange={(e) => setEdititemPopup({ ...edititemPopup, price: e.target.value })} placeholder="Price" className="w-full p-2 border rounded-lg bg-gray-700 text-white" />
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all" onClick={() => setEdititemPopup(null)}>Cancel</button>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all" onClick={handleModifyitemsubmit}>Modify</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteitemsPopup && (
          <>
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteitemsPopup(false)} />
            <motion.div className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-[600px] z-60" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-lg font-semibold mb-4">Delete items</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                <div className="flex justify-between p-3 bg-blue-600 rounded-lg font-semibold">
                  <span className="w-1/4">item Name</span>
                  <span className="w-1/4 text-center">Author Name</span>
                  <span className="w-1/4 text-center">ISBN Number</span>
                  <span className="w-1/4 text-right">Action</span>
                </div>
                {items.length > 0 ? items.map((item, index) => (
                  <motion.div key={index} className="flex justify-between p-3 bg-gray-700 rounded-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <span className="w-1/4">{item.name}</span>
                    <span className="w-1/4 text-center">{item.description}</span>
                    <span className="w-1/4 text-center">{item.price}</span>
                    <span className="w-1/4 text-right">
                      <button className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition-all" onClick={() => handleDeleteitem(item.id)}>Delete</button>
                    </span>
                  </motion.div>
                )) : <p className="text-gray-400">No items found</p>}
              </div>
              <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all w-full" onClick={() => setDeleteitemsPopup(false)}>Close</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/*
      <AnimatePresence>
        {requestsPopup && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRequestsPopup(false)} />
            <motion.div
              className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-[600px] z-50"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-lg font-semibold mb-4">item Requests</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                <div className="flex justify-between p-3 bg-blue-600 rounded-lg font-semibold"><span className="w-1/4">User</span>
                  <span className="w-1/4 text-center">item Name</span>
                  <span className="w-1/4 text-center">Status</span>
                  <span className="w-1/4 text-right">Action</span></div>
                {itemRequests.length > 0 ? itemRequests.map((request, index) => (
                  <motion.div key={index} className="flex justify-between p-3 bg-gray-700 rounded-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <span className="w-1/4">{request.users.name}</span><span className="w-1/4 text-center">{request.name}</span>
                    <span className="w-1/4 text-center capitalize">{request.status}</span>
                    <span className="w-1/4 text-right flex gap-2 justify-end">
                      {request.status === "pending" && (
                        <>
                          <button className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 transition-all" onClick={() => handleApproveRequest(request.id)}>Approve</button>
                          <button className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition-all" onClick={() => handleRejectRequest(request.id)}>Reject</button>
                        </>
                      )}
                    </span>
                  </motion.div>
                )) : <p className="text-gray-400">No requests found</p>}
              </div>
              <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all w-full" onClick={() => setRequestsPopup(false)}>Close</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>*/}

      <AnimatePresence>
        {returnRequestsPopup && (
          <>
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReturnRequestsPopup(false)} />
            <motion.div className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-[600px] z-50" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-lg font-semibold mb-4">Approve Return Requests</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                <div className="flex justify-between p-3 bg-blue-600 rounded-lg font-semibold">
                  <span className="w-1/5">User</span><span className="w-1/5 text-center">item Name</span><span className="w-1/5 text-center">Status</span><span className="w-1/5 text-center">Late Fee</span><span className="w-1/5 text-right">Action</span>
                </div>
                {returnRequests.length > 0 ? returnRequests.map((request, index) => (
                  <motion.div key={index} className="flex justify-between p-3 bg-gray-700 rounded-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <span className="w-1/5">{request.users.name}</span><span className="w-1/5 text-center">{request.items.name}</span><span className="w-1/5 text-center capitalize">{request.return_request}</span><span className="w-1/5 text-center">${request.lateFees}</span>
                    <span className="w-1/5 text-right flex gap-2 justify-end">
                      {request.return_request === "pending" && (
                        <>
                          <button className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 transition-all" onClick={() => handleApproveReturn(request.id)}>Approve</button>
                          <button className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition-all" onClick={() => handleRejectReturn(request.id)}>Reject</button>
                        </>
                      )}
                    </span>
                  </motion.div>
                )) : <p className="text-gray-400">No return requests found</p>}
              </div>
              <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all w-full" onClick={() => setReturnRequestsPopup(false)}>Close</button>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reservationsPopup && (
          <>
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReservationsPopup(false)} />
            <motion.div className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-[600px] z-50" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-lg font-semibold mb-4">Approve Reservations</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                <div className="flex justify-between p-3 bg-blue-600 rounded-lg font-semibold">
                  <span className="w-1/4">User</span><span className="w-1/4 text-center">item Name</span><span className="w-1/4 text-center">Status</span><span className="w-1/4 text-right">Action</span>
                </div>
                {reservations.length > 0 ? reservations.map((reservation, index) => (
                  <motion.div key={index} className="flex justify-between p-3 bg-gray-700 rounded-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <span className="w-1/4">{reservation.reserved_from_user.name}</span><span className="w-1/4 text-center">{reservation.items.name}</span><span className="w-1/4 text-center capitalize">{reservation.status}</span>
                    <span className="w-1/4 text-right flex gap-2 justify-end">
                      {reservation.status === "pending" && (
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          onClick={() => setSelectedReservation(reservation)}
                        >
                          Take Action
                        </button>
                      )}
                    </span>
                  </motion.div>
                )) : <p className="text-gray-400">No reservations found</p>}
              </div>
              <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all w-full" onClick={() => setReservationsPopup(false)}>Close</button>
            </motion.div>
            <ReservationActionModal
              reservation={selectedReservation}
              onClose={() => setSelectedReservation(null)}
              onSuccess={(msg) => setSuccessPopup(msg)}
              setReservations={setReservations}
            />
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transactionPopup && (
          <>
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setTransactionPopup(false)} />
            <motion.div className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-[600px] z-50" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-lg font-semibold mb-4">Transactions</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                <div className="flex justify-between p-3 bg-blue-600 rounded-lg font-semibold">
                  <span className="w-1/5">User</span>
                  <span className="w-1/5 text-center">item Name</span>
                  <span className="w-1/5 text-center">Remark</span>
                  <span className="w-1/5 text-center">Total Fee</span>
                </div>
                {transactions.length > 0 ? transactions.map((transaction, index) => (
                  <motion.div key={index} className="flex justify-between p-3 bg-gray-700 rounded-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <span className="w-1/5">{transaction.users.name}</span>
                    <span className="w-1/5 text-center">{transaction.items.name}</span>
                    <span className="w-1/5 text-center capitalize">{transaction.action}</span>
                    <span className="w-1/5 text-center">${transaction.fine_amount}</span>
                  </motion.div>
                )) : <p className="text-gray-400">No transactions found</p>}
                {transactions.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-700 rounded-lg text-right">
                    <span className="font-semibold">Total Fee Collected: </span>
                    <span>${calculateTotalFee()}</span>
                  </div>
                )}
              </div>
              <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all w-full" onClick={() => setTransactionPopup(false)}>Close</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {commentPopup && (
          <>
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCommentPopup(null)} />
            <motion.div className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-96 z-50" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-lg font-semibold mb-4">Add Comment</h3>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment here..."
                className="w-full p-2 border rounded-lg bg-gray-700 text-white h-32 resize-none"
              />
              <div className="flex justify-end mt-4">
                <button className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600 transition-all" onClick={() => setCommentPopup(null)}>Cancel</button>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all" onClick={handleCommentSubmit}>Done</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successPopup && (
          <>
            <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSuccessPopup(false)} />
            <motion.div className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-96 z-50" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="text-lg font-semibold mb-4">Success</h3>
              <p className="mb-4">{successPopup}</p>
              <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all w-full" onClick={() => setSuccessPopup(false)}>Close</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProfile;