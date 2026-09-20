// src/utils/pricing.ts
import type { CartItem, ProductVariant } from "../types";

export interface ItemPricing {
  unitPrice: number;
  originalUnitPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
}

/**
 * Resolves the price to charge for a cart/checkout line item.
 *
 * A variant's own discount takes priority over the product's discount -
 * they're independent (see ProductVariant::getActiveDiscountAmount, which
 * only falls back to the product/category discount when the variant has
 * none of its own). If no variant is selected, or the selected variant
 * carries no discount of its own, the product-level price/discount is used
 * instead - mirrors exactly what the backend already resolves server-side.
 */
export function getItemPricing(item: CartItem): ItemPricing {
  const selectedVariant: ProductVariant | undefined =
    item.variant_id && item.variants?.length
      ? item.variants.find((v) => v.id === item.variant_id)
      : undefined;

  if (selectedVariant && selectedVariant.has_discount) {
    const unitPrice = Number(selectedVariant.price);
    const originalUnitPrice = Number(
      selectedVariant.old_price ?? selectedVariant.price,
    );
    const discountPercent =
      originalUnitPrice > 0 && unitPrice < originalUnitPrice
        ? Math.round(((originalUnitPrice - unitPrice) / originalUnitPrice) * 100)
        : 0;

    return {
      unitPrice,
      originalUnitPrice,
      hasDiscount: originalUnitPrice > unitPrice,
      discountPercent,
    };
  }

  if (selectedVariant) {
    // Variant selected but has no discount of its own - still use its
    // own price (variants can have different prices even without a
    // discount), just without any strikethrough.
    const unitPrice = Number(selectedVariant.price);
    return {
      unitPrice,
      originalUnitPrice: unitPrice,
      hasDiscount: false,
      discountPercent: 0,
    };
  }

  // No variant selected - fall back to product-level pricing.
  const originalPrice = Number(item.price || 0);
  const unitPrice =
    item.has_discount && item.final_price !== undefined
      ? Number(item.final_price)
      : originalPrice;

  const discountPercent =
    originalPrice > 0 && unitPrice < originalPrice
      ? Math.round(((originalPrice - unitPrice) / originalPrice) * 100)
      : 0;

  return {
    unitPrice,
    originalUnitPrice: originalPrice,
    hasDiscount: unitPrice < originalPrice,
    discountPercent,
  };
}