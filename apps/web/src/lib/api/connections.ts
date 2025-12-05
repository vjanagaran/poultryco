/**
 * Connections API - Updated to use API client
 * Replaces Supabase connection queries
 */

import { apiClient } from './client';
import * as socialApi from './social';

// Re-export social API functions for backward compatibility
export const sendConnectionRequest = socialApi.sendConnectionRequest;
export const acceptConnectionRequest = socialApi.acceptConnectionRequest;
export const rejectConnectionRequest = socialApi.rejectConnectionRequest;
export const checkConnectionStatus = socialApi.checkConnectionStatus;

/**
 * Get pending connection requests for the current user
 */
export async function getPendingConnectionRequests(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const result = await socialApi.getConnections({ status: 'pending' });
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch connection requests' };
  }
}

/**
 * Get all connections (connected status)
 */
export async function getConnections(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const result = await socialApi.getConnections({ status: 'connected' });
    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch connections' };
  }
}

/**
 * Remove connection
 */
export async function removeConnection(connectionId: string): Promise<{ success: boolean; error?: string }> {
  return socialApi.removeConnection(connectionId);
}
