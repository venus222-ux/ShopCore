import React, { useEffect, useState } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import dashStyles from "../../styles/AdminDashboard.module.css";
import { Plus, Trash2, Truck, Edit3, X } from "lucide-react";
import type { ShippingMethod } from "../../types";

const emptyForm = { name: "", description: "", price: "", is_active: true, sort_order: 0 };

const ShippingMethodsTab: React.FC = () => {
  const {
    shippingMethods,
    isLoadingShippingMethods,
    fetchShippingMethods,
    createShippingMethod,
    updateShippingMethod,
    deleteShippingMethod,
  } = useAdminStore();

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const startEdit = (method: ShippingMethod) => {
    setEditingId(method.id);
    setForm({
      name: method.name,
      description: method.description || "",
      price: String(method.price),
      is_active: method.is_active ?? true,
      sort_order: method.sort_order ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price.trim()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      is_active: form.is_active,
      sort_order: form.sort_order,
    };

    if (editingId) {
      updateShippingMethod(editingId, payload);
    } else {
      createShippingMethod(payload);
    }

    cancelEdit();
  };

  return (
    <div className={dashStyles.dashboardGrid}>
      <div className={dashStyles.inventorySection}>
        <div className={dashStyles.glassCard}>
          <div className={dashStyles.cardHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Truck className={dashStyles.statusOn} size={20} />
              <h3>Shipping Methods</h3>
            </div>
            <span className={dashStyles.catBadge}>{shippingMethods.length} Total</span>
          </div>

          <div className={dashStyles.tableArea}>
            {isLoadingShippingMethods ? (
              <div className={dashStyles.skeletonLoader}>
                <div className={dashStyles.spinner}></div>
                <span>Loading shipping methods...</span>
              </div>
            ) : shippingMethods.length === 0 ? (
              <div className={dashStyles.emptyState}>
                <Truck size={40} opacity={0.3} />
                <p>No shipping methods yet. Add one to sell physical products.</p>
              </div>
            ) : (
              <table className={dashStyles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingMethods.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <span className={dashStyles.primaryText}>{m.name}</span>
                        {m.description && (
                          <div className={dashStyles.secondaryText}>{m.description}</div>
                        )}
                      </td>
                      <td>${Number(m.price).toFixed(2)}</td>
                      <td>
                        {m.is_active ? (
                          <span className={dashStyles.statusOn}>Active</span>
                        ) : (
                          <span className={dashStyles.statusOff}>Inactive</span>
                        )}
                      </td>
                      <td className={dashStyles.actionsCell}>
                        <div className={dashStyles.actions}>
                          <button onClick={() => startEdit(m)} className={dashStyles.editBtn} title="Edit">
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => deleteShippingMethod(m.id)}
                            className={dashStyles.deleteBtn}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <aside className={dashStyles.sideControls}>
        <div className={dashStyles.glassCard}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3>{editingId ? "Edit Method" : "New Shipping Method"}</h3>
            {editingId && (
              <button onClick={cancelEdit} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={16} />
              </button>
            )}
          </div>
          <p className={dashStyles.secondaryText} style={{ marginBottom: "1rem" }}>
            e.g. "Standard Shipping" at $5.00, or "Express" at $15.00.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input
              className={dashStyles.formInput}
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border, #e5e7eb)" }}
            />
            <input
              className={dashStyles.formInput}
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border, #e5e7eb)" }}
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border, #e5e7eb)" }}
            />
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
              <span className={dashStyles.secondaryText}>Active (selectable at checkout)</span>
            </label>

            <button type="submit" className={dashStyles.addSmallBtn}>
              <Plus size={16} /> {editingId ? "Save Changes" : "Create Method"}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
};

export default ShippingMethodsTab;
