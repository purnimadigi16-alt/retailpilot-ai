import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://retailpilot-ai-kohl.vercel.app";

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sales`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/inventory`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/purchases`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/suppliers`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/expenses`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ai-assistant`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/automations`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/portal`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/qa-matrix`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];
}
