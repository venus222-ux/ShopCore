import React, { useState, useCallback, useRef, useEffect } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import {
  FiUpload,
  FiX,
  FiFile,
  FiImage,
  FiFileText,
  FiAlignLeft,
  FiChevronDown,
  FiTrash2,
} from "react-icons/fi";
import dashStyles from "../../styles/AdminDashboard.module.css";
import productStyles from "../../styles/ProductForm.module.css";
import VariantManager from "../Product/VariantManager";
import type { AssetType } from "../../types";

const ProductForm: React.FC = () => {
  const {
    categories,
    productForm,
    editingProduct,
    updateProductForm,
    setEditingProduct,
    resetProductForm,
    createOrUpdateProduct,
    deletePreviewImage,
  } = useAdminStore();

  const assetDropRef = useRef<HTMLDivElement>(null);
  const [imageDragActive, setImageDragActive] = useState(false);
  const [assetDragActive, setAssetDragActive] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);
  const assetInputRef = useRef<HTMLInputElement>(null);

  const previewImages = productForm.preview_images ?? [];

  // Clear asset_file when switching away from digital (so it isn't sent on submit)
  useEffect(() => {
    if (productForm.asset_type !== "digital" && productForm.asset_file) {
      updateProductForm({ asset_file: null });
    }
  }, [productForm.asset_type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrUpdateProduct();
  };

  const handleCancel = () => {
    setEditingProduct(null);
    resetProductForm();
  };

  // Delete Existing Preview Image
  const handleDeleteExistingImage = async (mediaId: number) => {
    if (!editingProduct?.id) return;
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    setDeletingImageId(mediaId);
    await deletePreviewImage(editingProduct.id, mediaId);
    setDeletingImageId(null);
  };

  // ================= MULTIPLE PREVIEW IMAGES =================
  const handleMultipleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setImageDragActive(false);
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/"),
      );
      if (droppedFiles.length > 0) {
        updateProductForm({
          preview_images: [
            ...(productForm.preview_images || []),
            ...droppedFiles,
          ],
        });
      }
    },
    [updateProductForm, productForm.preview_images],
  );

  const handleMultipleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []).filter((file) =>
        file.type.startsWith("image/"),
      );
      if (selectedFiles.length > 0) {
        updateProductForm({
          preview_images: [
            ...(productForm.preview_images || []),
            ...selectedFiles,
          ],
        });
      }
    },
    [updateProductForm, productForm.preview_images],
  );

  const removeNewImage = (index: number) => {
    const updatedFiles = [...(productForm.preview_images || [])];
    updatedFiles.splice(index, 1);
    updateProductForm({
      preview_images: updatedFiles.length > 0 ? updatedFiles : null,
    });
  };

  // ================= ASSET FILE =================
  const handleAssetFile = useCallback(
    (file: File | undefined) => {
      if (file) updateProductForm({ asset_file: file });
    },
    [updateProductForm],
  );

  const removeAsset = () => updateProductForm({ asset_file: null });

  // Drag & Drop Helpers
  const handleDragOver = (
    e: React.DragEvent,
    setActive: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(true);
  };

  const handleDragLeave = (
    e: React.DragEvent,
    setActive: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(false);
  };

  return (
    <div className={dashStyles.glassCard}>
      <header className={productStyles.formHeader}>
        <div className={productStyles.formTitleGroup}>
          <span className={productStyles.formIcon}>
            {editingProduct ? "📝" : "✨"}
          </span>
          <h3>{editingProduct ? "Edit Product" : "New Product"}</h3>
        </div>
        {editingProduct && (
          <button
            type="button"
            onClick={handleCancel}
            className={productStyles.textBtn}
          >
            Discard Changes
          </button>
        )}
      </header>

      <form className={productStyles.form} onSubmit={handleSubmit}>
        {/* BASIC INFO */}
        <div className={productStyles.formSection}>
          <label className={productStyles.fieldLabel}>Product Identity</label>
          <input
            className={productStyles.mainInput}
            placeholder="e.g. Professional UI Kit 2026"
            value={productForm.title || ""}
            onChange={(e) => updateProductForm({ title: e.target.value })}
            required
          />
          <div className={productStyles.row}>
            <div className={productStyles.inputGroup}>
              <label>Price (USD)</label>
              <input
                type="number"
                step="0.01"
                value={productForm.price || ""}
                onChange={(e) =>
                  updateProductForm({
                    price: Number(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className={productStyles.inputGroup}>
              <label>Discount %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={productForm.discount_percentage ?? 0}
                onChange={(e) =>
                  updateProductForm({
                    discount_percentage: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className={productStyles.inputGroup}>
              <label>Discount Starts</label>
              <input
                type="datetime-local"
                value={productForm.discount_starts_at || ""}
                onChange={(e) =>
                  updateProductForm({
                    discount_starts_at: e.target.value,
                  })
                }
              />
            </div>
            <div className={productStyles.inputGroup}>
              <label>Discount Ends</label>
              <input
                type="datetime-local"
                value={productForm.discount_ends_at || ""}
                onChange={(e) =>
                  updateProductForm({
                    discount_ends_at: e.target.value || "", // Allow clearing
                  })
                }
              />
            </div>
            <div className={productStyles.inputGroup}>
              <label>Discount Fixed (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={productForm.discount_fixed ?? ""}
                onChange={(e) =>
                  updateProductForm({
                    discount_fixed: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
              />
            </div>
            <div className={productStyles.inputGroup}>
              <label>Category</label>
              <select
                value={productForm.category_id || ""}
                onChange={(e) =>
                  updateProductForm({
                    category_id: Number(e.target.value),
                  })
                }
                required
              >
                <option value="">Select category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* DETAILS */}
        <div className={productStyles.formSection}>
          <label className={productStyles.fieldLabel}>Details</label>
          <div className={productStyles.detailsCard}>
            <div className={productStyles.detailRow}>
              <div className={productStyles.iconWrapper}>
                <FiFileText size={18} />
              </div>
              <input
                className={productStyles.shortDescInput}
                placeholder="Brief tagline for search results"
                value={productForm.short_description || ""}
                onChange={(e) =>
                  updateProductForm({ short_description: e.target.value })
                }
                required
              />
            </div>
            <div className={productStyles.detailRow}>
              <div className={productStyles.iconWrapper}>
                <FiAlignLeft size={18} />
              </div>
              <textarea
                className={productStyles.descriptionArea}
                placeholder="Tell your customers more about this product..."
                rows={4}
                value={productForm.description || ""}
                onChange={(e) =>
                  updateProductForm({ description: e.target.value })
                }
                required
              />
            </div>
          </div>
        </div>

        {/* MEDIA & DELIVERY */}
        <div className={productStyles.formSection}>
          <label className={productStyles.fieldLabel}>Media & Delivery</label>
          <div className={productStyles.row}>
            <div className={productStyles.selectWrapper}>
              <select
                value={productForm.asset_type || ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  updateProductForm({
                    asset_type: e.target.value as AssetType,
                  })
                }
              >
                <option value="">Asset Type</option>
                <option value="digital">📦 Digital Download</option>
                <option value="physical">📬 Physical Good</option>
                <option value="service">⚙️ Service/License</option>
              </select>
              <FiChevronDown className={productStyles.selectIcon} />
            </div>
            <label className={productStyles.checkboxCard}>
              <input
                type="checkbox"
                checked={productForm.is_published || false}
                onChange={(e) =>
                  updateProductForm({ is_published: e.target.checked })
                }
              />
              <span>Live on Store</span>
            </label>
            {productForm.discount_starts_at && productForm.discount_ends_at && (
              <small
                style={{
                  display: "block",
                  marginTop: "10px",
                  opacity: 0.8,
                }}
              >
                Discount scheduled from{" "}
                {new Date(productForm.discount_starts_at).toLocaleString()} to{" "}
                {new Date(productForm.discount_ends_at).toLocaleString()}
              </small>
            )}
          </div>

          <div className={productStyles.fileGrid}>
            {/* PREVIEW IMAGES */}
            <div className={productStyles.uploadBox}>
              <label>
                Preview Images <small>(× to delete existing)</small>
              </label>
              <div
                className={`${productStyles.dropzone} ${imageDragActive ? productStyles.dropzoneActive : ""}`}
                onClick={() => previewInputRef.current?.click()}
                onDragOver={(e) => handleDragOver(e, setImageDragActive)}
                onDragLeave={(e) => handleDragLeave(e, setImageDragActive)}
                onDrop={handleMultipleDrop}
              >
                {/* Existing Images */}
                {editingProduct?.previews &&
                  editingProduct.previews.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <p>
                        <strong>Current Images:</strong>
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        {editingProduct.previews.map((img: any) => (
                          <div
                            key={img.id}
                            style={{
                              position: "relative",
                              textAlign: "center",
                            }}
                          >
                            <img
                              src={img.url}
                              alt={img.name}
                              style={{
                                width: "90px",
                                height: "90px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                border: "2px solid #4ade80",
                              }}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteExistingImage(img.id);
                              }}
                              disabled={deletingImageId === img.id}
                              style={{
                                position: "absolute",
                                top: -8,
                                right: -8,
                                background:
                                  deletingImageId === img.id
                                    ? "#666"
                                    : "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "26px",
                                height: "26px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {deletingImageId === img.id ? (
                                "⏳"
                              ) : (
                                <FiTrash2 size={14} />
                              )}
                            </button>
                            <small
                              style={{ display: "block", marginTop: "4px" }}
                            >
                              {img.name}
                            </small>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* New Images */}
                {previewImages.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <p>
                      <strong>New Images to Upload:</strong>
                    </p>
                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {previewImages.map((file, i) => (
                        <div key={i} style={{ position: "relative" }}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${i}`}
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeNewImage(i);
                            }}
                            style={{
                              position: "absolute",
                              top: -6,
                              right: -6,
                              background: "red",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              cursor: "pointer",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={productStyles.uploadPlaceholder}>
                  <FiImage size={32} />
                  <span>Drag & drop or click to upload more images</span>
                  <small>PNG, JPG, WEBP, GIF up to 5MB each</small>
                </div>
                <input
                  ref={previewInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleSelect}
                  className={productStyles.fileInput}
                />
              </div>
            </div>

            {/* ASSET FILE - only for digital downloads */}
            {productForm.asset_type === "digital" && (
              <div className={productStyles.uploadBox}>
                <label>Asset File (ZIP, etc.)</label>
                <div
                  ref={assetDropRef}
                  className={`${productStyles.dropzone} ${assetDragActive ? productStyles.dropzoneActive : ""}`}
                  onClick={() => assetInputRef.current?.click()}
                  onDragOver={(e) => handleDragOver(e, setAssetDragActive)}
                  onDragLeave={(e) => handleDragLeave(e, setAssetDragActive)}
                  onDrop={(e) => handleAssetFile(e.dataTransfer.files[0])}
                >
                  {/* NEW FILE */}
                  {productForm.asset_file instanceof File ? (
                    <div className={productStyles.fileInfo}>
                      <FiFile size={28} />
                      <div>
                        <strong>New File:</strong>
                        <br />
                        {productForm.asset_file.name}
                        <br />
                        <small>
                          {(productForm.asset_file.size / (1024 * 1024)).toFixed(
                            2,
                          )}{" "}
                          MB
                        </small>
                      </div>
                      <button
                        type="button"
                        onClick={removeAsset}
                        className={productStyles.removeBtn}
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : editingProduct?.asset ? (
                    /* EXISTING FILE */
                    <div className={productStyles.fileInfo}>
                      <FiFile size={28} />
                      <div>
                        <strong>Current Asset:</strong>
                        <br />
                        {editingProduct.asset.file_name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                        }}
                      >
                        <a
                          href={editingProduct.asset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          ↓ Download
                        </a>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!editingProduct?.id || !editingProduct?.asset)
                              return;
                            if (!window.confirm("Delete asset file?")) return;
                            await deletePreviewImage(
                              editingProduct.id,
                              editingProduct.asset.id,
                            );
                          }}
                          style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 10px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* EMPTY */
                    <div className={productStyles.uploadPlaceholder}>
                      <FiUpload size={32} />
                      <span>Drag & drop asset file here</span>
                      <small>Max 100MB</small>
                    </div>
                  )}
                  <input
                    ref={assetInputRef}
                    type="file"
                    onChange={(e) => handleAssetFile(e.target.files?.[0])}
                    className={productStyles.fileInput}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className={productStyles.submitBtn}>
          {editingProduct ? "Update Product" : "Create Product"}
        </button>
      </form>

      {/* VARIANTS - deliberately OUTSIDE the <form> above: it has its own
          internal submit (adding a variant) and nesting <form> elements is
          invalid HTML / causes unpredictable submit behavior in browsers.
          Only shown once the product actually exists, since variants need
          a real product_id to attach to. */}
      {editingProduct && (
        <VariantManager
          productId={editingProduct.id}
          categoryId={productForm.category_id}
          basePrice={productForm.price}
        />
      )}
    </div>
  );
};

export default ProductForm;