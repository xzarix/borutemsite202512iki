import { create } from "zustand"

interface User {
  id: string
  email: string
  name: string
  companyName: string
  priceTier: string
  isApproved: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}))
