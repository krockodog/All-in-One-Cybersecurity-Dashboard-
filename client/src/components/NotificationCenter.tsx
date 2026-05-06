import { Bell, X, Check, AlertCircle, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type NotificationType = "info" | "warning" | "error" | "success";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  read: boolean;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-blue-400" />,
  warning: <AlertCircle className="h-4 w-4 text-yellow-400" />,
  error: <AlertCircle className="h-4 w-4 text-red-400" />,
  success: <Check className="h-4 w-4 text-green-400" />,
};

const notificationColors: Record<NotificationType, string> = {
  info: "border-blue-500/20 bg-blue-500/10",
  warning: "border-yellow-500/20 bg-yellow-500/10",
  error: "border-red-500/20 bg-red-500/10",
  success: "border-green-500/20 bg-green-500/10",
};

export function NotificationCenter() {
  const [showPanel, setShowPanel] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const getNotificationsQuery = trpc.notifications.getNotifications.useQuery({ limit: 50 }, {
    refetchInterval: 5000,
  });
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation();
  const deleteNotificationMutation = trpc.notifications.deleteNotification.useMutation();

  useEffect(() => {
    if (getNotificationsQuery.data) {
      const data = getNotificationsQuery.data as any;
      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (data?.notifications && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    }
  }, [getNotificationsQuery.data]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate({ notificationId: id });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    deleteNotificationMutation.mutate({ notificationId: id });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  const handleClearAll = () => {
    notifications.forEach((n) => {
      deleteNotificationMutation.mutate({ notificationId: n.id });
    });
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        type="button"
        onClick={() => setShowPanel(!showPanel)}
        className="relative inline-flex items-center justify-center h-10 w-10 rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-200 transition hover:bg-cyan-500/20"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-96 rounded-lg border border-cyan-500/20 bg-slate-900/95 shadow-lg z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 px-4 py-3">
            <div>
              <h3 className="font-semibold text-white">Notifications</h3>
              <p className="text-xs text-slate-400">{unreadCount} unread</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPanel(false)}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto space-y-2 px-3 py-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-lg border p-3 ${notificationColors[notification.type]} ${
                    !notification.read ? "ring-1 ring-cyan-400/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{notificationIcons[notification.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{notification.title}</p>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1 text-cyan-400 hover:bg-cyan-500/20 rounded transition"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(notification.id)}
                        className="p-1 text-slate-400 hover:bg-red-500/20 rounded transition"
                        title="Delete"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-cyan-500/20 px-4 py-3 flex gap-2">
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-200 transition hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark all as read
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-200 transition hover:bg-red-500/20"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
