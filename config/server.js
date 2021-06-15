module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  /*admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
  },*/
  url: 'http://cesarvega.com.mx/api',
  admin: {
    url: 'http://cesarvega.com.mx/dashboard',
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
  }
});
