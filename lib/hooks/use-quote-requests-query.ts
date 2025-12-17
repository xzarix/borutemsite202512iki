import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Query keys
export const quoteRequestKeys = {
  all: ["quoteRequests"] as const,
  lists: () => [...quoteRequestKeys.all, "list"] as const,
  list: (filters?: any) => [...quoteRequestKeys.lists(), filters] as const,
  details: () => [...quoteRequestKeys.all, "detail"] as const,
  detail: (id: string) => [...quoteRequestKeys.details(), id] as const,
}

// Fetch quote requests list
export function useQuoteRequests(filters?: any) {
  return useQuery({
    queryKey: quoteRequestKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams(filters || {})
      const response = await fetch(`/api/quote-requests?${params}`)
      if (!response.ok) throw new Error("Failed to fetch quote requests")
      return response.json()
    },
  })
}

// Fetch single quote request
export function useQuoteRequest(id: string) {
  return useQuery({
    queryKey: quoteRequestKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/quote-requests/${id}`)
      if (!response.ok) throw new Error("Failed to fetch quote request")
      return response.json()
    },
    enabled: !!id,
  })
}

// Create quote request mutation
export function useCreateQuoteRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create quote request")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteRequestKeys.lists() })
    },
  })
}

// Update quote request status mutation
export function useUpdateQuoteRequestStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/quote-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Failed to update quote request")
      return response.json()
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: quoteRequestKeys.lists() })
      queryClient.invalidateQueries({ queryKey: quoteRequestKeys.detail(id) })
    },
  })
}

// Cancel quote request mutation
export function useCancelQuoteRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/quote-requests/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to cancel quote request")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteRequestKeys.lists() })
    },
  })
}
