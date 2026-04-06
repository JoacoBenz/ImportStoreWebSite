import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const admin = createAdminClient();

  const [productsRes, configRes, historyRes] = await Promise.all([
    admin.from("products").select("id, is_active, stock", { count: "exact" }),
    admin.from("config").select("*").eq("id", 1).single(),
    admin
      .from("stock_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const products = productsRes.data || [];
  const config = configRes.data;
  const history = historyRes.data || [];

  const activeProducts = products.filter((p) => p.is_active).length;
  const totalStock = products
    .filter((p) => p.is_active)
    .reduce((sum, p) => sum + p.stock, 0);

  const stats = [
    {
      label: "Productos activos",
      value: activeProducts,
      color: "border-brand-teal",
    },
    {
      label: "Cotización USD",
      value: `$${config?.exchange_rate?.toLocaleString("es-AR") || "—"}`,
      color: "border-brand-coral",
    },
    {
      label: "Unidades en stock",
      value: totalStock,
      color: "border-brand-gold",
    },
    {
      label: "Cargas de stock",
      value: history.length,
      color: "border-brand-pink",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-text-primary mb-6">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-surface-primary rounded-2xl border border-brand-ice p-5 border-l-4 ${stat.color}`}
          >
            <p className="text-sm text-text-secondary">{stat.label}</p>
            <p className="text-2xl font-bold font-heading text-text-primary mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/admin/stock"
          className="flex items-center gap-4 bg-brand-teal text-white rounded-2xl p-5 hover:bg-brand-teal-dark transition-colors"
        >
          <svg className="w-8 h-8 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div>
            <p className="font-semibold font-heading">Cargar Stock</p>
            <p className="text-sm text-white/70">
              Pegá el mensaje de la proveedora
            </p>
          </div>
        </Link>
        <Link
          href="/admin/productos"
          className="flex items-center gap-4 bg-surface-primary border border-brand-ice text-text-primary rounded-2xl p-5 hover:border-brand-teal transition-colors"
        >
          <svg className="w-8 h-8 shrink-0 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <div>
            <p className="font-semibold font-heading">Agregar Producto</p>
            <p className="text-sm text-text-secondary">
              Crear producto manualmente
            </p>
          </div>
        </Link>
      </div>

      {/* Recent history */}
      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold font-heading text-text-primary mb-4">
            Últimas cargas de stock
          </h2>
          <div className="bg-surface-primary rounded-2xl border border-brand-ice overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-secondary">
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    Fecha
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    Fuente
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">
                    Acción
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-text-secondary">
                    Productos
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-brand-ice">
                    <td className="px-4 py-3 text-text-primary">
                      {new Date(h.created_at).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          h.source === "whatsapp"
                            ? "bg-green-100 text-green-700"
                            : "bg-brand-ice/50 text-brand-teal"
                        }`}
                      >
                        {h.source === "whatsapp" ? "WhatsApp" : "Panel"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {h.action === "replace" ? "Reemplazar" : "Agregar"}
                    </td>
                    <td className="px-4 py-3 text-right text-text-primary">
                      +{h.products_created} / ~{h.products_updated} / -{h.products_deactivated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
