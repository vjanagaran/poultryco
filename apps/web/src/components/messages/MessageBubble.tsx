'use client';

import { useState } from 'react';
import { Message, formatMessageTime } from '@/lib/messagingUtils';
import Image from 'next/image';
import Link from 'next/link';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  onReply: () => void;
  onForward?: () => void;
  onDelete?: () => void;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar,
  status,
  onReply,
  onForward,
  onDelete,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
  };

  const renderStatusIcon = () => {
    if (!isOwn) return null;

    switch (status) {
      case 'sent':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            <path d="M13.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-1-1a1 1 0 011.414-1.414L8 15.586l7.293-7.293a1 1 0 011.414 0z" />
          </svg>
        );
      case 'read':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            <path d="M13.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-1-1a1 1 0 011.414-1.414L8 15.586l7.293-7.293a1 1 0 011.414 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isOwn && (
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Link href={`/me/${message.sender?.profile_slug}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 overflow-hidden cursor-pointer">
                {message.sender?.profile_photo_url ? (
                  <Image
                    src={message.sender.profile_photo_url}
                    alt={message.sender.full_name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold">
                    {message.sender?.full_name.charAt(0)}
                  </div>
                )}
              </div>
            </Link>
          ) : (
            <div className="w-8"></div>
          )}
        </div>
      )}

      {/* Message bubble */}
      <div className={`relative max-w-[70%] group ${isOwn ? 'ml-auto' : ''}`}>
        {/* Reply preview */}
        {message.reply_to && (
          <div className={`mb-1 px-3 py-2 text-xs rounded-t-lg border-l-4 ${
            isOwn
              ? 'bg-green-100 border-green-600'
              : 'bg-gray-100 border-gray-400'
          }`}>
            <div className="font-semibold text-gray-700">
              {message.reply_to.sender?.full_name}
            </div>
            <div className="text-gray-600 truncate">
              {message.reply_to.message_type === 'text'
                ? message.reply_to.content
                : '📎 Attachment'}
            </div>
          </div>
        )}

        {/* Message content */}
        <div
          className={`relative px-3 py-2 rounded-lg shadow-sm ${
            isOwn
              ? 'bg-[#d9fdd3] text-gray-900'
              : 'bg-white text-gray-900'
          } ${message.reply_to ? 'rounded-tl-none' : ''}`}
          onContextMenu={handleContextMenu}
          onClick={() => setShowMenu(false)}
        >
          {/* Media */}
          {message.media_urls && message.media_urls.length > 0 && (
            <div className="mb-2 -mx-1 -mt-1">
              {message.media_urls.length === 1 ? (
                <div className="relative w-full rounded-t-lg overflow-hidden">
                  <Image
                    src={message.media_urls[0]}
                    alt="Message attachment"
                    width={300}
                    height={200}
                    className="w-full h-auto"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {message.media_urls.slice(0, 4).map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={url}
                        alt={`Attachment ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {index === 3 && message.media_urls.length > 4 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold">
                          +{message.media_urls.length - 4}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Text content */}
          {message.content && (
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}

          {/* Timestamp and status */}
          <div className={`flex items-center justify-end gap-1 mt-1 ${
            message.content ? '-mb-1' : ''
          }`}>
            {message.edited && (
              <span className="text-[10px] text-gray-500 italic">edited</span>
            )}
            <span className="text-[11px] text-gray-500">
              {formatMessageTime(message.created_at)}
            </span>
            {renderStatusIcon()}
          </div>

          {/* Forwarded indicator */}
          {message.forwarded_from_message_id && (
            <div className="flex items-center gap-1 text-xs text-gray-500 italic mb-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Forwarded
            </div>
          )}
        </div>

        {/* Action menu */}
        {showMenu && (
          <div className={`absolute top-0 mt-8 bg-white rounded-lg shadow-lg z-10 py-1 min-w-[150px] ${
            isOwn ? 'right-0' : 'left-0'
          }`}>
            <button
              onClick={() => {
                onReply();
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Reply
            </button>
            {onForward && (
              <button
                onClick={() => {
                  onForward();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Forward
              </button>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(message.content);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy
            </button>
            {isOwn && onDelete && (
              <button
                onClick={() => {
                  if (confirm('Delete this message?')) {
                    onDelete();
                  }
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
          </div>
        )}

        {/* Quick actions (on hover) */}
        <div className={`absolute top-0 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity ${
          isOwn ? 'right-0' : 'left-0'
        }`}>
          <div className="flex items-center gap-1 bg-white rounded-lg shadow-md p-1">
            <button
              onClick={onReply}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="Reply"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={() => setShowMenu(true)}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="More"
            >
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

