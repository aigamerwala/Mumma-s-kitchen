import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Import Supabase client
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";

const SignIn = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 🔐 Supabase Sign In
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Store session token
            localStorage.setItem("supabase_token", data.session.access_token);

            navigate("/profile"); // Redirect to profile page
        } catch (err) {
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="flex min-h-screen items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 p-6"
        >
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl"
            >
                <motion.h2
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-center text-gray-800"
                >
                    Welcome Back!
                </motion.h2>
                {error && <motion.p className="text-red-500 text-center" animate={{ scale: 1.1 }}>{error}</motion.p>}
                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <motion.input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        whileFocus={{ scale: 1.02 }}
                    />
                    <motion.div className="relative flex items-center">
                        <motion.input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 pr-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            whileFocus={{ scale: 1.02 }}
                        />
                        <motion.button
                            type="button"
                            className=" absolute right-3 top-1/2 -translate-y-1/2 ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </motion.button>
                    </motion.div>
                    <motion.button
                        type="submit"
                        className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400"
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </motion.button>
                </form>
                <p className="mt-4 text-center text-gray-600">
                    Don't have an account? <Link to="/signup" className="text-indigo-500 hover:underline">Sign Up</Link>
                </p>
            </motion.div>
        </motion.div>
    );
};

export default SignIn;
