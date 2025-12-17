import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ProductFilters {
  search: string
  categoryId: string | null
  minPrice: number | null
  maxPrice: number | null
  brand: string | null
  inStock: boolean
  sortBy: "name" | "price-asc" | "price-desc" | "newest"
}

interface FilterState {
  productFilters: ProductFilters
  setSearch: (search: string) => void
  setCategory: (categoryId: string | null) => void
  setPriceRange: (min: number | null, max: number | null) => void
  setBrand: (brand: string | null) => void
  setInStock: (inStock: boolean) => void
  setSortBy: (sortBy: ProductFilters["sortBy"]) => void
  clearFilters: () => void
}

const defaultFilters: ProductFilters = {
  search: "",
  categoryId: null,
  minPrice: null,
  maxPrice: null,
  brand: null,
  inStock: false,
  sortBy: "newest",
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      productFilters: defaultFilters,

      setSearch: (search) =>
        set((state) => ({
          productFilters: { ...state.productFilters, search },
        })),

      setCategory: (categoryId) =>
        set((state) => ({
          productFilters: { ...state.productFilters, categoryId },
        })),

      setPriceRange: (minPrice, maxPrice) =>
        set((state) => ({
          productFilters: { ...state.productFilters, minPrice, maxPrice },
        })),

      setBrand: (brand) =>
        set((state) => ({
          productFilters: { ...state.productFilters, brand },
        })),

      setInStock: (inStock) =>
        set((state) => ({
          productFilters: { ...state.productFilters, inStock },
        })),

      setSortBy: (sortBy) =>
        set((state) => ({
          productFilters: { ...state.productFilters, sortBy },
        })),

      clearFilters: () => set({ productFilters: defaultFilters }),
    }),
    {
      name: "filter-storage",
    }
  )
)
