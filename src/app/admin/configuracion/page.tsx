"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import type { Config } from "@/types";

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch(() => {
        toast("Error al cargar configuración", "error");
        setLoading(false);
      });
  }, [toast]);

  async function handleSave() {
    if (!config) return;
    setSaving(true);

    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp_number: config.whatsapp_number,
          store_name: config.store_name,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Error al guardar", "error");
        return;
      }

      toast("Configuración guardada", "success");
    } catch {
      toast("Error de conexión", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!config) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-text-primary mb-6">
        Configuración
      </h1>

      <div className="max-w-xl space-y-6">
        <div className="bg-surface-primary rounded-2xl border border-brand-ice p-6 space-y-4">
          <h2 className="text-lg font-semibold font-heading text-text-primary">
            Tienda
          </h2>
          <Input
            label="Nombre de la tienda"
            value={config.store_name}
            onChange={(e) =>
              setConfig({ ...config, store_name: e.target.value })
            }
          />
          <Input
            label="Número de WhatsApp (con código de país)"
            value={config.whatsapp_number || ""}
            onChange={(e) =>
              setConfig({ ...config, whatsapp_number: e.target.value })
            }
            placeholder="+5491100000000"
          />
        </div>

        <Button onClick={handleSave} isLoading={saving} size="lg">
          Guardar configuración
        </Button>
      </div>
    </div>
  );
}
