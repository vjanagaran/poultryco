/**
 * SIMPLE WHATSAPP TEST
 * 
 * This is the absolute minimal test to verify whatsapp-web.js works.
 * Run: node test-whatsapp-simple.js
 * 
 * If this works, the library is fine - the issue is in our NestJS integration.
 * If this fails, the issue is with the library setup itself.
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 Starting simple WhatsApp test...');
console.log('📦 Using whatsapp-web.js version:', require('whatsapp-web.js/package.json').version || 'unknown');

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './test-session',
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

// Set up ALL event handlers BEFORE initialize
client.on('qr', (qr) => {
  console.log('\n✅ QR Code received!');
  console.log('📱 Scan this QR code with WhatsApp:');
  qrcode.generate(qr, { small: true });
  console.log('\n⏳ Waiting for scan...');
});

client.on('ready', () => {
  console.log('\n✅✅✅ Client is READY!');
  const info = client.info;
  if (info && info.wid && info.wid.user) {
    console.log('📱 Phone number:', info.wid.user);
    console.log('👤 Push name:', info.pushname || 'N/A');
  }
  console.log('\n✅ Test PASSED - whatsapp-web.js is working!');
  process.exit(0);
});

client.on('authenticated', () => {
  console.log('\n✅ Authenticated - waiting for ready...');
});

client.on('auth_failure', (msg) => {
  console.error('\n❌ Auth failure:', msg);
  process.exit(1);
});

client.on('disconnected', (reason) => {
  console.error('\n❌ Disconnected:', reason);
  process.exit(1);
});

client.on('loading_screen', (percent, message) => {
  console.log(`📱 Loading: ${percent}% - ${message}`);
});

// Initialize
console.log('🔄 Initializing client...');
client.initialize().catch((error) => {
  console.error('\n❌ Initialization error:', error);
  process.exit(1);
});

// Timeout after 5 minutes
setTimeout(() => {
  console.error('\n⏰ Test timeout after 5 minutes');
  process.exit(1);
}, 5 * 60 * 1000);

