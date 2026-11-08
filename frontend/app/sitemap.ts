import { MetadataRoute } from "next";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANCHES } from "@/components/mockData";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vehiclehub.com.kh";
  const now = new Date();

  // 1. Core Primary Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sitemap`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#loan-calculator`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#trade-in`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#color-studio-360`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#ai-consultant-vibol`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // 2. Vehicle Categories
  const categoryRoutes: MetadataRoute.Sitemap = MOCK_CATEGORIES.map((cat) => ({
    url: `${baseUrl}/?category=${encodeURIComponent(cat.slug)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // 3. Automotive Brands
  const uniqueBrands = Array.from(new Set(MOCK_PRODUCTS.map((p) => p.brand).filter(Boolean)));
  const brandRoutes: MetadataRoute.Sitemap = uniqueBrands.map((brand) => ({
    url: `${baseUrl}/?brand=${encodeURIComponent(brand.toLowerCase())}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // 4. All Vehicle Models & Inventory Items
  const productRoutes: MetadataRoute.Sitemap = MOCK_PRODUCTS.map((prod) => ({
    url: `${baseUrl}/?model=${encodeURIComponent((prod.model || prod.name).toLowerCase().replace(/\s+/g, "-"))}&id=${prod.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 5. Showroom Branches
  const branchRoutes: MetadataRoute.Sitemap = MOCK_BRANCHES.map((branch) => ({
    url: `${baseUrl}/?branch=${encodeURIComponent(branch.code.toLowerCase())}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  // 6. Policy & Compliance
  const legalRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/#privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/#terms-of-service`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/#khqr-payment-guidelines`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...brandRoutes,
    ...productRoutes,
    ...branchRoutes,
    ...legalRoutes,
  ];
}
