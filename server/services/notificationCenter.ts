/**
 * Notification Center Service
 * Centralized notification management with history and persistence
 */

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  userID: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  notificationTypes: {
    criticalFindings: boolean;
    workflowCompletion: boolean;
    systemAlerts: boolean;
    reportGeneration: boolean;
    tokenAlerts: boolean;
  };
  quietHours?: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  };
}

export class NotificationCenterService {
  private static notifications: Map<string, Notification[]> = new Map();
  private static preferences: Map<string, NotificationPreferences> = new Map();
  private static history: Notification[] = [];

  /**
   * Create notification
   */
  static createNotification(
    userID: string,
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ): Notification {
    const notif: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    // Store in user notifications
    if (!this.notifications.has(userID)) {
      this.notifications.set(userID, []);
    }
    this.notifications.get(userID)!.push(notif);

    // Store in history
    this.history.push(notif);

    // Trim history if too large
    if (this.history.length > 10000) {
      this.history = this.history.slice(-5000);
    }

    console.log(`[Notification] Created: ${notif.title} for user ${userID}`);

    return notif;
  }

  /**
   * Get user notifications
   */
  static getUserNotifications(userID: string, limit: number = 50): Notification[] {
    const userNotifs = this.notifications.get(userID) || [];
    return userNotifs.slice(-limit).reverse();
  }

  /**
   * Get unread notifications count
   */
  static getUnreadCount(userID: string): number {
    const userNotifs = this.notifications.get(userID) || [];
    return userNotifs.filter((n) => !n.read).length;
  }

  /**
   * Mark notification as read
   */
  static markAsRead(userID: string, notificationID: string): boolean {
    const userNotifs = this.notifications.get(userID) || [];
    const notif = userNotifs.find((n) => n.id === notificationID);

    if (notif) {
      notif.read = true;
      return true;
    }

    return false;
  }

  /**
   * Mark all as read
   */
  static markAllAsRead(userID: string): void {
    const userNotifs = this.notifications.get(userID) || [];
    userNotifs.forEach((n) => {
      n.read = true;
    });
  }

