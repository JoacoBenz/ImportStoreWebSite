"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import type { ParsedProduct } from "@/types";

const PROMPT_TEXT = `Sos un asistente que parsea mensajes de stock de una proveedora de tecnología.
Extraé todos los productos del mensaje y devolvé SOLAMENTE un JSON array válido, sin markdown ni explicaciones.
Cada producto debe tener esta estructura:
{
  "name": "nombre del producto (normalizado, sin abreviaciones raras)",
  "category": "una de: auriculares, cargadores, cables, fundas, accesorios, otros",
  "price_usd": número decimal (precio en dólares),
  "stock": número entero (cantidad disponible, si no se especifica poner 1),
  "description": "descripción breve si hay info adicional, sino null"
}

Reglas:
- Normalizá los nombres: "auris bluetooth" -> "Auriculares Bluetooth"
- Si el precio dice "U$S", "USD", "dls" o similar, es dólares
- Si no se especifica cantidad, asumí stock = 1
- Intentá categorizar por el tipo de producto
- Si hay variantes (colores, tamaños), crealas como productos separados
- Devolvé SOLO el JSON array, sin backticks, sin explicación`;

export default function StockPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [applying, setApplying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const { toast } = useToast();

  function handleLoadJson() {
    if (!jsonInput.trim()) {
      toast("Pegá el JSON con los productos", "error");
      return;
    }

    try {
      // Limpiar posibles backticks o texto extra
      const cleaned = jsonInput
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const products: ParsedProduct[] = JSON.parse(cleaned);

      if (!Array.isArray(products) || products.length === 0) {
        toast("El JSON debe ser un array con al menos un producto", "error");
        return;
      }

      // Validar estructura básica
      for (const p of products) {
        if (!p.name || typeof p.price_usd !== "number") {
          toast("Cada producto debe tener al menos 'name' y 'price_usd'", "error");
          return;
        }
      }

      setParsedProducts(products);
      setShowPreview(true);
      toast(`Se cargaron ${products.length} productos`, "success");
    } catch {
      toast("JSON inválido. Revisá el formato y volvé a intentar.", "error");
    }
  }

  async function handleApply() {
    setApplying(true);
    try {
      const res = await fetch("/api/stock/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: parsedProducts,
          raw_message: jsonInput,
          source: "admin_panel",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || "Error al aplicar", "error");
        return;
      }

      toast(
        `Stock actualizado: ${data.products_created} creados, ${data.products_updated} actualizados`,
        "success"
      );

      // Reset
      setJsonInput("");
      setParsedProducts([]);
      setShowPreview(false);
    } catch {
      toast("Error de conexión", "error");
    } finally {
      setApplying(false);
    }
  }

  function updateProduct(index: number, field: keyof ParsedProduct, value: string | number) {
    setParsedProducts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function removeProduct(index: number) {
    setParsedProducts((prev) => prev.filter((_, i) => i !== index));
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(PROMPT_TEXT);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      toast("No se pudo copiar. Seleccioná el texto manualmente.", "error");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-text-primary mb-6">
        Cargar Stock
      </h1>

      {/* Instructions */}
      <div className="bg-brand-ice/20 rounded-2xl border border-brand-ice p-5 mb-6">
        <h2 className="font-heading font-semibold text-text-primary mb-2">
          Cómo cargar stock
        </h2>
        <ol className="text-sm text-text-secondary space-y-1.5 list-decimal list-inside">
          <li>Copiá el mensaje de la proveedora</li>
          <li>
            Pegalo en{" "}
            <a
              href="https://chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-teal underline"
            >
              ChatGPT
            </a>
            {" "}o{" "}
            <a
              href="https://claude.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-teal underline"
            >
              Claude
            </a>
            {" "}junto con el prompt de abajo
          </li>
          <li>Copiá el JSON que te devuelve y pegalo acá</li>
          <li>Revisá el preview y confirmá la carga</li>
        </ol>
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="mt-3 text-sm font-medium text-brand-teal hover:underline flex items-center gap-1"
        >
          {showPrompt ? "Ocultar" : "Ver"} prompt para la IA
          <svg
            className={`w-4 h-4 transition-transform ${showPrompt ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showPrompt && (
          <div className="mt-3">
            <div className="relative">
              <pre className="bg-surface-primary rounded-xl p-4 text-xs text-text-secondary whitespace-pre-wrap font-mono max-h-64 overflow-y-auto border border-brand-ice">
                {PROMPT_TEXT}
              </pre>
              <button
                onClick={copyPrompt}
                className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-brand-teal text-white text-xs font-medium hover:bg-brand-teal-dark transition-colors"
              >
                {copySuccess ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* JSON Input */}
      <div className="bg-surface-primary rounded-2xl border border-brand-ice p-6 mb-6">
        <Textarea
          label="JSON de productos"
          placeholder={'Pegá acá el JSON que te devolvió la IA, por ejemplo:\n[\n  {"name": "Auriculares Bluetooth", "category": "auriculares", "price_usd": 10, "stock": 5, "description": null}\n]'}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={handleLoadJson} size="lg">
            Cargar productos
          </Button>
        </div>
      </div>

      {/* Preview */}
      {showPreview && parsedProducts.length > 0 && (
        <div className="bg-surface-primary rounded-2xl border border-brand-ice p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-heading text-text-primary">
              Preview — {parsedProducts.length} productos
            </h2>
            <Badge variant="info">Editá los campos antes de confirmar</Badge>
          </div>

          {/* Products table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-secondary">
                  <th className="text-left px-3 py-2 font-medium text-text-secondary">
                    Nombre
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-text-secondary">
                    Categoría
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-text-secondary">
                    USD
                  </th>
                  <th className="text-right px-3 py-2 font-medium text-text-secondary">
                    Stock
                  </th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {parsedProducts.map((product, i) => (
                  <tr key={i} className="border-t border-brand-ice">
                    <td className="px-3 py-2">
                      <input
                        className="w-full bg-transparent border-b border-transparent hover:border-brand-ice focus:border-brand-teal focus:outline-none py-1 text-text-primary"
                        value={product.name}
                        onChange={(e) =>
                          updateProduct(i, "name", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className="bg-transparent border-b border-transparent hover:border-brand-ice focus:border-brand-teal focus:outline-none py-1 text-text-primary text-sm"
                        value={product.category}
                        onChange={(e) =>
                          updateProduct(i, "category", e.target.value)
                        }
                      >
                        <option value="auriculares">Auriculares</option>
                        <option value="cargadores">Cargadores</option>
                        <option value="cables">Cables</option>
                        <option value="fundas">Fundas</option>
                        <option value="accesorios">Accesorios</option>
                        <option value="otros">Otros</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        className="w-20 bg-transparent border-b border-transparent hover:border-brand-ice focus:border-brand-teal focus:outline-none py-1 text-right text-text-primary"
                        value={product.price_usd}
                        onChange={(e) =>
                          updateProduct(
                            i,
                            "price_usd",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        className="w-16 bg-transparent border-b border-transparent hover:border-brand-ice focus:border-brand-teal focus:outline-none py-1 text-right text-text-primary"
                        value={product.stock}
                        onChange={(e) =>
                          updateProduct(
                            i,
                            "stock",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => removeProduct(i)}
                        className="text-text-muted hover:text-brand-coral transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action button */}
          <div className="mt-6 pt-4 border-t border-brand-ice">
            <Button
              onClick={handleApply}
              isLoading={applying}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Confirmar carga de stock
            </Button>
          </div>

          <p className="text-xs text-text-muted mt-3">
            Si el producto ya existe (mismo nombre), se actualiza el precio y se
            suma el stock. Si es nuevo, se crea automáticamente.
          </p>
        </div>
      )}
    </div>
  );
}
