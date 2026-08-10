import { useMemo, useState } from "react";
import { ProductVariant, VariantAttributeValue, AttributeValue } from "../../types";

interface VariantSelectorProps {
  variants: ProductVariant[];
  onChange: (variant: ProductVariant | null) => void;
}

// Type guard
const isVariantAttributeValue = (
  av: VariantAttributeValue | AttributeValue
): av is VariantAttributeValue => {
  return "attribute_slug" in av && "attribute_name" in av;
};

// Distinct attributes across all variants, in first-seen order
const useAttributeOptions = (variants: ProductVariant[]) =>
  useMemo(() => {
    const bySlug = new Map<
      string,
      { slug: string; name: string; values: Set<string> }
    >();

    variants.forEach((variant) => {
      variant.attribute_values.forEach((av) => {
        if (!isVariantAttributeValue(av)) return; // Skip if it's the other shape

        const slug = av.attribute_slug;

        if (!bySlug.has(slug)) {
          bySlug.set(slug, {
            slug,
            name: av.attribute_name,
            values: new Set(),
          });
        }
        bySlug.get(slug)!.values.add(av.value);
      });
    });

    return Array.from(bySlug.values()).map((a) => ({
      slug: a.slug,
      name: a.name,
      values: Array.from(a.values),
    }));
  }, [variants]);

const findMatch = (
  variants: ProductVariant[],
  attributes: { slug: string }[],
  selected: Record<string, string>,
): ProductVariant | null => {
  if (Object.keys(selected).length !== attributes.length) return null;

  return (
    variants.find((v) =>
      attributes.every((a) =>
        v.attribute_values.some((av) => {
          if (!isVariantAttributeValue(av)) return false;
          return av.attribute_slug === a.slug && av.value === selected[a.slug];
        }),
      ),
    ) ?? null
  );
};

const VariantSelector = ({ variants, onChange }: VariantSelectorProps) => {
  const attributes = useAttributeOptions(variants);
  const [selected, setSelected] = useState<Record<string, string>>({});

  if (attributes.length === 0) {
    return null;
  }

  const handleSelect = (slug: string, value: string) => {
    const next = { ...selected, [slug]: value };
    setSelected(next);
    onChange(findMatch(variants, attributes, next));
  };

  const matched = findMatch(variants, attributes, selected);

  return (
    <div className="mb-4">
      {attributes.map((attr) => (
        <div key={attr.slug} className="mb-3">
          <small className="text-uppercase text-muted fw-bold d-block mb-2">
            {attr.name}
          </small>
          <div className="d-flex flex-wrap gap-2">
            {attr.values.map((value) => {
              const isSelected = selected[attr.slug] === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSelect(attr.slug, value)}
                  className={`btn btn-sm ${isSelected ? "btn-dark" : "btn-outline-secondary"}`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {matched && matched.in_stock === false && (
        <div className="text-danger small mb-2">
          Out of stock for this combination
        </div>
      )}
    </div>
  );
};

export default VariantSelector;