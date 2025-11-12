'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Seed sites if they don't exist
    try {
      const siteService = strapi.documents('api::site.site');
      
      // Check if sites already exist
      const existingSites = await siteService.findMany({
        filters: {
          slug: {
            $in: ['mdb', 'cb']
          }
        }
      });

      const existingSlugs = existingSites.map(s => s.slug);

      // Create mdb site if it doesn't exist
      if (!existingSlugs.includes('mdb')) {
        await siteService.create({
          data: {
            name: 'MarketDB',
            slug: 'mdb',
            domain: 'marketdb.pro',
            description: 'MarketDB blog - аналитика маркетплейсов'
          }
        });
        strapi.log.info('Created site: mdb');
      }

      // Create cb site if it doesn't exist
      if (!existingSlugs.includes('cb')) {
        await siteService.create({
          data: {
            name: 'ChainBrain Blog',
            slug: 'cb',
            domain: 'chainbrain.pro',
            description: 'ChainBrain blog - упрощаем жизнь с AI'
          }
        });
        strapi.log.info('Created site: cb');
      }

      // Backfill existing articles with mdb site
      const mdbSite = await siteService.findMany({
        filters: { slug: 'mdb' },
        limit: 1
      });

      if (mdbSite && mdbSite.length > 0) {
        const mdbSiteId = mdbSite[0].documentId;
        
        // Find articles without a site
        const articleService = strapi.documents('api::article.article');
        const articlesWithoutSite = await articleService.findMany({
          filters: {
            site: {
              $null: true
            }
          },
          status: 'published'
        });

        // Also check drafts
        const draftsWithoutSite = await articleService.findMany({
          filters: {
            site: {
              $null: true
            }
          },
          status: 'draft'
        });

        const allArticlesWithoutSite = [...articlesWithoutSite, ...draftsWithoutSite];

        if (allArticlesWithoutSite.length > 0) {
          strapi.log.info(`Backfilling ${allArticlesWithoutSite.length} articles with mdb site`);
          
          for (const article of allArticlesWithoutSite) {
            await articleService.update({
              documentId: article.documentId,
              data: {
                site: mdbSiteId
              }
            });
          }
          
          strapi.log.info('Backfill complete');
        }
      }
    } catch (error) {
      strapi.log.error('Error during bootstrap:', error);
    }
  },
};
