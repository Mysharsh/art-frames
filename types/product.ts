export interface Product {
    id: string
    title: string
    artist: string
    category: string
    price: number
    image: string
    description: string
    sizes?: string[]
    materials?: string[]
    room?: string
    style?: string
    color?: string
}
