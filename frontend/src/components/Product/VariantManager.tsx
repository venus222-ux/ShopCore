// src/components/Product/VariantManager.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import { Plus, Trash2, Pencil, Check, X, Image as ImageIcon, ChevronDown, ChevronRight } from "lucide-react";
import styles from "../../styles/ProductForm.module.css";

interface VariantManagerProps {
  productId: number;
  categoryId?: number;
  basePrice: number;
}

interface ColorGroup {
  valueId: number;
  valueLabel: string;
  attributeName: string;
  variants: any[];
  images: any[];
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
    uploadAttributeValueImagesForProduct,
    deleteAttributeValueImageForProduct,
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

  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
  const [editSku, setEditSku] = useState("");
  const [editPrice, setEditPrice] = useState<number | null>(null);

  const imageInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [uploadingValueId, setUploadingValueId] = useState<number | null>(null);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);

  // Collapsed groups (color sections start expanded; user can collapse)
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const variantList: any[] = variants as any[];

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

  const handleImagesSelected = async (valueId: number, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    setUploadingValueId(valueId);
    await uploadAttributeValueImagesForProduct(productId, valueId, files);
    setUploadingValueId(null);
  };

  const handleDeleteImage = async (valueId: number, mediaId: number) => {
    const key = valueId + "-" + mediaId;
    setDeletingImage(key);
    await deleteAttributeValueImageForProduct(productId, valueId, mediaId);
    setDeletingImage(null);
  };

  /**
   * Group every variant under its "primary visual attribute" value - in
   * practice, whichever attribute the variant carries that already has
   * (or is the natural place to attach) images, typically Color. Every
   * variant sharing that value across all Sizes nests under one card, so
   * uploading a photo once applies to the whole group -
   * uploadAttributeValueImagesForProduct(productId, colorValueId, files)
   * updates every variant in that group via the fetchVariants() refresh.
   *
   * Preference order for picking the grouping value on a given variant:
   * 1. An attribute value that already carries images (so an existing
   *    group stays intact even if attribute order changes).
   * 2. Otherwise, an attribute value whose attribute name looks like a
   *    "visual" one (color/colour/finish) - covers brand-new groups
   *    before any image has been uploaded yet.
   * 3. Otherwise, the first attribute value at all - guarantees every
   *    variant lands in exactly one group.
   */
  const colorGroups = useMemo(() => {
    const groups = new Map<number, ColorGroup>();
    const ungrouped: any[] = [];

    const visualNamePattern = /colou?r|finish|shade/i;

    for (const v of variantList) {
      const attrValues: any[] = v.attribute_values || [];

      const withImages = attrValues.find((av: any) => av.images && av.images.length > 0);
      const visualNamed = attrValues.find((av: any) => visualNamePattern.test(av.attribute_name || ""));
      const groupingValue = withImages || visualNamed || attrValues[0];

      if (!groupingValue) {
        ungrouped.push(v);
        continue;
      }

      let group = groups.get(groupingValue.value_id);

      if (!group) {
        group = {
          valueId: groupingValue.value_id,
          valueLabel: groupingValue.value,
          attributeName: groupingValue.attribute_name,
          variants: [],
          images: groupingValue.images || [],
        };
        groups.set(groupingValue.value_id, group);
      }

      group.variants.push(v);

      if (group.images.length === 0 && groupingValue.images && groupingValue.images.length > 0) {
        group.images = groupingValue.images;
      }
    }

    return { groups: Array.from(groups.values()), ungrouped };
  }, [variantList]);

  const toggleCollapsed = (valueId: number) => {
    setCollapsed((prev) => ({ ...prev, [valueId]: !prev[valueId] }));
  };

  const renderVariantRow = (v: any) => {
    const isEditing = editingVariantId === v.id;
    // Show every attribute value except the one used for grouping (Color) -
    // that's already the section header, no need to repeat it per row.
    const nonGroupingAttrs: any[] = (v.attribute_values || []).slice(1);

    return (
      <div key={v.id} className={styles.sizeRow}>
        <div className={styles.sizeRowMain}>
          {isEditing ? (
            <input
              type="text"
              value={editSku}
              onChange={(e) => setEditSku(e.target.value)}
              className={styles.sizeRowSkuInput}
            />
          ) : (
            <span className={styles.sizeRowSku}>{v.sku}</span>
          )}

          <span className={styles.sizeRowProps}>
            {nonGroupingAttrs.map((av: any) => av.attribute_name + ": " + av.value).join(" · ")}
          </span>
        </div>

        <div className={styles.sizeRowStats}>
          <div className={styles.sizeRowStat}>
            <span className={styles.sizeRowStatLabel}>Price</span>
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                value={editPrice ?? ""}
                onChange={(e) => setEditPrice(e.target.value ? Number(e.target.value) : null)}
                className={styles.sizeRowSmallInput}
              />
            ) : (
              <strong>${Number(v.price).toFixed(2)}</strong>
            )}
          </div>

          <div className={styles.sizeRowStat}>
            <span className={styles.sizeRowStatLabel}>Stock</span>
            <input
              type="number"
              defaultValue={v.inventory?.quantity ?? 0}
              onBlur={(e) =>
                handleStockUpdate(v.id, Number(e.target.value), v.inventory?.track_stock ?? true)
              }
              className={styles.sizeRowSmallInput}
            />
          </div>

          <div className={styles.sizeRowStat}>
            <span className={styles.sizeRowStatLabel}>Track</span>
            <input
              type="checkbox"
              defaultChecked={v.inventory?.track_stock ?? true}
              onChange={(e) =>
                handleStockUpdate(v.id, v.inventory?.quantity ?? 0, e.target.checked)
              }
            />
          </div>

          {(v.inventory?.reserved ?? 0) > 0 && (
            <span className={styles.sizeRowReserved}>
              ⚠️ {v.inventory.reserved} held
            </span>
          )}

          <div className={styles.sizeRowActions}>
            {isEditing ? (
              <>
                <button type="button" onClick={() => saveEdit(v.id)} title="Save" className={styles.iconBtnGreen}>
                  <Check size={14} />
                </button>
                <button type="button" onClick={cancelEdit} title="Cancel" className={styles.iconBtnGray}>
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => startEdit(v)} title="Edit SKU/Price" className={styles.iconBtnIndigo}>
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteVariant(v.id);
                    await fetchVariants(productId);
                  }}
                  title="Delete"
                  className={styles.iconBtnRed}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
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
              placeholder="E.g. BELT-BLK-90"
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

      <div style={{ marginTop: "28px" }}>
        <h3 style={{ fontWeight: "600", marginBottom: "6px" }}>Active Options</h3>
        <p style={{ fontSize: "12px", color: "#6b7280", marginTop: 0, marginBottom: "16px" }}>
          Upload once per color — every size in that group shows the same
          photos automatically. Scoped to this product only.
        </p>

        <div className={styles.colorGroupList}>
          {colorGroups.groups.map((group) => {
            const isUploading = uploadingValueId === group.valueId;
            const isCollapsed = !!collapsed[group.valueId];

            return (
              <div key={group.valueId} className={styles.colorGroupCard}>
                <div className={styles.colorGroupHeader}>
                  <button
                    type="button"
                    className={styles.colorGroupToggle}
                    onClick={() => toggleCollapsed(group.valueId)}
                  >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    <strong>
                      {group.attributeName}: {group.valueLabel}
                    </strong>
                    <span className={styles.colorGroupCount}>
                      {group.variants.length} size{group.variants.length === 1 ? "" : "s"}
                    </span>
                  </button>
                </div>

                <div className={styles.colorGroupImagesRow}>
                  <div className={styles.colorGroupThumbs}>
                    {group.images.length === 0 && (
                      <span className={styles.variantCardMuted}>No image yet</span>
                    )}
                    {group.images.map((img: any) => {
                      const key = group.valueId + "-" + img.id;
                      return (
                        <div key={img.id} className={styles.variantImageThumb}>
                          <img src={img.url} alt={group.valueLabel} />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(group.valueId, img.id)}
                            disabled={deletingImage === key}
                            className={styles.variantImageDelete}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => imageInputRefs.current[group.valueId]?.click()}
                    disabled={isUploading}
                    className={styles.colorGroupUploadBtn}
                  >
                    <ImageIcon size={13} />
                    {isUploading ? "Uploading..." : "Upload images"}
                  </button>
                  <input
                    ref={(el) => (imageInputRefs.current[group.valueId] = el)}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => {
                      handleImagesSelected(group.valueId, e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>

                {!isCollapsed && (
                  <div className={styles.sizeRowList}>
                    {group.variants.map((v) => renderVariantRow(v))}
                  </div>
                )}
              </div>
            );
          })}

          {colorGroups.ungrouped.length > 0 && (
            <div className={styles.colorGroupCard}>
              <div className={styles.colorGroupHeader}>
                <strong>Ungrouped</strong>
              </div>
              <div className={styles.sizeRowList}>
                {colorGroups.ungrouped.map((v) => renderVariantRow(v))}
              </div>
            </div>
          )}

          {colorGroups.groups.length === 0 && colorGroups.ungrouped.length === 0 && (
            <p style={{ fontSize: "13px", color: "#9ca3af" }}>
              No variants yet — add one using the form above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VariantManager;