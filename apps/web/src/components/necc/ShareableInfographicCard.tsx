'use client';

import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface ShareableInfographicCardProps {
  title: string;
  subtitle?: string;
  data: {
    label: string;
    value: string | number;
    change?: number;
    changeType?: 'increase' | 'decrease' | 'neutral';
  }[];
  shareUrl: string;
  shareTitle: string;
  shareDescription?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ShareableInfographicCard({
  title,
  subtitle,
  data,
  shareUrl,
  shareTitle,
  shareDescription,
  className = '',
  children
}: ShareableInfographicCardProps) {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription || shareTitle,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
        console.error('Share failed:', err);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n${shareUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            {subtitle && <p className="text-sm text-white/90">{subtitle}</p>}
          </div>
          <div className="relative">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
            {showShareMenu && (
              <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg p-2 z-10 min-w-[200px]">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  Share on WhatsApp
                </a>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  Share on Twitter
                </a>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  Share on Facebook
                </a>
                <button
                  onClick={handleCopyLink}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {children || (
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-gray-700 font-medium">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{item.value}</span>
                  {item.change !== undefined && item.changeType && (
                    <span
                      className={`text-sm font-medium ${
                        item.changeType === 'increase'
                          ? 'text-green-600'
                          : item.changeType === 'decrease'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {item.changeType === 'increase' ? '+' : ''}
                      {item.change}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <Link
          href={shareUrl}
          className="text-sm text-primary hover:underline"
        >
          View full details →
        </Link>
      </div>
    </div>
  );
}

