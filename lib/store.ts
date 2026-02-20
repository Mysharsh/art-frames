import { create } from "zustand"
import type { Product } from "@/lib/products"

interface WaitlistItem {
  productId: string
  productTitle: string
  email: string
}

interface AppState {
  waitlistCount: number
  waitlistItems: WaitlistItem[]
  wishlistItems: Product[]
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
  toggleWishlist: (product: Product) => void
  isInWishlist: (productId: string) => boolean
}

export const useAppStore = create<AppState>((set, get) => ({
  waitlistCount: 0,
  waitlistItems: [],
  wishlistItems: [],
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
    set((state) => ({ 
      isMobileMenuOpen: !state.isMobileMenuOpen,
      isSearchOpen: false // Close search when opening menu
    })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleSearch: () => 
    set((state) => ({ 
      isSearchOpen: !state.isSearchOpen,
      isMobileMenuOpen: false // Close menu when opening search
    })),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleWishlist: (product) =>
    set((state) => {
      const exists = state.wishlistItems.some((item) => item.id === product.id)
      if (exists) {
        return {
          wishlistItems: state.wishlistItems.filter((item) => item.id !== product.id),
        }
      } else {
        return {
          wishlistItems: [...state.wishlistItems, product],
        }
      }
    }),
  isInWishlist: (productId) => {
    const state = get()
    return state.wishlistItems.some((item) => item.id === productId)
  },
}))
