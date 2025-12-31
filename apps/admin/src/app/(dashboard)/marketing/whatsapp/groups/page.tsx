'use client';

import { useState, useEffect } from 'react';
import {
  getWhatsAppGroups,
  getWhatsAppAccounts,
  discoverWhatsAppGroups,
  updateWhatsAppGroup,
  scrapeContactsFromGroup,
  type WhatsAppGroup,
  type WhatsAppAccount,
} from '@/lib/api/whatsapp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, RefreshCw, Download, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function WhatsAppGroupsPage() {
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  useEffect(() => {
    fetchGroups();
    fetchAccounts();
  }, []);

  async function fetchGroups() {
    try {
      setLoading(true);
      const data = await getWhatsAppGroups({
        accountId: selectedAccount || undefined,
        isActive: true,
      });
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
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

  async function handleDiscoverGroups(accountId: string) {
    if (!confirm('Discover groups from this account? This may take a few moments.')) return;
    
    try {
      await discoverWhatsAppGroups(accountId);
      fetchGroups();
      alert('Groups discovered successfully!');
    } catch (error) {
      console.error('Error discovering groups:', error);
      alert('Error discovering groups');
    }
  }

  async function handleScrapeContacts(groupId: string, accountId: string) {
    if (!confirm('Scrape contacts from this group?')) return;
    
    try {
      const contacts = await scrapeContactsFromGroup(groupId, accountId);
      alert(`Scraped ${contacts.length} contacts from group`);
    } catch (error) {
      console.error('Error scraping contacts:', error);
      alert('Error scraping contacts');
    }
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Groups</h1>
          <p className="mt-2 text-gray-600">
            Discover and manage WhatsApp groups for marketing campaigns
          </p>
        </div>
        <div className="flex items-center gap-2">
          {accounts.length > 0 && (
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                fetchGroups();
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountName}
                </option>
              ))}
            </select>
          )}
          {selectedAccount && (
            <Button onClick={() => handleDiscoverGroups(selectedAccount)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Discover Groups
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <Badge className={group.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {group.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {group.description && (
                  <p className="text-sm text-gray-600 mt-2">{group.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Members</div>
                      <div className="font-semibold">{group.memberCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Region</div>
                      <div className="font-semibold">{group.region || 'N/A'}</div>
                    </div>
                  </div>

                  {group.segmentTags && group.segmentTags.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Segment Tags</div>
                      <div className="flex flex-wrap gap-1">
                        {group.segmentTags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {group.accountId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleScrapeContacts(group.id, group.accountId!)}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Scrape Contacts
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredGroups.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No groups found' : 'No groups discovered'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'Try a different search term'
              : 'Discover groups from your WhatsApp accounts to get started'}
          </p>
          {accounts.length > 0 && (
            <Button onClick={() => handleDiscoverGroups(accounts[0].id)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Discover Groups
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

