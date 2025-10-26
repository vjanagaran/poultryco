/**
 * Notification Bell Button
 * 
 * Displays in header with unread count badge
 * Opens notification dropdown on click
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCount, subscribeToNotifications } from '@/lib/notificationService';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Fetch initial unread count
  useEffect(() => {
    if (!user) return;
    
    const fetchUnreadCount = async () => {
      const count = await getUnreadCount();
      setUnreadCount(count);
      setLoading(false);
    };
    
    fetchUnreadCount();
  }, [user]);
  
  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToNotifications(
      user.id,
      (notification) => {
        // Play notification sound (optional)
        // playNotificationSound();
        
        // Show browser notification (optional)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.content || undefined,
            icon: notification.sender?.profile_photo_url || '/logo.png',
          });
        }
      },
      (count) => {
        setUnreadCount(count);
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, [user]);
  
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  if (!user || loading) {
    return null;
  }
  
  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        {/* Bell Icon */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Pulse Animation for New Notifications */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 rounded-full animate-ping opacity-75"></span>
        )}
      </button>
      
      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          ></div>
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 z-20">
            <NotificationDropdown
              onClose={() => setShowDropdown(false)}
              onUnreadCountChange={setUnreadCount}
            />
          </div>
        </>
      )}
    </div>
  );
}

