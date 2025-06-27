// 📁 components/modals/ReturnApprovalModal.jsx

import React from "react";
import { supabase } from "../../supabaseClient";

const ReturnApprovalModal = ({ returnRequest, onClose, setIssuedBooks, onSuccess }) => {
  if (!returnRequest) return null;

  const handleApprove = async () => {
    try {
      const today = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("issued_books")
        .update({
          returned: true,
          return_date: today,
          lateFees: 0, // or calculate if needed
        })
        .eq("id", returnRequest.id);

      if (updateError) throw updateError;

      await supabase.from("notifications").insert([
        {
          user_id: returnRequest.user_id,
          message: "✅ Your book return has been approved!",
        },
      ]);

      setIssuedBooks((prev) =>
        prev.map((book) =>
          book.id === returnRequest.id
            ? { ...book, returned: true, return_date: today }
            : book
        )
      );

      onSuccess("Return approved!");
      onClose();
    } catch (err) {
      console.error("❌ Error approving return:", err.message);
      alert("Failed to approve return.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Approve Return</h2>
        <p className="mb-4">Are you sure you want to approve this return?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleApprove}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Approve
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

export default ReturnApprovalModal;
