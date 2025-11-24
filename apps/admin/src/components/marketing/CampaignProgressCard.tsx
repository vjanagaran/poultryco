'use client';

import { useCampaignPerformance, useCampaignHealth } from '@/lib/hooks/useContentCampaigns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignProgressCardProps {
  campaignId: string;
}

const healthColors = {
  excellent: 'text-green-600 bg-green-50',
  good: 'text-blue-600 bg-blue-50',
  fair: 'text-yellow-600 bg-yellow-50',
  needs_attention: 'text-orange-600 bg-orange-50',
  critical: 'text-red-600 bg-red-50',
};

const healthIcons = {
  excellent: '🎉',
  good: '👍',
  fair: '⚠️',
  needs_attention: '🔔',
  critical: '🚨',
};

export function CampaignProgressCard({ campaignId }: CampaignProgressCardProps) {
  const { data: campaign, isLoading } = useCampaignPerformance(campaignId);
  const { data: health } = useCampaignHealth(campaignId);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground text-center">
            Loading campaign...
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!campaign) return null;
  
  const progressPercentage = campaign.pieces_progress_pct || 0;
  
  return (
    <Card 
      className="relative overflow-hidden"
      style={{ borderLeftColor: campaign.color, borderLeftWidth: 4 }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{campaign.icon}</span>
            <div>
              <CardTitle className="text-lg">{campaign.name}</CardTitle>
              <Badge variant="outline" className="mt-1">
                {campaign.status}
              </Badge>
            </div>
          </div>
          {health && (
            <Badge 
              className={cn(
                "font-medium",
                healthColors[health]
              )}
            >
              {healthIcons[health]} {health.replace('_', ' ')}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Content Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Content Progress</span>
            <span className="font-medium">
              {campaign.pieces_created} / {campaign.target_pieces}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(progressPercentage, 100)}%`,
                backgroundColor: campaign.color,
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {progressPercentage.toFixed(0)}% complete
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold">{campaign.pieces_published}</div>
            <div className="text-xs text-muted-foreground">Published</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {campaign.total_views >= 1000 
                ? `${(campaign.total_views / 1000).toFixed(1)}k` 
                : campaign.total_views}
            </div>
            <div className="text-xs text-muted-foreground">Views</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {campaign.total_engagement >= 1000 
                ? `${(campaign.total_engagement / 1000).toFixed(1)}k` 
                : campaign.total_engagement}
            </div>
            <div className="text-xs text-muted-foreground">Engagement</div>
          </div>
        </div>
        
        {/* Timeline */}
        {campaign.days_remaining !== null && (
          <div className="flex items-center gap-2 text-sm pt-2 border-t">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {campaign.timeline_status === 'active' 
                ? `${campaign.days_remaining} days remaining`
                : campaign.timeline_status === 'not_started'
                ? `Starts in ${Math.abs(campaign.days_remaining)} days`
                : 'Campaign ended'}
            </span>
          </div>
        )}
        
        {/* Additional metrics */}
        {campaign.target_reach && (
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Reach Progress</span>
            <span className="font-medium">
              {campaign.reach_progress_pct?.toFixed(0)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

