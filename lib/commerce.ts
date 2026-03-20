export type PaymentMethod = "cod" | "stripe"

const DEFAULT_COD_FEE = 49

function parseFee(value: string | undefined): number {
    if (!value) return DEFAULT_COD_FEE
    const parsed = Number(value)

    if (!Number.isFinite(parsed) || parsed < 0) {
        return DEFAULT_COD_FEE
    }

    return parsed
}

export const COD_FEE = parseFee(process.env.NEXT_PUBLIC_COD_FEE)

export function calculateTotals(
    cartItems: Array<{ price: number; quantity: number }>,
    paymentMethod: PaymentMethod
) {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const codFee = paymentMethod === "cod" && cartItems.length > 0 ? COD_FEE : 0
    const total = subtotal + codFee

    return { subtotal, codFee, total }
}