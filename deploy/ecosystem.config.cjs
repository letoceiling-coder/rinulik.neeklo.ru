/**
 * PM2: cd /var/www/rinulik-build && pm2 start deploy/ecosystem.config.cjs
 * Логи: pm2 logs generate-ai-video
 */
module.exports = {
  apps: [
    {
      name: 'generate-ai-video',
      cwd: '/var/www/rinulik-build',
      script: 'dist-server/index.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 4010,
      },
    },
  ],
}
