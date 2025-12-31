'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getWhatsAppAccounts,
  createWhatsAppAccount,
  initializeWhatsAppAccount,
  disconnectWhatsAppAccount,
  getWhatsAppAccountQR,
  getWhatsAppLogs,
  type WhatsAppAccount,
} from '@/lib/api/whatsapp';
import { useWhatsAppAccountPolling } from '@/lib/hooks/useWhatsAppAccountPolling';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, RefreshCw, Loader2, Settings, Users, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { QRCodeSVG } from 'qrcode.react';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  standby: 'bg-blue-100 text-blue-800',
  warming: 'bg-yellow-100 text-yellow-800',
  banned: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-800',
};

export default function WhatsAppAccountsPage() {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<WhatsAppAccount | null>(null);
  const [formData, setFormData] = useState({
    accountName: '',
  });
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Polling hook for account status updates (replaces WebSocket to avoid CORS issues)
  const polling = useWhatsAppAccountPolling({
    accountId: selectedAccount?.id || null,
    enabled: qrDialogOpen, // Only poll when QR dialog is open
    pollInterval: 2000, // Poll every 2 seconds
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      setLoading(true);
      const data = await getWhatsAppAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount() {
    try {
      await createWhatsAppAccount(formData);
      setIsDialogOpen(false);
      setFormData({ accountName: '' });
      fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Error creating account');
    }
  }

  async function handleInitialize(accountId: string) {
    try {
      const account = accounts.find(a => a.id === accountId);
      if (account) {
        setSelectedAccount(account);
        setQrDialogOpen(true);
        // WebSocket hook will automatically subscribe when selectedAccount.id changes
      }
      await initializeWhatsAppAccount(accountId);
      fetchAccounts();
    } catch (error) {
      console.error('Error initializing account:', error);
      alert('Error initializing account');
    }
  }

  // Update account when polling receives phone number
  useEffect(() => {
    if (polling.phoneNumber && selectedAccount) {
      fetchAccounts(); // Refresh to get updated phone number
    }
  }, [polling.phoneNumber, selectedAccount]);

  // Close QR dialog when connected
  useEffect(() => {
    if (polling.status === 'active' && selectedAccount) {
      // Wait a moment then close and refresh
      setTimeout(() => {
        setQrDialogOpen(false);
        fetchAccounts();
      }, 2000);
    }
  }, [polling.status, selectedAccount]);

  async function fetchLogs() {
    try {
      setLogsLoading(true);
      const data = await getWhatsAppLogs(200);
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs(['Error fetching logs']);
    } finally {
      setLogsLoading(false);
    }
  }

  useEffect(() => {
    if (logsDialogOpen) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 3000); // Refresh every 3 seconds
      return () => clearInterval(interval);
    }
  }, [logsDialogOpen]);

  async function handleDisconnect(accountId: string) {
    if (!confirm('Are you sure you want to disconnect this account?')) return;
    
    try {
      await disconnectWhatsAppAccount(accountId);
      fetchAccounts();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      alert('Error disconnecting account');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Accounts</h1>
          <p className="mt-2 text-gray-600">
            Manage WhatsApp account connections and sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setLogsDialogOpen(true); }}>
            <FileText className="w-4 h-4 mr-2" />
            View Logs
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Accounts Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{account.accountName}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{account.phoneNumber || 'Not connected'}</p>
                  </div>
                  <Badge className={STATUS_COLORS[account.status] || STATUS_COLORS.inactive}>
                    {account.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Health Score</div>
                      <div className="font-semibold">{account.healthScore}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Daily Usage</div>
                      <div className="font-semibold">
                        {account.dailyUsageCount} / {account.dailyUsageLimit}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {account.status === 'inactive' || account.status === 'warming' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInitialize(account.id)}
                          className="flex-1"
                        >
                          <span className="mr-2">📱</span>
                          {account.status === 'warming' ? 'Show QR' : 'Initialize'}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDisconnect(account.id)}
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Disconnect
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={fetchAccounts}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/marketing/whatsapp/accounts/${account.id}/rate-limits`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
                          <Settings className="w-4 h-4 mr-2" />
                          Rate Limits
                        </Button>
                      </Link>
                      <Link href={`/marketing/whatsapp/accounts/${account.id}/persona-mapping`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
                          <Users className="w-4 h-4 mr-2" />
                          Persona
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && accounts.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No WhatsApp accounts
          </h3>
          <p className="text-gray-600 mb-4">
            Add your first WhatsApp account to get started
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>
      )}

      {/* Create Account Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add WhatsApp Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name
              </label>
              <Input
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                placeholder="e.g., Main Business Account"
              />
              <p className="mt-1 text-xs text-gray-500">
                Phone number will be automatically detected after scanning QR code
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAccount}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Scan this QR code with your WhatsApp mobile app to connect{' '}
              <strong>{selectedAccount?.accountName}</strong>
            </p>

            {/* QR Code Display */}
            <div className="flex flex-col items-center space-y-4">
              {polling.qrCode ? (
                <>
                  <div className="flex justify-center p-4 bg-white rounded-lg border-2 border-gray-200">
                    <QRCodeSVG value={polling.qrCode} size={256} level="H" />
                  </div>
                  
                  {/* Countdown Timer */}
                  {polling.qrExpiresIn > 0 && (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        QR code expires in{' '}
                        <span className="text-green-600 font-bold">
                          {polling.qrCountdown}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  {polling.loading ? (
                    <>
                      <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
                      <p className="text-sm text-gray-600">Initializing connection...</p>
                    </>
                  ) : polling.status === 'active' ? (
                    <>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">✓</span>
                      </div>
                      <p className="text-sm font-medium text-green-600">Connected!</p>
                      {polling.phoneNumber && (
                        <p className="text-xs text-gray-500 mt-1">
                          Phone: {polling.phoneNumber}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl text-gray-400">📱</span>
                      </div>
                      <p className="text-sm text-gray-600">Waiting for QR code...</p>
                      <p className="text-xs text-gray-500 mt-1">Status: {polling.status}</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Status Display */}
            {polling.status && polling.status !== 'active' && (
              <div className="text-center">
                <Badge className={STATUS_COLORS[polling.status] || STATUS_COLORS.inactive}>
                  {polling.status}
                </Badge>
              </div>
            )}

            {/* Error Display */}
            {polling.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{polling.error}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => polling.clearError()}
                  className="mt-2"
                >
                  Dismiss
                </Button>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs font-medium text-blue-900 mb-2">Instructions:</p>
              <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                <li>Open WhatsApp on your phone</li>
                <li>Go to Settings → Linked Devices</li>
                <li>Tap "Link a Device"</li>
                <li>Point your phone at this screen to scan the QR code</li>
              </ol>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQrDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (selectedAccount) {
                  handleInitialize(selectedAccount.id);
                  polling.refresh(); // Manually refresh polling
                }
              }}
              disabled={polling.loading}
            >
              {polling.loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh QR Code
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>WhatsApp Connection Logs</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">
                Real-time logs (auto-refreshes every 3 seconds)
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLogs}
                disabled={logsLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${logsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-lg overflow-auto max-h-[60vh]">
              {logsLoading && logs.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading logs...
                </div>
              ) : logs.length === 0 ? (
                <div className="text-gray-500">No logs available</div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => {
                    const isError = log.toLowerCase().includes('error');
                    const isSuccess = log.toLowerCase().includes('✅') || log.toLowerCase().includes('success');
                    const isWarning = log.toLowerCase().includes('warn') || log.toLowerCase().includes('⚠️');
                    
                    return (
                      <div
                        key={index}
                        className={`${
                          isError ? 'text-red-400' :
                          isSuccess ? 'text-green-400' :
                          isWarning ? 'text-yellow-400' :
                          'text-gray-300'
                        }`}
                      >
                        {log}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

