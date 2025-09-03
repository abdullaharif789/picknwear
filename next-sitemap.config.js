/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl:
    process.env.SITE_URL ||
    "https://picknwear-public-production.up.railway.app",
  generateRobotsTxt: true,
};
