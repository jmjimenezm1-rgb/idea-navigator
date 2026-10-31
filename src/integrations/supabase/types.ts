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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ai_drafts: {
        Row: {
          business_idea_id: string
          channel: string
          created_at: string
          data: Json
          id: string
          potential_lead_id: string
        }
        Insert: {
          business_idea_id?: string
          channel?: string
          created_at?: string
          data?: Json
          id: string
          potential_lead_id: string
        }
        Update: {
          business_idea_id?: string
          channel?: string
          created_at?: string
          data?: Json
          id?: string
          potential_lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_drafts_potential_lead_id_fkey"
            columns: ["potential_lead_id"]
            isOneToOne: false
            referencedRelation: "potential_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompts: {
        Row: {
          categoria: string
          created_at: string
          data: Json
          estado: string
          id: string
          modelo: string
          nombre: string
          version: string
        }
        Insert: {
          categoria?: string
          created_at?: string
          data?: Json
          estado?: string
          id: string
          modelo?: string
          nombre: string
          version?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          data?: Json
          estado?: string
          id?: string
          modelo?: string
          nombre?: string
          version?: string
        }
        Relationships: []
      }
      business_ideas: {
        Row: {
          created_at: string
          created_by: string
          data: Json
          id: string
          name: string
          sector: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          data?: Json
          id: string
          name: string
          sector?: string
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          data?: Json
          id?: string
          name?: string
          sector?: string
          status?: string
        }
        Relationships: []
      }
      data_source_credentials: {
        Row: {
          api_key: string
          created_at: string
          data_source_id: string
          updated_at: string
        }
        Insert: {
          api_key: string
          created_at?: string
          data_source_id: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          data_source_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_source_credentials_data_source_id_fkey"
            columns: ["data_source_id"]
            isOneToOne: true
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sources: {
        Row: {
          created_at: string
          data: Json
          enabled: boolean
          id: string
          name: string
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          data?: Json
          enabled?: boolean
          id: string
          name: string
          status?: string
          type?: string
        }
        Update: {
          created_at?: string
          data?: Json
          enabled?: boolean
          id?: string
          name?: string
          status?: string
          type?: string
        }
        Relationships: []
      }
      lead_events: {
        Row: {
          action: string
          actor: string
          created_at: string
          id: string
          new_status: string
          potential_lead_id: string
          previous_status: string
        }
        Insert: {
          action: string
          actor?: string
          created_at?: string
          id?: string
          new_status?: string
          potential_lead_id: string
          previous_status?: string
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          id?: string
          new_status?: string
          potential_lead_id?: string
          previous_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_events_potential_lead_id_fkey"
            columns: ["potential_lead_id"]
            isOneToOne: false
            referencedRelation: "potential_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      potential_leads: {
        Row: {
          business_idea_id: string
          company_name: string
          contact_allowed: string
          country: string
          created_at: string
          data: Json
          id: string
          opportunity_score: number
          risk_level: string
          sector: string
          validation_status: string
        }
        Insert: {
          business_idea_id: string
          company_name: string
          contact_allowed?: string
          country?: string
          created_at?: string
          data?: Json
          id: string
          opportunity_score?: number
          risk_level?: string
          sector?: string
          validation_status?: string
        }
        Update: {
          business_idea_id?: string
          company_name?: string
          contact_allowed?: string
          country?: string
          created_at?: string
          data?: Json
          id?: string
          opportunity_score?: number
          risk_level?: string
          sector?: string
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "potential_leads_business_idea_id_fkey"
            columns: ["business_idea_id"]
            isOneToOne: false
            referencedRelation: "business_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      viability_analyses: {
        Row: {
          ai_model: string
          business_idea_id: string
          created_at: string
          data: Json
          id: string
          prompt_version: string
          viability_score: number
        }
        Insert: {
          ai_model?: string
          business_idea_id: string
          created_at?: string
          data?: Json
          id: string
          prompt_version?: string
          viability_score?: number
        }
        Update: {
          ai_model?: string
          business_idea_id?: string
          created_at?: string
          data?: Json
          id?: string
          prompt_version?: string
          viability_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "viability_analyses_business_idea_id_fkey"
            columns: ["business_idea_id"]
            isOneToOne: false
            referencedRelation: "business_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
