export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      branches: {
        Row: {
          id: string
          name: string
          location: string | null
          city: string | null
          address: string | null
          phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          city?: string | null
          address?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          city?: string | null
          address?: string | null
          phone?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booked_at: string
          id: string
          passenger_email: string
          passenger_name: string
          passenger_phone: string
          pnr: string
          schedule_id: string
          seat_numbers: number[]
          status: string
          total_fare: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booked_at?: string
          id?: string
          passenger_email: string
          passenger_name: string
          passenger_phone?: string
          pnr: string
          schedule_id: string
          seat_numbers?: number[]
          status?: string
          total_fare?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booked_at?: string
          id?: string
          passenger_email?: string
          passenger_name?: string
          passenger_phone?: string
          pnr?: string
          schedule_id?: string
          seat_numbers?: number[]
          status?: string
          total_fare?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      buses: {
        Row: {
          amenities: string[] | null
          branch_id: string | null
          bus_type: string
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          registration_number: string
          total_seats: number
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          branch_id?: string | null
          bus_type?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          registration_number: string
          total_seats?: number
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          branch_id?: string | null
          bus_type?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          registration_number?: string
          total_seats?: number
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          booking_id: string | null
          created_at: string
          description: string
          id: string
          points: number
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          description?: string
          id?: string
          points?: number
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          description?: string
          id?: string
          points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      parcels: {
        Row: {
          branch_id: string | null
          created_at: string
          description: string
          destination: string
          fare: number
          id: string
          origin: string
          recipient_email: string
          recipient_name: string
          recipient_phone: string
          schedule_id: string | null
          sender_email: string
          sender_id: string
          sender_name: string
          sender_phone: string
          status: string
          tracking_code: string
          updated_at: string
          weight_kg: number
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          description?: string
          destination: string
          fare?: number
          id?: string
          origin: string
          recipient_email?: string
          recipient_name: string
          recipient_phone?: string
          schedule_id?: string | null
          sender_email?: string
          sender_id: string
          sender_name: string
          sender_phone?: string
          status?: string
          tracking_code: string
          updated_at?: string
          weight_kg?: number
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          description?: string
          destination?: string
          fare?: number
          id?: string
          origin?: string
          recipient_email?: string
          recipient_name?: string
          recipient_phone?: string
          schedule_id?: string | null
          sender_email?: string
          sender_id?: string
          sender_name?: string
          sender_phone?: string
          status?: string
          tracking_code?: string
          updated_at?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "parcels_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          branch_id: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          branch_id?: string | null
          email?: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          branch_id?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string
          destination: string
          distance_km: number | null
          id: string
          origin: string
        }
        Insert: {
          created_at?: string
          destination: string
          distance_km?: number | null
          id?: string
          origin: string
        }
        Update: {
          created_at?: string
          destination?: string
          distance_km?: number | null
          id?: string
          origin?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          arrival_time: string
          available_seats: number
          branch_id: string | null
          bus_id: string
          created_at: string
          departure_time: string
          fare: number
          id: string
          image_url: string | null
          route_id: string
          status: string
        }
        Insert: {
          arrival_time: string
          available_seats?: number
          branch_id?: string | null
          bus_id: string
          created_at?: string
          departure_time: string
          fare?: number
          id?: string
          image_url?: string | null
          route_id: string
          status?: string
        }
        Update: {
          arrival_time?: string
          available_seats?: number
          branch_id?: string | null
          bus_id?: string
          created_at?: string
          departure_time?: string
          fare?: number
          id?: string
          image_url?: string | null
          route_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      seat_locks: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          locked_by: string
          schedule_id: string
          seat_number: number
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          locked_by: string
          schedule_id: string
          seat_number: number
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          locked_by?: string
          schedule_id?: string
          seat_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "seat_locks_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          branch_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          branch_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          branch_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      current_user_branch_id: {
        Args: Record<PropertyKey, never>
        Returns: string | null
      }
      track_parcel: {
        Args: { _tracking_code: string }
        Returns: {
          created_at: string
          destination: string
          origin: string
          status: string
          tracking_code: string
          updated_at: string
          weight_kg: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user" | "manager" | "cashier"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
