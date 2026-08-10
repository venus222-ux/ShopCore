import { create } from 'zustand';

interface MarketplaceState {
  search: string;
  category: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  assetType: string | null;
  sort: string;
  attributes: Record<string, string>; // ⭐ Add dynamic attributes state

  setSearch: (q: string) => void;
  setFilters: (filters: Partial<Omit<MarketplaceState, 'attributes'>>) => void;
  setAttributeFilter: (slug: string, value: string | null) => void; // ⭐ Toggle attributes
  resetFilters: () => void;
}

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  search: '',
  category: null,
  minPrice: null,
  maxPrice: null,
  assetType: null,
  sort: 'newest',
  attributes: {},

  setSearch: (search) => set({ search }),
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  
  setAttributeFilter: (slug, value) => set((state) => {
    const nextAttributes = { ...state.attributes };
    if (!value) {
      delete nextAttributes[slug];
    } else {
      nextAttributes[slug] = value;
    }
    return { attributes: nextAttributes };
  }),

  resetFilters: () => set({
    search: '',
    category: null,
    minPrice: null,
    maxPrice: null,
    assetType: null,
    sort: 'newest',
    attributes: {},
  }),
}));