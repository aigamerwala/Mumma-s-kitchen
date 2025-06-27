import React from "react";
import { supabase } from "../../supabaseClient";

const ReservationActionModal = ({
  reservation,
  onClose,
  onSuccess,
  setReservations,
}) => {
  if (!reservation) return null;

  const handleAction = async (action) => {
    try {
      const { data: fullReservation, error: fetchError } = await supabase
        .from("reservations")
        .select("id, reserved_to")
        .eq("id", reservation.id)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from("reservations")
        .update({ status: action })
        .eq("id", reservation.id);

      if (updateError) throw updateError;

      await supabase.from("notifications").insert([
        {
          user_id: fullReservation.reserved_to,
          message:
            action === "approved"
              ? "🎉 Your reservation has been approved!"
              : "⚠️ Your reservation was rejected.",
        },
      ]);

      // Optional: update parent state
      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservation.id ? { ...r, status: action } : r
        )
      );

      onSuccess(`Reservation ${action}!`);
      onClose();
    } catch (err) {
      console.error("❌ Error handling reservation:", err.message);
      alert("Failed to process reservation.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Reservation Action</h2>
        <p className="mb-4">
          Do you want to <strong>approve</strong> or <strong>reject</strong> this reservation?
        </p>

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

export default ReservationActionModal;
