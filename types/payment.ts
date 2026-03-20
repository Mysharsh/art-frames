export type PaymentMethod = 'cod' | 'stripe'

export interface Payment {
    method: PaymentMethod
    status: 'pending' | 'succeeded' | 'failed' | 'cancelled'
    amount: number
    currency: string
}
