/**
 * Notification Dropdown
 * 
 * Displays list of notifications in a dropdown
 * Supports infinite scroll, mark as read, and actions
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllAsRead,
  formatNotificationTime,
  getNotificationIcon,
  getNotificationColor,
  type Notification,
} from '@/lib/notificationService';
import Image from 'next/image';
import Link from 'next/link';

interface NotificationDropdownProps {
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
}

export function NotificationDropdown({
  onClose,
  onUnreadCountChange,
}: NotificationDropdownProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const observerTarget = useRef(null);
  
  const NOTIFICATIONS_PER_PAGE = 10;
  
  // Fetch notifications
  useEffect(() => {
    loadNotifications(true);
  }, [showUnreadOnly]);
  
  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading]);
  
  // Load more when page changes
  useEffect(() => {
    if (page > 0) {
      loadNotifications(false);
    }
  }, [page]);
  
  const loadNotifications = async (reset: boolean = false) => {
    setLoading(true);
    
    const offset = reset ? 0 : page * NOTIFICATIONS_PER_PAGE;
    const data = await fetchNotifications(NOTIFICATIONS_PER_PAGE, offset, showUnreadOnly);
    
    if (reset) {
      setNotifications(data);
      setPage(0);
    } else {
      setNotifications((prev) => [...prev, ...data]);
    }
    
    setHasMore(data.length === NOTIFICATIONS_PER_PAGE);
    setLoading(false);
  };
  
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
      
      // Update unread count
      const unreadCount = notifications.filter((n) => !n.is_read).length - 1;
      onUnreadCountChange(Math.max(0, unreadCount));
    }
    
    // Navigate to action URL
    if (notification.action_url) {
      router.push(notification.action_url);
      onClose();
    }
  };
  
  const handleMarkAllAsRead = async () => {
    const count = await markAllAsRead();
    
    if (count > 0) {
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      
      // Update unread count
      onUnreadCountChange(0);
    }
  };
  
  return (
    <div className="w-96 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                showUnreadOnly
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread only
            </button>
          </div>
          
          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>
      
      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left ${
                  !notification.is_read ? 'bg-blue-50' : ''
                }`}
              >
                {/* Sender Avatar or Icon */}
                <div className="flex-shrink-0">
                  {notification.sender?.profile_photo_url ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      <Image
                        src={notification.sender.profile_photo_url}
                        alt={notification.sender.full_name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                        !notification.is_read ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm mb-1 ${!notification.is_read ? 'font-semibold' : 'font-normal'}`}>
                    {notification.title}
                  </p>
                  
                  {notification.content && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                      {notification.content}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    {formatNotificationTime(notification.created_at)}
                  </p>
                </div>
                
                {/* Unread Indicator */}
                {!notification.is_read && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
            
            {/* Infinite Scroll Trigger */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center">
              {loading && hasMore && (
                <div className="animate-spin w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full"></div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200">
          <Link
            href="/notifications"
            onClick={onClose}
            className="block w-full text-center text-sm text-green-600 hover:text-green-700 font-medium py-2"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

