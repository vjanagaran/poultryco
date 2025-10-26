/**
 * Notifications Page
 * 
 * Full-page view of all notifications
 * Supports filtering, infinite scroll, and batch actions
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllAsRead,
  formatNotificationTime,
  getNotificationIcon,
  getNotificationColor,
  type Notification,
} from '@/lib/notificationService';
import { Container } from '@/components/ui';
import Image from 'next/image';

export function NotificationsContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'posts' | 'connections' | 'messages'>('all');
  const observerTarget = useRef(null);
  
  const NOTIFICATIONS_PER_PAGE = 20;
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  // Fetch notifications
  useEffect(() => {
    if (user) {
      loadNotifications(true);
    }
  }, [user, filter]);
  
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
    const unreadOnly = filter === 'unread';
    let data = await fetchNotifications(NOTIFICATIONS_PER_PAGE, offset, unreadOnly);
    
    // Apply additional filters
    if (filter === 'posts') {
      data = data.filter((n) =>
        ['post_like', 'post_comment', 'post_share', 'post_mention', 'comment_like', 'comment_reply'].includes(
          n.notification_type
        )
      );
    } else if (filter === 'connections') {
      data = data.filter((n) =>
        ['connection_request', 'connection_accepted', 'follow_new'].includes(n.notification_type)
      );
    } else if (filter === 'messages') {
      data = data.filter((n) => ['message_new', 'message_mention'].includes(n.notification_type));
    }
    
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
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
    }
    
    // Navigate to action URL
    if (notification.action_url) {
      router.push(notification.action_url);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    
    // Update local state
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };
  
  if (authLoading || !user) {
    return (
      <Container className="py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            
            {notifications.some((n) => !n.is_read) && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium hover:bg-green-50 rounded-lg transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'posts', label: 'Posts' },
              { key: 'connections', label: 'Connections' },
              { key: 'messages', label: 'Messages' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key as typeof filter)}
                className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${
                  filter === item.key
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Notifications List */}
        <div className="space-y-2">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No notifications</h3>
              <p className="text-sm text-gray-500">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full bg-white rounded-lg shadow-sm p-4 flex items-start gap-4 hover:shadow-md transition-shadow text-left ${
                    !notification.is_read ? 'border-l-4 border-green-600' : ''
                  }`}
                >
                  {/* Sender Avatar or Icon */}
                  <div className="flex-shrink-0">
                    {notification.sender?.profile_photo_url ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                        <Image
                          src={notification.sender.profile_photo_url}
                          alt={notification.sender.full_name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          !notification.is_read ? 'bg-green-100' : 'bg-gray-100'
                        }`}
                      >
                        {getNotificationIcon(notification.notification_type)}
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-base mb-1 ${
                        !notification.is_read ? 'font-semibold text-gray-900' : 'font-normal text-gray-800'
                      }`}
                    >
                      {notification.title}
                    </p>
                    
                    {notification.content && (
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.content}
                      </p>
                    )}
                    
                    <p className="text-sm text-gray-500">
                      {formatNotificationTime(notification.created_at)}
                    </p>
                  </div>
                  
                  {/* Unread Indicator */}
                  {!notification.is_read && (
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
              
              {/* Infinite Scroll Trigger */}
              <div ref={observerTarget} className="h-16 flex items-center justify-center">
                {loading && hasMore && (
                  <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
                )}
                {!hasMore && notifications.length > 0 && (
                  <p className="text-gray-400 text-sm">You've reached the end</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  );
}

