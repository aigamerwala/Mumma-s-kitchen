import { motion } from "framer-motion";

export default function BooksPopupModal({ popup, booksData, closePopup, handleReturnBook }) {
  const headers = {
    issuedbooks: "Issued Books",
    returnedbooks: "Returned Books",
    returndue: "Return Due",
    transactions: "Transactions",
    requestedbooks: "Book Requests",
  };

  return (
    <>
      {/* Background Overlay */}
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closePopup}
      />

      {/* Modal Content */}
      <motion.div
        className="fixed bg-gray-800 text-white p-6 rounded-xl shadow-lg w-[600px] z-50"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4 capitalize">{headers[popup]}</h3>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {/* Transactions View */}
          {popup === "transactions" ? (
            <>
              <div className="flex justify-between p-3 bg-blue-600 rounded-lg font-semibold">
                <span className="w-1/3">Book</span>
                <span className="w-1/4 text-center">Type</span>
                <span className="w-1/4 text-right">Amount</span>
                <span className="w-1/4 text-right">Date</span>
              </div>
              {booksData.transactions.length > 0 ? (
                
                booksData.transactions.sort((a, b) => new Date(b.action_date) - new Date(a.action_date)).map((txn, index) => (
                  <motion.div
                    key={txn.id || index}
                    className="flex justify-between p-3 bg-gray-700 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <span className="w-1/3">{txn.books?.title || "N/A"}</span>
                    <span className="w-1/4 text-center capitalize">{txn.action}</span>
                    <span className="w-1/4 text-right">${txn.fine_amount || 0}</span>
                    <span className="w-1/4 text-right">
                      {new Date(txn.action_date).toLocaleDateString()}
                    </span>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-400">No transactions found</p>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between p-3 bg-blue-600 rounded-lg font-semibold">
                <span className="w-1/3">Book Name</span>
                <span className="w-1/3 text-center">Author Name</span>
                <span className="w-1/3 text-right">Date</span>
                {(popup === "returndue" || popup === "returnedbooks") && (
                  <span className="w-1/6 text-right">Late Fees</span>
                )}
                {popup === "returndue" && <span className="w-1/6 text-right">Action</span>}
              </div>

              {booksData[popup]?.length > 0 ? (
                booksData[popup].sort((a, b) => new Date(b.issue_date || b.created_at) - new Date(a.issue_date || a.created_at)).map((book, index) => (
                  <motion.div
                    key={index}
                    className="flex justify-between p-3 bg-gray-700 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="w-1/3">{book.books?.title || "N/A"}</span>
                    <span className="w-1/3 text-center">{book.books?.author || "N/A"}</span>
                    <span className="w-1/3 text-right">
                      {new Date(book.issue_date || book.created_at).toLocaleDateString()}
                    </span>
                    {(popup === "returndue" || popup === "returnedbooks") && (
                      <span className="w-1/6 text-right">${book.lateFees || 0}</span>
                    )}
                    {popup === "returndue" && (
                      <span className="w-1/6 text-right">
                        <button
                          className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600"
                          onClick={() => handleReturnBook(book.book_id)}
                        >
                          Return
                        </button>
                      </span>
                    )}
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-400">No data available</p>
              )}
            </>
          )}
        </div>

        {/* Close Button */}
        <button
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full"
          onClick={closePopup}
        >
          Close
        </button>
      </motion.div>
    </>
  );
}
