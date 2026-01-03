export type UserType = 'attorney' | 'client';
export type AppointmentStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_type: UserType;
          full_name: string;
          email: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_type: UserType;
          full_name: string;
          email: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_type?: UserType;
          full_name?: string;
          email?: string;
          phone?: string | null;
          updated_at?: string;
        };
      };
      attorney_profiles: {
        Row: {
          id: string;
          bio: string | null;
          years_of_experience: number;
          bar_number: string | null;
          office_address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          hourly_rate: number | null;
          profile_image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          bio?: string | null;
          years_of_experience?: number;
          bar_number?: string | null;
          office_address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          hourly_rate?: number | null;
          profile_image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          bio?: string | null;
          years_of_experience?: number;
          bar_number?: string | null;
          office_address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          hourly_rate?: number | null;
          profile_image_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      practice_areas: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
      };
      attorney_practice_areas: {
        Row: {
          attorney_id: string;
          practice_area_id: string;
          created_at: string;
        };
        Insert: {
          attorney_id: string;
          practice_area_id: string;
          created_at?: string;
        };
        Delete: {
          attorney_id: string;
          practice_area_id: string;
        };
      };
      services: {
        Row: {
          id: string;
          attorney_id: string;
          service_name: string;
          description: string | null;
          price: number;
          duration_minutes: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          attorney_id: string;
          service_name: string;
          description?: string | null;
          price: number;
          duration_minutes?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          service_name?: string;
          description?: string | null;
          price?: number;
          duration_minutes?: number;
          is_active?: boolean;
        };
      };
      availability_slots: {
        Row: {
          id: string;
          attorney_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          attorney_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
        };
      };
      appointments: {
        Row: {
          id: string;
          attorney_id: string;
          client_id: string;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status: AppointmentStatus;
          service_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          attorney_id: string;
          client_id: string;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status?: AppointmentStatus;
          service_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: AppointmentStatus;
          notes?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
