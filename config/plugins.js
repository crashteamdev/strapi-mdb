module.exports = ({ env }) => ({
  i18n: true,
  'users-permissions': true,

  graphql: {
    enabled: false,
    config: {
      v4CompatibilityMode: true,
    },
  },
  seo: {
      enabled: true,
  },
});


