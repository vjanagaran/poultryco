'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getWhatsAppAccountById } from '@/lib/api/whatsapp';
import type { WhatsAppAccount } from '@/lib/api/whatsapp';

interface UseWhatsAppAccountPollingOptions {
  accountId: string | null;
  enabled?: boolean;
  pollInterval?: number; // milliseconds
}

export function useWhatsAppAccountPolling({
  accountId,
  enabled = true,
  pollInterval = 2000, // Poll every 2 seconds
}: UseWhatsAppAccountPollingOptions) {
  const [account, setAccount] = useState<WhatsAppAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrExpiresIn, setQrExpiresIn] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qrCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qrGeneratedAtRef = useRef<number | null>(null);

  const fetchAccount = useCallback(async () => {
    if (!accountId || !enabled) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getWhatsAppAccountById(accountId);
      setAccount(data);

      // Handle QR code expiration countdown
      if (data.qrCode) {
        // If we have a QR code, start/update countdown
        if (!qrGeneratedAtRef.current) {
          // New QR code detected
          qrGeneratedAtRef.current = Date.now();
          setQrExpiresIn(20); // QR codes expire in ~20 seconds
        } else {
          // Calculate remaining time
          const elapsed = Math.floor((Date.now() - qrGeneratedAtRef.current) / 1000);
          const remaining = Math.max(0, 20 - elapsed);
          setQrExpiresIn(remaining);
        }
      } else {
        // No QR code - clear countdown
        qrGeneratedAtRef.current = null;
        setQrExpiresIn(0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch account status');
      console.error('Error fetching account status:', err);
    } finally {
      setLoading(false);
    }
  }, [accountId, enabled]);

  // Start polling when accountId is set and enabled
  useEffect(() => {
    if (!accountId || !enabled) {
      // Clear interval if disabled or no account
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Fetch immediately
    fetchAccount();

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      fetchAccount();
    }, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [accountId, enabled, pollInterval, fetchAccount]);

  // QR code countdown timer
  useEffect(() => {
    if (qrExpiresIn > 0 && account?.qrCode) {
      // Start countdown
      qrCountdownRef.current = setInterval(() => {
        setQrExpiresIn((prev) => {
          if (prev <= 1) {
            // QR expired - clear it
            qrGeneratedAtRef.current = null;
            if (qrCountdownRef.current) {
              clearInterval(qrCountdownRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Clear countdown if no QR code
      if (qrCountdownRef.current) {
        clearInterval(qrCountdownRef.current);
        qrCountdownRef.current = null;
      }
    }

    return () => {
      if (qrCountdownRef.current) {
        clearInterval(qrCountdownRef.current);
        qrCountdownRef.current = null;
      }
    };
  }, [qrExpiresIn, account?.qrCode]);

  // Format countdown timer
  const formatCountdown = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    account,
    loading,
    error,
    qrCode: account?.qrCode || null,
    qrExpiresIn,
    qrCountdown: formatCountdown(qrExpiresIn),
    status: account?.status || 'inactive',
    phoneNumber: account?.phoneNumber || null,
    isConnected: account?.isConnected || false,
    refresh: fetchAccount,
    clearError: () => setError(null),
  };
}

