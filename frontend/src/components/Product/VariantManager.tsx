// src/components/Product/VariantManager.tsx
import React, { useEffect, useState } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import styles from "../../styles/ProductForm.module.css";

interface VariantManagerProps {
  productId: number;
  categoryId?: number;
  basePrice: number;
}

export const VariantManager: React.FC<VariantManagerProps> = ({
  productId,
  basePrice,
}) => {
  const {
    attributes,
    variants,
    fetchAttributes,
    fetchVariants,
    createVariant,
    updateVariant,
    deleteVariant,
    updateVariantInventory,
  } = useAdminStore();

  useEffect(() => {
    fetchAttributes();
    fetchVariants(productId);
  }, [productId, fetchAttributes, fetchVariants]);

  const [sku, setSku] = useState("");
  const [price, setPrice] = useState(basePrice);
  const [quantity, setQuantity] = useState(10);
  const [trackStock, setTrackStock] = useState(true);
  const [selectedValues, setSelectedValues] = useState<Record<number, number>>({});

  // Inline edit state for an existing variant's own fields (sku/price)
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
  const [editSku, setEditSku] = useState("");
  const [editPrice, setEditPrice] = useState<number | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim()) return;

    const payload = {
      sku: sku.trim(),
      price: Number(price),
      quantity: Number(quantity),
      track_stock: trackStock,
      attribute_value_ids: Object.values(selectedValues),
    };

    await createVariant(productId, payload);
    await fetchVariants(productId);

    setSku("");
    setSelectedValues({});
    setQuantity(10);
    setPrice(basePrice);
  };

  // Fixed: was calling updateVariant() (the general SKU/price/attributes
  // endpoint), which doesn't accept quantity/track_stock at all - the
  // request succeeded silently but never touched inventory. Stock changes
  // must go through the dedicated inventory endpoint.
  const handleStockUpdate = async (variantId: number, qty: number, track: boolean) => {
    await updateVariantInventory(variantId, track, Number(qty));
    await fetchVariants(productId);
  };

  const startEdit = (v: any) => {
    setEditingVariantId(v.id);
    setEditSku(v.sku);
    setEditPrice(v.price);
  };

  const cancelEdit = () => {
    setEditingVariantId(null);
    setEditSku("");
    setEditPrice(null);
  };

  const saveEdit = async (variantId: number) => {
    await updateVariant(variantId, {
      sku: editSku.trim() || undefined,
      price: editPrice,
    });
    await fetchVariants(productId);
    cancelEdit();
  };

  return (
    <div style={{ marginTop: "40px", borderTop: "2px solid #e5e7eb", paddingTop: "2px" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", margin: "20px 0" }}>
        Product Variants & Stock Inventory Control
      </h2>

      <form
        onSubmit={handleCreate}
        style={{
          display: "grid",
          gap: "16px",
          background: "#f9fafb",
          padding: "16px",
          borderRadius: "8px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div className={styles.group}>
            <label>Variant SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="E.g. TS-RED-XL"
              required
            />
          </div>

          <div className={styles.group}>
            <label>Price Variation ($)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
          </div>

          <div className={styles.group}>
            <label>Initial Stock Qty</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
              disabled={!trackStock}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "24px" }}>
            <input
              type="checkbox"
              id="track_stock"
              checked={trackStock}
              onChange={(e) => setTrackStock(e.target.checked)}
            />
            <label htmlFor="track_stock">Track Inventory</label>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {attributes.map((attr) => (
            <div key={attr.id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "12px", textTransform: "capitalize", fontWeight: "600" }}>
                {attr.name}
              </label>
              <select
                required
                value={selectedValues[attr.id] || ""}
                onChange={(e) =>
                  setSelectedValues({ ...selectedValues, [attr.id]: Number(e.target.value) })
                }
                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
              >
                <option value="">Choose Options</option>
                {attr.values?.map((val) => (
                  <option key={val.id} value={val.id}>
                    {val.value}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button
          type="submit"
          style={{
            background: "#4f46e5",
            color: "white",
            padding: "10px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            justifyContent: "center",
            width: "max-content",
          }}
        >
          <Plus size={16} /> Add Variant Combination
        </button>
      </form>

      <div style={{ marginTop: "24px" }}>
        <h3 style={{ fontWeight: "600", marginBottom: "12px" }}>Active Options</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr style={{ background: "#f3f4f6", textAlign: "left", fontSize: "13px" }}>
              <th style={{ padding: "12px" }}>SKU</th>
              <th style={{ padding: "12px" }}>Properties</th>
              <th style={{ padding: "12px" }}>Price</th>
              <th style={{ padding: "12px" }}>Available Stock</th>
              <th style={{ padding: "12px" }}>Reserved (Checkout Lock)</th>
              <th style={{ padding: "12px" }}>Track Settings</th>
              <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v: any) => {
              const isEditing = editingVariantId === v.id;

              return (
                <tr key={v.id} style={{ borderBottom: "1px solid #e5e7eb", fontSize: "14px" }}>
                  <td style={{ padding: "12px", fontWeight: "500" }}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editSku}
                        onChange={(e) => setEditSku(e.target.value)}
                        style={{ width: "120px", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
                      />
                    ) : (
                      v.sku
                    )}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {v.attribute_values.map((av: any) => (
                      <span
                        key={av.value_id}
                        style={{
                          background: "#e0e7ff",
                          color: "#4338ca",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          marginRight: "4px",
                        }}
                      >
                        {av.attribute_name}: {av.value}
                      </span>
                    ))}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editPrice ?? ""}
                        onChange={(e) => setEditPrice(e.target.value ? Number(e.target.value) : null)}
                        style={{ width: "80px", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
                      />
                    ) : (
                      `$${Number(v.price).toFixed(2)}`
                    )}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <input
                      type="number"
                      defaultValue={v.inventory?.quantity ?? 0}
                      onBlur={(e) =>
                        handleStockUpdate(v.id, Number(e.target.value), v.inventory?.track_stock ?? true)
                      }
                      style={{ width: "70px", padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
                  </td>
                  <td style={{ padding: "12px", color: "#b45309" }}>
                    ⚠️ {v.inventory?.reserved ?? 0} items held
                  </td>
                  <td style={{ padding: "12px" }}>
                    <input
                      type="checkbox"
                      defaultChecked={v.inventory?.track_stock ?? true}
                      onChange={(e) =>
                        handleStockUpdate(v.id, v.inventory?.quantity ?? 0, e.target.checked)
                      }
                    />
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      {isEditing ? (
                        <>
                          <button type="button" onClick={() => saveEdit(v.id)} style={{ color: "#16a34a" }} title="Save">
                            <Check size={16} />
                          </button>
                          <button type="button" onClick={cancelEdit} style={{ color: "#6b7280" }} title="Cancel">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startEdit(v)} style={{ color: "#4f46e5" }} title="Edit SKU/Price">
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteVariant(v.id);
                              await fetchVariants(productId);
                            }}
                            style={{ color: "#ef4444" }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VariantManager;