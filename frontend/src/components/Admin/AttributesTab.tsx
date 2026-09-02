import React, { useEffect, useRef, useState } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import dashStyles from "../../styles/AdminDashboard.module.css";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import type { Attribute } from "../../types";

interface AttributesTabProps {
  productId?: number;
}

const AttributesTab: React.FC<AttributesTabProps> = ({ productId }) => {
  const {
    attributes,
    isLoadingAttributes,
    fetchAttributes,
    createAttribute,
    deleteAttribute,
    createAttributeValue,
    deleteAttributeValue,
    uploadAttributeValueImagesForProduct,
    deleteAttributeValueImageForProduct,
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

  const fileInputRefs = useRef<
    Record<number, HTMLInputElement | null>
  >({});

  const [uploadingValueId, setUploadingValueId] = useState<number | null>(
    null,
  );

  const [deletingImage, setDeletingImage] = useState<string | null>(null);

  const handleCreateAttribute = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    await createAttribute(name.trim(), type, isFilterable);

    setName("");
  };

  const handleAddValue = async (attributeId: number) => {
    const value = (newValueByAttribute[attributeId] || "").trim();

    if (!value) return;

    await createAttributeValue(attributeId, value);

    setNewValueByAttribute((prev) => ({
      ...prev,
      [attributeId]: "",
    }));
  };

  const handleImagesSelected = async (
    valueId: number,
    fileList: FileList | null,
  ) => {
    if (!productId) {
      console.error("Product ID is required to upload images");
      return;
    }

    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length === 0) return;

    try {
      setUploadingValueId(valueId);

      await uploadAttributeValueImagesForProduct(
        productId,
        valueId,
        files,
      );
    } finally {
      setUploadingValueId(null);
    }
  };

  const handleDeleteImage = async (
    valueId: number,
    mediaId: number,
  ) => {
    if (!productId) {
      console.error("Product ID is required to delete images");
      return;
    }

    const key = `${valueId}-${mediaId}`;

    try {
      setDeletingImage(key);

      await deleteAttributeValueImageForProduct(
        productId,
        valueId,
        mediaId,
      );
    } finally {
      setDeletingImage(null);
    }
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
                <div className={dashStyles.spinner} />
                <span>Loading attributes...</span>
              </div>
            ) : attributes.length === 0 ? (
              <div className={dashStyles.emptyState}>
                <Tag size={40} opacity={0.3} />
                <p>No attributes yet. Create one to get started.</p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
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
                        onClick={() =>
                          setExpanded(isOpen ? null : attribute.id)
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          {isOpen ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}

                          <strong>{attribute.name}</strong>

                          <span className={dashStyles.catBadge}>
                            {attribute.type}
                          </span>

                          {!attribute.is_filterable && (
                            <span className={dashStyles.secondaryText}>
                              not filterable
                            </span>
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
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {isOpen && (
                        <div style={{ padding: "0 16px 16px 42px" }}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "12px",
                              marginBottom: "12px",
                            }}
                          >
                            {values.map((v) => {
                              const images = v.images ?? [];
                              const isUploading =
                                uploadingValueId === v.id;

                              return (
                                <div
                                  key={v.id}
                                  style={{
                                    border:
                                      "1px solid var(--border, #e5e7eb)",
                                    borderRadius: "8px",
                                    padding: "10px 12px",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      marginBottom:
                                        images.length > 0 ? "8px" : "0",
                                    }}
                                  >
                                    <span
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
                                        onClick={() =>
                                          deleteAttributeValue(v.id)
                                        }
                                      />
                                    </span>

                                    {/* Images only make sense inside a product */}
                                    {productId && (
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                        }}
                                      >
                                        <span
                                          className={
                                            dashStyles.secondaryText
                                          }
                                        >
                                          {images.length} image
                                          {images.length === 1 ? "" : "s"}
                                        </span>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            fileInputRefs.current[
                                              v.id
                                            ]?.click()
                                          }
                                          disabled={isUploading}
                                          className={
                                            dashStyles.addSmallBtn
                                          }
                                          style={{
                                            padding: "4px 8px",
                                          }}
                                        >
                                          <ImageIcon size={12} />

                                          {isUploading
                                            ? "Uploading..."
                                            : "Add images"}
                                        </button>

                                        <input
                                          ref={(el) => {
                                            fileInputRefs.current[v.id] = el;
                                          }}
                                          type="file"
                                          accept="image/*"
                                          multiple
                                          style={{
                                            display: "none",
                                          }}
                                          onChange={(e) => {
                                            handleImagesSelected(
                                              v.id,
                                              e.target.files,
                                            );

                                            e.target.value = "";
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {productId && images.length > 0 && (
                                    <div
                                      style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "8px",
                                      }}
                                    >
                                      {images.map((img) => {
                                        const key = `${v.id}-${img.id}`;

                                        return (
                                          <div
                                            key={img.id}
                                            style={{
                                              position: "relative",
                                            }}
                                          >
                                            <img
                                              src={img.url}
                                              alt={v.value}
                                              style={{
                                                width: "64px",
                                                height: "64px",
                                                objectFit: "cover",
                                                borderRadius: "6px",
                                                border:
                                                  "1px solid var(--border, #e5e7eb)",
                                              }}
                                            />

                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleDeleteImage(
                                                  v.id,
                                                  img.id,
                                                )
                                              }
                                              disabled={
                                                deletingImage === key
                                              }
                                              style={{
                                                position: "absolute",
                                                top: -6,
                                                right: -6,
                                                background:
                                                  deletingImage === key
                                                    ? "#666"
                                                    : "#ef4444",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "50%",
                                                width: "20px",
                                                height: "20px",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "11px",
                                              }}
                                            >
                                              ×
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {values.length === 0 && (
                              <span className={dashStyles.secondaryText}>
                                No values yet
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                            }}
                          >
                            <input
                              className={dashStyles.formInput}
                              placeholder={`Add a ${attribute.name.toLowerCase()} value, e.g. "Black"`}
                              value={
                                newValueByAttribute[attribute.id] || ""
                              }
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
                                border:
                                  "1px solid var(--border, #e5e7eb)",
                                flex: 1,
                              }}
                            />

                            <button
                              onClick={() =>
                                handleAddValue(attribute.id)
                              }
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

          <p
            className={dashStyles.secondaryText}
            style={{ marginBottom: "1rem" }}
          >
            e.g. "Color", "Size", "Material" - then add its values below.
          </p>

          <form
            onSubmit={handleCreateAttribute}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
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
              onChange={(e) =>
                setType(e.target.value as Attribute["type"])
              }
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border, #e5e7eb)",
              }}
            >
              <option value="select">
                Select (fixed options)
              </option>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Yes/No</option>
            </select>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="checkbox"
                checked={isFilterable}
                onChange={(e) =>
                  setIsFilterable(e.target.checked)
                }
              />

              <span className={dashStyles.secondaryText}>
                Show as a search filter
              </span>
            </label>

            <button
              type="submit"
              className={dashStyles.addSmallBtn}
            >
              <Plus size={16} /> Create Attribute
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
};

export default AttributesTab;