import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Query keys
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters?: any) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
}

// Fetch orders list
export function useOrders(filters?: any) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams(filters || {})
      const response = await fetch(`/api/orders?${params}`)
      if (!response.ok) throw new Error("Failed to fetch orders")
      return response.json()
    },
  })
}

// Fetch single order
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/orders/${id}`)
      if (!response.ok) throw new Error("Failed to fetch order")
      return response.json()
    },
    enabled: !!id,
  })
}

// Create order mutation
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create order")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

// Cancel order mutation
export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/orders/${id}/cancel`, {
        method: "POST",
      })
      if (!response.ok) throw new Error("Failed to cancel order")
      return response.json()
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) })
    },
  })
}
