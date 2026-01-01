'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getWhatsAppGroupById,
  getWhatsAppGroupContacts,
  updateWhatsAppGroup,
  scrapeContactsFromGroup,
  getWhatsAppAccounts,
  type WhatsAppGroup,
  type WhatsAppGroupContact,
  type WhatsAppAccount,
} from '@/lib/api/whatsapp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Save, Loader2, Shield, Users } from 'lucide-react';

export default function WhatsAppGroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<WhatsAppGroup | null>(null);
  const [contacts, setContacts] = useState<WhatsAppGroupContact[]>([]);
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLeft, setShowLeft] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    region: '',
    state: '',
    district: '',
    segmentTags: [] as string[],
    internalDescription: '',
    profilePicUrl: '',
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchGroup();
    fetchContacts();
    fetchAccounts();
  }, [groupId]);

  async function fetchGroup() {
    try {
      setLoading(true);
      const data = await getWhatsAppGroupById(groupId);
      setGroup(data);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        region: data.region || '',
        state: data.state || '',
        district: data.district || '',
        segmentTags: data.segmentTags || [],
        internalDescription: data.internalDescription || '',
        profilePicUrl: data.profilePicUrl || '',
      });
    } catch (error) {
      console.error('Error fetching group:', error);
      alert('Error fetching group');
    } finally {
      setLoading(false);
    }
  }

  async function fetchContacts() {
    try {
      const data = await getWhatsAppGroupContacts(groupId, showLeft);
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  }

  async function fetchAccounts() {
    try {
      const data = await getWhatsAppAccounts();
      setAccounts(data.filter(a => a.status === 'active'));
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }

  useEffect(() => {
    fetchContacts();
  }, [showLeft]);

  async function handleSave() {
    if (!group) return;

    try {
      setSaving(true);
      await updateWhatsAppGroup(groupId, formData);
      await fetchGroup();
      alert('Group updated successfully!');
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Error updating group');
    } finally {
      setSaving(false);
    }
  }

  async function handleScrape(accountId: string) {
    if (!confirm('Scrape contacts from this group? This may take a few moments.')) return;

    try {
      setScraping(true);
      const result = await scrapeContactsFromGroup(groupId, accountId);
      await fetchContacts();
      await fetchGroup();
      alert(`Successfully scraped ${result.scrapedCount} contacts!`);
    } catch (error) {
      console.error('Error scraping contacts:', error);
      alert('Error scraping contacts');
    } finally {
      setScraping(false);
    }
  }

  function addTag() {
    if (newTag.trim() && !formData.segmentTags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        segmentTags: [...formData.segmentTags, newTag.trim()],
      });
      setNewTag('');
    }
  }

  function removeTag(tag: string) {
    setFormData({
      ...formData,
      segmentTags: formData.segmentTags.filter(t => t !== tag),
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Group not found</h2>
        <Link href="/marketing/whatsapp/groups">
          <Button variant="outline">Back to Groups</Button>
        </Link>
      </div>
    );
  }

  const activeContacts = contacts.filter(c => !c.isLeft);
  const adminContacts = activeContacts.filter(c => c.isAdmin || c.isSuperAdmin);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/marketing/whatsapp/groups">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
            {group.description && (
              <p className="mt-1 text-gray-600">{group.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {group.isAccountAdmin && (
            <Badge className="bg-purple-100 text-purple-800">
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          )}
          {group.isHidden && (
            <Badge variant="outline">Hidden</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contacts List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Contacts ({activeContacts.length})
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLeft(!showLeft)}
                >
                  {showLeft ? 'Hide Left' : 'Show Left'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {contacts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No contacts scraped yet</p>
                    <p className="text-sm mt-1">Scrape contacts to see them here</p>
                  </div>
                ) : (
                  contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-3 rounded-lg border ${
                        contact.isLeft
                          ? 'bg-gray-50 border-gray-200 opacity-60'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {contact.name || contact.phoneNumber}
                          </div>
                          {contact.name && (
                            <div className="text-xs text-gray-500">{contact.phoneNumber}</div>
                          )}
                          {contact.isLeft && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              Left
                            </Badge>
                          )}
                        </div>
                        {(contact.isAdmin || contact.isSuperAdmin) && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            {contact.isSuperAdmin ? 'Super Admin' : 'Admin'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Scrape Button */}
              {accounts.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleScrape(e.target.value);
                        e.target.value = ''; // Reset selection
                      }
                    }}
                    disabled={scraping}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="">Select account to scrape...</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.accountName}
                      </option>
                    ))}
                  </select>
                  {scraping && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scraping contacts...
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Group Details & Metadata Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Group Info */}
          <Card>
            <CardHeader>
              <CardTitle>Group Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Members</div>
                  <div className="text-lg font-semibold">{group.memberCount}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Contacts Scraped</div>
                  <div className="text-lg font-semibold">
                    {group.contactsCountAtLastScrape || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Admins</div>
                  <div className="text-lg font-semibold">{adminContacts.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Last Scraped</div>
                  <div className="text-sm font-medium">
                    {group.lastScrapedAt
                      ? new Date(group.lastScrapedAt).toLocaleString()
                      : 'Never'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata Form */}
          <Card>
            <CardHeader>
              <CardTitle>Group Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="internalDescription">Internal Description</Label>
                <textarea
                  id="internalDescription"
                  value={formData.internalDescription}
                  onChange={(e) => setFormData({ ...formData, internalDescription: e.target.value })}
                  rows={3}
                  placeholder="Internal notes for team use..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <Label htmlFor="profilePicUrl">Profile Picture URL</Label>
                <Input
                  id="profilePicUrl"
                  value={formData.profilePicUrl}
                  onChange={(e) => setFormData({ ...formData, profilePicUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label>Segment Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add tag..."
                  />
                  <Button onClick={addTag} type="button">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.segmentTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

