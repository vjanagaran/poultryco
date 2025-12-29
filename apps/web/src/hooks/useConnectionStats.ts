import { useQuery } from '@tanstack/react-query';
import { getConnectionStats, getConnections } from '@/lib/api/social';
import { apiClient } from '@/lib/api/client';

interface ConnectionStats {
  connectionsCount: number;
  followersCount: number;
  followingCount: number;
  pendingRequestsCount: number;
  mutualConnectionsCount?: number;
}

export function useConnectionStats(profileId?: string) {
  return useQuery({
    queryKey: ['connectionStats', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      try {
        // Get connection stats from API
        const stats = await getConnectionStats();
        
        // Get pending requests (only for current user)
        let pendingRequestsCount = 0;
        try {
          const currentUser = await apiClient.get<{ user: { profile: { id: string } } }>('/auth/me');
          const currentProfileId = currentUser.user?.profile?.id;
          
          if (currentProfileId === profileId) {
            const connections = await getConnections({ status: 'pending' });
            // Filter to only count requests received (not sent)
            pendingRequestsCount = connections.filter((conn: any) => 
              conn.addresseeId === profileId
            ).length;
          }
        } catch (error) {
          // If not authenticated, skip pending count
        }
        
        const result: ConnectionStats = {
          connectionsCount: stats.connections || 0,
          followersCount: stats.followers || 0,
          followingCount: stats.following || 0,
          pendingRequestsCount,
        };
        
        return result;
      } catch (error) {
        console.error('Error fetching connection stats:', error);
        return {
          connectionsCount: 0,
          followersCount: 0,
          followingCount: 0,
          pendingRequestsCount: 0,
        };
      }
    },
    enabled: !!profileId,
    staleTime: 30000, // Cache for 30 seconds
  });
}

// Hook to get mutual connections count between two profiles
export function useMutualConnections(profileId1?: string, profileId2?: string) {
  return useQuery({
    queryKey: ['mutualConnections', profileId1, profileId2],
    queryFn: async () => {
      if (!profileId1 || !profileId2 || profileId1 === profileId2) return { count: 0, profiles: [] };
      
      try {
        // Get connections for both profiles
        const [connections1, connections2] = await Promise.all([
          getConnections({ status: 'accepted' }),
          getConnections({ status: 'accepted' }),
        ]);
        
        // Extract connection IDs
        const profile1Connections = new Set<string>();
        connections1.forEach((conn: any) => {
          const otherId = conn.requesterId === profileId1 ? conn.addresseeId : conn.requesterId;
          profile1Connections.add(otherId);
        });
        
        const profile2Connections = new Set<string>();
        connections2.forEach((conn: any) => {
          const otherId = conn.requesterId === profileId2 ? conn.addresseeId : conn.requesterId;
          profile2Connections.add(otherId);
        });
        
        // Find mutual connections
        const mutualIds = Array.from(profile1Connections).filter(id => profile2Connections.has(id));
        
        // Get mutual connection profiles (first 3 for display)
        let profiles: any[] = [];
        if (mutualIds.length > 0) {
          // TODO: Fetch profiles for mutual IDs when endpoint is available
          // For now, return count only
        }
        
        return {
          count: mutualIds.length,
          profiles
        };
      } catch (error) {
        console.error('Error fetching mutual connections:', error);
        return { count: 0, profiles: [] };
      }
    },
    enabled: !!profileId1 && !!profileId2 && profileId1 !== profileId2,
    staleTime: 60000, // Cache for 1 minute
  });
}
