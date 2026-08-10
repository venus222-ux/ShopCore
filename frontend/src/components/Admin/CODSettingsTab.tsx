import { useEffect, useState } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import styles from "../../styles/OrdersTab.module.css";

const CODSettingsTab = () => {
  const { codEnabled, codMaxOrderValue, codFee, fetchCodSettings, updateCodSettings } = useAdminStore();

  const [enabled, setEnabled] = useState(true);
  const [maxValue, setMaxValue] = useState(500);
  const [fee, setFee] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCodSettings();
  }, []);

  useEffect(() => {
    setEnabled(codEnabled);
    setMaxValue(codMaxOrderValue);
    setFee(codFee);
  }, [codEnabled, codMaxOrderValue, codFee]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCodSettings({
        cod_enabled: enabled,
        cod_max_order_value: maxValue,
        cod_fee: fee,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Cash on Delivery</h1>
          <p className={styles.subtitle}>
            Configure whether customers can pay in cash upon delivery, and under what conditions.
          </p>
        </div>
      </header>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.5rem", maxWidth: 480 }}>
        <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          <span style={{ fontWeight: 600 }}>Enable Cash on Delivery</span>
        </label>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.85rem", color: "#475569" }}>
            Maximum order value eligible for COD ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={maxValue}
            onChange={(e) => setMaxValue(Number(e.target.value))}
            disabled={!enabled}
            style={{ width: "100%", padding: "0.55rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
          />
          <small style={{ color: "#94a3b8" }}>
            Protects against fraud on high-value uncollected deliveries.
          </small>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.85rem", color: "#475569" }}>
            Handling fee ($, optional)
          </label>
          <input
            type="number"
            step="0.01"
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
            disabled={!enabled}
            style={{ width: "100%", padding: "0.55rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={styles.completeActionBtn}
          style={{ width: "100%" }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default CODSettingsTab;