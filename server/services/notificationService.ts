export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  metadata?: string | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  workflowCompleted: boolean;
  criticalFinding: boolean;
  toolError: boolean;
  scanStarted: boolean;
  scanCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationEvent {
  type: 'workflow_completed' | 'critical_finding' | 'tool_error' | 'scan_started' | 'scan_completed';
  title: string;
  message: string;
  userId: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  metadata?: Record<string, unknown>;
}

/**
 * Notification Service
 * Manages user notifications, preferences, and delivery
 */
export class NotificationService {
  /**
   * Create and store a notification
   */
  static async createNotification(event: NotificationEvent): Promise<Notification> {
    // Store notification in database
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: event.userId,
      type: event.type,
      title: event.title,
      message: event.message,
      severity: event.severity,
      metadata: event.metadata ? JSON.stringify(event.metadata) : null,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real implementation, this would insert into the database
    // For now, we return the notification object
    return notification;
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    // In a real implementation, this would query the database
    // For now, return empty array
    return [];
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    // In a real implementation, this would update the database
    // For now, do nothing
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string): Promise<void> {
    // In a real implementation, this would update the database
    // For now, do nothing
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    // In a real implementation, this would delete from the database
    // For now, do nothing
  }

  /**
   * Get user notification preferences
   */
  static async getPreferences(userId: string): Promise<NotificationPreference> {
    // In a real implementation, this would query the database
    // For now, return default preferences
    return {
      id: `pref-${userId}`,
      userId,
      emailNotifications: true,
      pushNotifications: true,
      workflowCompleted: true,
      criticalFinding: true,
      toolError: true,
      scanStarted: false,
      scanCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Update user notification preferences
   */
  static async updatePreferences(userId: string, preferences: Partial<NotificationPreference>): Promise<NotificationPreference> {
    // In a real implementation, this would update the database
    // For now, return updated preferences
    return {
      id: `pref-${userId}`,
      userId,
      emailNotifications: preferences.emailNotifications ?? true,
      pushNotifications: preferences.pushNotifications ?? true,
      workflowCompleted: preferences.workflowCompleted ?? true,
      criticalFinding: preferences.criticalFinding ?? true,
      toolError: preferences.toolError ?? true,
      scanStarted: preferences.scanStarted ?? false,
      scanCompleted: preferences.scanCompleted ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Send workflow completion notification
   */
  static async notifyWorkflowCompleted(userId: string, workflowName: string, status: 'success' | 'failed'): Promise<void> {
    const event: NotificationEvent = {
      type: 'workflow_completed',
      title: `Workflow ${status === 'success' ? 'Completed' : 'Failed'}`,
      message: `${workflowName} has ${status === 'success' ? 'completed successfully' : 'failed'}`,
      userId,
      severity: status === 'success' ? 'success' : 'error',
      metadata: { workflowName, status },
    };

    await this.createNotification(event);
  }

  /**
   * Send critical finding notification
   */
  static async notifyCriticalFinding(userId: string, findingTitle: string, severity: string): Promise<void> {
    const event: NotificationEvent = {
      type: 'critical_finding',
      title: 'Critical Finding Detected',
      message: `${findingTitle} (${severity})`,
      userId,
      severity: 'error',
      metadata: { findingTitle, severity },
    };

    await this.createNotification(event);
  }

  /**
   * Send tool error notification
   */
  static async notifyToolError(userId: string, toolName: string, error: string): Promise<void> {
    const event: NotificationEvent = {
      type: 'tool_error',
      title: `Tool Error: ${toolName}`,
      message: error,
      userId,
      severity: 'error',
      metadata: { toolName, error },
    };

    await this.createNotification(event);
  }

  /**
   * Helper: Determine if notification should be sent based on preferences
   */
  private static shouldNotify(eventType: string, preferences: NotificationPreference): boolean {
    switch (eventType) {
      case 'workflow_completed':
        return preferences.workflowCompleted;
      case 'critical_finding':
        return preferences.criticalFinding;
      case 'tool_error':
        return preferences.toolError;
      case 'scan_started':
        return preferences.scanStarted;
      case 'scan_completed':
        return preferences.scanCompleted;
      default:
        return true;
    }
  }
}
