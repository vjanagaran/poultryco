const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://postgres:@localhost:5432/poultryco?sslmode=prefer';
const SESSION_BASE_PATH = './whatsapp-sessions';

async function fixAccounts() {
  const sql = postgres(DATABASE_URL);
  
  try {
    console.log('🔧 Fixing WhatsApp accounts...\n');
    
    // Get all accounts
    const accounts = await sql`
      SELECT id, account_name, status, session_storage_path
      FROM mkt_wap_accounts
      ORDER BY created_at DESC
    `;
    
    for (const account of accounts) {
      console.log(`\n📱 Processing: ${account.account_name} (${account.id})`);
      console.log(`   Current Status: ${account.status}`);
      
      // Check if session directory exists
      const sessionPath = account.session_storage_path || `${SESSION_BASE_PATH}/${account.id}`;
      const fullPath = path.resolve(sessionPath);
      
      console.log(`   Session Path: ${fullPath}`);
      
      if (fs.existsSync(fullPath)) {
        console.log(`   ✅ Session directory exists`);
        
        // Check for auth files
        const authPath = path.join(fullPath, '.wwebjs_auth');
        const cachePath = path.join(fullPath, '.wwebjs_cache');
        
        if (fs.existsSync(authPath)) {
          const authFiles = fs.readdirSync(authPath);
          console.log(`   ✅ Auth files found: ${authFiles.length} files`);
          
          // Check for lock files
          const lockFile = path.join(fullPath, 'session', 'SingletonLock');
          if (fs.existsSync(lockFile)) {
            console.log(`   ⚠️  Lock file exists, removing...`);
            try {
              fs.unlinkSync(lockFile);
              console.log(`   ✅ Lock file removed`);
            } catch (error) {
              console.log(`   ❌ Could not remove lock file: ${error.message}`);
            }
          }
        } else {
          console.log(`   ⚠️  No auth files found - account not authenticated`);
        }
        
        // Update session path in database if missing
        if (!account.session_storage_path) {
          await sql`
            UPDATE mkt_wap_accounts
            SET session_storage_path = ${sessionPath}
            WHERE id = ${account.id}
          `;
          console.log(`   💾 Updated session path in database`);
        }
        
        // If stuck in warming, reset to inactive
        if (account.status === 'warming') {
          const updated = await sql`
            UPDATE mkt_wap_accounts
            SET status = 'inactive',
                updated_at = NOW()
            WHERE id = ${account.id}
            RETURNING *
          `;
          console.log(`   🔄 Reset status from "warming" to "inactive"`);
        }
      } else {
        console.log(`   ⚠️  Session directory does not exist`);
      }
    }
    
    console.log('\n✅ Account fix completed!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

fixAccounts();

