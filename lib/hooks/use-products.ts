"use client"

import { useState, useEffect } from "react"
import type { ProductWithCategory } from "@/types/product"

export function useProducts(categoryId?: string) {
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const url = categoryId 
          ? `/api/products?categoryId=${categoryId}`
          : "/api/products"
        
        const response = await fetch(url)
        if (!response.ok) throw new Error("Failed to fetch products")
        
        const data = await response.json()
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categoryId])

  return { products, loading, error }
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<ProductWithCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${id}`)
        if (!response.ok) throw new Error("Failed to fetch product")
        
        const data = await response.json()
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProduct()
  }, [id])

  return { product, loading, error }
}
