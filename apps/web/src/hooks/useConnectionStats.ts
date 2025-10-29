import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface ConnectionStats {
  connectionsCount: number;
  followersCount: number;
  followingCount: number;
  pendingRequestsCount: number;
  mutualConnectionsCount?: number;
}

export function useConnectionStats(profileId?: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['connectionStats', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      // Get connections count (accepted mutual connections)
      const { count: connectionsCount } = await supabase
        .from('network_connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${profileId},target_id.eq.${profileId}`)
        .eq('status', 'accepted');
      
      // Get followers count
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileId);
      
      // Get following count
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileId);
      
      // Get pending requests count (only for current user)
      let pendingRequestsCount = 0;
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.id === profileId) {
        const { count } = await supabase
          .from('network_connections')
          .select('*', { count: 'exact', head: true })
          .eq('target_id', profileId)
          .eq('status', 'pending');
        pendingRequestsCount = count || 0;
      }
      
      const stats: ConnectionStats = {
        connectionsCount: connectionsCount || 0,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
        pendingRequestsCount
      };
      
      return stats;
    },
    enabled: !!profileId,
    staleTime: 30000, // Cache for 30 seconds
  });
}

// Hook to get mutual connections count between two profiles
export function useMutualConnections(profileId1?: string, profileId2?: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['mutualConnections', profileId1, profileId2],
    queryFn: async () => {
      if (!profileId1 || !profileId2 || profileId1 === profileId2) return { count: 0, profiles: [] };
      
      // Get all connections for profile1
      const { data: connections1 } = await supabase
        .from('network_connections')
        .select('requester_id, target_id')
        .or(`requester_id.eq.${profileId1},target_id.eq.${profileId1}`)
        .eq('status', 'accepted');
      
      // Get all connections for profile2
      const { data: connections2 } = await supabase
        .from('network_connections')
        .select('requester_id, target_id')
        .or(`requester_id.eq.${profileId2},target_id.eq.${profileId2}`)
        .eq('status', 'accepted');
      
      // Extract connection IDs
      const profile1Connections = new Set<string>();
      connections1?.forEach(conn => {
        profile1Connections.add(conn.requester_id === profileId1 ? conn.target_id : conn.requester_id);
      });
      
      const profile2Connections = new Set<string>();
      connections2?.forEach(conn => {
        profile2Connections.add(conn.requester_id === profileId2 ? conn.target_id : conn.requester_id);
      });
      
      // Find mutual connections
      const mutualIds = Array.from(profile1Connections).filter(id => profile2Connections.has(id));
      
      // Get mutual connection profiles (first 3 for display)
      let profiles: any[] = [];
      if (mutualIds.length > 0) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, username, profile_photo_url')
          .in('id', mutualIds.slice(0, 3));
        profiles = data || [];
      }
      
      return {
        count: mutualIds.length,
        profiles
      };
    },
    enabled: !!profileId1 && !!profileId2 && profileId1 !== profileId2,
    staleTime: 60000, // Cache for 1 minute
  });
}
