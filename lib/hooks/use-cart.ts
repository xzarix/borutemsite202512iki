"use client"

import { useState, useEffect, useCallback } from "react"
import type { CartWithItems } from "@/types/cart"

export function useCart() {
  const [cart, setCart] = useState<CartWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/cart")
      if (!response.ok) throw new Error("Failed to fetch cart")
      
      const data = await response.json()
      setCart(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (productId: string, quantity: number) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      })
      
      if (!response.ok) throw new Error("Failed to add to cart")
      
      await fetchCart()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  const updateItem = async (itemId: string, quantity: number) => {
    try {
      const response = await fetch("/api/cart/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      })
      
      if (!response.ok) throw new Error("Failed to update item")
      
      await fetchCart()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) throw new Error("Failed to remove item")
      
      await fetchCart()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return false
    }
  }

  return {
    cart,
    loading,
    error,
    addToCart,
    updateItem,
    removeItem,
    refresh: fetchCart,
  }
}
