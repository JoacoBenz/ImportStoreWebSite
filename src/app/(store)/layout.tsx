export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { StoreFooter } from "@/components/store/store-footer";
import { WhatsAppFab } from "@/components/store/whatsapp-fab";
import type { Config } from "@/types";

async function getConfig(): Promise<Config | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("config")
      .select("*")
      .eq("id", 1)
      .single();
    return data as Config;
  } catch {
    return null;
  }
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getConfig();
  const storeName = config?.store_name || "Import Store Argentina";
  const whatsappNumber = config?.whatsapp_number || "";

  return (
    <div className="flex flex-col min-h-screen">
      {children}
      <StoreFooter
        storeName={storeName}
        whatsappNumber={whatsappNumber}
      />
      {whatsappNumber && <WhatsAppFab phoneNumber={whatsappNumber} />}
    </div>
  );
}
