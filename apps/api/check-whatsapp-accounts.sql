-- Check WhatsApp accounts status
SELECT 
  id,
  account_name,
  phone_number,
  push_name,
  status,
  health_score,
  daily_usage_count,
  daily_usage_limit,
  session_storage_path,
  session_data->>'qrCode' as qr_code_in_session,
  last_connected_at,
  last_disconnected_at,
  created_at,
  updated_at
FROM mkt_wap_accounts
ORDER BY created_at DESC;

