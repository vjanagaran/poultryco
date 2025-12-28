/**
 * Connections API - Replaces Supabase connection queries
 */

import { apiClient } from './client';
import { getConnections, sendConnectionRequest, acceptConnectionRequest } from './social';

export interface ConnectionRequest {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  message?: string | null;
  createdAt: string;
  
  requester?: {
    id: string;
    firstName: string;
    lastName: string;
    slug: string;
    profilePhoto?: string | null;
    headline?: string | null;
  };
  addressee?: {
    id: string;
    firstName: string;
    lastName: string;
    slug: string;
    profilePhoto?: string | null;
    headline?: string | null;
  };
}

/**
 * Get pending connection requests (received)
 */
export async function getPendingConnectionRequests(): Promise<{ success: boolean; data?: ConnectionRequest[] }> {
  try {
    const connections = await getConnections({ status: 'pending' });
    
    // Filter to only received requests (where current user is addressee)
    const currentUser = await apiClient.get<{ user: { profile: { id: string } } }>('/auth/me');
    const currentProfileId = currentUser.user?.profile?.id;
    
    if (!currentProfileId) {
      return { success: false };
    }
    
    const received = connections.filter((conn: any) => conn.addresseeId === currentProfileId);
    
    return { success: true, data: received };
  } catch (error) {
    console.error('Error fetching pending connection requests:', error);
    return { success: false };
  }
}

/**
 * Accept connection request
 */
export async function acceptConnectionRequestById(connectionId: string): Promise<{ success: boolean }> {
  try {
    await acceptConnectionRequest(connectionId);
    return { success: true };
  } catch (error) {
    console.error('Error accepting connection request:', error);
    return { success: false };
  }
}

/**
 * Reject connection request
 */
export async function rejectConnectionRequest(connectionId: string): Promise<{ success: boolean }> {
  // TODO: Implement reject endpoint in API
  return { success: false };
}
