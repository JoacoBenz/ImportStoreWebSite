export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://importstore.com.ar";

  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, updated_at")
    .eq("is_active", true);

  const productUrls: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${baseUrl}/producto/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...productUrls,
  ];
}
