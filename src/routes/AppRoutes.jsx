import { Routes, Route } from "react-router-dom";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import Main from "../pages/Main";
import Profile from "../pages/Profile";
import Order from "../pages/Order";
import ProtectedRoute from "../components/ProtectedRoute";
import AvailableBooks from "../pages/AvailableBooks";
import Ebooks from "../pages/Ebooks";
import AudioBooks from "../pages/AudioBooks";
import AdminProfile from "../pages/AdminProfile";
import IssuedBooks from "../pages/IssuedBooks";
import Enquiry from "../pages/Enquiry";
import Reservations from "../pages/Reservations";
import EnquiryReviews from "../pages/EnquiryReviews";
import Dashboard from "../components/Dashboard";
const AppRoutes = () => {
    return (
        <Routes basename="/" className="h-full">
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}></Route>
            <Route path="/" element={<Main />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/main" element={<Main />} />
            <Route path="/order" element={<Order />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/available-books" element={<AvailableBooks/>} />
            <Route path="/ebooks" element={<Ebooks />} />
            <Route path="/audiobooks" element={<AudioBooks />} />
            <Route path="/adminprofile" element={<AdminProfile />} />
            <Route path="/issued-books" element={<IssuedBooks />} />
            <Route path="/enquiry" element={<Enquiry />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/enquiry-reviews" element={<EnquiryReviews />} /> 
            <Route path="/dashboard" element={<Dashboard />} /> 
            {/* <Route path="/book-request" element={<BookRequestModal />} /> */}
            {/* 404 Page */}
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
    );
};

export default AppRoutes;
