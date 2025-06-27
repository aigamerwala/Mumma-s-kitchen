import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const AdminDashboard = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [userPhoto, setUserPhoto] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: "", email: "", password: "" });

    const [allCustomers, setAllCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [returnOrders, setReturnOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const [successPopup, setSuccessPopup] = useState(false);
    const [editProductPopup, setEditProductPopup] = useState(null);

    const [newProductData, setNewProductData] = useState({
        image: "",
        title: "",
        price: 0,
        description: "",
        stock: 1
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: sessionData, error } = await supabase.auth.getSession();
            if (error || !sessionData.session) return navigate("/signin");

            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("*")
                .eq("id", sessionData.session.user.id)
                .single();

            if (userError || userData.role !== "admin") return navigate("/profile");

            setUser(userData);
            setUserPhoto(userData.profile_picture);
            fetchAllCustomers();
            fetchOrders();
            fetchReturnOrders();
            fetchProducts();
            fetchTransactions();
        };

        fetchProfile();
    }, [navigate]);

    const uploadImage = async (file) => {
        const fileName = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
            .from("items-img")
            .upload(fileName, file);

        if (error) return null;

        return supabase.storage
            .from("items-img")
            .getPublicUrl(fileName).data.publicUrl;
    };

    const fetchAllCustomers = async () => {
        const { data, error } = await supabase.from("users").select("id, name, email, role").eq("role", "customer");
        if (!error) setAllCustomers(data);
    };

    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from("orders")
            .select("*, users(name), products(title)")
            .eq("status", "pending");

        if (!error) setOrders(data);
    };

    const fetchReturnOrders = async () => {
        const { data, error } = await supabase
            .from("orders")
            .select("*, users(name), products(title)")
            .eq("return_status", "requested");

        if (!error) setReturnOrders(data);
    };

    const fetchProducts = async () => {
        const { data, error } = await supabase.from("products").select("*");
        if (!error) setProducts(data);
    };

    const fetchTransactions = async () => {
        const { data, error } = await supabase
            .from("transactions")
            .select("*, users(name), products(title)");
        if (!error) setTransactions(data);
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

        const { data: publicUrlData } = supabase.storage
            .from("profile-pictures")
            .getPublicUrl(filePath);
        const imageUrl = publicUrlData.publicUrl;

        const { error: updateError } = await supabase
            .from("users")
            .update({ profile_picture: imageUrl })
            .eq("id", user.id);

        if (!updateError) {
            setUserPhoto(imageUrl);
            setUser({ ...user, profile_picture: imageUrl });
        }
    };

    const handleAddProduct = async () => {
        if (!newProductData.title || !newProductData.price || !newProductData.stock) {
            alert("Please fill all fields.");
            return;
        }

        const { error } = await supabase.from("products").insert([newProductData]);

        if (!error) {
            setSuccessPopup("Product added!");
            fetchProducts();
        }
    };

    const handleEditProduct = (product) => {
        setEditProductPopup(product);
    };

    const handleModifyProductSubmit = async () => {
        const { error } = await supabase
            .from("products")
            .update(editProductPopup)
            .eq("id", editProductPopup.id);

        if (!error) {
            setProducts(products.map(p => (p.id === editProductPopup.id ? editProductPopup : p)));
            setEditProductPopup(null);
            setSuccessPopup("Product updated!");
            fetchProducts();
        }
    };

    const handleDeleteProduct = async (productId) => {
        const { error } = await supabase.from("products").delete().eq("id", productId);
        if (!error) {
            setProducts(products.filter(p => p.id !== productId));
            setSuccessPopup("Product deleted!");
            fetchProducts();
        }
    };

    const calculateTotalRevenue = () => {
        return transactions.reduce((total, tx) => total + (tx.amount || 0), 0);
    };

    if (!user) return <p>Loading admin dashboard...</p>;

    // You can now design your return based on this logic
