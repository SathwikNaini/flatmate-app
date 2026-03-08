import { useEffect, useState } from "react";
import { notifications } from "../lib/api";

function Notifications() {
  const [notificationList, setNotificationList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notifications.getAll();
      setNotificationList(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await notifications.getUnreadCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleMarkAsRead = async (notificationId = null) => {
    try {
      await notifications.markAsRead(notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      alert("Error marking as read: " + error.message);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    try {
      await notifications.delete(notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      alert("Error deleting notification: " + error.message);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all notifications? This cannot be undone.")) return;
    try {
      await notifications.clearAll();
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      alert("Error clearing notifications: " + error.message);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection_request': return { icon: '🤝', color: '#6366f1' };
      case 'connection_accepted': return { icon: '✨', color: '#22c55e' };
      case 'new_message': return { icon: '💬', color: '#3b82f6' };
      default: return { icon: '🔔', color: '#94a3b8' };
    }
  };

  if (loading) return (
    <div className="skeleton-container">
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-card"></div>
      <div className="skeleton skeleton-card"></div>
    </div>
  );

  return (
    <div className="notifications-container fade-in">
      <div className="section-header saas-section-header">
        <div className="header-with-badge">
          <h3>Activity Feed</h3>
          {unreadCount > 0 && <span className="notification-badge-saas">{unreadCount}</span>}
        </div>
        {notificationList.length > 0 && (
          <div className="flex gap-2">
            <button className="secondary-btn saas-btn btn-sm" onClick={() => handleMarkAsRead()}>
              Read All
            </button>
            <button className="danger-btn-outline saas-btn btn-sm" onClick={handleClearAll}>
              Clear Feed
            </button>
          </div>
        )}
      </div>

      {notificationList.length === 0 ? (
        <div className="empty-state card saas-card">
          <div className="card-body">
            <div className="empty-illustration">📭</div>
            <h3 className="text-xl font-bold mt-4">All caught up!</h3>
            <p className="text-slate-400 mt-2">We'll let you know when something important happens.</p>
          </div>
        </div>
      ) : (
        <div className="notifications-list-saas">
          {notificationList.map((notif, index) => {
            const { icon, color } = getNotificationIcon(notif.type);
            return (
              <div 
                key={notif.id} 
                className={`card saas-card glass-card hover-lift notification-item-saas ${notif.is_read ? 'is-read' : 'is-unread'}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="card-body">
                  <div className="notification-flex">
                    <div className="notif-icon-box" style={{ background: `${color}15`, color: color }}>
                      {icon}
                    </div>
                    <div className="notif-details">
                      <p className="notif-text-content">
                        <strong>Activity:</strong> {notif.message}
                      </p>
                      <span className="notif-timestamp">
                        {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                      <div className="notif-sidebar-actions">
                        {!notif.is_read && <div className="status-dot-saas"></div>}
                        <button 
                          className="mark-as-read-icon-btn delete-notif-btn" 
                          onClick={() => handleDeleteNotification(notif.id)}
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;
