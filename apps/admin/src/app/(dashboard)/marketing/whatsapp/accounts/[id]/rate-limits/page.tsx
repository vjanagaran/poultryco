'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getWhatsAppAccountById,
  updateWhatsAppAccountRateLimits,
  type WhatsAppAccount,
  type RateLimitConfig,
} from '@/lib/api/whatsapp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RateLimitsPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;

  const [account, setAccount] = useState<WhatsAppAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<RateLimitConfig>({
    messages_per_minute: 20,
    messages_per_hour: 200,
    messages_per_day: 1000,
    groups_per_day: 50,
    contacts_per_day: 100,
    cooldown_after_error: 300,
  });

  useEffect(() => {
    if (accountId) {
      fetchAccount();
    }
  }, [accountId]);

  async function fetchAccount() {
    try {
      setLoading(true);
      const data = await getWhatsAppAccountById(accountId);
      setAccount(data);
      
      // Load rate limit config if available
      if ((data as any).rateLimitConfig) {
        setConfig((data as any).rateLimitConfig);
      }
    } catch (error) {
      console.error('Error fetching account:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await updateWhatsAppAccountRateLimits(accountId, {
        messagesPerMinute: config.messages_per_minute,
        messagesPerHour: config.messages_per_hour,
        messagesPerDay: config.messages_per_day,
        groupsPerDay: config.groups_per_day,
        contactsPerDay: config.contacts_per_day,
        cooldownAfterError: config.cooldown_after_error,
      });
      
      // Refresh account data
      await fetchAccount();
      alert('Rate limits updated successfully');
    } catch (error) {
      console.error('Error updating rate limits:', error);
      alert('Error updating rate limits');
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
              <h1 className="text-3xl font-bold text-gray-900">Rate Limit Configuration</h1>
              <p className="mt-2 text-gray-600">
                Configure rate limits for <span className="font-semibold">{account.accountName}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Limits Form */}
      <Card>
        <CardHeader>
          <CardTitle>Message Rate Limits</CardTitle>
          <CardDescription>
            Set maximum number of messages that can be sent per time period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="messages_per_minute">Messages per Minute</Label>
              <Input
                id="messages_per_minute"
                type="number"
                min="1"
                max="100"
                value={config.messages_per_minute}
                onChange={(e) =>
                  setConfig({ ...config, messages_per_minute: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-gray-500">Recommended: 20-30</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="messages_per_hour">Messages per Hour</Label>
              <Input
                id="messages_per_hour"
                type="number"
                min="1"
                max="10000"
                value={config.messages_per_hour}
                onChange={(e) =>
                  setConfig({ ...config, messages_per_hour: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-gray-500">Recommended: 200-500</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="messages_per_day">Messages per Day</Label>
              <Input
                id="messages_per_day"
                type="number"
                min="1"
                max="100000"
                value={config.messages_per_day}
                onChange={(e) =>
                  setConfig({ ...config, messages_per_day: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-gray-500">Recommended: 1000-5000</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Group & Contact Limits</CardTitle>
          <CardDescription>
            Set maximum number of groups and contacts that can be processed per day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="groups_per_day">Groups per Day</Label>
              <Input
                id="groups_per_day"
                type="number"
                min="1"
                max="1000"
                value={config.groups_per_day}
                onChange={(e) =>
                  setConfig({ ...config, groups_per_day: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-gray-500">Maximum groups to join/process daily</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contacts_per_day">Contacts per Day</Label>
              <Input
                id="contacts_per_day"
                type="number"
                min="1"
                max="10000"
                value={config.contacts_per_day}
                onChange={(e) =>
                  setConfig({ ...config, contacts_per_day: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-gray-500">Maximum contacts to scrape/process daily</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error Handling</CardTitle>
          <CardDescription>
            Configure cooldown period after errors to prevent account bans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cooldown_after_error">Cooldown After Error (seconds)</Label>
            <Input
              id="cooldown_after_error"
              type="number"
              min="0"
              max="3600"
              value={config.cooldown_after_error}
              onChange={(e) =>
                setConfig({ ...config, cooldown_after_error: parseInt(e.target.value) || 0 })
              }
            />
            <p className="text-xs text-gray-500">
              Wait time in seconds before retrying after an error (Recommended: 300-600)
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
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

