export type Role = 'buyer' | 'seller' | 'admin'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: Role
  phone: string
  avatar: string | null
  bio: string
  city: string
  date_joined: string
}

export interface CarImage {
  id: number
  image: string
  is_primary: boolean
  order: number
}

export interface Car {
  id: number
  title: string
  brand: string
  model: string
  year: number
  price: string | number
  mileage: number
  condition: string
  fuel_type: string
  transmission: string
  color: string
  city: string
  description?: string
  status: string
  views_count: number
  created_at: string
  updated_at?: string
  primary_image?: string | null
  images?: CarImage[]
  seller: number | User
  seller_name?: string
  is_favorited?: boolean
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Favorite {
  id: number
  car: Car
  created_at: string
}

export interface Message {
  id: number
  sender: User
  text: string
  is_read: boolean
  created_at: string
}

export interface Conversation {
  id: number
  car: Car
  buyer: User
  seller: User
  created_at: string
  updated_at: string
  last_message: Message | null
  unread_count: number
}

export interface CarFilters {
  search?: string
  brand?: string
  city?: string
  condition?: string
  fuel_type?: string
  transmission?: string
  year_min?: string | number
  year_max?: string | number
  price_min?: string | number
  price_max?: string | number
  mileage_max?: string | number
  ordering?: string
  page?: number
  mine?: string
}
