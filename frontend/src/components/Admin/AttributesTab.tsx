import React, { useEffect, useState } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import dashStyles from "../../styles/AdminDashboard.module.css";
import { Plus, Trash2, ChevronDown, ChevronRight, Tag } from "lucide-react";
import type { Attribute } from "../../types";

const AttributesTab: React.FC = () => {
  const {
    attributes,
    isLoadingAttributes,
    fetchAttributes,
    createAttribute,
    deleteAttribute,
    createAttributeValue,
    deleteAttributeValue,
  } = useAdminStore();

  useEffect(() => {
    fetchAttributes();
  }, []);

  const [name, setName] = useState("");
  const [type, setType] = useState<Attribute["type"]>("select");
  const [isFilterable, setIsFilterable] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [newValueByAttribute, setNewValueByAttribute] = useState<
    Record<number, string>
  >({});

  const handleCreateAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createAttribute(name.trim(), type, isFilterable);
    setName("");
  };

  const handleAddValue = (attributeId: number) => {
    const value = (newValueByAttribute[attributeId] || "").trim();
    if (!value) return;
    createAttributeValue(attributeId, value);
    setNewValueByAttribute((prev) => ({ ...prev, [attributeId]: "" }));
  };

  return (
    <div className={dashStyles.dashboardGrid}>
      <div className={dashStyles.inventorySection}>
        <div className={dashStyles.glassCard}>
          <div className={dashStyles.cardHeader}>
            <div className={dashStyles.headerInfo}>
              <h3>Attributes</h3>
              {attributes.length > 0 && (
                <span className={dashStyles.countBadge}>
                  {attributes.length} Total
                </span>
              )}
            </div>
          </div>

          <div className={dashStyles.tableArea}>
            {isLoadingAttributes ? (
              <div className={dashStyles.skeletonLoader}>
                <div className={dashStyles.spinner}></div>
                <span>Loading attributes...</span>
              </div>
            ) : attributes.length === 0 ? (
              <div className={dashStyles.emptyState}>
                <Tag size={40} opacity={0.3} />
                <p>No attributes yet. Create one to get started.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {attributes.map((attribute) => {
                  const isOpen = expanded === attribute.id;
                  const values = attribute.values ?? [];

                  return (
                    <div
                      key={attribute.id}
                      style={{
                        border: "1px solid var(--border, #e5e7eb)",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        onClick={() => setExpanded(isOpen ? null : attribute.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <strong>{attribute.name}</strong>
                          <span className={dashStyles.catBadge}>{attribute.type}</span>
                          {!attribute.is_filterable && (
                            <span className={dashStyles.secondaryText}>not filterable</span>
                          )}
                          <span className={dashStyles.secondaryText}>
                            {values.length} value
                             {values.length === 1 ? "" : "s"}
                         </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAttribute(attribute.id);
                          }}
                          title="Delete attribute"
                          style={{ background: "none", border: "none", cursor: "pointer" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {isOpen && (
                        <div style={{ padding: "0 16px 16px 42px" }}>
                  <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "10px",
  }}
>
  {values.map((v) => (
    <span
      key={v.id}
      className={dashStyles.catBadge}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {v.value}
      <Trash2
        size={12}
        style={{ cursor: "pointer" }}
        onClick={() => deleteAttributeValue(v.id)}
      />
    </span>
  ))}

  {values.length === 0 && (
    <span className={dashStyles.secondaryText}>
      No values yet
    </span>
  )}
</div>

                          <div style={{ display: "flex", gap: "8px" }}>
                            <input
                              className={dashStyles.formInput}
                              placeholder={`Add a ${attribute.name.toLowerCase()} value, e.g. "Black"`}
                              value={newValueByAttribute[attribute.id] || ""}
                              onChange={(e) =>
                                setNewValueByAttribute((prev) => ({
                                  ...prev,
                                  [attribute.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddValue(attribute.id);
                                }
                              }}
                              style={{
                                padding: "8px 10px",
                                borderRadius: "8px",
                                border: "1px solid var(--border, #e5e7eb)",
                                flex: 1,
                              }}
                            />
                            <button
                              onClick={() => handleAddValue(attribute.id)}
                              className={dashStyles.addSmallBtn}
                            >
                              <Plus size={14} /> Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className={dashStyles.sideControls}>
        <div className={dashStyles.glassCard}>
          <h3>New Attribute</h3>
          <p className={dashStyles.secondaryText} style={{ marginBottom: "1rem" }}>
            e.g. "Color", "Size", "Material" - then add its values below.
          </p>

          <form
            onSubmit={handleCreateAttribute}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <input
              className={dashStyles.formInput}
              placeholder="e.g. Color"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border, #e5e7eb)",
              }}
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value as Attribute["type"])}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border, #e5e7eb)",
              }}
            >
              <option value="select">Select (fixed options)</option>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Yes/No</option>
            </select>

            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={isFilterable}
                onChange={(e) => setIsFilterable(e.target.checked)}
              />
              <span className={dashStyles.secondaryText}>
                Show as a search filter
              </span>
            </label>

            <button type="submit" className={dashStyles.addSmallBtn}>
              <Plus size={16} /> Create Attribute
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
};

export default AttributesTab;
