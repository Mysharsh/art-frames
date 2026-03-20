export interface OrderItem {
    productId: string
    title: string
    image: string
    artist: string
    price: number
    size: string
    material: string
    quantity: number
}

export interface Order {
    id: string
    customerId?: string
    items: OrderItem[]
    total: number
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
    paymentMethod: 'cod' | 'stripe'
    shippingAddress: {
        name: string
        phone: string
        address: string
        city: string
        state: string
        pincode: string
    }
    createdAt: string
    updatedAt: string
}

export interface RecentOrder {
    orderId: string
    status: string
    amount: number
    paymentMethod: 'cod' | 'stripe'
    createdAt: string
}
