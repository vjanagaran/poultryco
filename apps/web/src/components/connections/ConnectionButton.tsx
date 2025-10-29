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
      
      // Use the get_connection_status RPC function
      const { data: status, error } = await supabase.rpc('get_connection_status', {
        p_user_id: currentUserId,
        p_other_user_id: targetProfileId
      });
      
      if (error) {
        console.error('Error getting connection status:', error);
        return 'none' as ConnectionStatus;
      }
      
      // Map the database status to our component status
      if (status === 'connected') return 'connected' as ConnectionStatus;
      if (status === 'pending_sent') return 'pending_sent' as ConnectionStatus;
      if (status === 'pending_received') return 'pending_received' as ConnectionStatus;
      
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
    mutationFn: async (message?: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('send_connection_request', {
        p_requester_id: user.id,
        p_target_id: targetProfileId,
        p_message: message || null
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Connection request sent',
        description: `Your connection request has been sent to ${targetProfileName}`,
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
  
  // Remove connection or withdraw request
  const removeConnectionMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Get the connection ID to delete
      const minId = user.id < targetProfileId ? user.id : targetProfileId;
      const maxId = user.id < targetProfileId ? targetProfileId : user.id;
      
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('profile_id_1', minId)
        .eq('profile_id_2', maxId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      const title = connectionStatus === 'pending_sent' ? 'Request withdrawn' : 'Connection removed';
      const description = connectionStatus === 'pending_sent' 
        ? 'Your connection request has been withdrawn'
        : `You are no longer connected with ${targetProfileName}`;
      
      toast({
        title,
        description,
      });
      queryClient.invalidateQueries({ queryKey: ['connectionStatus'] });
      queryClient.invalidateQueries({ queryKey: ['connectionStats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove connection',
      });
    }
  });
  
  if (!currentUserId || currentUserId === targetProfileId || isLoading) {
    return null;
  }
  
  const handleConnect = () => {
    setShowMessageDialog(true);
  };
  
  const handleSendConnection = () => {
    sendConnectionMutation.mutate(message.trim());
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
          onClick={() => removeConnectionMutation.mutate()}
          disabled={removeConnectionMutation.isPending}
        >
          <Clock className="h-4 w-4 mr-2" />
          {removeConnectionMutation.isPending ? 'Withdrawing...' : 'Pending'}
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
