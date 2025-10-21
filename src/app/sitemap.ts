import { MetadataRoute } from 'next';

type SitemapEntry = {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
};

/**
 * Generates dynamic sitemap for the website
 * This will be available at /sitemap.xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  const supportedLanguages = (process.env.NEXT_PUBLIC_SUPPORTED_CULTURES || 'en,ar')
    .split(',')
    .map((lang) => lang.trim().toLowerCase());

  const entries: SitemapEntry[] = [];

  // Add homepage for each language
  supportedLanguages.forEach((lang) => {
    entries.push({
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    });
  });

  // Add common static pages (customize based on your actual pages)
  const staticPages = [
    { path: 'about', priority: 0.8 },
    { path: 'contact', priority: 0.8 },
    { path: 'careers', priority: 0.7 },
    { path: 'faq', priority: 0.6 },
    { path: 'privacy-policy', priority: 0.5 },
    { path: 'terms-conditions', priority: 0.5 },
  ];

  staticPages.forEach((page) => {
    supportedLanguages.forEach((lang) => {
      entries.push({
        url: `${baseUrl}/${lang}/${page.path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page.priority,
      });
    });
  });

  // TODO: Fetch dynamic pages from Sitefinity CMS
  // You can extend this to fetch all published pages from Sitefinity
  // Example:
  // const dynamicPages = await fetchSitefinityPages();
  // dynamicPages.forEach(page => {
  //   entries.push({
  //     url: `${baseUrl}/${page.culture}/${page.urlName}`,
  //     lastModified: page.lastModified,
  //     changeFrequency: 'weekly',
  //     priority: 0.6,
  //   });
  // });

  return entries;
}

