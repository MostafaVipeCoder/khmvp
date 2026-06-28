export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  experience_years: number
  average_rating: number
  review_count: number
  role: 'client' | 'khala' | 'admin'
  availability_type: 'home' | 'outside' | 'both' | null
  is_verified: boolean
  is_active: boolean
  phone: string | null
  mother_job: string | null
  father_job: string | null
  default_address: string | null
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  client_id: string
  sitter_id: string
  date: string
  start_time: string
  duration_hours: number
  location: string
  booking_type: 'home' | 'outside'
  status: 'pending' | 'waiting_payment' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  total_price: number
  children_count: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
    id: string
    booking_id: string
    amount: number
    payment_method: 'card' | 'instapay' | 'vodafone' | 'fawry'
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    transaction_id: string | null
    gateway_response: any | null
    created_at: string
    updated_at: string
}

export interface VerificationRequest {
    id: string
    user_id?: string
    sitter_id?: string
    document_type: string
    document_url: string
    status: 'pending' | 'approved' | 'rejected'
    rejection_reason?: string
    reviewed_by?: string
    reviewed_at?: string
    created_at: string
    updated_at: string
    user?: Profile
}
