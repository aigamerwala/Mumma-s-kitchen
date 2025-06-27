import { motion } from "framer-motion";

export default function EditProfileModal({ editData, setEditData, onSave, onClose }) {
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
        <h3 className="text-lg font-semibold mb-3">Edit Profile</h3>
        <label className="block mb-2">
          <span className="text-gray-400">Name</span>
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="w-full p-2 border rounded-lg bg-gray-700 text-white"
          />
        </label>
        <label className="block mb-2">
          <span className="text-gray-400">Email</span>
          <input
            type="email"
            value={editData.email}
            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            className="w-full p-2 border rounded-lg bg-gray-700 text-white"
          />
        </label>
        <label className="block mb-2">
          <span className="text-gray-400">New Password</span>
          <input
            type="password"
            value={editData.password}
            onChange={(e) => setEditData({ ...editData, password: e.target.value })}
            className="w-full p-2 border rounded-lg bg-gray-700 text-white"
          />
        </label>
        <div className="flex justify-end mt-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            onClick={onSave}
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </>
  );
}
