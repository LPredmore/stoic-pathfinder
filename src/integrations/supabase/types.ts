export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agree_disagree: {
        Row: {
          comfortable_challenging_norms: number | null
          created_at: string
          easy_to_admit_wrong: number | null
          energized_by_many_people: number | null
          fairness_honesty_important: number | null
          highly_organized_person: number | null
          id: string
          notice_subtle_mood_changes: number | null
          own_emotions_easier_than_others: number | null
          prefer_exploring_new_ideas: number | null
          profile_id: string
          updated_at: string
        }
        Insert: {
          comfortable_challenging_norms?: number | null
          created_at?: string
          easy_to_admit_wrong?: number | null
          energized_by_many_people?: number | null
          fairness_honesty_important?: number | null
          highly_organized_person?: number | null
          id?: string
          notice_subtle_mood_changes?: number | null
          own_emotions_easier_than_others?: number | null
          prefer_exploring_new_ideas?: number | null
          profile_id: string
          updated_at?: string
        }
        Update: {
          comfortable_challenging_norms?: number | null
          created_at?: string
          easy_to_admit_wrong?: number | null
          energized_by_many_people?: number | null
          fairness_honesty_important?: number | null
          highly_organized_person?: number | null
          id?: string
          notice_subtle_mood_changes?: number | null
          own_emotions_easier_than_others?: number | null
          prefer_exploring_new_ideas?: number | null
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agree_disagree_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_therapist_settings: {
        Row: {
          created_at: string
          created_by_profile: string | null
          custom_tools: Json | null
          escalation_policy: string | null
          id: string
          is_active: boolean
          persona: string | null
          principles: string[] | null
          prohibited_topics: string | null
          response_style: string | null
          safety_boundaries: string | null
          session_closing: string | null
          session_opening: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_profile?: string | null
          custom_tools?: Json | null
          escalation_policy?: string | null
          id?: string
          is_active?: boolean
          persona?: string | null
          principles?: string[] | null
          prohibited_topics?: string | null
          response_style?: string | null
          safety_boundaries?: string | null
          session_closing?: string | null
          session_opening?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_profile?: string | null
          custom_tools?: Json | null
          escalation_policy?: string | null
          id?: string
          is_active?: boolean
          persona?: string | null
          principles?: string[] | null
          prohibited_topics?: string | null
          response_style?: string | null
          safety_boundaries?: string | null
          session_closing?: string | null
          session_opening?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_therapist_settings_created_by_profile_fkey"
            columns: ["created_by_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_training: {
        Row: {
          created_at: string
          id: string
          instructions: string
          mode: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructions?: string
          mode: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string
          mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      always_never: {
        Row: {
          analyze_vs_distract_when_stressed: number | null
          anxious_talk_it_out_vs_internal: number | null
          created_at: string
          follow_through_long_term_goals: number | null
          id: string
          making_plans_prefer_schedule: number | null
          profile_id: string
          rely_logic_over_gut: number | null
          thrill_seeking_frequency: number | null
          understand_upset_friend_immediately: number | null
          updated_at: string
        }
        Insert: {
          analyze_vs_distract_when_stressed?: number | null
          anxious_talk_it_out_vs_internal?: number | null
          created_at?: string
          follow_through_long_term_goals?: number | null
          id?: string
          making_plans_prefer_schedule?: number | null
          profile_id: string
          rely_logic_over_gut?: number | null
          thrill_seeking_frequency?: number | null
          understand_upset_friend_immediately?: number | null
          updated_at?: string
        }
        Update: {
          analyze_vs_distract_when_stressed?: number | null
          anxious_talk_it_out_vs_internal?: number | null
          created_at?: string
          follow_through_long_term_goals?: number | null
          id?: string
          making_plans_prefer_schedule?: number | null
          profile_id?: string
          rely_logic_over_gut?: number | null
          thrill_seeking_frequency?: number | null
          understand_upset_friend_immediately?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "always_never_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      boundaries: {
        Row: {
          boundary: string
          created_at: string
          id: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          boundary: string
          created_at?: string
          id?: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          boundary?: string
          created_at?: string
          id?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boundaries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_scores: {
        Row: {
          attachment_anxiety: number | null
          attachment_avoidance: number | null
          big5_agreeableness: number | null
          big5_conscientiousness: number | null
          big5_extraversion: number | null
          big5_neuroticism: number | null
          big5_openness: number | null
          eq_empathy: number | null
          eq_self_perception: number | null
          eq_stress_management: number | null
          hexaco_agreeableness: number | null
          hexaco_conscientiousness: number | null
          hexaco_emotionality: number | null
          hexaco_extraversion: number | null
          hexaco_honesty_humility: number | null
          profile_id: string
        }
        Insert: {
          attachment_anxiety?: number | null
          attachment_avoidance?: number | null
          big5_agreeableness?: number | null
          big5_conscientiousness?: number | null
          big5_extraversion?: number | null
          big5_neuroticism?: number | null
          big5_openness?: number | null
          eq_empathy?: number | null
          eq_self_perception?: number | null
          eq_stress_management?: number | null
          hexaco_agreeableness?: number | null
          hexaco_conscientiousness?: number | null
          hexaco_emotionality?: number | null
          hexaco_extraversion?: number | null
          hexaco_honesty_humility?: number | null
          profile_id: string
        }
        Update: {
          attachment_anxiety?: number | null
          attachment_avoidance?: number | null
          big5_agreeableness?: number | null
          big5_conscientiousness?: number | null
          big5_extraversion?: number | null
          big5_neuroticism?: number | null
          big5_openness?: number | null
          eq_empathy?: number | null
          eq_self_perception?: number | null
          eq_stress_management?: number | null
          hexaco_agreeableness?: number | null
          hexaco_conscientiousness?: number | null
          hexaco_emotionality?: number | null
          hexaco_extraversion?: number | null
          hexaco_honesty_humility?: number | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_scores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin: boolean
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          memory_store: Json | null
          onboarding_status: Database["public"]["Enums"]["onboarding_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin?: boolean
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          memory_store?: Json | null
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin?: boolean
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          memory_store?: Json | null
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_traits: {
        Row: {
          question_id: string
          trait_code: string
          weight: number
        }
        Insert: {
          question_id: string
          trait_code: string
          weight?: number
        }
        Update: {
          question_id?: string
          trait_code?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_traits_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          code: string
          created_at: string
          id: string
          source: string
          text: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          source: string
          text: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          source?: string
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      responses: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          question_id: string
          response_value: number | null
          source: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          question_id: string
          response_value?: number | null
          source: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          question_id?: string
          response_value?: number | null
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      stuck_points: {
        Row: {
          created_at: string
          id: string
          point: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          point: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          point?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stuck_points_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_values: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_values_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_compute_profile_scores: {
        Row: {
          attachment_anxiety: number | null
          attachment_avoidance: number | null
          big5_agreeableness: number | null
          big5_conscientiousness: number | null
          big5_extraversion: number | null
          big5_neuroticism: number | null
          big5_openness: number | null
          eq_empathy: number | null
          eq_self_perception: number | null
          eq_stress_management: number | null
          hexaco_emotionality: number | null
          hexaco_honesty_humility: number | null
          profile_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      onboarding_status: "onboarding" | "complete"
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
      onboarding_status: ["onboarding", "complete"],
    },
  },
} as const
