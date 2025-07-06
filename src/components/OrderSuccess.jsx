import { Link } from "react-router-dom";

const OrderSuccess = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gray-900 text-white px-4">
      <h1 className="text-3xl font-bold mb-4">🎉 Payment Successful!</h1>
      <p className="mb-6">Thank you for your order. Your payment has been processed.</p>
      <Link to="/" className="px-6 py-3 bg-green-500 rounded-lg hover:bg-green-600 transition">
        Go to Home
      </Link>
    </div>
  );
};

export default OrderSuccess;