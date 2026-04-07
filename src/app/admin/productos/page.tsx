"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import type { Product } from "@/types";

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [showInactive, setShowInactive] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (!showInactive) params.set("active", "true");
      else params.set("active", "false");
      if (search) params.set("q", search);
      if (categoryFilter !== "todos") params.set("category", categoryFilter);

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      toast("Error al cargar productos", "error");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, showInactive, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (editingProduct.id) formData.append("productId", editingProduct.id);

      const res = await fetch("/api/products/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || "Error al subir imagen", "error");
        return;
      }

      setEditingProduct({ ...editingProduct, image_url: data.url });
      toast("Imagen subida", "success");
    } catch {
      toast("Error al subir imagen", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!editingProduct) return;
    setSaving(true);

    try {
      const isNew = !editingProduct.id;
      const url = isNew
        ? "/api/products"
        : `/api/products/${editingProduct.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingProduct.name,
          description: editingProduct.description,
          category: editingProduct.category,
          price_usd: editingProduct.price_usd,
          stock: editingProduct.stock,
          is_active: editingProduct.is_active,
          image_url: editingProduct.image_url,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Error al guardar", "error");
        return;
      }

      toast(
        isNew ? "Producto creado" : "Producto actualizado",
        "success"
      );
      setShowModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch {
      toast("Error de conexión", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(product: Product) {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !product.is_active }),
      });
      fetchProducts();
      toast(
        product.is_active ? "Producto desactivado" : "Producto activado",
        "success"
      );
    } catch {
      toast("Error al actualizar", "error");
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`¿Eliminar "${product.name}" definitivamente?`)) return;

    try {
      await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      fetchProducts();
      toast("Producto eliminado", "success");
    } catch {
      toast("Error al eliminar", "error");
    }
  }

  function openNew() {
    setEditingProduct({
      id: "",
      name: "",
      description: null,
      category: "celulares",
      price_usd: 0,
      stock: 1,
      image_url: null,
      is_active: true,
      created_at: "",
      updated_at: "",
    });
    setShowModal(true);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold font-heading text-text-primary">
          Productos
        </h1>
        <Button onClick={openNew}>+ Nuevo producto</Button>
      </div>

      {/* Filters */}
      <div className="bg-surface-primary rounded-2xl border border-brand-ice p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-brand-ice bg-surface-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
          >
            <option value="todos">Todas las categorías</option>
            <option value="accesorios">Accesorios</option>
            <option value="auriculares">Auriculares</option>
            <option value="cables">Cables</option>
            <option value="cargadores">Cargadores</option>
            <option value="celulares">Celulares</option>
            <option value="gamer">Gamer</option>
            <option value="notebooks">Notebooks</option>
            <option value="otros">Otros</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded accent-brand-teal"
            />
            Mostrar inactivos
          </label>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="Sin productos"
          description="No se encontraron productos con los filtros actuales."
          action={<Button onClick={openNew}>Crear producto</Button>}
        />
      ) : (
        <div className="bg-surface-primary rounded-2xl border border-brand-ice overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-secondary">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  Nombre
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  Categoría
                </th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">
                  USD
                </th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">
                  Stock
                </th>
                <th className="text-center px-4 py-3 font-medium text-text-secondary">
                  Estado
                </th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-brand-ice hover:bg-surface-secondary/50 transition-colors"
                >
                  <td className="px-4 py-3 text-text-primary font-medium">
                    {product.name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="default">{product.category}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-text-primary">
                    ${product.price_usd}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        product.stock <= 3
                          ? "text-brand-coral font-medium"
                          : "text-text-primary"
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={product.is_active ? "success" : "danger"}
                    >
                      {product.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowModal(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-surface-secondary text-text-muted hover:text-brand-teal transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleActive(product)}
                        className="p-1.5 rounded-lg hover:bg-surface-secondary text-text-muted hover:text-brand-gold transition-colors"
                        title={product.is_active ? "Desactivar" : "Activar"}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={product.is_active ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878l4.242 4.242M21 21l-4.35-4.35" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-1.5 rounded-lg hover:bg-surface-secondary text-text-muted hover:text-brand-coral transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit/Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        title={editingProduct?.id ? "Editar producto" : "Nuevo producto"}
      >
        {editingProduct && (
          <div className="space-y-4">
            <Input
              label="Nombre"
              value={editingProduct.name}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, name: e.target.value })
              }
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">
                Categoría
              </label>
              <select
                value={editingProduct.category}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    category: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-brand-ice bg-surface-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
              >
                <option value="accesorios">Accesorios</option>
                <option value="auriculares">Auriculares</option>
                <option value="cables">Cables</option>
                <option value="cargadores">Cargadores</option>
                <option value="celulares">Celulares</option>
                <option value="gamer">Gamer</option>
                <option value="notebooks">Notebooks</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Precio USD"
                type="number"
                step="0.01"
                value={editingProduct.price_usd}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    price_usd: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <Input
                label="Stock"
                type="number"
                value={editingProduct.stock}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <Input
              label="Descripción"
              value={editingProduct.description || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  description: e.target.value || null,
                })
              }
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">
                Imagen
              </label>
              {editingProduct.image_url ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-surface-secondary border border-brand-ice">
                  <img
                    src={editingProduct.image_url}
                    alt={editingProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEditingProduct({ ...editingProduct, image_url: null })
                    }
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-brand-navy/60 text-white hover:bg-brand-navy/80 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-brand-ice hover:border-brand-teal cursor-pointer transition-colors bg-surface-secondary">
                  {uploading ? (
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <svg className="animate-spin h-5 w-5 text-brand-teal" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Subiendo...
                    </div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-text-muted mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm text-text-muted">
                        Click para subir imagen
                      </span>
                      <span className="text-xs text-text-muted/60 mt-0.5">
                        JPG, PNG o WebP (máx 5MB)
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editingProduct.is_active}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    is_active: e.target.checked,
                  })
                }
                className="rounded accent-brand-teal"
              />
              Producto activo
            </label>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                }}
                variant="ghost"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                isLoading={saving}
                className="flex-1"
              >
                Guardar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
