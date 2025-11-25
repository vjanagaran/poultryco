'use client';

import { useState } from 'react';
import { useContentTags, type ContentTag } from '@/lib/hooks/useContentTags';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagSelector({
  selectedTagIds,
  onTagsChange,
  placeholder = 'Add tags...',
  maxTags,
}: TagSelectorProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  
  // Fetch all tags
  const { data: allTags, isLoading } = useContentTags();
  
  // Filter tags based on search
  const filteredTags = allTags?.filter(tag => 
    !selectedTagIds.includes(tag.id) &&
    tag.name.toLowerCase().includes(search.toLowerCase())
  ) || [];
  
  // Get selected tags
  const selectedTags = allTags?.filter(tag => 
    selectedTagIds.includes(tag.id)
  ) || [];
  
  const addTag = (tagId: string) => {
    if (maxTags && selectedTagIds.length >= maxTags) {
      return;
    }
    onTagsChange([...selectedTagIds, tagId]);
    setSearch('');
  };
  
  const removeTag = (tagId: string) => {
    onTagsChange(selectedTagIds.filter(id => id !== tagId));
  };
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tags</label>
      
      {/* Selected tags */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-background">
        {selectedTags.map(tag => (
          <Badge 
            key={tag.id} 
            style={{ backgroundColor: tag.color }}
            className="pl-2 pr-1 py-1 text-white"
          >
            {tag.name}
            <button
              type="button"
              onClick={() => removeTag(tag.id)}
              className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        
        {/* Add tag button */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7"
              disabled={maxTags ? selectedTagIds.length >= maxTags : false}
            >
              <Plus className="w-3 h-3 mr-1" />
              {placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-2 border-b">
              <div className="relative">
                <TagIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <ScrollArea className="h-[200px]">
              <div className="p-2">
                {isLoading ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Loading tags...
                  </div>
                ) : filteredTags.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    {search ? 'No tags found' : 'All tags selected'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredTags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          addTag(tag.id);
                          setOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-left"
                      >
                        <Badge 
                          style={{ backgroundColor: tag.color }}
                          className="text-white"
                        >
                          {tag.name}
                        </Badge>
                        {tag.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {tag.description}
                          </span>
                        )}
                        <span className="ml-auto text-xs text-muted-foreground">
                          {tag.usage_count} uses
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
      
      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {selectedTagIds.length} / {maxTags} tags selected
        </p>
      )}
    </div>
  );
}

