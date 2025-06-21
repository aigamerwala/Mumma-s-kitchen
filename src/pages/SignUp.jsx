import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // ✅ Import Supabase client
import { motion } from "framer-motion";

const SignUp = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            setLoading(false);
            return;
        }

        try {
            // ✅ Sign up user in Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name } // ✅ Store name in metadata
                }
            });

            if (error) throw error;

            // ✅ Insert user details into Supabase database
            const { error: dbError } = await supabase.from("users").insert([
                { id: data.user.id, name, email, phone }
            ]);

            if (dbError) throw dbError;

            // ✅ Redirect to sign-in page after successful registration
            navigate("/signin");
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className=" flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500 py-24"
        >
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg"
            >
                <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-semibold text-center text-gray-800"
                >
                    Sign Up
                </motion.h2>
                {error && <motion.p className="text-red-500 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>}
                <motion.form
                    className="mt-6 space-y-4"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <motion.input
                        type="text" placeholder="Full Name" className="w-full p-3 border border-gray-300 rounded-lg"
                        value={name} onChange={(e) => setName(e.target.value)} required
                        whileFocus={{ scale: 1.05 }}
                    />
                    <motion.input
                        type="email" placeholder="Email" className="w-full p-3 border border-gray-300 rounded-lg"
                        value={email} onChange={(e) => setEmail(e.target.value)} required
                        whileFocus={{ scale: 1.05 }}
                    />
                    <motion.input
                        type="phone" placeholder="Phone" className="w-full p-3 border border-gray-300 rounded-lg"
                        value={phone} onChange={(e) => setPhone(e.target.value)} required
                        whileFocus={{ scale: 1.05 }}
                    />
                    <motion.input
                        type="password" placeholder="Password" className="w-full p-3 border border-gray-300 rounded-lg"
                        value={password} onChange={(e) => setPassword(e.target.value)} required
                        whileFocus={{ scale: 1.05 }}
                    />
                    <motion.input
                        type="password" placeholder="Confirm Password" className="w-full p-3 border border-gray-300 rounded-lg"
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                        whileFocus={{ scale: 1.05 }}
                    />
                    <motion.button
                        type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {loading ? "Registering..." : "Register"}
                    </motion.button>
                </motion.form>
                <motion.p
                    className="mt-4 text-center text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Already have an account? <Link to="/signin" className="text-blue-500">Sign In</Link>
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default SignUp;
