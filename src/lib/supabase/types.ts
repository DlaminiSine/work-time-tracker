export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type TimeFormat = "12h" | "24h";
export type WeekStartsOn = 0 | 1;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          timezone: string;
          time_format: TimeFormat;
          week_starts_on: WeekStartsOn;
          default_currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          timezone?: string;
          time_format?: TimeFormat;
          week_starts_on?: WeekStartsOn;
          default_currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          timezone?: string;
          time_format?: TimeFormat;
          week_starts_on?: WeekStartsOn;
          default_currency?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          color?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          color?: string;
          is_archived?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          name: string;
          description: string | null;
          weekly_target_minutes: number | null;
          hourly_rate: number | null;
          currency: string;
          color: string;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          name: string;
          description?: string | null;
          weekly_target_minutes?: number | null;
          hourly_rate?: number | null;
          currency?: string;
          color?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          company_id?: string;
          name?: string;
          description?: string | null;
          weekly_target_minutes?: number | null;
          hourly_rate?: number | null;
          currency?: string;
          color?: string;
          is_archived?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      work_sessions: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          task_description: string | null;
          notes: string | null;
          clock_in: string;
          clock_out: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          task_description?: string | null;
          notes?: string | null;
          clock_in: string;
          clock_out?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          project_id?: string;
          task_description?: string | null;
          notes?: string | null;
          clock_in?: string;
          clock_out?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_sessions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type WorkSession = Database["public"]["Tables"]["work_sessions"]["Row"];
