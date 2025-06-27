import { motion } from "framer-motion";

export default function LateFeesModal({ totalLateFees, handlePayNow, onClose }) {
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
        <h3 className="text-lg font-semibold mb-4">Late Fees</h3>
        <p className="mb-4">Total Late Fees: ${totalLateFees}</p>
        <div className="flex justify-between">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            onClick={handlePayNow}
          >
            Pay Now
          </button>
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            onClick={onClose}
          >
            Pay Later
          </button>
        </div>
      </motion.div>
    </>
  );
}
