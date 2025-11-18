'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { MutualConnections } from './MutualConnections';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface ConnectionRequest {
  id: string;
  created_at: string;
  message?: string;
  requester: {
    id: string;
    full_name: string;
    profile_slug: string;
    headline?: string;
    profile_photo_url?: string;
    location_city?: string;
    location_state?: string;
  };
}

export function ConnectionRequestsList() {
  const supabase = createClient();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  
  // Fetch received connection requests
  const { data: receivedRequests = [], isLoading: loadingReceived } = useQuery({
    queryKey: ['connectionRequests', 'received'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      
      // Get connections where current user is profile_id_1 or profile_id_2 and status is pending
      // and requested_by is NOT the current user (these are received requests)
      const { data, error } = await supabase
        .from('connections')
        .select(`
          id,
          created_at,
          connection_message,
          requested_by,
          profile_id_1,
          profile_id_2
        `)
        .or(`profile_id_1.eq.${user.user.id},profile_id_2.eq.${user.user.id}`)
        .eq('status', 'pending')
        .neq('requested_by', user.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch requester profiles
      const requesterIds = data?.map(d => d.requested_by) || [];
      if (requesterIds.length === 0) return [];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, profile_slug, headline, profile_photo_url, location_city, location_state')
        .in('id', requesterIds);
      
      // Map profiles to requests
      return (data || []).map(item => ({
        id: item.id,
        created_at: item.created_at,
        message: item.connection_message,
        requester: profiles?.find(p => p.id === item.requested_by) || {
          id: item.requested_by,
          full_name: 'Unknown User',
          profile_slug: 'unknown',
        }
      })) as ConnectionRequest[];
    }
  });
  
  // Fetch sent connection requests
  const { data: sentRequests = [], isLoading: loadingSent } = useQuery({
    queryKey: ['connectionRequests', 'sent'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      
      // Get connections where current user is the requester
      const { data, error } = await supabase
        .from('connections')
        .select(`
          id,
          created_at,
          connection_message,
          requested_by,
          profile_id_1,
          profile_id_2
        `)
        .eq('requested_by', user.user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get the target profile IDs (the other person in the connection)
      const targetIds = (data || []).map(item => 
        item.profile_id_1 === user.user.id ? item.profile_id_2 : item.profile_id_1
      );
      
      if (targetIds.length === 0) return [];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, profile_slug, headline, profile_photo_url, location_city, location_state')
        .in('id', targetIds);
      
      // Map profiles to requests
      return (data || []).map(item => {
        const targetId = item.profile_id_1 === user.user.id ? item.profile_id_2 : item.profile_id_1;
        return {
          id: item.id,
          created_at: item.created_at,
          message: item.connection_message,
          requester: profiles?.find(p => p.id === targetId) || {
            id: targetId,
            full_name: 'Unknown User',
            profile_slug: 'unknown',
          }
        };
      }) as ConnectionRequest[];
    }
  });
  
  // Accept connection request
  const acceptMutation = useMutation({
    mutationFn: async (requesterId: string) => {
      const { error } = await supabase.rpc('accept_connection_request', {
        requester_profile_id: requesterId
      });
      
      if (error) throw error;
    },
    onSuccess: (_, requesterId) => {
      toast({
        title: 'Connection accepted',
        description: 'You are now connected!',
      });
      queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
      queryClient.invalidateQueries({ queryKey: ['connectionStats'] });
      queryClient.invalidateQueries({ queryKey: ['connectionStatus', requesterId] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept connection request',
        variant: 'destructive',
      });
    }
  });
  
  // Reject connection request
  const rejectMutation = useMutation({
    mutationFn: async (requesterId: string) => {
      const { error } = await supabase.rpc('reject_connection_request', {
        requester_profile_id: requesterId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Request ignored',
        description: 'Connection request has been removed',
      });
      queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject connection request',
        variant: 'destructive',
      });
    }
  });
  
  // Withdraw sent request
  const withdrawMutation = useMutation({
    mutationFn: async (targetId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const minId = user.id < targetId ? user.id : targetId;
      const maxId = user.id < targetId ? targetId : user.id;
      
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('profile_id_1', minId)
        .eq('profile_id_2', maxId)
        .eq('requested_by', user.id)
        .eq('status', 'pending');
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Request withdrawn',
        description: 'Connection request has been withdrawn',
      });
      queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
      queryClient.invalidateQueries({ queryKey: ['connectionStatus'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to withdraw request',
      });
    }
  });
  
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    }
  });
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'received' | 'sent')}>
        <div className="border-b border-gray-200">
          <TabsList className="w-full justify-start rounded-none h-auto p-0">
            <TabsTrigger 
              value="received" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-3"
            >
              Received ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger 
              value="sent" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-3"
            >
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="received" className="p-0">
          {loadingReceived ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : receivedRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No pending connection requests
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {receivedRequests.map((request) => (
                <div key={request.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <Link 
                      href={`/me/${request.requester.profile_slug}`}
                      className="flex-shrink-0"
                    >
                      <div className="relative w-16 h-16">
                        {request.requester.profile_photo_url ? (
                          <Image
                            src={request.requester.profile_photo_url}
                            alt={request.requester.full_name}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xl">
                              {request.requester.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link 
                            href={`/me/${request.requester.profile_slug}`}
                            className="font-semibold text-gray-900 hover:text-primary transition-colors"
                          >
                            {request.requester.full_name}
                          </Link>
                          {request.requester.headline && (
                            <p className="text-sm text-gray-600 mt-1">
                              {request.requester.headline}
                            </p>
                          )}
                          {(request.requester.location_city || request.requester.location_state) && (
                            <p className="text-sm text-gray-500 mt-1">
                              📍 {[request.requester.location_city, request.requester.location_state].filter(Boolean).join(', ')}
                            </p>
                          )}
                          
                          {currentUser && (
                            <div className="mt-2">
                              <MutualConnections
                                currentUserId={currentUser.id}
                                targetUserId={request.requester.id}
                                variant="compact"
                              />
                            </div>
                          )}
                          
                          {request.message && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">{request.message}</p>
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptMutation.mutate(request.requester.id)}
                            disabled={acceptMutation.isPending || rejectMutation.isPending}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectMutation.mutate(request.requester.id)}
                            disabled={acceptMutation.isPending || rejectMutation.isPending}
                          >
                            Ignore
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="sent" className="p-0">
          {loadingSent ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : sentRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No pending requests sent
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sentRequests.map((request) => (
                <div key={request.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <Link 
                      href={`/me/${request.requester.profile_slug}`}
                      className="flex-shrink-0"
                    >
                      <div className="relative w-16 h-16">
                        {request.requester.profile_photo_url ? (
                          <Image
                            src={request.requester.profile_photo_url}
                            alt={request.requester.full_name}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xl">
                              {request.requester.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link 
                            href={`/me/${request.requester.profile_slug}`}
                            className="font-semibold text-gray-900 hover:text-primary transition-colors"
                          >
                            {request.requester.full_name}
                          </Link>
                          {request.requester.headline && (
                            <p className="text-sm text-gray-600 mt-1">
                              {request.requester.headline}
                            </p>
                          )}
                          
                          {request.message && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">{request.message}</p>
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-400 mt-2">
                            Sent {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => withdrawMutation.mutate(request.requester.id)}
                          disabled={withdrawMutation.isPending}
                        >
                          Withdraw
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
