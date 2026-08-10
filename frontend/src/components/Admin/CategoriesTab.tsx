import React, { useEffect, useState } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import dashStyles from "../../styles/AdminDashboard.module.css";
import catStyles from "../../styles/CategoriesTab.module.css"; // The new module
import { Plus, Trash2, X, Folder, Tags } from "lucide-react";
import type { Category } from "../../types";

const CategoriesTab: React.FC = () => {
  const {
    categories,
    addCategory,
    deleteCategory,
    attributes,
    fetchAttributes,
    categoryAttributeOptions,
    isLoadingCategoryAttributes,
    fetchCategoryAttributes,
    syncCategoryAttributes,
  } = useAdminStore();

  const [catName, setCatName] = useState("");
  const [parentId, setParentId] = useState<number | "">("");
  const [managingAttributesFor, setManagingAttributesFor] = useState<number | null>(null);

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    addCategory(catName.trim(), parentId === "" ? null : Number(parentId));
    setCatName("");
    setParentId("");
  };

  const openAttributeManager = (categoryId: number) => {
    setManagingAttributesFor(categoryId);
    fetchCategoryAttributes(categoryId);
  };

  const toggleAttribute = (categoryId: number, attributeId: number, currentlyAssigned: boolean) => {
    const nextIds = currentlyAssigned
      ? categoryAttributeOptions.filter((a) => a.assigned && a.id !== attributeId).map((a) => a.id)
      : [...categoryAttributeOptions.filter((a) => a.assigned).map((a) => a.id), attributeId];

    syncCategoryAttributes(categoryId, nextIds);
  };

  // Light two-level grouping (top-level categories + their direct children)
  // rather than a fully recursive tree - matches how most storefronts
  // actually structure categories in practice.
  const topLevel = categories.filter((c) => !c.parent_id);
  const childrenOf = (parentId: number) =>
    categories.filter((c) => c.parent_id === parentId);

  const renderCategoryCard = (c: Category, indent = false) => (
    <div key={c.id} className={catStyles.categoryCard} style={indent ? { marginLeft: "24px" } : undefined}>
      <span className={catStyles.categoryName}>{c.name}</span>
      <span className={dashStyles.secondaryText}>Assets: --</span>

      <button
        onClick={() => openAttributeManager(c.id)}
        title="Manage attributes for this category"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <Tags size={14} />
      </button>

      <button onClick={() => deleteCategory(c.id)} title="Delete Category">
        <Trash2 size={14} />
      </button>
    </div>
  );

  return (
    <div className={dashStyles.dashboardGrid}>
      <div className={dashStyles.inventorySection}>
        <div className={dashStyles.glassCard}>
          <div className={dashStyles.cardHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Folder className={dashStyles.statusOn} size={20} />
              <h3>Managed Categories</h3>
            </div>
            <span className={dashStyles.catBadge}>
              {categories.length} Total
            </span>
          </div>

          <div className={dashStyles.tableArea}>
            <div className={catStyles.categoryGrid}>
              {topLevel.map((c) => (
                <React.Fragment key={c.id}>
                  {renderCategoryCard(c)}
                  {childrenOf(c.id).map((child) => renderCategoryCard(child, true))}
                </React.Fragment>
              ))}

              {categories.length === 0 && (
                <div
                  className={dashStyles.emptyState}
                  style={{ gridColumn: "1 / -1" }}
                >
                  <Folder size={40} opacity={0.3} />
                  <p>No categories found. Create one to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ATTRIBUTE ASSIGNMENT PANEL - shown when "Manage attributes" is clicked */}
        {managingAttributesFor !== null && (
          <div className={dashStyles.glassCard} style={{ marginTop: "16px" }}>
            <div className={dashStyles.cardHeader}>
              <h3>
                Attributes for{" "}
                {categories.find((c) => c.id === managingAttributesFor)?.name}
              </h3>
              <button
                onClick={() => setManagingAttributesFor(null)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className={dashStyles.tableArea}>
              {isLoadingCategoryAttributes ? (
                <div className={dashStyles.skeletonLoader}>
                  <div className={dashStyles.spinner}></div>
                  <span>Loading...</span>
                </div>
              ) : attributes.length === 0 ? (
                <p className={dashStyles.secondaryText}>
                  No attributes exist yet - create some in the Attributes tab first.
                </p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {categoryAttributeOptions.map((option) => (
                    <label
                      key={option.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        border: "1px solid var(--border, #e5e7eb)",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={option.assigned}
                        onChange={() =>
                          toggleAttribute(managingAttributesFor, option.id, option.assigned)
                        }
                      />
                      {option.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <aside className={dashStyles.sideControls}>
        <div className={dashStyles.glassCard}>
          <h3>Quick Create</h3>
          <p
            className={dashStyles.secondaryText}
            style={{ marginBottom: "1rem" }}
          >
            Add a new category to organize your products.
          </p>

          <form className={catStyles.inputGroup} onSubmit={handleSubmit} style={{ flexDirection: "column", gap: "10px" }}>
            <input
              className={dashStyles.formInput}
              placeholder="E.g. Vector Art"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border, #e5e7eb)",
                flex: 1,
              }}
            />

            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value === "" ? "" : Number(e.target.value))}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border, #e5e7eb)",
              }}
            >
              <option value="">No parent (top-level)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button type="submit" className={catStyles.addBtn}>
              <Plus size={20} /> Create
            </button>
          </form>

          <div className={catStyles.tagCloud}>
            {categories.map((c) => (
              <span key={c.id} className={catStyles.tagItem}>
                {c.name}
                <X size={12} onClick={() => deleteCategory(c.id)} />
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CategoriesTab;
