'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPendingConnectionRequests, acceptConnectionRequest, rejectConnectionRequest } from '@/lib/api/connections';
import { Button } from '@/components/ui';
import { getPublicUrl } from '@/lib/supabase/storage';

export function PendingConnectionsList() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchPendingRequests = async () => {
    const result = await getPendingConnectionRequests();
    if (result.success && result.data) {
      setPendingRequests(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleAccept = async (connectionId: string) => {
    setProcessingIds(prev => new Set(prev).add(connectionId));
    
    const result = await acceptConnectionRequest(connectionId);
    
    if (result.success) {
      // Remove from list
      setPendingRequests(prev => prev.filter(req => req.id !== connectionId));
    } else {
      alert(result.error || 'Failed to accept connection');
    }
    
    setProcessingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(connectionId);
      return newSet;
    });
  };

  const handleReject = async (connectionId: string) => {
    setProcessingIds(prev => new Set(prev).add(connectionId));
    
    const result = await rejectConnectionRequest(connectionId);
    
    if (result.success) {
      // Remove from list
      setPendingRequests(prev => prev.filter(req => req.id !== connectionId));
    } else {
      alert(result.error || 'Failed to reject connection');
    }
    
    setProcessingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(connectionId);
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
        <div className="h-20 bg-gray-200 rounded-lg"></div>
        <div className="h-20 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pending connection requests
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingRequests.map((request) => (
        <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-start gap-4">
            <Link href={`/me/${request.requester.profile_slug}`} className="flex-shrink-0">
              {request.requester.profile_photo_url ? (
                <Image
                  src={getPublicUrl(request.requester.profile_photo_url) || '/default-avatar.png'}
                  alt={request.requester.full_name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {request.requester.full_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>
            
            <div className="flex-1 min-w-0">
              <Link 
                href={`/me/${request.requester.profile_slug}`}
                className="font-semibold text-gray-900 hover:text-primary"
              >
                {request.requester.full_name}
              </Link>
              {request.requester.headline && (
                <p className="text-sm text-gray-600 line-clamp-1">
                  {request.requester.headline}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {new Date(request.requested_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleAccept(request.id)}
                disabled={processingIds.has(request.id)}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(request.id)}
                disabled={processingIds.has(request.id)}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
