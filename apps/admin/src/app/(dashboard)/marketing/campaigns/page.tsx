'use client';

import { useState } from 'react';
import {
  useContentCampaigns,
  useAllCampaignsPerformance,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  type ContentCampaign,
  type CampaignStatus,
} from '@/lib/hooks/useContentCampaigns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CampaignProgressCard } from '@/components/marketing/CampaignProgressCard';
import { Plus, Edit2, Trash2, Target } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function CampaignManagementPage() {
  const { data: campaigns, isLoading } = useContentCampaigns();
  const { data: campaignsPerformance } = useAllCampaignsPerformance();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<ContentCampaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    start_date: '',
    end_date: '',
    target_pieces: 10,
    target_reach: 0,
    target_engagement: 0,
    color: '#6366F1',
    icon: '🚀',
    status: 'planning' as CampaignStatus,
  });

  const handleOpenDialog = (campaign?: ContentCampaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        name: campaign.name,
        slug: campaign.slug,
        description: campaign.description || '',
        start_date: campaign.start_date || '',
        end_date: campaign.end_date || '',
        target_pieces: campaign.target_pieces,
        target_reach: campaign.target_reach || 0,
        target_engagement: campaign.target_engagement || 0,
        color: campaign.color,
        icon: campaign.icon || '🚀',
        status: campaign.status,
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        start_date: '',
        end_date: '',
        target_pieces: 10,
        target_reach: 0,
        target_engagement: 0,
        color: '#6366F1',
        icon: '🚀',
        status: 'planning',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCampaign(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCampaign) {
        await updateCampaign.mutateAsync({
          campaignId: editingCampaign.id,
          updates: formData,
        });
      } else {
        // Auto-generate slug from name if not provided
        const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
        await createCampaign.mutateAsync({
          ...formData,
          slug,
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving campaign:', error);
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      await deleteCampaign.mutateAsync(campaignId);
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const activeCampaigns = campaigns?.filter(c => c.status === 'active' || c.status === 'planning') || [];
  const completedCampaigns = campaigns?.filter(c => c.status === 'completed' || c.status === 'archived') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaign Management</h1>
          <p className="text-muted-foreground mt-1">
            Coordinate and track marketing campaigns
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaignsPerformance?.reduce((sum, c) => sum + c.pieces_created, 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaignsPerformance?.reduce((sum, c) => sum + c.total_views, 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Campaigns */}
      {activeCampaigns.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCampaigns.map(campaign => (
              <div key={campaign.id} className="relative">
                <CampaignProgressCard campaignId={campaign.id} />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(campaign)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading campaigns...
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="space-y-2">
              {campaigns.map(campaign => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  style={{ borderLeftColor: campaign.color, borderLeftWidth: 4 }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{campaign.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{campaign.name}</div>
                      {campaign.description && (
                        <div className="text-sm text-muted-foreground">
                          {campaign.description}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline">{campaign.status}</Badge>
                    <div className="text-sm text-muted-foreground">
                      {campaign.target_pieces} pieces
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(campaign)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(campaign.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No campaigns yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create your first campaign
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., PTSE 2026 Launch"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="Auto-generated"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Campaign description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Target Pieces *</label>
                <Input
                  type="number"
                  value={formData.target_pieces}
                  onChange={(e) =>
                    setFormData({ ...formData, target_pieces: parseInt(e.target.value) || 0 })
                  }
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Target Reach</label>
                <Input
                  type="number"
                  value={formData.target_reach}
                  onChange={(e) =>
                    setFormData({ ...formData, target_reach: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Target Engagement</label>
                <Input
                  type="number"
                  value={formData.target_engagement}
                  onChange={(e) =>
                    setFormData({ ...formData, target_engagement: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    placeholder="#6366F1"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Icon (Emoji)</label>
                <Input
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="🚀"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as CampaignStatus })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCampaign.isPending || updateCampaign.isPending}
              >
                {editingCampaign ? 'Update' : 'Create'} Campaign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

