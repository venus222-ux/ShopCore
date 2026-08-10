import { useEffect, useState } from "react";
import { useMarketplaceStore } from "../store/useMarketplaceStore";
import { useProducts } from "../hooks/useProducts";
import styles from "../styles/FiltersSidebar.module.css";

// Define expected facet shape (adjust if you have a proper type)
interface ProductFacets {
  categories: Array<{ id: number; name: string; count: number }>;
  attributes: Array<{
    slug: string;
    name: string;
    values: Array<{ value: string; count: number }>;
  }>;
}

const FiltersSidebar = () => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    assetType,
    sort,
    attributes,
    setSearch,
    setFilters,
    setAttributeFilter,
    resetFilters,
  } = useMarketplaceStore();

  // ⭐ Extract dynamic facets from the first page of ES results
  const { data } = useProducts();

  // Safe extraction with type assertion
  const facets: ProductFacets = (data?.pages?.[0] as any)?.facets || {
    categories: [],
    attributes: [],
  };

  // Local state for debounced price inputs
  const [localMin, setLocalMin] = useState(minPrice ?? "");
  const [localMax, setLocalMax] = useState(maxPrice ?? "");

  useEffect(() => {
    setLocalMin(minPrice ?? "");
    setLocalMax(maxPrice ?? "");
  }, [minPrice, maxPrice]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters({
        minPrice: localMin === "" ? null : Number(localMin),
        maxPrice: localMax === "" ? null : Number(localMax),
      });
    }, 500);
    return () => clearTimeout(handler);
  }, [localMin, localMax, setFilters]);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h3>Filters</h3>
        <button className={styles.resetBtn} onClick={resetFilters} title="Clear all">
          Reset
        </button>
      </div>

      {/* Search */}
      <div className={styles.section}>
        <label className={styles.label}>Search</label>
        <input
          type="text"
          className={styles.input}
          placeholder="Keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ⭐ Dynamic Categories from ES Aggregations */}
      <div className={styles.section}>
        <label className={styles.label}>Category</label>
        <select
          className={styles.input}
          value={category ?? ""}
          onChange={(e) =>
            setFilters({ category: e.target.value ? Number(e.target.value) : null })
          }
        >
          <option value="">All Categories</option>
          {facets.categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.count})
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className={styles.section}>
        <label className={styles.label}>Price Range</label>
        <div className={styles.priceGrid}>
          <input
            type="number"
            className={styles.input}
            placeholder="Min"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
          />
          <input
            type="number"
            className={styles.input}
            placeholder="Max"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
          />
        </div>
      </div>

      {/* Asset Type */}
      <div className={styles.section}>
        <label className={styles.label}>Asset Type</label>
        <div className={styles.pillContainer}>
          {["Premium", "Free"].map((type) => (
            <button
              key={type}
              type="button"
              className={`${styles.pill} ${assetType === type ? styles.pillActive : ""}`}
              onClick={() => setFilters({ assetType: assetType === type ? null : type })}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* ⭐ Dynamic Attribute Facets (Color, Size, Software, etc.) */}
      {facets.attributes.map((attr) => (
        <div key={attr.slug} className={styles.section}>
          <label className={styles.label}>{attr.name}</label>
          <div className={styles.pillContainer}>
            {attr.values.map((val) => {
              const isSelected = attributes[attr.slug] === val.value;
              return (
                <button
                  key={val.value}
                  type="button"
                  className={`${styles.pill} ${isSelected ? styles.pillActive : ""}`}
                  onClick={() =>
                    setAttributeFilter(attr.slug, isSelected ? null : val.value)
                  }
                >
                  {val.value} ({val.count})
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Sort */}
      <div className={styles.footer}>
        <label className={styles.label}>Sort By</label>
        <select
          className={styles.input}
          value={sort}
          onChange={(e) => setFilters({ sort: e.target.value })}
        >
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </aside>
  );
};

export default FiltersSidebar;