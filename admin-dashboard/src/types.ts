export interface Service {
    id: string;
    name: string;
    description: string;
    pricePerHour: number; // This maps to 'price' in DB for simplicity in UI
    price?: number; // Fallback
    minHours?: number;
    features?: string[];
    is_active?: boolean;
    service_type?: string; // For raw DB mapping compatibility
    minimum_hours?: number; // DB field
}

export interface Sitter {
    id: string;
    name: string;
    image: string;
    rating: number;
    reviews: number;
    experience: number;
    location: string;
    available: boolean;
    availabilityType: 'home' | 'outside' | 'both';
    languages: string[];
    specialties: string[];
    services: Service[];
    bio?: string;
    raw?: any; // Temporary: holds the full DB profile object if needed
}

export type SitterProfile = SitterDBProfile;

export interface SitterServiceDB {
    id: string;
    sitter_id: string;
    service_type: string;
    price: number;
    description: string | null;
    minimum_hours: number;
    features: any; // JSONb
    is_active: boolean;
}

export interface SitterSkillDB {
    id: string;
    sitter_id: string;
    skill: string;
}

export interface SitterLanguageDB {
    id: string;
    sitter_id: string;
    language: string;
}

export interface SitterDBProfile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    location: string | null;
    experience_years: number;
    average_rating: number;
    review_count: number;
    availability_type: 'home' | 'outside' | 'both' | null;
    is_verified: boolean;
    is_active: boolean;
    phone?: string | null;
    created_at?: string;
    sitter_services?: SitterServiceDB[];
    sitter_skills?: SitterSkillDB[];
    sitter_languages?: SitterLanguageDB[];
}

export interface SitterAvailability {
    id: string;
    sitter_id: string;
    date: string | null;
    day_of_week: number | null;
    start_time: string;
    end_time: string;
    is_recurring: boolean;
    created_at?: string;
}



export interface Child {
    id: string;
    client_id: string;
    name: string;
    age: number;
    gender: 'male' | 'female';
    notes?: string;
    medical_conditions?: string;
    allergies?: string;
    special_needs?: string;
    created_at: string;
}

export interface Payment {
    id: string;
    booking_id: string;
    amount: number;
    payment_method: 'card' | 'instapay' | 'vodafone' | 'fawry';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transaction_id?: string;
    gateway_response?: any;
    created_at: string;
    updated_at: string;
}

export interface Dispute {
    id: string;
    booking_id: string;
    reported_by: 'client' | 'khala';
    type: 'no_show' | 'late' | 'quality' | 'payment' | 'behavior' | 'other';
    status: 'open' | 'in_review' | 'resolved' | 'closed';
    title: string;
    description: string;
    evidence?: any[];
    resolution?: string;
    resolved_by?: string;
    created_at: string;
    updated_at: string;
    closed_at?: string;
}

export interface SupportTicket {
    id: string;
    user_id: string;
    user_type: 'client' | 'khala';
    category: 'technical' | 'account' | 'payment' | 'booking' | 'other';
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
    subject: string;
    description: string;
    attachments?: any[];
    created_at: string;
    updated_at: string;
}

export interface TicketMessage {
    id: string;
    ticket_id: string;
    sender_id: string;
    sender_type: 'user' | 'support';
    message: string;
    attachments?: any[];
    created_at: string;
}

export interface SitterEvaluation {
    id: string;
    sitter_id: string;
    evaluated_by?: string;
    interview_date?: string;
    punctuality_score?: number;
    education_level?: string;
    age?: number;
    secondary_phone?: string;
    residence_area?: string;
    nearest_metro?: string;
    phone_type?: string;
    marital_status?: string;
    number_of_children?: number;
    current_employment_status?: string;
    additional_work_notes?: string;
    q1_score?: number;
    q2_score?: number;
    q3_score?: number;
    q4_score?: number;
    q5_score?: number;
    q6_score?: number;
    q7_score?: number;
    q8_score?: number;
    open_answer_1?: string;
    open_answer_2?: string;
    open_answer_3?: string;
    has_camera_issue?: boolean;
    camera_issue_notes?: string;
    courses?: string;
    certificates?: string;
    general_notes?: string;
    photo_url?: string;
    total_score?: number;
    evaluation_percentage?: number;
    summary?: string;
    created_at: string;
    updated_at: string;
}

export interface BookingStatusHistory {
    id: string;
    booking_id: string;
    old_status?: string;
    new_status: string;
    changed_by?: string;
    notes?: string;
    attachments?: any[];
    created_at: string;
}

// Extend original Booking interface with new fields
export interface Booking {
    id: string;
    client_id: string;
    sitter_id: string;
    date: string;
    start_time: string;
    duration_hours: number;
    location: string;
    booking_type: 'home' | 'outside';
    status: 'pending' | 'waiting_payment' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'interested' | 'searching' | 'paid';
    total_price: number;
    children_count?: number;
    notes?: string;
    created_at: string;
    payment_screenshot_url?: string;
    feedback_screenshot_url?: string;
    assigned_sitter_code?: string;
    // Joins
    client?: { full_name: string; avatar_url: string };
    sitter?: { full_name: string; avatar_url: string };
}

// Extend original SitterDBProfile with admin_role
export interface SitterDBProfile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    location: string | null;
    experience_years: number;
    average_rating: number;
    review_count: number;
    availability_type: 'home' | 'outside' | 'both' | null;
    is_verified: boolean;
    is_active: boolean;
    phone?: string | null;
    created_at?: string;
    admin_role?: 'super_admin' | 'client_manager' | 'sitter_manager';
    sitter_services?: SitterServiceDB[];
    sitter_skills?: SitterSkillDB[];
    sitter_languages?: SitterLanguageDB[];
}
