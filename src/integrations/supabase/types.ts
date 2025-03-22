export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      employer_assessments: {
        Row: {
          company_type: string
          created_at: string
          description: string
          employee_count: string | null
          id: string
          user_id: string
        }
        Insert: {
          company_type: string
          created_at?: string
          description: string
          employee_count?: string | null
          id?: string
          user_id: string
        }
        Update: {
          company_type?: string
          created_at?: string
          description?: string
          employee_count?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_profile"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          accepted_count: number | null
          application_deadline: string | null
          created_at: string | null
          description: string | null
          employer_id: string
          field: string | null
          id: string
          location: string | null
          platform: string | null
          requirements: string | null
          responses: number | null
          salary: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          accepted_count?: number | null
          application_deadline?: string | null
          created_at?: string | null
          description?: string | null
          employer_id: string
          field?: string | null
          id?: string
          location?: string | null
          platform?: string | null
          requirements?: string | null
          responses?: number | null
          salary?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          accepted_count?: number | null
          application_deadline?: string | null
          created_at?: string | null
          description?: string | null
          employer_id?: string
          field?: string | null
          id?: string
          location?: string | null
          platform?: string | null
          requirements?: string | null
          responses?: number | null
          salary?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_employer_id"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_templates: {
        Row: {
          company: string
          created_at: string
          description: string | null
          field: string
          id: string
          location: string
          requirements: string | null
          salary: string | null
          title: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          field: string
          id?: string
          location: string
          requirements?: string | null
          salary?: string | null
          title: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          field?: string
          id?: string
          location?: string
          requirements?: string | null
          salary?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          province: string | null
          updated_at: string
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          province?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          province?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          certificates: string[] | null
          created_at: string
          education: string[] | null
          first_name: string | null
          id: string
          last_name: string | null
          reference_list: string[] | null
          skills: Json[] | null
          updated_at: string
          user_id: string
          work_experience: string[] | null
        }
        Insert: {
          certificates?: string[] | null
          created_at?: string
          education?: string[] | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          reference_list?: string[] | null
          skills?: Json[] | null
          updated_at?: string
          user_id: string
          work_experience?: string[] | null
        }
        Update: {
          certificates?: string[] | null
          created_at?: string
          education?: string[] | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          reference_list?: string[] | null
          skills?: Json[] | null
          updated_at?: string
          user_id?: string
          work_experience?: string[] | null
        }
        Relationships: []
      }
      seeker_assessments: {
        Row: {
          analysis_results: Json | null
          created_at: string
          education: string
          experience: string
          id: string
          job_title: string | null
          soft_skills: string[] | null
          technical_skills: string[] | null
          user_id: string
        }
        Insert: {
          analysis_results?: Json | null
          created_at?: string
          education: string
          experience: string
          id?: string
          job_title?: string | null
          soft_skills?: string[] | null
          technical_skills?: string[] | null
          user_id: string
        }
        Update: {
          analysis_results?: Json | null
          created_at?: string
          education?: string
          experience?: string
          id?: string
          job_title?: string | null
          soft_skills?: string[] | null
          technical_skills?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_profile"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: Database["public"]["Enums"]["skill_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: Database["public"]["Enums"]["skill_type"]
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["skill_type"]
        }
        Relationships: []
      }
      skills: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "skill_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skills: {
        Row: {
          assessment_id: string | null
          created_at: string
          id: string
          skill_id: string
          skill_type: string
          user_id: string
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          id?: string
          skill_id: string
          skill_type: string
          user_id: string
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          id?: string
          skill_id?: string
          skill_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_profile"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skills_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "seeker_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      insert_skills: {
        Args: {
          category_name: string
          skills: string[]
        }
        Returns: undefined
      }
    }
    Enums: {
      skill_type: "technical" | "soft"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
