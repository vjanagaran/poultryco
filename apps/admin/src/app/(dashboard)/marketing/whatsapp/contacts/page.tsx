'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getWhatsAppContacts,
  type WhatsAppContact,
} from '@/lib/api/whatsapp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Users, 
  ArrowLeft,
  Phone,
  User,
  Loader2,
} from 'lucide-react';
import { useToast, ToastContainer } from '@/components/ui/toast';

export default function WhatsAppContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<WhatsAppContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    // Filter contacts based on search query
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = contacts.filter(contact => 
        contact.name?.toLowerCase().includes(query) ||
        contact.phoneNumber?.toLowerCase().includes(query) ||
        contact.notes?.toLowerCase().includes(query)
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  async function fetchContacts() {
    try {
      setLoading(true);
      const data = await getWhatsAppContacts();
      setContacts(data);
      setFilteredContacts(data);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      toast.error(error?.message || 'Error fetching contacts');
      setContacts([]);
      setFilteredContacts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/marketing/whatsapp"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Contacts</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all WhatsApp contacts across groups
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search contacts by name, phone number, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {contacts.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">With Names</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {contacts.filter(c => c.name).length}
                </p>
              </div>
              <User className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Filtered Results</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {filteredContacts.length}
                </p>
              </div>
              <Search className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-3 text-gray-600">Loading contacts...</span>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {searchQuery ? 'No contacts found matching your search' : 'No contacts found'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {contact.profilePicUrl ? (
                      <img
                        src={contact.profilePicUrl}
                        alt={contact.name || contact.phoneNumber}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">${(contact.name || contact.phoneNumber || '?')[0].toUpperCase()}</div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                        {(contact.name || contact.phoneNumber || '?')[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {contact.name || 'Unknown'}
                      </h3>
                      {contact.name && (
                        <Badge variant="secondary" className="text-xs">
                          Named
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{contact.phoneNumber}</span>
                    </div>
                    {contact.notes && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {contact.notes}
                      </p>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex-shrink-0 text-right">
                    {contact.engagementScore !== undefined && contact.engagementScore > 0 && (
                      <Badge variant="outline" className="mb-2">
                        Score: {contact.engagementScore}
                      </Badge>
                    )}
                    {contact.source && (
                      <p className="text-xs text-gray-500">
                        Source: {contact.source}
                      </p>
                    )}
                    {contact.lastInteractionAt && (
                      <p className="text-xs text-gray-500">
                        Last: {new Date(contact.lastInteractionAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

