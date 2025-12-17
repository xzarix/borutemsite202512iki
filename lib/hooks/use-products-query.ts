import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Query keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters?: any) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
}

// Fetch products list
export function useProducts(filters?: any) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams(filters || {})
      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) throw new Error("Failed to fetch products")
      return response.json()
    },
  })
}

// Fetch single product
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`)
      if (!response.ok) throw new Error("Failed to fetch product")
      return response.json()
    },
    enabled: !!id,
  })
}

// Create product mutation (admin only)
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create product")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

// Update product mutation (admin only)
export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update product")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
    },
  })
}

// Delete product mutation (admin only)
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete product")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
