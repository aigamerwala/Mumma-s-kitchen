import { Routes, Route } from "react-router-dom";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import Main from "../pages/Main";
import Profile from "../pages/Profile";
import Menu from "../pages/Menu";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminProfile from "../pages/Admin/AdminProfile";
import Enquiry from "../pages/Support";
import EnquiryReviews from "../pages/Admin/EnquiryReviews";
import Dashboard from "../components/Dashboard";
import Cart from "../pages/Cart";
import HandleOrder from "../pages/HandleOrder";
import Payment from "../components/Payment";
import OrderSuccess from "../components/OrderSuccess";
import ManualQRPayment from "../components/ManualQRPayment";
import AdminVerifyPayments from "../pages/Admin/AdminVerifyPayments";

const AppRoutes = () => {
    return (
        <Routes basename="/" className="h-full">
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}></Route>
            <Route path="/" element={<Main />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/main" element={<Main />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/adminprofile" element={<AdminProfile />} />
            <Route path="/support" element={<Enquiry />} />
            <Route path="/enquiry-reviews" element={<EnquiryReviews />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/handle-order" element={<HandleOrder />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/qr-payment" element={<ManualQRPayment orderId="abc123" totalAmount={1200} />} />
            <Route path="/admin/payments" element={<AdminVerifyPayments />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            {/* 404 Page */}
            <Route path="*" element={<h1 className="mt-10 text-4xl text-center px-40 py-70 font-extrabold">404 - Page Not Found</h1>} />
        </Routes>
    );
};

export default AppRoutes;
