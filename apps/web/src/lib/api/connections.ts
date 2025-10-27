import { createClient } from '@/lib/supabase/client';

/**
 * Send a connection request to another user
 */
export async function sendConnectionRequest(targetUserId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('connections')
      .select('*')
      .or(`and(profile_id_1.eq.${user.id},profile_id_2.eq.${targetUserId}),and(profile_id_1.eq.${targetUserId},profile_id_2.eq.${user.id})`)
      .single();
    
    if (existingConnection) {
      return { success: false, error: 'Connection already exists' };
    }
    
    // Sort IDs to ensure consistency (smaller ID first)
    const [profileId1, profileId2] = [user.id, targetUserId].sort();
    
    // Insert the connection - the database trigger will handle notifications
    const { error: connectionError } = await supabase
      .from('connections')
      .insert({
        profile_id_1: profileId1,
        profile_id_2: profileId2,
        status: 'pending',
        requested_by: user.id,
      });
    
    if (connectionError) {
      console.error('Connection error:', connectionError);
      return { success: false, error: connectionError.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending connection request:', error);
    return { success: false, error: 'Failed to send connection request' };
  }
}

/**
 * Check if a connection exists between two users
 */
export async function checkConnectionStatus(targetUserId: string): Promise<{
  exists: boolean;
  status?: string;
  isRequester?: boolean;
  connectionId?: string;
}> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { exists: false };
    }
    
    const { data: connection } = await supabase
      .from('connections')
      .select('*')
      .or(`and(profile_id_1.eq.${user.id},profile_id_2.eq.${targetUserId}),and(profile_id_1.eq.${targetUserId},profile_id_2.eq.${user.id})`)
      .single();
    
    if (connection) {
      return {
        exists: true,
        status: connection.status,
        isRequester: connection.requested_by === user.id,
        connectionId: connection.id,
      };
    }
    
    return { exists: false };
  } catch (error) {
    console.error('Error checking connection status:', error);
    return { exists: false };
  }
}

/**
 * Accept a connection request
 */
export async function acceptConnectionRequest(connectionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    // Update connection status to connected
    const { error } = await supabase
      .from('connections')
      .update({ 
        status: 'connected',
        responded_at: new Date().toISOString()
      })
      .eq('id', connectionId)
      .neq('requested_by', user.id); // Ensure user is not the requester
    
    if (error) {
      console.error('Error accepting connection:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error accepting connection request:', error);
    return { success: false, error: 'Failed to accept connection request' };
  }
}

/**
 * Reject a connection request
 */
export async function rejectConnectionRequest(connectionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    // Delete the connection request
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId)
      .eq('status', 'pending')
      .neq('requested_by', user.id); // Ensure user is not the requester
    
    if (error) {
      console.error('Error rejecting connection:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error rejecting connection request:', error);
    return { success: false, error: 'Failed to reject connection request' };
  }
}

/**
 * Get pending connection requests for the current user
 */
export async function getPendingConnectionRequests(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        requester:requested_by(
          id,
          full_name,
          profile_slug,
          profile_photo_url,
          headline
        )
      `)
      .or(`profile_id_1.eq.${user.id},profile_id_2.eq.${user.id}`)
      .eq('status', 'pending')
      .neq('requested_by', user.id)
      .order('requested_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching pending connections:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching pending connection requests:', error);
    return { success: false, error: 'Failed to fetch connection requests' };
  }
}
