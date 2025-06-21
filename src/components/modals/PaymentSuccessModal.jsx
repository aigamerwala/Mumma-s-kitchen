import { motion } from "framer-motion";

export default function PaymentSuccessModal({ onClose }) {
  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-96 z-50"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h3 className="text-lg font-semibold mb-4">Payment Successful</h3>
        <p className="mb-4">Your late fees have been successfully paid!</p>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full"
          onClick={onClose}
        >
          Close
        </button>
      </motion.div>
    </>
  );
}
