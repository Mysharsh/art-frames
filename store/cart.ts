import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product } from "@/types/product"
import type { RecentOrder } from "@/types/order"

interface WaitlistItem {
    productId: string
    productTitle: string
    email: string
}

export interface CartItem {
    productId: string
    title: string
    image: string
    artist: string
    price: number
    size: string
    material: string
    quantity: number
}

interface AppState {
    waitlistCount: number
    waitlistItems: WaitlistItem[]
    wishlistItems: Product[]
    cartItems: CartItem[]
    recentOrders: RecentOrder[]
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
    addToCart: (item: Omit<CartItem, "quantity">) => void
    removeFromCart: (productId: string, size: string, material: string) => void
    updateCartQuantity: (
        productId: string,
        size: string,
        material: string,
        quantity: number
    ) => void
    clearCart: () => void
    cartCount: () => number
    addRecentOrder: (order: RecentOrder) => void
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            waitlistCount: 0,
            waitlistItems: [],
            wishlistItems: [],
            cartItems: [],
            recentOrders: [],
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
                    isSearchOpen: false,
                })),
            closeMobileMenu: () => set({ isMobileMenuOpen: false }),
            toggleSearch: () =>
                set((state) => ({
                    isSearchOpen: !state.isSearchOpen,
                    isMobileMenuOpen: false,
                })),
            closeSearch: () => set({ isSearchOpen: false }),
            toggleWishlist: (product) =>
                set((state) => {
                    const exists = state.wishlistItems.some((item) => item.id === product.id)
                    if (exists) {
                        return {
                            wishlistItems: state.wishlistItems.filter((item) => item.id !== product.id),
                        }
                    }
                    return {
                        wishlistItems: [...state.wishlistItems, product],
                    }
                }),
            isInWishlist: (productId) => {
                const state = get()
                return state.wishlistItems.some((item) => item.id === productId)
            },
            addToCart: (item) =>
                set((state) => {
                    const existing = state.cartItems.find(
                        (cartItem) =>
                            cartItem.productId === item.productId &&
                            cartItem.size === item.size &&
                            cartItem.material === item.material
                    )

                    if (existing) {
                        return {
                            cartItems: state.cartItems.map((cartItem) =>
                                cartItem === existing
                                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                                    : cartItem
                            ),
                        }
                    }

                    return {
                        cartItems: [...state.cartItems, { ...item, quantity: 1 }],
                    }
                }),
            removeFromCart: (productId, size, material) =>
                set((state) => ({
                    cartItems: state.cartItems.filter(
                        (item) =>
                            !(
                                item.productId === productId &&
                                item.size === size &&
                                item.material === material
                            )
                    ),
                })),
            updateCartQuantity: (productId, size, material, quantity) =>
                set((state) => ({
                    cartItems: state.cartItems
                        .map((item) => {
                            if (
                                item.productId === productId &&
                                item.size === size &&
                                item.material === material
                            ) {
                                return { ...item, quantity }
                            }
                            return item
                        })
                        .filter((item) => item.quantity > 0),
                })),
            clearCart: () => set({ cartItems: [] }),
            cartCount: () => {
                const state = get()
                return state.cartItems.reduce((acc, item) => acc + item.quantity, 0)
            },
            addRecentOrder: (order) =>
                set((state) => ({
                    recentOrders: [order, ...state.recentOrders].slice(0, 20),
                })),
        }),
        {
            name: "posterwaala-store",
            partialize: (state) => ({
                wishlistItems: state.wishlistItems,
                cartItems: state.cartItems,
                waitlistItems: state.waitlistItems,
                recentOrders: state.recentOrders,
            }),
        }
    )
)
