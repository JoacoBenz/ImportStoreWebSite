import { createAdminClient } from "@/lib/supabase/admin";
import type { Config } from "@/types";

export async function getConfig(): Promise<Config> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("config")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) throw new Error(`Error al obtener configuración: ${error.message}`);
  return data as Config;
}

export async function updateConfig(
  updates: Partial<Omit<Config, "id" | "updated_at">>
): Promise<Config> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("config")
    .update(updates)
    .eq("id", 1)
    .select()
    .single();

  if (error) throw new Error(`Error al actualizar configuración: ${error.message}`);
  return data as Config;
}
