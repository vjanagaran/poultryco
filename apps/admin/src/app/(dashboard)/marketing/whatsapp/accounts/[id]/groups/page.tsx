'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getWhatsAppAccountGroups,
  getWhatsAppAccountById,
  getLiveWhatsAppGroups,
  discoverWhatsAppGroups,
  saveSingleWhatsAppGroup,
  hideWhatsAppGroup,
  deleteWhatsAppGroup,
  getWhatsAppGroupContacts,
  getLiveWhatsAppGroupContacts,
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
  Users, 
  Download,
  ArrowLeft,
  Save,
  Loader as Loader2,
  X,
  CheckCircle as CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useToast, ToastContainer } from '@/components/ui/toast';

type TabType = 'all' | 'open' | 'selected' | 'featured' | 'hidden';
type ContactTabType = 'all' | 'saved' | 'new' | 'admins' | 'past';

interface ScrapedGroup {
  whatsappGroupId?: string; // WhatsApp group ID (same as groupId, but explicit)
  groupId: string; // WhatsApp group ID
  name: string;
  description?: string;
  memberCount: number;
  profilePicUrl?: string;
  isSaved: boolean;
  savedGroupId?: string; // DB ID if saved
}

interface LiveContact {
  phoneNumber: string;
  name: string | null;
  profilePicUrl: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLeft: boolean;
}

// Extended interface for contacts with saved status
interface ExtendedGroupContact extends WhatsAppGroupContact {
  isSaved?: boolean;
}

export default function WhatsAppAccountGroupsPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;
  
  const [account, setAccount] = useState<WhatsAppAccount | null>(null);
  const [scrapedGroups, setScrapedGroups] = useState<ScrapedGroup[]>([]);
  const [savedGroups, setSavedGroups] = useState<WhatsAppGroup[]>([]);
  const [mergedGroups, setMergedGroups] = useState<(ScrapedGroup & Partial<WhatsAppGroup>)[]>([]);
  const [contacts, setContacts] = useState<ExtendedGroupContact[]>([]);
  const [liveContacts, setLiveContacts] = useState<LiveContact[]>([]);
  const [contactsSaved, setContactsSaved] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('open');
  const [contactTab, setContactTab] = useState<ContactTabType>('all');
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [scrapedGroupsCache, setScrapedGroupsCache] = useState<ScrapedGroup[]>([]);
  
  // Search & Filters
  const [groupSearch, setGroupSearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  
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
    isFavorite: false,
  });
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  // Load account and initial data
  useEffect(() => {
    if (accountId) {
      fetchAccount();
      fetchSavedGroups();
      autoScrapeGroups();
    }
  }, [accountId]);

  // Merge groups when scraped or saved groups change
  useEffect(() => {
    mergeGroups();
  }, [scrapedGroups, savedGroups]);


  async function fetchLiveContactsForUnsavedGroup(whatsappGroupId: string, accountId: string) {
    try {
      setLoadingContacts(true);
      console.log('fetchLiveContactsForUnsavedGroup: Fetching live contacts from WhatsApp for unsaved group:', whatsappGroupId);
      
      // For unsaved groups, use whatsapp_group_id directly
      // Pass the whatsappGroupId as the third parameter to use it instead of database group id
      const data = await getLiveWhatsAppGroupContacts(whatsappGroupId, accountId, whatsappGroupId);
      
      console.log('fetchLiveContactsForUnsavedGroup: Fetched', data.length, 'live contacts');
      setLiveContacts(data);
      setContactsSaved(false);
    } catch (error: any) {
      console.error('fetchLiveContactsForUnsavedGroup: Error fetching live contacts:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error fetching contacts';
      
      if (errorMessage.includes('timeout')) {
        toast.error('Contact fetching timed out. For large groups, save the group first.');
      } else if (!errorMessage.includes('not available') && !errorMessage.includes('not connected')) {
        toast.error(errorMessage);
      }
      setLiveContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  }

  // Load contacts when group selected
  useEffect(() => {
    if (selectedGroup) {
      // Use a small delay to ensure mergedGroups is updated
      const timer = setTimeout(() => {
        const group = mergedGroups.find(g => (g.savedGroupId || g.groupId) === selectedGroup);
        console.log('useEffect - selectedGroup changed:', { 
          selectedGroup, 
          group: group ? { name: group.name, isSaved: group.isSaved, savedGroupId: group.savedGroupId, groupId: group.groupId } : null, 
          mergedGroupsLength: mergedGroups.length 
        });
        
        if (group?.isSaved && group.savedGroupId) {
          // For saved groups: fetch live contacts from WhatsApp
          console.log('Loading contacts and details for saved group:', group.savedGroupId);
          fetchLiveContacts(group.savedGroupId);
          fetchContactsFromDB();
          fetchGroupDetails();
        } else if (group) {
          // For unsaved groups: fetch live contacts using whatsapp_group_id
          console.log('Loading scraped data and live contacts for unsaved group:', group.groupId);
          loadScrapedGroupData();
          // Fetch live contacts using the whatsapp_group_id (groupId) and accountId
          if (accountId) {
            fetchLiveContactsForUnsavedGroup(group.groupId, accountId);
          }
          setContacts([]);
          setContactsSaved(false);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // Clear contacts and form when no group is selected
      setContacts([]);
      setLiveContacts([]);
      setContactsSaved(false);
      setFormData({
        name: '',
        description: '',
        region: '',
        state: '',
        district: '',
        segmentTags: [],
        internalDescription: '',
        profilePicUrl: '',
        isFavorite: false,
      });
    }
  }, [selectedGroup, mergedGroups]);

  async function fetchAccount() {
    try {
      const data = await getWhatsAppAccountById(accountId);
      setAccount(data);
    } catch (error: any) {
      console.error('Error fetching account:', error);
      toast.error(error?.message || 'Error fetching account');
    }
  }

  async function fetchSavedGroups() {
    try {
      const data = await getWhatsAppAccountGroups(accountId, true);
      setSavedGroups(data);
    } catch (error: any) {
      console.error('Error fetching saved groups:', error);
      toast.error(error?.message || 'Error fetching saved groups');
    }
  }

  async function autoScrapeGroups(clearCache: boolean = false) {
    try {
      setLoading(true);
      setDiscovering(true);
      
      // Clear cache if explicitly requested (e.g., from Re-scrape button)
      if (clearCache) {
        setScrapedGroupsCache([]);
        setScrapedGroups([]);
      }
      
      // Check cache first (only if not clearing)
      if (!clearCache && scrapedGroupsCache.length > 0) {
        console.log('Using cached groups:', scrapedGroupsCache.length);
        setScrapedGroups(scrapedGroupsCache);
        setLoading(false);
        setDiscovering(false);
        return;
      }

      console.log('Fetching live groups from WhatsApp...');
      // Get live groups from WhatsApp (don't save to DB)
      const liveGroups = await getLiveWhatsAppGroups(accountId);
      
      console.log('Received live groups from API:', liveGroups.length);
      
      // Convert to ScrapedGroup format (not saved yet)
      const scraped: ScrapedGroup[] = liveGroups.map((g: any) => {
        const groupId = g.groupId || g.whatsappGroupId || g.id;
        console.log('Mapping live group to scraped:', { groupId, name: g.name, originalData: g });
        return {
          whatsappGroupId: groupId,
          groupId: groupId,
          name: g.name,
          description: g.description,
          memberCount: g.memberCount,
          profilePicUrl: g.profilePicUrl,
          isSaved: false,
        };
      });

      console.log('Mapped scraped groups:', scraped.length);
      setScrapedGroups(scraped);
      setScrapedGroupsCache(scraped); // Cache for session
      toast.success(`Found ${scraped.length} live groups from WhatsApp`);
    } catch (error: any) {
      console.error('Error scraping groups:', error);
      
      // Check for session/connection errors (503 or 500 with specific messages)
      // API client throws errors with statusCode directly, not nested in response
      const errorMessage = error?.response?.data?.message || error?.message || 'Error scraping groups';
      const statusCode = error?.response?.status || error?.statusCode || error?.status;
      
      // If session is not available (503 or specific error messages)
      if (statusCode === 503 || 
          statusCode === 500 ||
          errorMessage.includes('not available') || 
          errorMessage.includes('not ready') || 
          errorMessage.includes('not connected') ||
          errorMessage.includes('not initialized') ||
          errorMessage.includes('reconnect') ||
          errorMessage.includes('disconnected')) {
        // Clear scraped groups
        setScrapedGroups([]);
        setScrapedGroupsCache([]);
        
        // Show error message - more prominent if manually triggered
        if (clearCache) {
          toast.error('WhatsApp session is not available. Please reconnect the account first, then try again.');
        } else {
          // Only show warning if we have saved groups to show (check after a small delay to allow savedGroups to load)
          setTimeout(() => {
            if (savedGroups.length > 0) {
              toast.warning('WhatsApp session not available. Showing saved groups only. Please reconnect the account to see live groups.');
            } else {
              toast.error('WhatsApp session is not available. Please reconnect the account.');
            }
          }, 500);
        }
      } else {
        toast.error(`Failed to fetch groups: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
      setDiscovering(false);
    }
  }

  function mergeGroups() {
    console.log('mergeGroups called:', { 
      scrapedGroupsCount: scrapedGroups.length, 
      savedGroupsCount: savedGroups.length 
    });
    
    // Start with scraped groups (live data from WhatsApp)
    const merged: (ScrapedGroup & Partial<WhatsAppGroup>)[] = scrapedGroups.map(scraped => {
      // Find matching saved group by whatsapp_group_id
      // Match by groupId (WhatsApp group ID) - check both scraped.groupId and scraped.whatsappGroupId
      const scrapedGroupId = scraped.whatsappGroupId || scraped.groupId;
      console.log('Looking for match:', { scrapedGroupId, scrapedName: scraped.name, savedGroupsCount: savedGroups.length });
      const saved = savedGroups.find(sg => {
        // Match by WhatsApp group ID (groupId field in saved groups)
        const match = sg.groupId === scrapedGroupId;
        if (match) {
          console.log('✓ Found matching saved group:', { 
            scrapedGroupId, 
            savedGroupId: sg.groupId, 
            savedDbId: sg.id,
            scrapedName: scraped.name,
            savedName: sg.name
          });
        }
        return match;
      });
      
      if (saved) {
        // Merge: Use saved metadata, but keep scraped live data
        return {
          ...scraped,
          ...saved,
          description: saved.description || scraped.description || undefined,
          isSaved: true,
          savedGroupId: saved.id,
          // Keep live data from scraped
          name: scraped.name || saved.name, // Use live name if available
          memberCount: scraped.memberCount || saved.memberCount || 0, // Use live member count if available
          profilePicUrl: scraped.profilePicUrl || saved.profilePicUrl || undefined,
          // Ensure isFavorite and isHidden are properly merged from saved group
          isFavorite: saved.isFavorite || false,
          isHidden: saved.isHidden || false,
        } as ScrapedGroup & Partial<WhatsAppGroup>;
      }
      
      // Unsaved group - ensure isSaved is explicitly false
      console.log('Unsaved group found:', { groupId: scraped.groupId, name: scraped.name });
      return {
        ...scraped,
        isSaved: false,
      } as ScrapedGroup & Partial<WhatsAppGroup>;
    });

    // Add saved groups that don't have a matching scraped group (when live fetch fails)
    savedGroups.forEach(saved => {
      // Check if this saved group already exists in merged (by database ID or WhatsApp group ID)
      const exists = merged.some(m => 
        m.savedGroupId === saved.id || 
        m.groupId === saved.groupId || 
        m.whatsappGroupId === saved.groupId
      );
      if (!exists) {
        // Convert saved group to merged format
        merged.push({
          // Include all saved group properties first
          ...saved,
          // Then override/add ScrapedGroup-specific properties
          whatsappGroupId: saved.groupId,
          groupId: saved.groupId,
          name: saved.name || 'Unknown Group',
          description: saved.description || undefined,
          memberCount: saved.memberCount || 0,
          profilePicUrl: saved.profilePicUrl || undefined,
          isSaved: true,
          savedGroupId: saved.id,
          isFavorite: saved.isFavorite || false,
          isHidden: saved.isHidden || false,
        } as ScrapedGroup & Partial<WhatsAppGroup>);
      }
    });

    setMergedGroups(merged);
    
    // Auto-select first group in 'open' tab if no group is selected
    if (!selectedGroup && merged.length > 0) {
      const filtered = merged.filter(group => {
        // Filter for 'open' tab (unsaved groups)
        return !group.isSaved;
      });
      
      if (filtered.length > 0) {
        const firstGroup = filtered[0];
        const groupKey = firstGroup.savedGroupId || firstGroup.groupId;
        setSelectedGroup(groupKey);
      } else if (merged.length > 0) {
        // If no open groups, select first saved group
        const firstGroup = merged[0];
        const groupKey = firstGroup.savedGroupId || firstGroup.groupId;
        setSelectedGroup(groupKey);
      }
    }
  }

  async function fetchLiveContacts(groupId: string) {
    if (!accountId) {
      console.log('fetchLiveContacts: No accountId');
      return;
    }
    
    try {
      setLoadingContacts(true);
      console.log('fetchLiveContacts: Fetching live contacts from WhatsApp for group:', groupId);
      
      // Get group info to determine timeout based on member count
      const selectedGroupData = mergedGroups.find(g => (g.savedGroupId || g.groupId) === groupId);
      const memberCount = selectedGroupData?.memberCount || 0;
      
      // Calculate timeout based on member count (2 seconds per 100 members, minimum 30s, maximum 5 minutes)
      const timeoutMs = Math.max(30000, Math.min(300000, memberCount * 20));
      console.log(`fetchLiveContacts: Using timeout of ${timeoutMs}ms for ${memberCount} members`);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout: Contact fetching took too long. Try using "Save Contacts" button instead.')), timeoutMs);
      });
      
      const dataPromise = getLiveWhatsAppGroupContacts(groupId, accountId);
      const data = await Promise.race([dataPromise, timeoutPromise]) as any[];
      
      console.log('fetchLiveContacts: Fetched', data.length, 'live contacts');
      setLiveContacts(data);
      
      // Check if contacts are already saved (don't wait for this if it's slow)
      try {
        const dbContacts = await Promise.race([
          getWhatsAppGroupContacts(groupId, true),
          new Promise((resolve) => setTimeout(() => resolve([]), 5000)) // 5 second timeout
        ]) as any[];
        setContactsSaved(dbContacts.length > 0);
      } catch (dbError) {
        console.warn('fetchLiveContacts: Could not check saved contacts:', dbError);
        // Don't block on this - just continue
      }
    } catch (error: any) {
      console.error('fetchLiveContacts: Error fetching live contacts:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error fetching contacts';
      
      if (errorMessage.includes('timeout')) {
        toast.error('Contact fetching timed out. For large groups, use "Save Contacts" button to scrape directly.');
      } else if (!errorMessage.includes('not available') && !errorMessage.includes('not connected')) {
        toast.error(errorMessage);
      }
      setLiveContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  }

  async function fetchContactsFromDB() {
    if (!selectedGroup) {
      console.log('fetchContactsFromDB: No selectedGroup');
      return;
    }
    
    try {
      // Use savedGroupId if available, otherwise use selectedGroup
      const group = mergedGroups.find(g => (g.savedGroupId || g.groupId) === selectedGroup);
      if (!group) {
        console.warn('fetchContactsFromDB: Group not found in mergedGroups for selectedGroup:', selectedGroup);
        return;
      }
      
      if (!group.isSaved || !group.savedGroupId) {
        console.warn('fetchContactsFromDB: Group is not saved, cannot fetch contacts');
        setContacts([]);
        setContactsSaved(false);
        return;
      }
      
      console.log('fetchContactsFromDB: Calling API with groupId:', group.savedGroupId);
      const data = await getWhatsAppGroupContacts(group.savedGroupId, true);
      console.log('fetchContactsFromDB: Fetched contacts:', data.length, 'contacts');
      setContacts(data);
      setContactsSaved(data.length > 0);
    } catch (error: any) {
      console.error('fetchContactsFromDB: Error fetching contacts:', error);
      toast.error(error?.message || 'Error fetching contacts');
      setContacts([]);
      setContactsSaved(false);
    }
  }

  async function fetchGroupDetails() {
    if (!selectedGroup) return;
    
    try {
      const group = await getWhatsAppGroupById(selectedGroup);
      // Get the merged group to access WhatsApp data
      const mergedGroup = mergedGroups.find(g => (g.savedGroupId || g.groupId) === selectedGroup);
      
      setFormData({
        // WhatsApp data (read-only) - use live data if available, otherwise from DB
        name: mergedGroup?.name || group.name || '',
        description: mergedGroup?.description || group.description || '',
        profilePicUrl: mergedGroup?.profilePicUrl || group.profilePicUrl || '',
        // Editable metadata
        region: group.region || '',
        state: group.state || '',
        district: group.district || '',
        segmentTags: group.segmentTags || [],
        internalDescription: group.internalDescription || '',
        isFavorite: group.isFavorite || false,
      });
    } catch (error: any) {
      console.error('Error fetching group details:', error);
    }
  }

  function loadScrapedGroupData() {
    if (!selectedGroup) return;
    
    const group = mergedGroups.find(g => (g.savedGroupId || g.groupId) === selectedGroup);
    if (group && !group.isSaved) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        region: '',
        state: '',
        district: '',
        segmentTags: [],
        internalDescription: '',
        profilePicUrl: group.profilePicUrl || '',
        isFavorite: false,
      });
    }
  }

  async function handleSaveGroup() {
    if (!selectedGroup || !accountId) return;

    try {
      setSaving(true);
      const group = mergedGroups.find(g => (g.savedGroupId || g.groupId) === selectedGroup);
      
      if (group?.isSaved) {
        // Update existing saved group - only save editable fields, not WhatsApp data
        await updateWhatsAppGroup(group.savedGroupId!, {
          // Don't update WhatsApp fields (name, description, profilePicUrl) - they come from WhatsApp
          region: formData.region,
          state: formData.state,
          district: formData.district,
          segmentTags: formData.segmentTags,
          internalDescription: formData.internalDescription,
          isFavorite: formData.isFavorite,
          isHidden: false,
        });
        toast.success('Group updated successfully!');
      } else {
        // Create new saved group - save only this specific group
        if (group) {
          const savedGroup = await saveSingleWhatsAppGroup(accountId, group.groupId);
          await fetchSavedGroups();
          
          // Update with metadata
          await updateWhatsAppGroup(savedGroup.id, {
            // Don't update WhatsApp fields - they're already saved
            region: formData.region,
            state: formData.state,
            district: formData.district,
            segmentTags: formData.segmentTags,
            internalDescription: formData.internalDescription,
            isFavorite: formData.isFavorite,
            isHidden: false,
          });
          
          await fetchSavedGroups();
          mergeGroups();
          
          // Update selected group to use saved ID
          const updatedGroup = mergedGroups.find(g => g.groupId === group.groupId && g.isSaved);
          if (updatedGroup?.savedGroupId) {
            setSelectedGroup(updatedGroup.savedGroupId);
          }
        }
        toast.success('Group saved successfully!');
      }
      
      await fetchSavedGroups(); // Refresh saved groups
      mergeGroups(); // Re-merge
      
      // Wait for mergeGroups to complete, then select next group
      setTimeout(() => {
        const filtered = mergedGroups.filter(g => {
          // Filter based on current tab
          if (activeTab === 'open') {
            return !g.isSaved;
          } else if (activeTab === 'selected') {
            return g.isSaved && !g.isHidden;
          } else if (activeTab === 'featured') {
            return g.isFavorite && !g.isHidden;
          } else if (activeTab === 'hidden') {
            return g.isHidden;
          }
          return true; // 'all' tab
        });
        
        // Find current group index
        const currentIndex = filtered.findIndex(g => {
          const groupKey = g.savedGroupId || g.groupId;
          return groupKey === selectedGroup;
        });
        
        // Select next group, or first group if current was last
        if (filtered.length > 0) {
          const nextIndex = currentIndex >= 0 && currentIndex < filtered.length - 1 
            ? currentIndex + 1 
            : 0;
          const nextGroup = filtered[nextIndex];
          const nextGroupKey = nextGroup.savedGroupId || nextGroup.groupId;
          setSelectedGroup(nextGroupKey);
        }
      }, 100);
    } catch (error: any) {
      console.error('Error saving group:', error);
      toast.error(error?.message || 'Error saving group');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveGroup() {
    if (!selectedGroup) return;

    const group = mergedGroups.find(g => (g.savedGroupId || g.groupId) === selectedGroup);
    if (!group) return;

    // Confirm deletion
    if (!confirm(`Are you sure you want to remove "${group.name}"?\n\nThis will:\n- Delete contacts that are only in this group\n- Remove all group-contact mappings\n- Permanently delete the group\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      if (group.savedGroupId) {
        await deleteWhatsAppGroup(group.savedGroupId);
        toast.success('Group removed successfully');
        
        await fetchSavedGroups();
        mergeGroups();
        
        // Select next group after removal
        setTimeout(() => {
          const filtered = mergedGroups.filter(g => {
            // Filter based on current tab
            if (activeTab === 'open') {
              return !g.isSaved;
            } else if (activeTab === 'selected') {
              return g.isSaved && !g.isHidden;
            } else if (activeTab === 'featured') {
              return g.isFavorite && !g.isHidden;
            } else if (activeTab === 'hidden') {
              return g.isHidden;
            }
            return true; // 'all' tab
          });
          
          // Find current group index (it should be removed now, so find the one that was next)
          const currentIndex = filtered.findIndex(g => {
            const groupKey = g.savedGroupId || g.groupId;
            return groupKey === selectedGroup;
          });
          
          // Select next group, or first group if current was last or not found
          if (filtered.length > 0) {
            const nextIndex = currentIndex >= 0 && currentIndex < filtered.length - 1 
              ? currentIndex + 1 
              : 0;
            const nextGroup = filtered[nextIndex];
            const nextGroupKey = nextGroup.savedGroupId || nextGroup.groupId;
            setSelectedGroup(nextGroupKey);
          } else {
            setSelectedGroup(null);
          }
        }, 100);
      } else {
        toast.error('Cannot remove unsaved group. Please save it first.');
      }
    } catch (error: any) {
      console.error('Error removing group:', error);
      toast.error(error?.message || 'Error removing group');
    }
  }

  async function handleHideGroup() {
    if (!selectedGroup) return;

    try {
      const group = mergedGroups.find(g => (g.savedGroupId || g.groupId) === selectedGroup);
      
      if (group?.isSaved && group.savedGroupId) {
        // Group is already saved, just hide it
        await hideWhatsAppGroup(group.savedGroupId, true);
        toast.success('Group hidden');
        await fetchSavedGroups();
        mergeGroups();
      } else if (group) {
        // Group is not saved yet - save only THIS group, then hide it
        const savedGroup = await saveSingleWhatsAppGroup(accountId, group.groupId);
        await fetchSavedGroups();
        
        // Update with metadata and hide
        await updateWhatsAppGroup(savedGroup.id, {
          region: formData.region,
          state: formData.state,
          district: formData.district,
          segmentTags: formData.segmentTags,
          internalDescription: formData.internalDescription,
          isFavorite: formData.isFavorite,
          isHidden: true, // Hide it
        });
        
        toast.success('Group saved and hidden');
        await fetchSavedGroups();
        mergeGroups();
      }
      
      // Select next group after hiding
      setTimeout(() => {
        const filtered = mergedGroups.filter(g => {
          // Filter based on current tab
          if (activeTab === 'open') {
            return !g.isSaved;
          } else if (activeTab === 'selected') {
            return g.isSaved && !g.isHidden;
          } else if (activeTab === 'featured') {
            return g.isFavorite && !g.isHidden;
          } else if (activeTab === 'hidden') {
            return g.isHidden;
          }
          return true; // 'all' tab
        });
        
        // Find current group index
        const currentIndex = filtered.findIndex(g => {
          const groupKey = g.savedGroupId || g.groupId;
          return groupKey === selectedGroup;
        });
        
        // Select next group, or first group if current was last
        if (filtered.length > 0) {
          const nextIndex = currentIndex >= 0 && currentIndex < filtered.length - 1 
            ? currentIndex + 1 
            : 0;
          const nextGroup = filtered[nextIndex];
          const nextGroupKey = nextGroup.savedGroupId || nextGroup.groupId;
          setSelectedGroup(nextGroupKey);
        }
      }, 100);
    } catch (error: any) {
      console.error('Error hiding group:', error);
      toast.error(error?.message || 'Error hiding group');
    }
  }

  async function handleSaveContacts() {
    if (!selectedGroup || !accountId) return;
    
    const group = mergedGroups.find(g => (g.savedGroupId || g.groupId) === selectedGroup);
    if (!group?.isSaved || !group.savedGroupId) {
      toast.warning('Please save the group first before saving contacts');
      return;
    }

    if (liveContacts.length === 0) {
      toast.warning('No contacts to save. Please wait for contacts to load.');
      return;
    }

    if (!confirm(`Save ${liveContacts.length} contacts to database? This may take a few moments.`)) return;

    try {
      setScraping(true);
      const result = await scrapeContactsFromGroup(group.savedGroupId, accountId);
      await fetchContactsFromDB();
      await fetchSavedGroups();
      mergeGroups();
      setContactsSaved(true);
      toast.success(`Successfully saved ${result.scrapedCount} new contacts! Total: ${result.totalContacts}`);
    } catch (error: any) {
      console.error('Error saving contacts:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error saving contacts';
      toast.error(errorMessage);
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

  // Filter groups
  const filteredGroups = mergedGroups.filter(group => {
    // Tab filters
    if (activeTab === 'hidden') {
      // Hidden tab: only show hidden groups
      if (!group.isHidden) return false;
    } else if (activeTab === 'open') {
      // Open tab: show groups that are NOT saved to database
      if (group.isSaved) return false;
    } else if (activeTab === 'selected') {
      // Selected tab: show saved groups that are NOT hidden
      if (!group.isSaved || group.isHidden) return false;
    } else if (activeTab === 'featured') {
      // Featured tab: only show favorite groups (and not hidden)
      if (!group.isFavorite || group.isHidden) return false;
    }
    // 'all' tab: no filter, show all groups
    
    // Search filter
    const searchLower = groupSearch.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLower) ||
      group.description?.toLowerCase().includes(searchLower) ||
      group.segmentTags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  // Debug logging for filtered groups
  useEffect(() => {
    if (mergedGroups.length > 0) {
      console.log('Filtered groups for tab:', {
        activeTab,
        totalMerged: mergedGroups.length,
        filteredCount: filteredGroups.length,
        unsavedInMerged: mergedGroups.filter(g => !g.isSaved).length,
        savedInMerged: mergedGroups.filter(g => g.isSaved).length,
        sampleGroup: mergedGroups[0] ? { name: mergedGroups[0].name, isSaved: mergedGroups[0].isSaved } : null,
      });
    }
  }, [activeTab, filteredGroups.length, mergedGroups.length]);

  // Filter contacts - use liveContacts if available, otherwise use saved contacts
  const contactsToDisplay = liveContacts.length > 0 ? liveContacts : contacts;
  const filteredContacts = contactsToDisplay.filter((contact: any) => {
    // Tab filter
    if (contactTab === 'saved') {
      // Only show saved contacts (from DB)
      if (liveContacts.length > 0) {
        // If showing live contacts, check if they're in saved contacts
        const savedContact = contacts.find(c => {
          const phone = (c as any).contact?.phoneNumber || (c as any).phoneNumber;
          return phone === contact.phoneNumber;
        });
        if (!savedContact) return false;
      } else {
        // If showing saved contacts, all are saved
        return true;
      }
    }
    if (contactTab === 'new') {
      // Only show new contacts (not in DB)
      if (liveContacts.length > 0) {
        const savedContact = contacts.find(c => {
          const phone = (c as any).contact?.phoneNumber || (c as any).phoneNumber;
          return phone === contact.phoneNumber;
        });
        if (savedContact) return false;
      } else {
        return false; // No new contacts if only showing saved
      }
    }
    if (contactTab === 'admins' && !contact.isAdmin && !contact.isSuperAdmin) return false;
    if (contactTab === 'past' && !contact.isLeft) return false;
    
    // Search filter
    const searchLower = contactSearch.toLowerCase();
    const contactName = contact.name || (contact as any).contact?.name || '';
    const contactPhone = contact.phoneNumber || (contact as any).contact?.phoneNumber || '';
    return (
      contactName.toLowerCase().includes(searchLower) ||
      contactPhone.includes(searchLower)
    );
  });

  const selectedGroupData = mergedGroups.find(g => (g.savedGroupId || g.groupId) === selectedGroup);
  const activeContacts = contactsToDisplay.filter((c: any) => !c.isLeft);
  const adminContacts = activeContacts.filter((c: any) => c.isAdmin || c.isSuperAdmin);

  if (!account) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/marketing/whatsapp/accounts" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Accounts
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Groups</h1>
            {account && (
              <p className="text-sm text-gray-600 mt-1">
                {account.accountName} ({account.phoneNumber})
              </p>
            )}
          </div>
          <button
            onClick={() => autoScrapeGroups(true)}
            disabled={discovering}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${discovering ? 'animate-spin' : ''}`} />
            Re-scrape Groups
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Groups List */}
        <div className="w-[400px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search group chats"
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm placeholder-gray-400"
              />
              {groupSearch && (
                <button
                  onClick={() => setGroupSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
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
              onClick={() => setActiveTab('open')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'open'
                  ? 'border-green-500 text-green-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Open
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
                {filteredGroups.map((group) => {
                  const groupKey = group.savedGroupId || group.groupId;
                  return (
                    <div
                      key={groupKey}
                      onClick={() => setSelectedGroup(groupKey)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        selectedGroup === groupKey ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                      } ${group.isHidden ? 'opacity-60' : ''}`}
                    >
                      {/* Group Avatar */}
                      <div className="flex-shrink-0">
                        {group.profilePicUrl ? (
                          <img
                            src={group.profilePicUrl}
                            alt={group.name}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"><svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>';
                              }
                            }}
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
                          {group.isSaved && (
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{group.memberCount} members</span>
                        </div>
                      </div>

                      {/* Right Arrow */}
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Members/Contacts List */}
        <div className="w-[400px] border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
          {selectedGroup ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  {selectedGroupData?.isSaved && liveContacts.length > 0 && (
                    <button
                      onClick={handleSaveContacts}
                      disabled={scraping}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Save className={`w-4 h-4 ${scraping ? 'animate-spin' : ''}`} />
                      {scraping ? 'Saving...' : 'Save Contacts'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm placeholder-gray-400"
                  />
                  {contactSearch && (
                    <button
                      onClick={() => setContactSearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {/* Contact Tabs */}
                <div className="flex gap-1 mt-3">
                  <button
                    onClick={() => setContactTab('all')}
                    className={`px-3 py-1.5 text-xs rounded ${
                      contactTab === 'all'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setContactTab('saved')}
                    className={`px-3 py-1.5 text-xs rounded ${
                      contactTab === 'saved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Saved
                  </button>
                  <button
                    onClick={() => setContactTab('new')}
                    className={`px-3 py-1.5 text-xs rounded ${
                      contactTab === 'new'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    New
                  </button>
                  <button
                    onClick={() => setContactTab('admins')}
                    className={`px-3 py-1.5 text-xs rounded ${
                      contactTab === 'admins'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Admins
                  </button>
                  <button
                    onClick={() => setContactTab('past')}
                    className={`px-3 py-1.5 text-xs rounded ${
                      contactTab === 'past'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Past
                  </button>
                </div>
              </div>

              {/* Contacts List */}
              <div className="flex-1 overflow-y-auto">
                {loadingContacts ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-3" />
                    <p className="text-sm">Loading contacts from WhatsApp...</p>
                    <p className="text-xs mt-1 text-gray-400">
                      {selectedGroupData?.memberCount 
                        ? `Processing ${selectedGroupData.memberCount} contacts...` 
                        : 'This may take a moment'}
                    </p>
                    {selectedGroupData?.memberCount && selectedGroupData.memberCount > 200 && (
                      <p className="text-xs mt-2 text-orange-600 max-w-xs text-center">
                        Large group detected. If this takes too long, use "Save Contacts" button instead.
                      </p>
                    )}
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No contacts found</p>
                    {!selectedGroupData?.isSaved ? (
                      <p className="text-xs mt-1">Save group first to load contacts</p>
                    ) : liveContacts.length === 0 ? (
                      <p className="text-xs mt-1">No contacts in this group</p>
                    ) : null}
                  </div>
                ) : (
                  <div>
                    {filteredContacts.map((contact: any, index: number) => {
                      const contactKey = contact.id || contact.phoneNumber || index;
                      const contactName = contact.name || (contact as any).contact?.name || '';
                      const contactPhone = contact.phoneNumber || (contact as any).contact?.phoneNumber || '';
                      const contactPic = contact.profilePicUrl || (contact as any).contact?.profilePicUrl || null;
                      const isSaved = contacts.some(c => {
                        const phone = (c as any).contact?.phoneNumber || (c as any).phoneNumber;
                        return phone === contactPhone;
                      });
                      
                      return (
                        <div
                          key={contactKey}
                          onClick={() => setSelectedContact(contactPhone)}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            selectedContact === contactPhone ? 'bg-green-50' : ''
                          } ${contact.isLeft ? 'opacity-60' : ''}`}
                        >
                          {/* Contact Avatar */}
                          <div className="flex-shrink-0 relative">
                            {contactPic ? (
                              <img
                                src={contactPic}
                                alt={contactName || contactPhone}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const initial = (contactName || contactPhone).charAt(0).toUpperCase();
                                    parent.innerHTML = `<div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><span class="text-gray-600 text-sm font-medium">${initial}</span></div>`;
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-600 text-sm font-medium">
                                  {(contactName || contactPhone).charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            {/* Saved indicator */}
                            {isSaved && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>

                          {/* Contact Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-gray-900 truncate">
                                {contactName || contactPhone}
                              </h3>
                              {(contact.isAdmin || contact.isSuperAdmin) && (
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded ml-2 flex-shrink-0">
                                  {contact.isSuperAdmin ? 'Super Admin' : 'Admin'}
                                </span>
                              )}
                            </div>
                            {contactName && (
                              <p className="text-xs text-gray-500 truncate">{contactPhone}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a group to view members</p>
              </div>
            </div>
          )}
        </div>

        {/* Column 3: Group Details */}
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
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedGroupData.isSaved ? 'Saved' : 'Unsaved'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Group Metadata Form */}
              <div className="space-y-6">
                {/* Group Name (Read-only) */}
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Group Name (from WhatsApp)
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    readOnly
                    className="mt-1 bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Description (Read-only) */}
                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description (from WhatsApp)
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    readOnly
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed resize-none"
                  />
                </div>

                {/* Region, State, District */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="region" className="text-sm font-medium text-gray-700">
                      Region
                    </Label>
                    <Input
                      id="region"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="mt-1"
                      placeholder="Enter region"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                      State
                    </Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="mt-1"
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="district" className="text-sm font-medium text-gray-700">
                      District
                    </Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="mt-1"
                      placeholder="Enter district"
                    />
                  </div>
                </div>

                {/* Internal Description */}
                <div>
                  <Label htmlFor="internalDescription" className="text-sm font-medium text-gray-700">
                    Internal Description
                  </Label>
                  <textarea
                    id="internalDescription"
                    value={formData.internalDescription}
                    onChange={(e) => setFormData({ ...formData, internalDescription: e.target.value })}
                    rows={4}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    placeholder="Internal notes for team use..."
                  />
                </div>

                {/* Profile Picture URL (Read-only) */}
                <div>
                  <Label htmlFor="profilePicUrl" className="text-sm font-medium text-gray-700">
                    Profile Picture URL (from WhatsApp)
                  </Label>
                  <Input
                    id="profilePicUrl"
                    value={formData.profilePicUrl}
                    readOnly
                    className="mt-1 bg-gray-100 cursor-not-allowed"
                    placeholder="https://..."
                  />
                  {formData.profilePicUrl && (
                    <img
                      src={formData.profilePicUrl}
                      alt="Group profile"
                      className="mt-2 w-20 h-20 rounded-lg object-cover border border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                </div>

                {/* Segment Tags */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Segment Tags
                  </Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Add tag..."
                      className="flex-1"
                    />
                    <Button onClick={addTag} type="button" size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.segmentTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Mark as Favorite */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFavorite"
                    checked={formData.isFavorite}
                    onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <Label htmlFor="isFavorite" className="cursor-pointer">
                    Mark as Favorite
                  </Label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  {/* Save/Update Group Button */}
                  <Button
                    onClick={handleSaveGroup}
                    disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving 
                      ? 'Saving...' 
                      : selectedGroupData?.isSaved && !selectedGroupData?.isHidden
                        ? 'Update Group'
                        : 'Save Group'
                    }
                  </Button>
                  
                  {/* Hide Group Button - only show if group is NOT saved (so it can save and hide) */}
                  {!selectedGroupData?.isSaved && (
                    <Button
                      onClick={handleHideGroup}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Hide Group
                    </Button>
                  )}
                  
                  {/* Remove Group Button - show if group is saved (whether hidden or not) */}
                  {selectedGroupData?.isSaved && selectedGroupData.savedGroupId && (
                    <Button
                      onClick={handleRemoveGroup}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Group
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a group to view and edit details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
