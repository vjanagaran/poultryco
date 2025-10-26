'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface GroupCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Connection {
  id: string;
  full_name: string;
  profile_slug: string;
  profile_photo_url: string | null;
  headline: string | null;
}

export function GroupCreationModal({ isOpen, onClose }: GroupCreationModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'details' | 'participants'>('details');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupPhoto, setGroupPhoto] = useState<File | null>(null);
  const [groupPhotoPreview, setGroupPhotoPreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen && user) {
      fetchConnections();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = connections.filter(
        (conn) =>
          conn.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conn.headline?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConnections(filtered);
    } else {
      setFilteredConnections(connections);
    }
  }, [searchQuery, connections]);

  const fetchConnections = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          connected_user:profiles!connections_connected_user_id_fkey(
            id,
            full_name,
            profile_slug,
            profile_photo_url,
            headline
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const connList = data?.map((item: any) => item.connected_user) || [];
      setConnections(connList);
      setFilteredConnections(connList);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGroupPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleParticipant = (participantId: string) => {
    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(participantId)) {
      newSelected.delete(participantId);
    } else {
      newSelected.add(participantId);
    }
    setSelectedParticipants(newSelected);
  };

  const createGroup = async () => {
    if (!user || !groupName.trim() || selectedParticipants.size === 0) return;

    setCreating(true);
    try {
      let groupPhotoUrl = null;

      // Upload group photo if provided
      if (groupPhoto) {
        const fileExt = groupPhoto.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `groups/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('cdn-poultryco')
          .upload(filePath, groupPhoto);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('cdn-poultryco')
          .getPublicUrl(filePath);

        groupPhotoUrl = urlData.publicUrl;
      }

      // Create conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          is_group: true,
          group_name: groupName.trim(),
          group_description: groupDescription.trim() || null,
          group_photo_url: groupPhotoUrl,
          created_by: user.id,
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants (creator + selected)
      const participantInserts = [
        {
          conversation_id: newConv.id,
          user_id: user.id,
          is_admin: true,
        },
        ...Array.from(selectedParticipants).map((participantId) => ({
          conversation_id: newConv.id,
          user_id: participantId,
          is_admin: false,
        })),
      ];

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participantInserts);

      if (participantsError) throw participantsError;

      // Send system message
      await supabase.from('messages').insert({
        conversation_id: newConv.id,
        sender_id: user.id,
        content: `${user.user_metadata?.full_name || 'Someone'} created the group`,
        message_type: 'system',
      });

      // Navigate to new group
      router.push(`/messages?conversation=${newConv.id}`);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setStep('details');
    setGroupName('');
    setGroupDescription('');
    setGroupPhoto(null);
    setGroupPhotoPreview(null);
    setSearchQuery('');
    setSelectedParticipants(new Set());
  };

  const handleClose = () => {
    if (!creating) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 'participants' && (
              <button
                onClick={() => setStep('details')}
                disabled={creating}
                className="p-1 hover:bg-gray-100 rounded-full -ml-2"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 'details' ? 'New Group' : 'Add Participants'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={creating}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === 'details' ? (
            <div className="px-6 py-6 space-y-6">
              {/* Group Photo */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 overflow-hidden flex items-center justify-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {groupPhotoPreview ? (
                      <img
                        src={groupPhotoPreview}
                        alt="Group"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-green-600 text-white rounded-full hover:bg-green-700 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Group Name */}
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  id="groupName"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  maxLength={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                />
                <div className="mt-1 text-xs text-gray-500 text-right">
                  {groupName.length}/100
                </div>
              </div>

              {/* Group Description */}
              <div>
                <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="groupDescription"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="What's this group about?"
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 resize-none"
                />
                <div className="mt-1 text-xs text-gray-500 text-right">
                  {groupDescription.length}/500
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Search */}
              <div className="px-6 py-4 border-b sticky top-0 bg-white">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search connections..."
                    className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:border-green-500"
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Selected count */}
              {selectedParticipants.size > 0 && (
                <div className="px-6 py-3 bg-green-50 border-b">
                  <p className="text-sm text-green-700">
                    {selectedParticipants.size} participant{selectedParticipants.size !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}

              {/* Connections list */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredConnections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-lg font-medium mb-1">No connections found</p>
                  <p className="text-sm">Try searching with a different name</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredConnections.map((connection) => {
                    const isSelected = selectedParticipants.has(connection.id);
                    return (
                      <button
                        key={connection.id}
                        onClick={() => toggleParticipant(connection.id)}
                        className="w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        {/* Checkbox */}
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'bg-green-600 border-green-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>

                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0 overflow-hidden">
                          {connection.profile_photo_url ? (
                            <Image
                              src={connection.profile_photo_url}
                              alt={connection.full_name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                              {connection.full_name.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {connection.full_name}
                          </div>
                          {connection.headline && (
                            <div className="text-sm text-gray-500 truncate">
                              {connection.headline}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          {step === 'details' ? (
            <button
              onClick={() => setStep('participants')}
              disabled={!groupName.trim()}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setStep('details')}
                disabled={creating}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={createGroup}
                disabled={creating || selectedParticipants.size === 0}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  'Create Group'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

