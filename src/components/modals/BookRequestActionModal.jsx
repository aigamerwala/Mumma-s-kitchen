// 📁 components/modals/BookRequestActionModal.jsx

import React from "react";
import { supabase } from "../../supabaseClient";

const BookRequestActionModal = ({ request, onClose, setRequests, onSuccess }) => {
  if (!request) return null;

  const handleAction = async (action) => {
    try {
      const { error: updateError } = await supabase
        .from("book_requests")
        .update({ status: action })
        .eq("id", request.id);

      if (updateError) throw updateError;

      await supabase.from("notifications").insert([
        {
          user_id: request.user_id,
          message:
            action === "approved"
              ? "📚 Your book request has been approved!"
              : "❌ Your book request was rejected.",
        },
      ]);

      setRequests((prev) =>
        prev.map((r) =>
          r.id === request.id ? { ...r, status: action } : r
        )
      );

      onSuccess(`Request ${action}!`);
      onClose();
    } catch (err) {
      console.error("❌ Error handling book request:", err.message);
      alert("Failed to process request.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Book Request Action</h2>
        <p className="mb-4">Do you want to approve or reject this book request?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleAction("approved")}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Approve
          </button>
          <button
            onClick={() => handleAction("rejected")}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Reject
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookRequestActionModal;
