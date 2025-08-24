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
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'admin' | 'team_member'
          created_at: string
          updated_at?: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role: 'admin' | 'team_member'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: 'admin' | 'team_member'
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          created_by: string
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          added_by: string
          added_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          added_by: string
          added_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          added_by?: string
          added_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          filename: string
          file_size: number
          upload_date: string
          status: 'processing' | 'ready' | 'error'
          uploaded_by: string
          team_id?: string
          file_path?: string
        }
        Insert: {
          id?: string
          filename: string
          file_size: number
          upload_date?: string
          status?: 'processing' | 'ready' | 'error'
          uploaded_by: string
          team_id?: string
          file_path?: string
        }
        Update: {
          id?: string
          filename?: string
          file_size?: number
          upload_date?: string
          status?: 'processing' | 'ready' | 'error'
          uploaded_by?: string
          team_id?: string
          file_path?: string
        }
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

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
