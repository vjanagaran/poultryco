'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getWhatsAppAccountGroups,
  getWhatsAppAccounts,
  discoverWhatsAppGroups,
  hideWhatsAppGroup,
  getWhatsAppGroupContacts,
  getWhatsAppGroupById,
  updateWhatsAppGroup,
  scrapeContactsFromGroup,
  type WhatsAppGroup,
  type WhatsAppAccount,
  type WhatsAppGroupContact,
} from '@/lib/api/whatsapp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  RefreshCw, 
  Eye, 
  Users, 
  Download,
  ArrowLeft,
  Save,
  Loader as Loader2,
} from 'lucide-react';

type TabType = 'all' | 'selected' | 'featured' | 'hidden';

export default function WhatsAppGroupsEnhancedPage() {
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [contacts, setContacts] = useState<WhatsAppGroupContact[]>([]);
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  
  // Search & Filters
  const [groupSearch, setGroupSearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [showLeftContacts, setShowLeftContacts] = useState(false);
  
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchGroups();
    } else {
      setGroups([]);
      setContacts([]);
      setSelectedGroup(null);
      setSelectedContact(null);
    }
  }, [selectedAccount, activeTab]);

  useEffect(() => {
    if (selectedGroup) {
      fetchContacts();
      fetchGroupDetails();
    } else {
      setContacts([]);
      setSelectedContact(null);
    }
  }, [selectedGroup, showLeftContacts]);

  async function fetchAccounts() {
    try {
      const data = await getWhatsAppAccounts();
      setAccounts(data.filter(a => a.status === 'active'));
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }

  async function fetchGroups() {
    if (!selectedAccount) return;
    
    try {
      setLoading(true);
      const includeHidden = activeTab === 'hidden' || activeTab === 'all';
      const data = await getWhatsAppAccountGroups(selectedAccount, includeHidden);
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      alert('Error fetching groups');
    } finally {
      setLoading(false);
    }
  }

  async function fetchContacts() {
    if (!selectedGroup) return;
    
    try {
      const data = await getWhatsAppGroupContacts(selectedGroup, showLeftContacts);
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  }

  async function fetchGroupDetails() {
    if (!selectedGroup) return;
    
    try {
      const group = await getWhatsAppGroupById(selectedGroup);
      setFormData({
        name: group.name || '',
        description: group.description || '',
        region: group.region || '',
        state: group.state || '',
        district: group.district || '',
        segmentTags: group.segmentTags || [],
        internalDescription: group.internalDescription || '',
        profilePicUrl: group.profilePicUrl || '',
      });
    } catch (error) {
      console.error('Error fetching group details:', error);
    }
  }

  async function handleDiscoverGroups() {
    if (!selectedAccount) return;
    if (!confirm('Discover groups from this account? This may take a few moments.')) return;
    
    try {
      setDiscovering(true);
      await discoverWhatsAppGroups(selectedAccount);
      await fetchGroups();
      alert('Groups discovered successfully!');
    } catch (error) {
      console.error('Error discovering groups:', error);
      alert('Error discovering groups');
    } finally {
      setDiscovering(false);
    }
  }

  async function handleScrapeContacts() {
    if (!selectedGroup || !selectedAccount) return;
    if (!confirm('Scrape contacts from this group? This may take a few moments.')) return;

    try {
      setScraping(true);
      const result = await scrapeContactsFromGroup(selectedGroup, selectedAccount);
      await fetchContacts();
      await fetchGroups();
      alert(`Successfully scraped ${result.scrapedCount} contacts!`);
    } catch (error) {
      console.error('Error scraping contacts:', error);
      alert('Error scraping contacts');
    } finally {
      setScraping(false);
    }
  }

  async function handleToggleHide(groupId: string, currentHidden: boolean) {
    try {
      await hideWhatsAppGroup(groupId, !currentHidden);
      await fetchGroups();
    } catch (error) {
      console.error('Error toggling hide status:', error);
      alert('Error updating group');
    }
  }

  async function handleSaveGroup() {
    if (!selectedGroup) return;

    try {
      setSaving(true);
      await updateWhatsAppGroup(selectedGroup, formData);
      await fetchGroups();
      alert('Group updated successfully!');
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Error updating group');
    } finally {
      setSaving(false);
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

  // Filter groups
  const filteredGroups = groups.filter(group => {
    if (activeTab === 'hidden' && !group.isHidden) return false;
    if (activeTab === 'selected' && !group.isHidden) return false; // TODO: Implement selected/favorite
    if (activeTab === 'featured' && !group.isHidden) return false; // TODO: Implement featured
    
    const searchLower = groupSearch.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLower) ||
      group.description?.toLowerCase().includes(searchLower) ||
      group.segmentTags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const searchLower = contactSearch.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(searchLower) ||
      contact.phoneNumber.includes(searchLower)
    );
  });

  const selectedGroupData = groups.find(g => g.id === selectedGroup);
  const activeContacts = contacts.filter(c => !c.isLeft);
  const adminContacts = activeContacts.filter(c => c.isAdmin || c.isSuperAdmin);
  const leftContacts = contacts.filter(c => c.isLeft);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Header - Account Selection */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/marketing/whatsapp/groups">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">WhatsApp Groups</h1>
              <p className="text-sm text-gray-600 mt-1">Manage groups and contacts</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Account:</label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select account...</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountName} {account.phoneNumber && `(${account.phoneNumber})`}
                  </option>
                ))}
              </select>
            </div>
            {selectedAccount && (
              <Button
                onClick={handleDiscoverGroups}
                disabled={discovering}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${discovering ? 'animate-spin' : ''}`} />
                Discover
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Three-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Groups List (WhatsApp Style) */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search group chats"
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-green-500 text-green-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('selected')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'selected'
                  ? 'border-green-500 text-green-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Selected
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'featured'
                  ? 'border-green-500 text-green-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setActiveTab('hidden')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'hidden'
                  ? 'border-green-500 text-green-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Hidden
            </button>
          </div>

          {/* Groups List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No groups found</p>
              </div>
            ) : (
              <div>
                {filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroup(group.id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedGroup === group.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                    } ${group.isHidden ? 'opacity-60' : ''}`}
                  >
                    {/* Group Avatar */}
                    <div className="flex-shrink-0">
                      {group.profilePicUrl ? (
                        <img
                          src={group.profilePicUrl}
                          alt={group.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <Users className="w-6 h-6 text-green-600" />
                        </div>
                      )}
                    </div>

                    {/* Group Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{group.name}</h3>
                        {group.isHidden && (
                          <Eye className="w-4 h-4 text-gray-400 flex-shrink-0 opacity-50" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{group.memberCount} members</span>
                        {group.lastScrapedAt && (
                          <>
                            <span>•</span>
                            <span>{new Date(group.lastScrapedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                      {group.segmentTags && group.segmentTags.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {group.segmentTags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                          {group.segmentTags.length > 2 && (
                            <span className="text-xs text-gray-400">+{group.segmentTags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Arrow */}
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Members/Contacts List (WhatsApp Style) */}
        <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
          {selectedGroup ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Members</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleScrapeContacts}
                      disabled={scraping}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Scrape contacts"
                    >
                      <Download className={`w-5 h-5 text-gray-600 ${scraping ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Search"
                    >
                      <Search className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setShowLeftContacts(!showLeftContacts)}
                    className={`px-2 py-1 text-xs rounded ${
                      showLeftContacts
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Show Left
                  </button>
                  <div className="text-xs text-gray-500">
                    {activeContacts.length} active • {adminContacts.length} admins
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="flex-1 overflow-y-auto">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No contacts found</p>
                    <p className="text-xs mt-1">Scrape contacts to see them here</p>
                  </div>
                ) : (
                  <div>
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() => setSelectedContact(contact.contactId)}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          selectedContact === contact.contactId ? 'bg-green-50' : ''
                        } ${contact.isLeft ? 'opacity-60' : ''}`}
                      >
                        {/* Contact Avatar */}
                        <div className="flex-shrink-0">
                          {contact.profilePicUrl ? (
                            <img
                              src={contact.profilePicUrl}
                              alt={contact.name || contact.phoneNumber}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-600 text-sm font-medium">
                                {(contact.name || contact.phoneNumber).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Contact Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {contact.name || contact.phoneNumber}
                            </h3>
                            {(contact.isAdmin || contact.isSuperAdmin) && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded ml-2 flex-shrink-0">
                                {contact.isSuperAdmin ? 'Super Admin' : 'Admin'}
                              </span>
                            )}
                          </div>
                          {contact.name && (
                            <div className="text-xs text-gray-500">{contact.phoneNumber}</div>
                          )}
                          {contact.isLeft && (
                            <div className="text-xs text-red-600 mt-1">Left the group</div>
                          )}
                        </div>

                        {/* Right Arrow */}
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Select a group to view members</p>
              </div>
            </div>
          )}
        </div>

        {/* Column 3: Group Details & Metadata Form */}
        <div className="flex-1 bg-white overflow-y-auto">
          {selectedGroup ? (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Group Details</h2>

              {/* Group Information Stats */}
              {selectedGroupData && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Group Information</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Members</div>
                      <div className="text-lg font-semibold text-gray-900">{selectedGroupData.memberCount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Admins</div>
                      <div className="text-lg font-semibold text-gray-900">{adminContacts.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Contacts Scraped</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedGroupData.contactsCountAtLastScrape || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Last Scraped</div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedGroupData.lastScrapedAt
                          ? new Date(selectedGroupData.lastScrapedAt).toLocaleDateString()
                          : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Group Metadata Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Group Metadata</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Group Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="region">Region</Label>
                      <Input
                        id="region"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="district">District</Label>
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="mt-1"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="profilePicUrl">Profile Picture URL</Label>
                    <Input
                      id="profilePicUrl"
                      value={formData.profilePicUrl}
                      onChange={(e) => setFormData({ ...formData, profilePicUrl: e.target.value })}
                      placeholder="https://..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Segment Tags</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        placeholder="Add tag..."
                        className="flex-1"
                      />
                      <Button onClick={addTag} type="button" size="sm">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.segmentTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} <span className="ml-1">×</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleSaveGroup} disabled={saving} className="w-full mt-6">
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
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Select a group to view and edit details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
