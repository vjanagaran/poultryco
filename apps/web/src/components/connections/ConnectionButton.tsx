'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// @ts-ignore - lucide-react type compatibility
import { UserPlus, UserCheck, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ConnectionButtonProps {
  targetProfileId: string;
  targetProfileName: string;
  currentUserId?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
  className?: string;
}

type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'connected' | 'following';

export function ConnectionButton({
  targetProfileId,
  targetProfileName,
  currentUserId,
  size = 'md',
  variant = 'primary',
  className = ''
}: ConnectionButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [message, setMessage] = useState('');
  
  // Check connection status
  const { data: connectionStatus = 'none', isLoading } = useQuery({
    queryKey: ['connectionStatus', currentUserId, targetProfileId],
    queryFn: async () => {
      if (!currentUserId || currentUserId === targetProfileId) return 'none';
      
      // Check for existing connection
      const { data: connection } = await supabase
        .from('network_connections')
        .select('status, requester_id')
        .or(
          `and(requester_id.eq.${currentUserId},target_id.eq.${targetProfileId}),` +
          `and(requester_id.eq.${targetProfileId},target_id.eq.${currentUserId})`
        )
        .single();
      
      if (connection) {
        if (connection.status === 'accepted') return 'connected' as ConnectionStatus;
        if (connection.status === 'pending') {
          return connection.requester_id === currentUserId ? 
            'pending_sent' as ConnectionStatus : 
            'pending_received' as ConnectionStatus;
        }
      }
      
      // Check if following
      const { data: following } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetProfileId)
        .single();
      
      if (following) return 'following' as ConnectionStatus;
      
      return 'none' as ConnectionStatus;
    },
    enabled: !!currentUserId && currentUserId !== targetProfileId
  });
  
  // Send connection request
  const sendConnectionMutation = useMutation({
    mutationFn: async ({ requestType, message }: { requestType: 'connect' | 'follow', message?: string }) => {
      const { data, error } = await supabase.rpc('handle_connection_request', {
        target_profile_id: targetProfileId,
        request_type: requestType,
        message: message || null
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { requestType }) => {
      toast({
        title: requestType === 'connect' ? 'Connection request sent' : 'Following',
        description: requestType === 'connect' ? 
          `Your connection request has been sent to ${targetProfileName}` :
          `You are now following ${targetProfileName}`,
      });
      queryClient.invalidateQueries({ queryKey: ['connectionStatus'] });
      queryClient.invalidateQueries({ queryKey: ['connectionStats'] });
      setShowMessageDialog(false);
      setMessage('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send connection request',
        variant: 'destructive',
      });
    }
  });
  
  // Accept/Reject connection request
  const handleConnectionResponse = useMutation({
    mutationFn: async (action: 'accept' | 'reject') => {
      const rpcFunction = action === 'accept' ? 'accept_connection_request' : 'reject_connection_request';
      const { error } = await supabase.rpc(rpcFunction, {
        requester_profile_id: targetProfileId
      });
      
      if (error) throw error;
    },
    onSuccess: (_, action) => {
      toast({
        title: action === 'accept' ? 'Connection accepted' : 'Connection rejected',
        description: action === 'accept' ? 
          `You are now connected with ${targetProfileName}` :
          'Connection request rejected',
      });
      queryClient.invalidateQueries({ queryKey: ['connectionStatus'] });
      queryClient.invalidateQueries({ queryKey: ['connectionStats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to respond to connection request',
        variant: 'destructive',
      });
    }
  });
  
  // Remove connection or unfollow
  const removeConnectionMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('remove_connection', {
        other_profile_id: targetProfileId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Connection removed',
        description: `You are no longer connected with ${targetProfileName}`,
      });
      queryClient.invalidateQueries({ queryKey: ['connectionStatus'] });
      queryClient.invalidateQueries({ queryKey: ['connectionStats'] });
    }
  });
  
  if (!currentUserId || currentUserId === targetProfileId || isLoading) {
    return null;
  }
  
  const handleConnect = () => {
    setShowMessageDialog(true);
  };
  
  const handleFollow = () => {
    sendConnectionMutation.mutate({ requestType: 'follow' });
  };
  
  const handleSendConnection = () => {
    sendConnectionMutation.mutate({ 
      requestType: 'connect', 
      message: message.trim() 
    });
  };
  
  // Render different buttons based on status
  switch (connectionStatus) {
    case 'connected':
      return (
        <Button
          size={size}
          variant="outline"
          className={`${className} text-green-600 border-green-600 hover:bg-green-50`}
          onClick={() => removeConnectionMutation.mutate()}
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Connected
        </Button>
      );
      
    case 'pending_sent':
      return (
        <Button
          size={size}
          variant="outline"
          className={className}
          disabled
        >
          <Clock className="h-4 w-4 mr-2" />
          Pending
        </Button>
      );
      
    case 'pending_received':
      return (
        <div className="flex gap-2">
            <Button
              size={size}
              variant="primary"
              className={className}
              onClick={() => handleConnectionResponse.mutate('accept')}
            >
              Accept
            </Button>
          <Button
            size={size}
            variant="outline"
            className={className}
            onClick={() => handleConnectionResponse.mutate('reject')}
          >
            Ignore
          </Button>
        </div>
      );
      
    case 'following':
      return (
        <Button
          size={size}
          variant={variant}
          className={className}
          onClick={handleConnect}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Connect
        </Button>
      );
      
    default:
      return (
        <>
          <Button
            size={size}
            variant={variant}
            className={className}
            onClick={handleConnect}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Connect
          </Button>
          
          <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Connect with {targetProfileName}</DialogTitle>
                <DialogDescription>
                  Add a personalized message to your connection request
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Textarea
                  placeholder="Hi, I'd like to connect with you on PoultryCo..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px]"
                  maxLength={300}
                />
                <div className="text-sm text-muted-foreground text-right">
                  {message.length}/300 characters
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMessageDialog(false);
                    setMessage('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendConnection}
                  disabled={sendConnectionMutation.isPending}
                >
                  Send Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
  }
}
