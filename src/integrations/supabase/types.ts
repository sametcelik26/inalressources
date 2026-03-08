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
      candidate_applications: {
        Row: {
          availability: string | null
          comments: string | null
          created_at: string
          cv_url: string | null
          email: string
          full_name: string
          id: string
          industry: string | null
          legal_right_to_work: boolean | null
          license_class: string | null
          phone: string
          preferred_contact: string | null
          status: string
          work_location: string | null
        }
        Insert: {
          availability?: string | null
          comments?: string | null
          created_at?: string
          cv_url?: string | null
          email: string
          full_name: string
          id?: string
          industry?: string | null
          legal_right_to_work?: boolean | null
          license_class?: string | null
          phone: string
          preferred_contact?: string | null
          status?: string
          work_location?: string | null
        }
        Update: {
          availability?: string | null
          comments?: string | null
          created_at?: string
          cv_url?: string | null
          email?: string
          full_name?: string
          id?: string
          industry?: string | null
          legal_right_to_work?: boolean | null
          license_class?: string | null
          phone?: string
          preferred_contact?: string | null
          status?: string
          work_location?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          subject?: string
        }
        Relationships: []
      }
      employer_requests: {
        Row: {
          comments: string | null
          company_address: string | null
          company_name: string
          contact_person: string
          created_at: string
          department: string | null
          email: string
          employees_needed: number | null
          id: string
          industry: string | null
          job_description: string | null
          job_title: string | null
          phone: string | null
          preferred_contact: string | null
          required_skills: string | null
          salary_range: string | null
          start_date: string | null
          status: string
          urgency: string | null
          work_schedule: string | null
        }
        Insert: {
          comments?: string | null
          company_address?: string | null
          company_name: string
          contact_person: string
          created_at?: string
          department?: string | null
          email: string
          employees_needed?: number | null
          id?: string
          industry?: string | null
          job_description?: string | null
          job_title?: string | null
          phone?: string | null
          preferred_contact?: string | null
          required_skills?: string | null
          salary_range?: string | null
          start_date?: string | null
          status?: string
          urgency?: string | null
          work_schedule?: string | null
        }
        Update: {
          comments?: string | null
          company_address?: string | null
          company_name?: string
          contact_person?: string
          created_at?: string
          department?: string | null
          email?: string
          employees_needed?: number | null
          id?: string
          industry?: string | null
          job_description?: string | null
          job_title?: string | null
          phone?: string | null
          preferred_contact?: string | null
          required_skills?: string | null
          salary_range?: string | null
          start_date?: string | null
          status?: string
          urgency?: string | null
          work_schedule?: string | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          id: string
          job_id: string
          resume_url: string | null
          seeker_id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id: string
          resume_url?: string | null
          seeker_id: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string
          resume_url?: string | null
          seeker_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          application_email: string | null
          benefits: string | null
          category: string | null
          company_name: string | null
          conditions: string | null
          created_at: string
          deadline: string | null
          description: string
          employer_id: string
          experience_level:
            | Database["public"]["Enums"]["experience_level"]
            | null
          id: string
          is_active: boolean
          job_type: Database["public"]["Enums"]["job_type"]
          location: string
          requirements: string | null
          responsibilities: string | null
          salary_max: number | null
          salary_min: number | null
          skills: string[] | null
          skills_required: string | null
          title: string
          updated_at: string
        }
        Insert: {
          application_email?: string | null
          benefits?: string | null
          category?: string | null
          company_name?: string | null
          conditions?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          employer_id: string
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          id?: string
          is_active?: boolean
          job_type?: Database["public"]["Enums"]["job_type"]
          location: string
          requirements?: string | null
          responsibilities?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[] | null
          skills_required?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          application_email?: string | null
          benefits?: string | null
          category?: string | null
          company_name?: string | null
          conditions?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          employer_id?: string
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          id?: string
          is_active?: boolean
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string
          requirements?: string | null
          responsibilities?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[] | null
          skills_required?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_submissions: {
        Row: {
          city: string | null
          cover_letter: string | null
          created_at: string
          email: string
          first_name: string | null
          full_name: string
          id: string
          job_id: string
          last_name: string | null
          linkedin_url: string | null
          phone: string | null
          resume_url: string | null
          status: string
        }
        Insert: {
          city?: string | null
          cover_letter?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          full_name: string
          id?: string
          job_id: string
          last_name?: string | null
          linkedin_url?: string | null
          phone?: string | null
          resume_url?: string | null
          status?: string
        }
        Update: {
          city?: string | null
          cover_letter?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          full_name?: string
          id?: string
          job_id?: string
          last_name?: string | null
          linkedin_url?: string | null
          phone?: string | null
          resume_url?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_submissions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_description: string | null
          company_logo_url: string | null
          company_name: string | null
          company_website: string | null
          created_at: string
          education: string | null
          experience_years: number | null
          full_name: string | null
          id: string
          industry: string | null
          phone: string | null
          resume_url: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_description?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          education?: string | null
          experience_years?: number | null
          full_name?: string | null
          id?: string
          industry?: string | null
          phone?: string | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_description?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          education?: string | null
          experience_years?: number | null
          full_name?: string | null
          id?: string
          industry?: string | null
          phone?: string | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "job_seeker" | "employer" | "admin"
      application_status:
        | "pending"
        | "reviewed"
        | "shortlisted"
        | "rejected"
        | "hired"
      experience_level: "entry" | "junior" | "mid" | "senior" | "executive"
      job_type:
        | "full_time"
        | "part_time"
        | "contract"
        | "temporary"
        | "internship"
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
      app_role: ["job_seeker", "employer", "admin"],
      application_status: [
        "pending",
        "reviewed",
        "shortlisted",
        "rejected",
        "hired",
      ],
      experience_level: ["entry", "junior", "mid", "senior", "executive"],
      job_type: [
        "full_time",
        "part_time",
        "contract",
        "temporary",
        "internship",
      ],
    },
  },
} as const