return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-800">
        {/* Success Popup */}
        {successPopup && (
            <div className="bg-green-500 text-white px-4 py-2 rounded mb-4">
                {successPopup}
            </div>
        )}

        {/* Profile Section */}
        <div className="flex items-center gap-6 mb-8">
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
                <img src={userPhoto} alt="Admin" className="w-full h-full object-cover" />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
            </div>
            <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p>{user.email}</p>
                <button
                    onClick={handleEditClick}
                    className="mt-2 px-4 py-1 bg-blue-600 text-white rounded"
                >
                    Edit Profile
                </button>
            </div>
        </div>

        {isEditing && (
            <div className="mb-6 bg-white p-4 rounded shadow">
                <h3 className="font-semibold text-lg mb-3">Edit Profile</h3>
                <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="border p-2 w-full mb-2"
                    placeholder="Name"
                />
                <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="border p-2 w-full mb-2"
                    placeholder="Email"
                />
                <input
                    type="password"
                    value={editData.password}
                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                    className="border p-2 w-full mb-2"
                    placeholder="New Password (optional)"
                />
                <button onClick={handleSaveChanges} className="bg-green-600 text-white px-4 py-2 rounded mr-2">
                    Save
                </button>
                <button onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded">
                    Cancel
                </button>
            </div>
        )}

        {/* Customers */}
        <section className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Customers</h3>
            <ul className="space-y-2">
                {allCustomers.map((cust) => (
                    <li key={cust.id} className="bg-white p-3 rounded shadow">
                        {cust.name} ({cust.email})
                    </li>
                ))}
            </ul>
        </section>

        {/* Products */}
        <section className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                        <div>
                            <h4 className="font-bold">{product.title}</h4>
                            <p>₹{product.price} | Stock: {product.stock}</p>
                        </div>
                        <div className="space-x-2">
                            <button onClick={() => handleEditProduct(product)} className="text-blue-600">Edit</button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Product Form */}
            <div className="mt-6 bg-white p-4 rounded shadow">
                <h4 className="font-semibold mb-2">Add New Product</h4>
                <input
                    type="text"
                    placeholder="Title"
                    value={newProductData.title}
                    onChange={(e) => setNewProductData({ ...newProductData, title: e.target.value })}
                    className="border p-2 w-full mb-2"
                />
                <input
                    type="number"
                    placeholder="Price"
                    value={newProductData.price}
                    onChange={(e) => setNewProductData({ ...newProductData, price: parseFloat(e.target.value) })}
                    className="border p-2 w-full mb-2"
                />
                <input
                    type="number"
                    placeholder="Stock"
                    value={newProductData.stock}
                    onChange={(e) => setNewProductData({ ...newProductData, stock: parseInt(e.target.value) })}
                    className="border p-2 w-full mb-2"
                />
                <textarea
                    placeholder="Description"
                    value={newProductData.description}
                    onChange={(e) => setNewProductData({ ...newProductData, description: e.target.value })}
                    className="border p-2 w-full mb-2"
                />
                <button onClick={handleAddProduct} className="bg-blue-600 text-white px-4 py-2 rounded">
                    Add Product
                </button>
            </div>
        </section>

        {/* Edit Product Modal */}
        {editProductPopup && (
            <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
                    <h4 className="font-bold mb-4">Edit Product</h4>
                    <input
                        type="text"
                        value={editProductPopup.title}
                        onChange={(e) => setEditProductPopup({ ...editProductPopup, title: e.target.value })}
                        className="border p-2 w-full mb-2"
                        placeholder="Title"
                    />
                    <input
                        type="number"
                        value={editProductPopup.price}
                        onChange={(e) => setEditProductPopup({ ...editProductPopup, price: parseFloat(e.target.value) })}
                        className="border p-2 w-full mb-2"
                        placeholder="Price"
                    />
                    <input
                        type="number"
                        value={editProductPopup.stock}
                        onChange={(e) => setEditProductPopup({ ...editProductPopup, stock: parseInt(e.target.value) })}
                        className="border p-2 w-full mb-2"
                        placeholder="Stock"
                    />
                    <textarea
                        value={editProductPopup.description}
                        onChange={(e) => setEditProductPopup({ ...editProductPopup, description: e.target.value })}
                        className="border p-2 w-full mb-2"
                        placeholder="Description"
                    />
                    <button onClick={handleModifyProductSubmit} className="bg-green-600 text-white px-4 py-2 rounded mr-2">
                        Save
                    </button>
                    <button onClick={() => setEditProductPopup(null)} className="bg-gray-500 text-white px-4 py-2 rounded">
                        Cancel
                    </button>
                </div>
            </div>
        )}

        {/* Orders */}
        <section className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Pending Orders</h3>
            <ul className="space-y-2">
                {orders.map((order) => (
                    <li key={order.id} className="bg-white p-4 rounded shadow">
                        {order.users.name} ordered <strong>{order.products.title}</strong> (Status: {order.status})
                    </li>
                ))}
            </ul>
        </section>

        {/* Return Orders */}
        <section className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Return Requests</h3>
            <ul className="space-y-2">
                {returnOrders.map((order) => (
                    <li key={order.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                        <div>
                            {order.users.name} requested return for <strong>{order.products.title}</strong>
                        </div>
                        <div className="space-x-2">
                            <button
                                onClick={() => handleApproveReturn(order)}
                                className="bg-green-500 text-white px-3 py-1 rounded"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleRejectReturn(order)}
                                className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                                Reject
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </section>

        {/* Transactions */}
        <section>
            <h3 className="text-xl font-semibold mb-3">Transaction History</h3>
            <ul className="space-y-2">
                {transactions.map((tx) => (
                    <li key={tx.id} className="bg-white p-4 rounded shadow">
                        ₹{tx.amount} from {tx.users.name} for <strong>{tx.products.title}</strong>
                    </li>
                ))}
            </ul>
            <p className="mt-4 font-bold">Total Revenue: ₹{calculateTotalRevenue()}</p>
        </section>
    </div>
);
};

export default AdminDashboard;
