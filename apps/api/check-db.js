const postgres = require('postgres');

const DATABASE_URL = 'postgresql://postgres:@localhost:5432/poultryco?sslmode=prefer';

async function checkDatabase() {
  const sql = postgres(DATABASE_URL);
  
  try {
    console.log('📊 Checking WhatsApp accounts...\n');
    
    const accounts = await sql`
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
        session_data,
        last_connected_at,
        last_disconnected_at,
        created_at,
        updated_at
      FROM mkt_wap_accounts
      ORDER BY created_at DESC
    `;
    
    console.log(`Found ${accounts.length} accounts:\n`);
    
    accounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.account_name}`);
      console.log(`   ID: ${account.id}`);
      console.log(`   Phone: ${account.phone_number || 'NULL'}`);
      console.log(`   Push Name: ${account.push_name || 'NULL'}`);
      console.log(`   Status: ${account.status}`);
      console.log(`   Session Path: ${account.session_storage_path || 'NULL'}`);
      console.log(`   Last Connected: ${account.last_connected_at || 'Never'}`);
      console.log(`   Has QR in session_data: ${account.session_data?.qrCode ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // Check for accounts that should be active but aren't
    const stuckAccounts = accounts.filter(a => 
      a.status === 'warming' && !a.phone_number
    );
    
    if (stuckAccounts.length > 0) {
      console.log(`⚠️  Found ${stuckAccounts.length} accounts stuck in "warming" status:\n`);
      stuckAccounts.forEach(acc => {
        console.log(`   - ${acc.account_name} (${acc.id})`);
        console.log(`     Created: ${acc.created_at}`);
        console.log(`     Updated: ${acc.updated_at}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error querying database:', error);
  } finally {
    await sql.end();
  }
}

checkDatabase();

