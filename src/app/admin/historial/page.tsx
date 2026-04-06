"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import type { StockHistory } from "@/types";

export default function HistorialPage() {
  const [history, setHistory] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stock/history")
      .then((res) => res.json())
      .then((data) => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-text-primary mb-6">
        Historial de cargas
      </h1>

      {history.length === 0 ? (
        <EmptyState
          title="Sin historial"
          description="Todavía no se realizaron cargas de stock."
        />
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="bg-surface-primary rounded-2xl border border-brand-ice overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === entry.id ? null : entry.id)
                }
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-surface-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium text-text-primary">
                    {new Date(entry.created_at).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <Badge
                    variant={
                      entry.source === "whatsapp" ? "success" : "info"
                    }
                  >
                    {entry.source === "whatsapp" ? "WhatsApp" : "Panel"}
                  </Badge>
                  <Badge
                    variant={
                      entry.action === "replace" ? "warning" : "success"
                    }
                  >
                    {entry.action === "replace" ? "Reemplazar" : "Agregar"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span>+{entry.products_created}</span>
                  <span>~{entry.products_updated}</span>
                  <span>-{entry.products_deactivated}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      expandedId === entry.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {expandedId === entry.id && (
                <div className="px-5 pb-4 border-t border-brand-ice">
                  <div className="mt-4">
                    <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">
                      Mensaje original
                    </p>
                    <pre className="bg-surface-secondary rounded-xl p-3 text-xs text-text-secondary whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                      {entry.raw_message}
                    </pre>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">
                      Productos parseados ({entry.parsed_products.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {entry.parsed_products.map((p, i) => (
                        <div
                          key={i}
                          className="bg-surface-secondary rounded-xl p-3 text-sm"
                        >
                          <p className="font-medium text-text-primary">
                            {p.name}
                          </p>
                          <p className="text-text-secondary">
                            USD {p.price_usd} · Stock: {p.stock} ·{" "}
                            {p.category}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
