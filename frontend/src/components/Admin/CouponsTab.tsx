import { useEffect, useState } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import { Plus, Trash2, Tag, X, Pencil } from "lucide-react";
import styles from "../../styles/OrdersTab.module.css";
import type { CouponFormData } from "../../types";

const emptyForm: CouponFormData = {
  code: "",
  type: "percent",
  value: 0,
  min_subtotal: null,
  usage_limit: null,
  is_active: true,
  starts_at: null,
  ends_at: null,
};

const CouponsTab = () => {
  const {
    coupons,
    isLoadingCoupons,
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponActive,
    couponsEnabledGlobally,
    fetchGlobalSettings,
    updateGlobalSettings,
  } = useAdminStore();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CouponFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCoupons();
    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchCoupons(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (coupon: any) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      min_subtotal: coupon.min_subtotal != null ? Number(coupon.min_subtotal) : null,
      usage_limit: coupon.usage_limit,
      is_active: !!coupon.is_active,
      starts_at: coupon.starts_at ? coupon.starts_at.slice(0, 10) : null,
      ends_at: coupon.ends_at ? coupon.ends_at.slice(0, 10) : null,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        await updateCoupon(editingId, form);
      } else {
        await createCoupon(form);
      }
      setFormOpen(false);
    } catch {
      // toast already shown by store
    } finally {
      setSaving(false);
    }
  };

  const isExpired = (coupon: any) => coupon.ends_at && new Date(coupon.ends_at) < new Date();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Coupons</h1>
          <p className={styles.subtitle}>Create and manage discount codes for checkout.</p>
        </div>
        <button onClick={openCreate} className={styles.refreshBtn}>
          <Plus size={15} /> New Coupon
        </button>
      </header>

      {/* Global switch - hides the coupon field entirely from Checkout */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <strong style={{ display: "block", fontSize: "0.9rem" }}>Enable coupons at checkout</strong>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
            When disabled, the coupon field is hidden entirely from Checkout, regardless of individual coupon status.
          </span>
        </div>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={couponsEnabledGlobally}
            onChange={(e) => updateGlobalSettings(e.target.checked)}
          />
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
            {couponsEnabledGlobally ? "Enabled" : "Disabled"}
          </span>
        </label>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search by code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Min. Subtotal</th>
              <th>Usage</th>
              <th>Expires</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingCoupons ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                  Loading...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  No coupons yet.
                </td>
              </tr>
            ) : (
              coupons.map((c: any) => (
                <tr key={c.id}>
                  <td className={styles.orderId}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Tag size={14} /> {c.code}
                    </span>
                  </td>
                  <td>
                    {c.type === "percent" ? `${Number(c.value)}%` : `$${Number(c.value).toFixed(2)}`}
                  </td>
                  <td>{c.min_subtotal ? `$${Number(c.min_subtotal).toFixed(2)}` : "—"}</td>
                  <td>
                    {c.used_count}
                    {c.usage_limit ? ` / ${c.usage_limit}` : ""}
                  </td>
                  <td>
                    {c.ends_at ? (
                      <span style={{ color: isExpired(c) ? "#dc2626" : "inherit" }}>
                        {new Date(c.ends_at).toLocaleDateString()}
                      </span>
                    ) : (
                      "Never"
                    )}
                  </td>
                  <td>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                      <input type="checkbox" checked={!!c.is_active} onChange={() => toggleCouponActive(c.id)} />
                      <span style={{ fontSize: "0.8rem" }}>
                        {isExpired(c) ? "Expired" : c.is_active ? "Active" : "Disabled"}
                      </span>
                    </label>
                  </td>
                  <td>
                    <div className={styles.actionGroup}>
                      <button className={styles.iconBtn} onClick={() => openEdit(c)} title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.releaseActionBtn}`}
                        onClick={() => deleteCoupon(c.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className={styles.modalOverlay} onClick={() => setFormOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingId ? "Edit Coupon" : "New Coupon"}</h3>
              <button className={styles.closeActionBtn} onClick={() => setFormOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.3rem" }}>Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER20"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem" }}>Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "fixed" })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem" }}>Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem" }}>
                    Min. Subtotal (optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.min_subtotal ?? ""}
                    onChange={(e) => setForm({ ...form, min_subtotal: e.target.value ? Number(e.target.value) : null })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem" }}>
                    Usage Limit (optional)
                  </label>
                  <input
                    type="number"
                    value={form.usage_limit ?? ""}
                    onChange={(e) => setForm({ ...form, usage_limit: e.target.value ? Number(e.target.value) : null })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem" }}>
                    Starts At (optional)
                  </label>
                  <input
                    type="date"
                    value={form.starts_at ?? ""}
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value || null })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem" }}>
                    Expires At (optional)
                  </label>
                  <input
                    type="date"
                    value={form.ends_at ?? ""}
                    onChange={(e) => setForm({ ...form, ends_at: e.target.value || null })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <span>Active</span>
              </label>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.completeActionBtn} onClick={handleSave} disabled={saving} style={{ width: "100%" }}>
                {saving ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsTab;