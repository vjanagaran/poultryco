'use client';

import { useState } from 'react';
import {
  useContentTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  type ContentTag,
} from '@/lib/hooks/useContentTags';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Tag as TagIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function TagManagementPage() {
  const { data: tags, isLoading } = useContentTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<ContentTag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: '#6366F1',
    description: '',
  });

  const handleOpenDialog = (tag?: ContentTag) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
        description: tag.description || '',
      });
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        slug: '',
        color: '#6366F1',
        description: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTag(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTag) {
        await updateTag.mutateAsync({
          tagId: editingTag.id,
          updates: formData,
        });
      } else {
        // Auto-generate slug from name if not provided
        const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
        await createTag.mutateAsync({
          ...formData,
          slug,
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  const handleDelete = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      await deleteTag.mutateAsync(tagId);
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tag Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage tags for flexible content categorization
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Create Tag
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tags?.reduce((sum, tag) => sum + tag.usage_count, 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unused Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tags?.filter(tag => tag.usage_count === 0).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags List */}
      <Card>
        <CardHeader>
          <CardTitle>All Tags</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading tags...
            </div>
          ) : tags && tags.length > 0 ? (
            <div className="space-y-2">
              {tags.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Badge
                      style={{ backgroundColor: tag.color }}
                      className="text-white"
                    >
                      {tag.name}
                    </Badge>
                    {tag.description && (
                      <span className="text-sm text-muted-foreground">
                        {tag.description}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {tag.usage_count} uses
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(tag)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(tag.id)}
                      disabled={tag.usage_count > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TagIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tags yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create your first tag
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTag ? 'Edit Tag' : 'Create New Tag'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Urgent, PTSE-2026"
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
                placeholder="Auto-generated from name"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to auto-generate
              </p>
            </div>

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
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description"
              />
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
                disabled={createTag.isPending || updateTag.isPending}
              >
                {editingTag ? 'Update' : 'Create'} Tag
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

