module.exports = ({ env }) => ({
  locales: ['ru'],
  defaultLocale: 'ru',
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
});
