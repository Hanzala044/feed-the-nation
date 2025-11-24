/**
 * Push Notification Utilities for FOOD 4 U PWA
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Show a local notification (works even when app is open)
 */
export async function showNotification(options: NotificationOptions): Promise<void> {
  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    console.warn('Notification permission denied');
    return;
  }

  // Use service worker notification if available (shows even when app is closed)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/logo-192.png',
      badge: options.badge || '/logo-192.png',
      tag: options.tag,
      data: options.data,
      vibrate: [200, 100, 200],
      requireInteraction: false,
    });
  } else {
    // Fallback to regular notification
    new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/logo-192.png',
      badge: options.badge || '/logo-192.png',
      tag: options.tag,
      data: options.data,
    });
  }
}

/**
 * Check if notifications are supported and enabled
 */
export function areNotificationsSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Send notification for new donation
 */
export async function notifyNewDonation(donationTitle: string) {
  await showNotification({
    title: '🎁 New Donation Available',
    body: donationTitle,
    tag: 'new-donation',
  });
}

/**
 * Send notification for donation accepted
 */
export async function notifyDonationAccepted(volunteerName: string) {
  await showNotification({
    title: '✅ Donation Accepted',
    body: `${volunteerName} will pick up your donation`,
    tag: 'donation-accepted',
  });
}

/**
 * Send notification for delivery completed
 */
export async function notifyDeliveryCompleted(donationTitle: string) {
  await showNotification({
    title: '🎉 Delivery Completed',
    body: `${donationTitle} has been delivered successfully`,
    tag: 'delivery-completed',
  });
}
