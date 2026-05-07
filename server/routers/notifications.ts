import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { NotificationService } from '../services/notificationService';

export const notificationsRouter = router({
  /**
   * Get user notifications
   */
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = String(ctx.user?.id || '');
      const notifications = await NotificationService.getUserNotifications(userId, input.limit);
      return {
        success: true,
        notifications,
        count: notifications.length,
      };
    }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await NotificationService.markAsRead(input.notificationId);
      return { success: true };
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = String(ctx.user?.id || '');
    await NotificationService.markAllAsRead(userId);
    return { success: true };
  }),

  /**
   * Delete notification
   */
  deleteNotification: protectedProcedure
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await NotificationService.deleteNotification(input.notificationId);
      return { success: true };
    }),

  /**
   * Get notification preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const userId = String(ctx.user?.id || '');
    const preferences = await NotificationService.getPreferences(userId);
    return {
      success: true,
      preferences,
    };
  }),

  /**
   * Update notification preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        workflowCompleted: z.boolean().optional(),
        criticalFinding: z.boolean().optional(),
        toolError: z.boolean().optional(),
        scanStarted: z.boolean().optional(),
        scanCompleted: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = String(ctx.user?.id || '');
      const preferences = await NotificationService.updatePreferences(userId, input);
      return {
        success: true,
        preferences,
      };
    }),

  /**
   * Send test notification
   */
  sendTestNotification: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = String(ctx.user?.id || '');
    const notification = await NotificationService.createNotification({
      type: 'workflow_completed',
      title: 'Test Notification',
      message: 'This is a test notification from the dashboard',
      userId,
      severity: 'info',
    });

    return {
      success: true,
      notification,
    };
  }),
});
