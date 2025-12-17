import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UIState {
  // Sidebar state
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Modal state
  activeModal: string | null
  openModal: (modalId: string) => void
  closeModal: () => void

  // Toast/notification state
  toast: {
    message: string
    type: "success" | "error" | "info" | "warning"
    visible: boolean
  }
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void
  hideToast: () => void

  // Loading state
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      // Modal
      activeModal: null,
      openModal: (modalId) => set({ activeModal: modalId }),
      closeModal: () => set({ activeModal: null }),

      // Toast
      toast: {
        message: "",
        type: "info",
        visible: false,
      },
      showToast: (message, type) =>
        set({ toast: { message, type, visible: true } }),
      hideToast: () =>
        set((state) => ({ toast: { ...state.toast, visible: false } })),

      // Loading
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
)
