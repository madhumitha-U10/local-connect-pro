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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number | null
          reel_url: string | null
          seller_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number | null
          reel_url?: string | null
          seller_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number | null
          reel_url?: string | null
          seller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_sellers: {
        Row: {
          created_at: string
          seller_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          seller_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          seller_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_sellers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_accounts: {
        Row: {
          created_at: string
          nammaspot_id: string
          profile: Json | null
          seller_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          nammaspot_id: string
          profile?: Json | null
          seller_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          nammaspot_id?: string
          profile?: Json | null
          seller_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      seller_events: {
        Row: {
          created_at: string
          event: Database["public"]["Enums"]["seller_event"]
          id: string
          seller_id: string
        }
        Insert: {
          created_at?: string
          event: Database["public"]["Enums"]["seller_event"]
          id?: string
          seller_id: string
        }
        Update: {
          created_at?: string
          event?: Database["public"]["Enums"]["seller_event"]
          id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_events_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          seller_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          seller_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_reports_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_updates: {
        Row: {
          announcement: string | null
          closing_time: string | null
          created_at: string
          id: string
          location_text: string | null
          maps_url: string | null
          opening_time: string | null
          seller_id: string
          status: Database["public"]["Enums"]["day_status"]
          update_date: string
          updated_at: string
        }
        Insert: {
          announcement?: string | null
          closing_time?: string | null
          created_at?: string
          id?: string
          location_text?: string | null
          maps_url?: string | null
          opening_time?: string | null
          seller_id: string
          status: Database["public"]["Enums"]["day_status"]
          update_date: string
          updated_at?: string
        }
        Update: {
          announcement?: string | null
          closing_time?: string | null
          created_at?: string
          id?: string
          location_text?: string | null
          maps_url?: string | null
          opening_time?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["day_status"]
          update_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_updates_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          base_location: string
          business_name: string
          category_id: string
          created_at: string
          description: string | null
          id: string
          instagram_id: string
          is_verified: boolean
          owner_name: string
          phone: string | null
          profile_image_url: string | null
          slug: string
          status: Database["public"]["Enums"]["seller_status"]
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          base_location: string
          business_name: string
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          instagram_id: string
          is_verified?: boolean
          owner_name: string
          phone?: string | null
          profile_image_url?: string | null
          slug: string
          status?: Database["public"]["Enums"]["seller_status"]
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          base_location?: string
          business_name?: string
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          instagram_id?: string
          is_verified?: boolean
          owner_name?: string
          phone?: string | null
          profile_image_url?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["seller_status"]
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sellers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sellers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
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
      my_seller_stats: {
        Args: { _seller_id: string }
        Returns: {
          event: Database["public"]["Enums"]["seller_event"]
          total: number
        }[]
      }
      nammaspot_id_available: { Args: { _id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "seller"
      day_status: "open" | "closed" | "holiday"
      seller_event:
        | "view"
        | "whatsapp"
        | "call"
        | "instagram"
        | "share"
        | "save"
      seller_status: "draft" | "pending" | "approved" | "rejected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "seller"],
      day_status: ["open", "closed", "holiday"],
      seller_event: ["view", "whatsapp", "call", "instagram", "share", "save"],
      seller_status: ["draft", "pending", "approved", "rejected"],
    },
  },
} as const
