import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const user = supabase.auth.getUser();

    // ✅ Get current logged-in user

    useEffect(() => {
        const fetchNotifications = async () => {
          const { data: user, error: userError } = await supabase.auth.getUser(); // ✅ Get user safely
          if (userError || !user || !user.user) {
            console.error("❌ Error fetching user:", userError);
            return;
          }
          
          const userId = user.user.id; // ✅ Ensure valid user ID
          if (!userId) {
            console.error("❌ User ID is undefined!");
            return;
          }
      
          const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId) // ✅ Use valid UUID
            .eq("is_read", false)
            .order("created_at", { ascending: false });
      
          if (error) {
            console.error("🔥 Error fetching notifications:", error);
          } else {
            setNotifications(data);
            setUnreadCount(data.length);
          }
        };
      
        fetchNotifications();
      }, []);
    // ✅ Fetch notifications for the logged-in user      

  const markAsRead = async (id) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="absolute top-16 right-6 bg-white shadow-lg rounded-lg p-4 w-80">
      <h3 className="font-bold text-lg">Notifications</h3>
      {notifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        notifications.map((notification) => (
          <div key={notification.id} className="border-b py-2">
            <p>{notification.message}</p>
            <button
              onClick={() => markAsRead(notification.id)}
              className="text-blue-500 text-sm"
            >
              Mark as Read
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;
