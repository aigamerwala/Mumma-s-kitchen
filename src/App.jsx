import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import { Footer } from "./components/Footer";
const App = () => {
    return (
        <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 ">
            <div className="flex-none bg-white dark:bg-gray-800 shadow-md z-10">
                <Navbar />
            </div>
            <div className="flex-grow mt-10">
                <AppRoutes basename="/" className="h-full" />
            </div>
            <Footer />
        </div>
    );
};

export default App;
