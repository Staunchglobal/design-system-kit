/**
 * Re-exports the NotificationCenter composite and related types from the
 * feature directory so it can be imported from the standard ui/ path.
 */
export {
  NotificationCenter,
  type NotificationCenterProps,
  type NotificationItem,
} from '@/components/notification-center/notification-center'

export {
  NotificationList,
  groupByDate,
  type NotificationListProps,
  type DateGroup,
  type NotificationType,
} from '@/components/notification-center/notification-list'
