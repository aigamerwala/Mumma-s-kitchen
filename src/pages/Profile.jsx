// 📄 Updated Profile.jsx (cleaned with modular modals)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";

// ✅ Modal imports
// import BookRequestModal from "../components/modals/BookRequestModal";
import EditProfileModal from "../components/modals/EditProfileModal";
import BooksPopupModal from "../components/modals/BooksPopupModal";
import PaymentSuccessModal from "../components/modals/PaymentSuccessModal";

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userPhoto, setUserPhoto] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: "", email: "", password: "" });
    const [popup, setPopup] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const [booksData, setBooksData] = useState({
        issuedbooks: [],
        returnedbooks: [],
        returndue: [],
        transactions: [],
        requestedbooks: [],
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

            const fetchBooksData = async (userId) => {
                const { data: issuedBooks } = await supabase
                    .from("issued_books")
                    .select("*, books(author,title)")
                    .eq("user_id", userId);

                const { data: returnedBooks } = await supabase
                    .from("issued_books")
                    .select("*, books(title, author)")
                    .eq("user_id", userId)
                    .is("returned", true);

                const { data: returnDueBooks } = await supabase
                    .from("issued_books")
                    .select("*, books(*)")
                    .eq("user_id", userId)
                    .is("return_date", null);
                const { data: requestedBooks } = await supabase
                    .from("book_requests")
                    .select("*, books(*)")
                    .eq("user_id", userId);

                setBooksData(prev => ({
                    ...prev,
                    issuedbooks: issuedBooks || [],
                    returnedbooks: returnedBooks || [],
                    returndue: returnDueBooks || [],
                    requestedbooks: requestedBooks || [],
                }));
            };

            await fetchBooksData(userData.id);
            setLoading(false);

            const { data: transactionsData } = await supabase
                .from("transactions")
                .select("*, books(title, author)")
                .eq("user_id", userData.id)
                .order("action_date", { ascending: false });

            setBooksData(prev => ({ ...prev, transactions: transactionsData || [] }));

            const { data: requestedBooks } = await supabase
                .from("book_requests")
                .select("*")
                .eq("user_id", userData.id);

            setBooksData(prev => ({ ...prev, requestedbooks: requestedBooks || [] }));

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

    const handleReturnBook = async (bookId) => {
        // Fetch the book to get current copies
        console.log("Book ID:", bookId);
        const { data: book, error: fetchError } = await supabase
            .from("issued_books")
            .select("*,books(*)")
            .eq("book_id", bookId)
            // .update({ returned: true })
        // .single();

        if (fetchError) {
            console.error("Failed to fetch book:", fetchError.message);
            console.log(bookId)
            return;
        }
        console.log("Fetched book:", book[0]);
        const { error: updateError } = await supabase
            .from("books")
            .update({
                copies: book[0].books.copies + 1,
            })
            .eq("id", bookId);

        if (updateError) {
            console.error("Failed to return book:", updateError.message);
            return;
        }

        const { error: transactionsError } = await supabase.from("transactions").insert([
            {
                user_id: book[0].user_id,
                book_id: book[0].book_id,
                action: "book return request sent for approval",
                action_date: new Date().toISOString(),
            }
        ]);
        console.log("Transaction data:", book[0].user_id, book[0].book_id, book[0].lateFees || 0);
        if (transactionsError) {
            console.error("Transaction insertion failed:", transactionsError.message);
            return;
        }
        
        // Refresh data
        window.location.reload(); // or call fetchProfile() if you move it out
    };
    const calculateTotalFees = (type) => {/* unchanged logic */ const today = new Date();

        return booksData[type].reduce((total, book) => {
            let lateFees = 0;

            if (!book.returned && book.due_date) {
                const dueDate = new Date(book.due_date);

                if (today > dueDate) {
                    const lateDays = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                    lateFees = lateDays * 5; // $5 per day
                }
            } else if (book.lateFees) {
                lateFees = book.lateFees;
            }

            return total + lateFees;
        }, 0);
    };
    const handleRequestedBook = async (bookId) => {/* unchanged logic */
        const { error } = await supabase
            .from("book_requests")
            .select("*")
            .eq("user_id", user.id)
    }

    const totalReturnedFees = calculateTotalFees("returnedbooks");
    const totalDueFees = calculateTotalFees("returndue");
    const totalLateFees = totalReturnedFees + totalDueFees;

    const handlePayNow = () => {/* unchanged logic */
        setBooksData({
            ...booksData,
            returnedbooks: booksData.returnedbooks.map(book => ({ ...book, lateFees: 0 })),
            returndue: booksData.returndue.map(book => ({ ...book, lateFees: 0 }))
        });
        setPaymentSuccess(true);
    };
    const closePaymentSuccess = () => {/* unchanged logic */
        setLateFeesPopupetPaymentSuccess(false);
        setLateFeesPopup(false);
    };

    if (loading) return <p>Loading profile...</p>;
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
                    {["Issued Books", "Returned Books", "Return Due", "Requested Books", "Transactions"].map((label) => (
                        <motion.button
                            key={label}
                            whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(0, 255, 255, 0.6)" }}
                            className={`w-64 bg-gray-800 text-white px-5 py-3 rounded-lg text-lg font-semibold transition-all hover:bg-gray-700 ${label === "Late Fees" && totalLateFees === 0 ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            onClick={() => {
                                if (label === "Issued Books") openPopup("issuedbooks");
                                if (label === "Returned Books") openPopup("returnedbooks");
                                if (label === "Return Due") openPopup("returndue");
                                if (label === "Transactions") openPopup("transactions");
                                if (label === "Requested Books") openPopup("requestedbooks");
                                if (label === "Reserved Books") openPopup("reservedbooks");
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

            {/* ✅ Books & Transactions Modal */}
            <AnimatePresence>
                {popup && popup !== "requestedbooks" && (
                    <BooksPopupModal
                        popup={popup}
                        booksData={booksData}
                        closePopup={() => setPopup(null)}
                        handleReturnBook={handleReturnBook}
                    />
                )}
            </AnimatePresence>

            {/* ✅ Requested Books */}
            <AnimatePresence>
                {popup === "requestedbooks" && (
                    <BooksPopupModal
                        popup={popup}
                        booksData={booksData.requestedbooks}
                        closePopup={() => setPopup(null)}
                        handleReturnBook={handleRequestedBook}
                    />
                )}
            </AnimatePresence>

        </div>
    );
}

export default Profile;