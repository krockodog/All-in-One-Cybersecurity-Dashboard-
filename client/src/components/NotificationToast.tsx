import { useNotification, Notification } from "@/contexts/NotificationContext";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export function NotificationToast() {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
      case "critical":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-4 rounded-lg border ${getBgColor(notification.type)} animate-in slide-in-from-top-2 fade-in`}
        >
          {getIcon(notification.type)}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">{notification.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                className="text-sm font-medium text-primary hover:underline mt-2 inline-block"
              >
                View Details →
              </a>
            )}
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
