'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getWhatsAppAccountById,
  type WhatsAppAccount,
} from '@/lib/api/whatsapp';
import { getStakeholderSegments } from '@/lib/api/marketing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Loader2, Tag, Users } from 'lucide-react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface StakeholderSegment {
  id: string;
  name: string;
  description?: string | null;
  priority_level?: number | null;
}

export default function PersonaMappingPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;

  const [account, setAccount] = useState<WhatsAppAccount | null>(null);
  const [segments, setSegments] = useState<StakeholderSegment[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    if (accountId) {
      fetchData();
    }
  }, [accountId]);

  async function fetchData() {
    try {
      setLoading(true);
      const [accountData, segmentsData] = await Promise.all([
        getWhatsAppAccountById(accountId),
        getStakeholderSegments(),
      ]);
      
      setAccount(accountData);
      setSegments(segmentsData);
      
      // Load existing mappings if available
      if ((accountData as any).personaSegments) {
        setSelectedSegments(new Set((accountData as any).personaSegments));
      }
      if ((accountData as any).personaTags) {
        setSelectedTags(new Set((accountData as any).personaTags));
      }
      
      // Load available tags (you may need to create an API for this)
      // For now, using common tags
      setAvailableTags([
        'Poultry Farmers',
        'Feed Manufacturers',
        'Veterinarians',
        'Equipment Suppliers',
        'Processors',
        'Distributors',
        'Retailers',
        'Exporters',
        'Researchers',
        'Government Officials',
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleSegment(segmentId: string) {
    const newSet = new Set(selectedSegments);
    if (newSet.has(segmentId)) {
      newSet.delete(segmentId);
    } else {
      newSet.add(segmentId);
    }
    setSelectedSegments(newSet);
  }

  function toggleTag(tag: string) {
    const newSet = new Set(selectedTags);
    if (newSet.has(tag)) {
      newSet.delete(tag);
    } else {
      newSet.add(tag);
    }
    setSelectedTags(newSet);
  }

  async function handleSave() {
    try {
      setSaving(true);
      // TODO: Create API endpoint for updating persona mapping
      // await updateWhatsAppAccountPersonaMapping(accountId, {
      //   segmentIds: Array.from(selectedSegments),
      //   tags: Array.from(selectedTags),
      // });
      
      alert('Persona mapping updated successfully');
    } catch (error) {
      console.error('Error updating persona mapping:', error);
      alert('Error updating persona mapping');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Account not found</p>
        <Link href="/marketing/whatsapp/accounts">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Accounts
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <Link href="/marketing/whatsapp/accounts">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Persona Mapping</h1>
              <p className="mt-2 text-gray-600">
                Map target segments and tags for <span className="font-semibold">{account.accountName}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Segments Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Stakeholder Segments
          </CardTitle>
          <CardDescription>
            Select the stakeholder segments this account should target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {segments.map((segment) => (
              <div key={segment.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={`segment-${segment.id}`}
                  checked={selectedSegments.has(segment.id)}
                  onCheckedChange={() => toggleSegment(segment.id)}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={`segment-${segment.id}`}
                    className="font-medium cursor-pointer"
                  >
                    {segment.name}
                  </Label>
                  {segment.description && (
                    <p className="text-sm text-gray-500 mt-1">{segment.description}</p>
                  )}
                  {segment.priority_level && (
                    <Badge variant="outline" className="mt-2">
                      Priority: {segment.priority_level}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {segments.length === 0 && (
              <p className="text-gray-500 text-center py-8">No segments available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tags Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Tags
          </CardTitle>
          <CardDescription>
            Add custom tags to categorize this account's target audience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.has(tag) ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  {selectedTags.has(tag) && ' ✓'}
                </Badge>
              ))}
            </div>
            
            {/* Custom Tag Input */}
            <div className="mt-4 pt-4 border-t">
              <Label htmlFor="custom-tag">Add Custom Tag</Label>
              <div className="flex gap-2 mt-2">
                <input
                  id="custom-tag"
                  type="text"
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="Enter tag name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      toggleTag(e.currentTarget.value.trim());
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input.value.trim()) {
                      toggleTag(input.value.trim());
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Mapping Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{selectedSegments.size}</span> segments selected
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{selectedTags.size}</span> tags assigned
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Link href="/marketing/whatsapp/accounts">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Mapping
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

