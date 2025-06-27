// components/modals/PopupModal.jsx
import { motion } from "framer-motion";

const PopupModal = ({ popup, data, closePopup, handleReturnBook }) => {
  const renderHeader = () => {
    if (popup === "transactions") {
      return (
        <div className="flex justify-between p-3 bg-blue-600 rounded-lg font-semibold">
          <span className="w-1/3">Book</span>
          <span className="w-1/4 text-center">Type</span>
          <span className="w-1/4 text-right">Amount</span>
          <span className="w-1/4 text-right">Date</span>
        </div>
      );
    }

    return (
      <div className="flex justify-between p-3 bg-blue-600 rounded-lg font-semibold">
        <span className="w-1/3">Book Name</span>
        <span className="w-1/3 text-center">Author Name</span>
        <span className={popup === "returndue" ? "w-1/6 text-right" : "w-1/3 text-right"}>Date</span>
        {(popup === "returndue" || popup === "returnedbooks") && (
          <span className="w-1/6 text-right">Late Fees</span>
        )}
        {popup === "returndue" && <span className="w-1/6 text-right">Action</span>}
      </div>
    );
  };

  const renderRow = (item, index) => {
    if (popup === "transactions") {
      return (
        <motion.div
          key={item.id || index}
          className="flex justify-between p-3 bg-gray-700 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <span className="w-1/3">{item.books?.title || "N/A"}</span>
          <span className="w-1/4 text-center capitalize">{item.type}</span>
          <span className="w-1/4 text-right">${item.amount || 0}</span>
          <span className="w-1/4 text-right">{new Date(item.timestamp).toLocaleDateString()}</span>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={index}
        className="flex justify-between p-3 bg-gray-700 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <span className="w-1/3">{item.books?.title || "N/A"}</span>
        <span className="w-1/3 text-center">{item.books?.author || "N/A"}</span>
        <span className={popup === "returndue" ? "w-1/6 text-right" : "w-1/3 text-right"}>
          {item.issue_date}
        </span>
        {(popup === "returndue" || popup === "returnedbooks") && (
          <span className="w-1/6 text-right">${item.lateFees || 0}</span>
        )}
        {popup === "returndue" && (
          <span className="w-1/6 text-right">
            <button
              className="bg-green-500 px-2 py-1 rounded-lg"
              onClick={() => handleReturnBook(item.book_id)}
            >
              Return
            </button>
          </span>
        )}
      </motion.div>
    );
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closePopup}
      />
      <motion.div
        className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-[600px] z-50"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h3 className="text-lg font-semibold mb-4 capitalize">{popup.replace(/([a-z])([A-Z])/g, "$1 $2")}</h3>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {renderHeader()}
          {data.length > 0 ? data.map(renderRow) : <p className="text-gray-400">No data available</p>}
        </div>
        <button
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full"
          onClick={closePopup}
        >
          Close
        </button>
      </motion.div>
    </>
  );
};

export default PopupModal;