  /**
   * Delete notification
   */
  static deleteNotification(userID: string, notificationID: string): boolean {
    const userNotifs = this.notifications.get(userID) || [];
    const index = userNotifs.findIndex((n) => n.id === notificationID);

    if (index !== -1) {
      userNotifs.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * Clear all notifications
   */
  static clearAllNotifications(userID: string): void {
    this.notifications.delete(userID);
  }

  /**
   * Get notification preferences
   */
  static getPreferences(userID: string): NotificationPreferences {
    if (!this.preferences.has(userID)) {
      const defaultPrefs: NotificationPreferences = {
        userID,
        emailNotifications: true,
        pushNotifications: true,
        inAppNotifications: true,
        notificationTypes: {
          criticalFindings: true,
          workflowCompletion: true,
          systemAlerts: true,
          reportGeneration: true,
          tokenAlerts: true,
        },
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
        },
      };
      this.preferences.set(userID, defaultPrefs);
      return defaultPrefs;
    }

    return this.preferences.get(userID)!;
  }

  /**
   * Update preferences
   */
  static updatePreferences(userID: string, updates: Partial<NotificationPreferences>): NotificationPreferences {
    const prefs = this.getPreferences(userID);
    const updated = { ...prefs, ...updates, userID };
    this.preferences.set(userID, updated);

    console.log(`[Notification] Updated preferences for user ${userID}`);

    return updated;
  }

  /**
   * Check if in quiet hours
   */
  static isInQuietHours(userID: string): boolean {
    const prefs = this.getPreferences(userID);

    if (!prefs.quietHours?.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const start = prefs.quietHours.startTime;
    const end = prefs.quietHours.endTime;

    if (start < end) {
      return currentTime >= start && currentTime < end;
    } else {
      return currentTime >= start || currentTime < end;
    }
  }

  /**
   * Should send notification
   */
  static shouldSendNotification(userID: string, notificationType: keyof NotificationPreferences['notificationTypes']): boolean {
    const prefs = this.getPreferences(userID);

    if (!prefs.inAppNotifications) {
      return false;
    }

    if (!prefs.notificationTypes[notificationType]) {
      return false;
    }

    if (this.isInQuietHours(userID)) {
      return false;
    }

    return true;
  }

  /**
   * Get notification history
   */
  static getHistory(limit: number = 100): Notification[] {
    return this.history.slice(-limit).reverse();
  }

  /**
   * Get notifications by type
   */
  static getNotificationsByType(userID: string, type: Notification['type']): Notification[] {
    const userNotifs = this.notifications.get(userID) || [];
    return userNotifs.filter((n) => n.type === type);
  }

  /**
   * Get notifications by source
   */
  static getNotificationsBySource(userID: string, source: string): Notification[] {
    const userNotifs = this.notifications.get(userID) || [];
    return userNotifs.filter((n) => n.source === source);
  }

  /**
   * Send critical finding notification
   */
  static notifyCriticalFinding(userID: string, finding: any): Notification | null {
    if (!this.shouldSendNotification(userID, 'criticalFindings')) {
      return null;
    }

    return this.createNotification(userID, {
      type: 'critical',
      title: 'Critical Security Finding',
      message: `Critical finding detected: ${finding.title || 'Unknown'}`,
      source: 'security-scanner',
      actionUrl: `/findings/${finding.id}`,
      actionLabel: 'View Finding',
      metadata: { findingID: finding.id, severity: finding.severity },
    });
  }

  /**
   * Send workflow completion notification
   */
  static notifyWorkflowCompletion(userID: string, workflow: any): Notification | null {
    if (!this.shouldSendNotification(userID, 'workflowCompletion')) {
      return null;
    }

    return this.createNotification(userID, {
      type: 'success',
      title: 'Workflow Completed',
      message: `${workflow.name} completed successfully`,
      source: 'workflow-engine',
      actionUrl: `/workflows/${workflow.id}`,
      actionLabel: 'View Results',
      metadata: { workflowID: workflow.id, duration: workflow.duration },
    });
  }

  /**
   * Send system alert notification
   */
  static notifySystemAlert(userID: string, alert: any): Notification | null {
    if (!this.shouldSendNotification(userID, 'systemAlerts')) {
      return null;
    }

    return this.createNotification(userID, {
      type: 'warning',
      title: 'System Alert',
      message: alert.message,
      source: 'system',
      metadata: { alertID: alert.id, severity: alert.severity },
    });
  }

  /**
   * Send report generation notification
   */
  static notifyReportGeneration(userID: string, report: any): Notification | null {
    if (!this.shouldSendNotification(userID, 'reportGeneration')) {
      return null;
    }

    return this.createNotification(userID, {
      type: 'success',
      title: 'Report Generated',
      message: `${report.type} report is ready for download`,
      source: 'report-generator',
      actionUrl: `/reports/${report.id}`,
      actionLabel: 'Download Report',
      metadata: { reportID: report.id, type: report.type },
    });
  }

  /**
   * Send token alert notification
   */
  static notifyTokenAlert(userID: string, alert: any): Notification | null {
    if (!this.shouldSendNotification(userID, 'tokenAlerts')) {
      return null;
    }

    return this.createNotification(userID, {
      type: alert.severity === 'critical' ? 'critical' : 'warning',
      title: 'AI Token Alert',
      message: alert.message,
      source: 'ai-token-manager',
      actionUrl: '/settings/ai-tokens',
      actionLabel: 'Manage Tokens',
      metadata: { providerID: alert.providerID, type: alert.type },
    });
  }

  /**
   * Get notification statistics
   */
  static getStatistics(userID: string): {
    total: number;
    unread: number;
    byType: Record<string, number>;
    bySource: Record<string, number>;
  } {
    const userNotifs = this.notifications.get(userID) || [];

    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    userNotifs.forEach((n) => {
      byType[n.type] = (byType[n.type] || 0) + 1;
      bySource[n.source] = (bySource[n.source] || 0) + 1;
    });

    return {
      total: userNotifs.length,
      unread: userNotifs.filter((n) => !n.read).length,
      byType,
      bySource,
    };
  }
}

export const notificationCenterService = NotificationCenterService;
