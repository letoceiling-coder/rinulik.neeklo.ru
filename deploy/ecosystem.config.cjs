/**
 * PM2: cd /var/www/generate-al-video && pm2 start deploy/ecosystem.config.cjs
 * Логи: pm2 logs generate-ai-video
 */
module.exports = {
  apps: [
    {
      name: 'generate-ai-video',
      cwd: '/var/www/generate-al-video',
      script: 'dist-server/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 4010,
      },
    },
  ],
}
