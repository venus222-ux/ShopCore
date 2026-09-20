import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import API from "../api";
import { useMarketplaceStore } from "../store/useMarketplaceStore";
import { useDebounce } from "./useDebounce";

// Type for ES pagination response
type ESPagination<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export const useProducts = () => {
  const filters = useMarketplaceStore();
  const debouncedSearch = useDebounce(filters.search, 400);

  return useInfiniteQuery<ESPagination<any>>({
    queryKey: [
      "products",
      debouncedSearch,
      filters.category,
      filters.minPrice,
      filters.maxPrice,
      filters.assetType,
      filters.onSale,
      filters.sort,
      // Attributes is an object ({ color: "Black" }) - React Query hashes
      // query keys structurally (stable JSON serialization), so including
      // it directly here is safe and triggers a refetch on every toggle,
      // exactly like every other filter above.
      filters.attributes,
    ],

    initialPageParam: 1,

    queryFn: async ({ pageParam = 1 }) => {
      // Built explicitly with bracket notation (attributes[color]=Black)
      // rather than handed to axios as a nested object - guarantees the
      // shape Laravel expects ($request->input('attributes') as an
      // associative array), regardless of axios's default param
      // serialization behavior.
      const params: Record<string, any> = {
        page: pageParam,
        q: debouncedSearch,
        category: filters.category,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        asset_type: filters.assetType,
        on_sale: filters.onSale || undefined,
        sort: filters.sort,
      };

      Object.entries(filters.attributes).forEach(([slug, value]) => {
        params[`attributes[${slug}]`] = value;
      });

      const res = await API.get("/search", { params });

      return res.data as ESPagination<any>;
    },

    getNextPageParam: (lastPage) => {
      return lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined;
    },

    // ⭐ prevents UI flicker when switching filters/search
    placeholderData: keepPreviousData,

    // ⭐ reduces unnecessary re-renders (important for big product grids)
    notifyOnChangeProps: ["data", "isFetching"],

    staleTime: 1000 * 60 * 2, // 2 min
    gcTime: 1000 * 60 * 10, // 10 min
    refetchOnWindowFocus: false,
  });
};
/***
 * 👉 fetch de produse din API
👉 cu filtre + search
👉 cu infinite scroll (pagination automată)
👉 cu cache inteligent (React Query)

🧠 Ce face, pe scurt
👉 Îți aduce produse din backend în pagini (page 1, 2, 3…)
👉 Le combină automat pentru infinite scroll
👉 Reface request-ul când schimbi filtrele
👉 Evită spam-ul de request-uri (debounce + cache)
 */
