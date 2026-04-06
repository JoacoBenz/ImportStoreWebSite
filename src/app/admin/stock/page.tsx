"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import type { ParsedProduct } from "@/types";

export default function StockPage() {
  const [rawMessage, setRawMessage] = useState("");
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [parsing, setParsing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  async function handleParse() {
    if (!rawMessage.trim()) {
      toast("Ingresá el mensaje de la proveedora", "error");
      return;
    }

    setParsing(true);
    try {
      const res = await fetch("/api/stock/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_message: rawMessage }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || "Error al parsear", "error");
        return;
      }

      setParsedProducts(data.products);
      setShowPreview(true);
      toast(`Se encontraron ${data.products.length} productos`, "success");
    } catch {
      toast("Error de conexión", "error");
    } finally {
      setParsing(false);
    }
  }

  async function handleApply(action: "replace" | "add") {
    setApplying(true);
    try {
      const res = await fetch("/api/stock/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: parsedProducts,
          action,
          raw_message: rawMessage,
          source: "admin_panel",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || "Error al aplicar", "error");
        return;
      }

      toast(
        `Stock actualizado: ${data.products_created} creados, ${data.products_updated} actualizados, ${data.products_deactivated} desactivados`,
        "success"
      );

      // Reset
      setRawMessage("");
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

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-text-primary mb-6">
        Cargar Stock
      </h1>

      {/* Input area */}
      <div className="bg-surface-primary rounded-2xl border border-brand-ice p-6 mb-6">
        <Textarea
          label="Mensaje de la proveedora"
          placeholder="Pegá acá el mensaje con el listado de productos, precios y cantidades..."
          value={rawMessage}
          onChange={(e) => setRawMessage(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={handleParse} isLoading={parsing} size="lg">
            Analizar con IA
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

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-brand-ice">
            <Button
              onClick={() => handleApply("replace")}
              isLoading={applying}
              variant="danger"
              size="lg"
              className="flex-1"
            >
              Reemplazar stock completo
            </Button>
            <Button
              onClick={() => handleApply("add")}
              isLoading={applying}
              variant="primary"
              size="lg"
              className="flex-1"
            >
              Agregar al stock existente
            </Button>
          </div>

          <p className="text-xs text-text-muted mt-3">
            <strong>Reemplazar:</strong> desactiva todos los productos actuales
            y carga los nuevos. <strong>Agregar:</strong> suma stock a los
            existentes y crea los nuevos.
          </p>
        </div>
      )}
    </div>
  );
}
