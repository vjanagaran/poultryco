'use client';

import { useContentCampaigns, type ContentCampaign } from '@/lib/hooks/useContentCampaigns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignSelectorProps {
  value: string | null;
  onChange: (campaignId: string | null) => void;
  showInactive?: boolean;
  placeholder?: string;
}

export function CampaignSelector({
  value,
  onChange,
  showInactive = false,
  placeholder = 'Select campaign...',
}: CampaignSelectorProps) {
  const { data: campaigns, isLoading } = useContentCampaigns({
    status: showInactive ? undefined : ['planning', 'active'],
  });
  
  const selectedCampaign = campaigns?.find(c => c.id === value);
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Campaign (Optional)</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground"
            )}
          >
            {selectedCampaign ? (
              <div className="flex items-center gap-2">
                <span>{selectedCampaign.icon}</span>
                <span>{selectedCampaign.name}</span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedCampaign.color }}
                />
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="max-h-[300px] overflow-auto p-1">
            {/* No campaign option */}
            <button
              onClick={() => onChange(null)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-left",
                !value && "bg-accent"
              )}
            >
              <Check
                className={cn(
                  "h-4 w-4",
                  !value ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="text-sm">No campaign</span>
            </button>
            
            {isLoading ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Loading campaigns...
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              campaigns.map(campaign => (
                <button
                  key={campaign.id}
                  onClick={() => onChange(campaign.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-left",
                    value === campaign.id && "bg-accent"
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === campaign.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{campaign.icon}</span>
                  <span className="text-sm flex-1">{campaign.name}</span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: campaign.color }}
                  />
                  <Badge variant="outline" className="text-xs">
                    {campaign.status}
                  </Badge>
                </button>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No campaigns found
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {selectedCampaign?.description && (
        <p className="text-xs text-muted-foreground">
          {selectedCampaign.description}
        </p>
      )}
    </div>
  );
}

