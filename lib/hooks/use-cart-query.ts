import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Query keys
export const cartKeys = {
  all: ["cart"] as const,
  detail: () => [...cartKeys.all, "detail"] as const,
}

// Fetch cart
export function useCart() {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: async () => {
      const response = await fetch("/api/cart")
      if (!response.ok) throw new Error("Failed to fetch cart")
      return response.json()
    },
  })
}

// Add to cart mutation
export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      })
      if (!response.ok) throw new Error("Failed to add to cart")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() })
    },
  })
}

// Update cart item mutation
export function useUpdateCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      })
      if (!response.ok) throw new Error("Failed to update cart item")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() })
    },
  })
}

// Remove from cart mutation
export function useRemoveFromCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to remove from cart")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() })
    },
  })
}

// Clear cart mutation
export function useClearCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/cart/clear", {
        method: "POST",
      })
      if (!response.ok) throw new Error("Failed to clear cart")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() })
    },
  })
}
