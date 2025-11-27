// =====================================================
// Supabase Edge Function: Refresh Monthly Averages
// Schedule: Daily at 00:30 UTC (after NECC scraper runs)
// Purpose: Refresh necc_monthly_averages materialized view
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log('Starting monthly averages refresh...');
    const startTime = Date.now();

    // Call the refresh function
    const { error } = await supabase.rpc('refresh_necc_monthly_averages');

    if (error) {
      console.error('Error refreshing monthly averages:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          duration_ms: Date.now() - startTime 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`Monthly averages refreshed successfully in ${duration}ms`);

    // Get some stats about the refresh
    const { data: stats, error: statsError } = await supabase
      .from('necc_monthly_averages')
      .select('zone_id', { count: 'exact', head: true });

    const recordCount = stats?.length ?? 0;

    return new Response(
      JSON.stringify({ 
        success: true,
        duration_ms: duration,
        records_count: recordCount,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// =====================================================
// DEPLOYMENT INSTRUCTIONS
// =====================================================
//
// 1. Deploy this function:
//    supabase functions deploy refresh-monthly-averages
//
// 2. Set up cron schedule in Supabase Dashboard:
//    - Go to Database > Cron Jobs (pg_cron extension required)
//    - Or use Supabase Edge Function cron trigger
//    - Schedule: 0 30 * * * (00:30 UTC daily)
//
// 3. Test manually:
//    curl -i --location --request POST \
//      'https://<project-ref>.supabase.co/functions/v1/refresh-monthly-averages' \
//      --header 'Authorization: Bearer <anon-key>'
//
// 4. Monitor execution:
//    - Check function logs in Supabase Dashboard
//    - Expected duration: 100-500ms
//    - Expected records: ~9,000 (50 zones × ~15 years × 12 months)
//
// =====================================================
// ALTERNATIVE: Using pg_cron directly
// =====================================================
//
// If you prefer pg_cron instead of Edge Function:
//
// SELECT cron.schedule(
//   'refresh-monthly-averages',
//   '30 0 * * *', -- 00:30 UTC daily
//   $$SELECT refresh_necc_monthly_averages();$$
// );
//
// To check scheduled jobs:
// SELECT * FROM cron.job;
//
// To unschedule:
// SELECT cron.unschedule('refresh-monthly-averages');
//
// =====================================================

