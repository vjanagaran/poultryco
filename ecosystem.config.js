// PM2 Ecosystem Configuration for PoultryCo
// Manages web, admin, and API applications

module.exports = {
  apps: [
    {
      name: 'poultryco-web',
      script: 'npm',
      args: 'start',
      cwd: '/home/ubuntu/poultryco/apps/web',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://api.poultryco.net/v1',
      },
      error_file: '/home/ubuntu/poultryco/logs/web-error.log',
      out_file: '/home/ubuntu/poultryco/logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
    },
    {
      name: 'poultryco-admin',
      script: 'npm',
      args: 'run start',
      cwd: '/home/ubuntu/poultryco/apps/admin',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXT_PUBLIC_API_URL: 'https://api.poultryco.net/v1',
      },
      error_file: '/home/ubuntu/poultryco/logs/admin-error.log',
      out_file: '/home/ubuntu/poultryco/logs/admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
    },
    {
      name: 'poultryco-api',
      script: '/home/ubuntu/poultryco/apps/api/start.sh',
      cwd: '/home/ubuntu/poultryco/apps/api',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        API_PREFIX: 'v1',
        CORS_ORIGIN: 'https://poultryco.net,https://www.poultryco.net,https://admin.poultryco.net,http://localhost:3000,http://localhost:3001',
        ADMIN_URL: 'https://admin.poultryco.net,http://localhost:3001,http://localhost:3000',
        PUPPETEER_EXECUTABLE_PATH: '/usr/bin/chromium-browser', // Ubuntu standard path
      },
      error_file: '/home/ubuntu/poultryco/logs/api-error.log',
      out_file: '/home/ubuntu/poultryco/logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      // Increase memory limit for WhatsApp/Chromium
      max_memory_restart: '2G',
    },
  ],
};

