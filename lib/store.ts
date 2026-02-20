import { create } from "zustand"

interface WaitlistItem {
  productId: string
  productTitle: string
  email: string
}

interface AppState {
  waitlistCount: number
  waitlistItems: WaitlistItem[]
  isWaitlistModalOpen: boolean
  selectedProductId: string | null
  selectedProductTitle: string | null
  isMobileMenuOpen: boolean
  isSearchOpen: boolean
  setWaitlistCount: (count: number) => void
  incrementWaitlistCount: () => void
  addWaitlistItem: (item: WaitlistItem) => void
  openWaitlistModal: (productId: string, productTitle: string) => void
  closeWaitlistModal: () => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  toggleSearch: () => void
  closeSearch: () => void
}

export const useAppStore = create<AppState>((set) => ({
  waitlistCount: 0,
  waitlistItems: [],
  isWaitlistModalOpen: false,
  selectedProductId: null,
  selectedProductTitle: null,
  isMobileMenuOpen: false,
  isSearchOpen: false,
  setWaitlistCount: (count) => set({ waitlistCount: count }),
  incrementWaitlistCount: () =>
    set((state) => ({ waitlistCount: state.waitlistCount + 1 })),
  addWaitlistItem: (item) =>
    set((state) => ({ waitlistItems: [...state.waitlistItems, item] })),
  openWaitlistModal: (productId, productTitle) =>
    set({
      isWaitlistModalOpen: true,
      selectedProductId: productId,
      selectedProductTitle: productTitle,
    }),
  closeWaitlistModal: () =>
    set({
      isWaitlistModalOpen: false,
      selectedProductId: null,
      selectedProductTitle: null,
    }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  closeSearch: () => set({ isSearchOpen: false }),
}))
