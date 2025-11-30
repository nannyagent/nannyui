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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string
          agent_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          summary: string
          user_id: string
        }
        Insert: {
          activity_type: string
          agent_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          summary: string
          user_id: string
        }
        Update: {
          activity_type?: string
          agent_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          summary?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_device_codes: {
        Row: {
          agent_id: string | null
          authorized: boolean | null
          authorized_at: string | null
          authorized_by: string | null
          client_id: string | null
          consumed: boolean | null
          created_at: string | null
          device_code: string
          expires_at: string | null
          id: string | null
          metadata: Json | null
          scope: string | null
          stored_access_token: string | null
          stored_agent_id: string | null
          stored_refresh_token: string | null
          user_code: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          authorized?: boolean | null
          authorized_at?: string | null
          authorized_by?: string | null
          client_id?: string | null
          consumed?: boolean | null
          created_at?: string | null
          device_code?: string
          expires_at?: string | null
          id?: string | null
          metadata?: Json | null
          scope?: string | null
          stored_access_token?: string | null
          stored_agent_id?: string | null
          stored_refresh_token?: string | null
          user_code?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          authorized?: boolean | null
          authorized_at?: string | null
          authorized_by?: string | null
          client_id?: string | null
          consumed?: boolean | null
          created_at?: string | null
          device_code?: string
          expires_at?: string | null
          id?: string | null
          metadata?: Json | null
          scope?: string | null
          stored_access_token?: string | null
          stored_agent_id?: string | null
          stored_refresh_token?: string | null
          user_code?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_device_codes_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_metrics: {
        Row: {
          agent_id: string
          agent_version: string | null
          block_devices: Json | null
          cpu_percent: number | null
          device_fingerprint: string | null
          disk_percent: number | null
          extra: Json | null
          filesystem_info: Json | null
          ip_address: unknown
          kernel_version: string | null
          load_averages: Json | null
          location: string | null
          memory_mb: number | null
          network_in_kbps: number | null
          network_out_kbps: number | null
          network_stats: Json | null
          os_info: Json | null
          recorded_at: string
        }
        Insert: {
          agent_id: string
          agent_version?: string | null
          block_devices?: Json | null
          cpu_percent?: number | null
          device_fingerprint?: string | null
          disk_percent?: number | null
          extra?: Json | null
          filesystem_info?: Json | null
          ip_address?: unknown
          kernel_version?: string | null
          load_averages?: Json | null
          location?: string | null
          memory_mb?: number | null
          network_in_kbps?: number | null
          network_out_kbps?: number | null
          network_stats?: Json | null
          os_info?: Json | null
          recorded_at?: string
        }
        Update: {
          agent_id?: string
          agent_version?: string | null
          block_devices?: Json | null
          cpu_percent?: number | null
          device_fingerprint?: string | null
          disk_percent?: number | null
          extra?: Json | null
          filesystem_info?: Json | null
          ip_address?: unknown
          kernel_version?: string | null
          load_averages?: Json | null
          location?: string | null
          memory_mb?: number | null
          network_in_kbps?: number | null
          network_out_kbps?: number | null
          network_stats?: Json | null
          os_info?: Json | null
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_packages: {
        Row: {
          agent_id: string
          collected_at: string
          created_at: string
          distro: string
          file_size_bytes: number | null
          id: string
          package_count: number | null
          storage_path: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          collected_at?: string
          created_at?: string
          distro: string
          file_size_bytes?: number | null
          id?: string
          package_count?: number | null
          storage_path: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          collected_at?: string
          created_at?: string
          distro?: string
          file_size_bytes?: number | null
          id?: string
          package_count?: number | null
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_agent_packages"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_registrations: {
        Row: {
          agent_name: string
          agent_type: string
          created_at: string
          device_code: string | null
          id: string
          metadata: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_name: string
          agent_type?: string
          created_at?: string
          device_code?: string | null
          id: string
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_name?: string
          agent_type?: string
          created_at?: string
          device_code?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_registrations_device_code_fkey"
            columns: ["device_code"]
            isOneToOne: false
            referencedRelation: "agent_device_codes"
            referencedColumns: ["device_code"]
          },
        ]
      }
      agent_tokens: {
        Row: {
          agent_id: string
          created_at: string
          expires_at: string
          id: string
          issued_at: string | null
          refresh_token_hash: string | null
          revoked: boolean
          revoked_at: string | null
          token_hash: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          expires_at: string
          id?: string
          issued_at?: string | null
          refresh_token_hash?: string | null
          revoked?: boolean
          revoked_at?: string | null
          token_hash: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          issued_at?: string | null
          refresh_token_hash?: string | null
          revoked?: boolean
          revoked_at?: string | null
          token_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_tokens_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          created_at: string | null
          fingerprint: string | null
          id: string
          ip_address: unknown
          kernel_version: string | null
          last_seen: string | null
          location: string | null
          metadata: Json | null
          name: string | null
          oauth_client_id: string | null
          oauth_token_expires_at: string | null
          os_version: string | null
          owner: string
          public_key: string | null
          registered_ip: unknown
          status: string
          timeline: Json | null
          version: string | null
          websocket_connected: boolean | null
          websocket_connected_at: string | null
          websocket_disconnected_at: string | null
        }
        Insert: {
          created_at?: string | null
          fingerprint?: string | null
          id?: string
          ip_address?: unknown
          kernel_version?: string | null
          last_seen?: string | null
          location?: string | null
          metadata?: Json | null
          name?: string | null
          oauth_client_id?: string | null
          oauth_token_expires_at?: string | null
          os_version?: string | null
          owner: string
          public_key?: string | null
          registered_ip?: unknown
          status?: string
          timeline?: Json | null
          version?: string | null
          websocket_connected?: boolean | null
          websocket_connected_at?: string | null
          websocket_disconnected_at?: string | null
        }
        Update: {
          created_at?: string | null
          fingerprint?: string | null
          id?: string
          ip_address?: unknown
          kernel_version?: string | null
          last_seen?: string | null
          location?: string | null
          metadata?: Json | null
          name?: string | null
          oauth_client_id?: string | null
          oauth_token_expires_at?: string | null
          os_version?: string | null
          owner?: string
          public_key?: string | null
          registered_ip?: unknown
          status?: string
          timeline?: Json | null
          version?: string | null
          websocket_connected?: boolean | null
          websocket_connected_at?: string | null
          websocket_disconnected_at?: string | null
        }
        Relationships: []
      }
      device_sessions: {
        Row: {
          agent_email: string | null
          agent_password: string | null
          agent_user_id: string | null
          approved_at: string | null
          approved_by: string | null
          authorized: boolean | null
          authorized_at: string | null
          authorized_by: string | null
          client_metadata: Json | null
          consume_ip: unknown
          consumed_at: string | null
          created_at: string
          device_code_hash: string
          device_id: string | null
          device_name: string | null
          expires_at: string
          id: string
          interval_seconds: number
          last_polled_at: string | null
          poll_count: number
          request_ip: unknown
          requested_scopes: Json | null
          status: string
          stored_agent_id: string | null
          user_code: string
        }
        Insert: {
          agent_email?: string | null
          agent_password?: string | null
          agent_user_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          authorized?: boolean | null
          authorized_at?: string | null
          authorized_by?: string | null
          client_metadata?: Json | null
          consume_ip?: unknown
          consumed_at?: string | null
          created_at?: string
          device_code_hash: string
          device_id?: string | null
          device_name?: string | null
          expires_at: string
          id?: string
          interval_seconds?: number
          last_polled_at?: string | null
          poll_count?: number
          request_ip?: unknown
          requested_scopes?: Json | null
          status?: string
          stored_agent_id?: string | null
          user_code: string
        }
        Update: {
          agent_email?: string | null
          agent_password?: string | null
          agent_user_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          authorized?: boolean | null
          authorized_at?: string | null
          authorized_by?: string | null
          client_metadata?: Json | null
          consume_ip?: unknown
          consumed_at?: string | null
          created_at?: string
          device_code_hash?: string
          device_id?: string | null
          device_name?: string | null
          expires_at?: string
          id?: string
          interval_seconds?: number
          last_polled_at?: string | null
          poll_count?: number
          request_ip?: unknown
          requested_scopes?: Json | null
          status?: string
          stored_agent_id?: string | null
          user_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_sessions_stored_agent_id_fkey"
            columns: ["stored_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      installed_packages: {
        Row: {
          agent_id: string
          architecture: string | null
          id: string
          metadata: Json | null
          package_manager: string
          package_name: string
          package_version: string
          recorded_at: string
        }
        Insert: {
          agent_id: string
          architecture?: string | null
          id?: string
          metadata?: Json | null
          package_manager: string
          package_name: string
          package_version: string
          recorded_at?: string
        }
        Update: {
          agent_id?: string
          architecture?: string | null
          id?: string
          metadata?: Json | null
          package_manager?: string
          package_name?: string
          package_version?: string
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_agent_installed_packages"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      investigations: {
        Row: {
          agent_id: string | null
          application_group: string | null
          completed_at: string | null
          created_at: string | null
          episode_id: string | null
          holistic_analysis: string | null
          id: number
          initiated_at: string | null
          initiated_by: string | null
          investigation_id: string
          issue: string
          metadata: Json | null
          priority: string | null
          status: string | null
          target_agents: string[] | null
          tensorzero_response: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          application_group?: string | null
          completed_at?: string | null
          created_at?: string | null
          episode_id?: string | null
          holistic_analysis?: string | null
          id?: number
          initiated_at?: string | null
          initiated_by?: string | null
          investigation_id: string
          issue: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          target_agents?: string[] | null
          tensorzero_response?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          application_group?: string | null
          completed_at?: string | null
          created_at?: string | null
          episode_id?: string | null
          holistic_analysis?: string | null
          id?: number
          initiated_at?: string | null
          initiated_by?: string | null
          investigation_id?: string
          issue?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          target_agents?: string[] | null
          tensorzero_response?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investigations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      package_fetch_commands: {
        Row: {
          command: string
          created_at: string
          description: string | null
          distro: string
          id: string
          package_manager: string
          updated_at: string
        }
        Insert: {
          command: string
          created_at?: string
          description?: string | null
          distro: string
          id?: string
          package_manager: string
          updated_at?: string
        }
        Update: {
          command?: string
          created_at?: string
          description?: string | null
          distro?: string
          id?: string
          package_manager?: string
          updated_at?: string
        }
        Relationships: []
      }
      patch_management_schedules: {
        Row: {
          agent_id: string
          created_at: string
          cron_schedule: string
          enabled: boolean
          id: string
          last_run_at: string | null
          next_run_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          cron_schedule?: string
          enabled?: boolean
          id?: string
          last_run_at?: string | null
          next_run_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          cron_schedule?: string
          enabled?: boolean
          id?: string
          last_run_at?: string | null
          next_run_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_agent_patch_schedule"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      patch_tasks: {
        Row: {
          agent_id: string
          command: string
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          exit_code: number | null
          id: string
          started_at: string | null
          status: string
          stderr_storage_path: string | null
          stdout_storage_path: string | null
        }
        Insert: {
          agent_id: string
          command: string
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          exit_code?: number | null
          id?: string
          started_at?: string | null
          status?: string
          stderr_storage_path?: string | null
          stdout_storage_path?: string | null
        }
        Update: {
          agent_id?: string
          command?: string
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          exit_code?: number | null
          id?: string
          started_at?: string | null
          status?: string
          stderr_storage_path?: string | null
          stdout_storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_patch_tasks_agent"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_investigations: {
        Row: {
          agent_id: string
          command_results: Json | null
          completed_at: string | null
          created_at: string | null
          diagnostic_payload: Json
          episode_id: string | null
          error_message: string | null
          id: string
          investigation_id: string
          started_at: string | null
          status: string | null
          task_type: string | null
        }
        Insert: {
          agent_id: string
          command_results?: Json | null
          completed_at?: string | null
          created_at?: string | null
          diagnostic_payload: Json
          episode_id?: string | null
          error_message?: string | null
          id?: string
          investigation_id: string
          started_at?: string | null
          status?: string | null
          task_type?: string | null
        }
        Update: {
          agent_id?: string
          command_results?: Json | null
          completed_at?: string | null
          created_at?: string | null
          diagnostic_payload?: Json
          episode_id?: string | null
          error_message?: string | null
          id?: string
          investigation_id?: string
          started_at?: string | null
          status?: string | null
          task_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_investigations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          advanced_security: boolean | null
          agent_limit: number | null
          api_calls_per_day: number | null
          api_calls_per_min: number | null
          core_api_access: boolean | null
          created_at: string | null
          custom_agents: boolean | null
          data_retention_days: number | null
          features: Json | null
          max_agents: number | null
          monitoring: string | null
          monthly_price_cents: number | null
          name: string | null
          plan_id: string
          priority_support: boolean | null
          slug: string | null
          support: string | null
          tokens_per_day: number | null
        }
        Insert: {
          advanced_security?: boolean | null
          agent_limit?: number | null
          api_calls_per_day?: number | null
          api_calls_per_min?: number | null
          core_api_access?: boolean | null
          created_at?: string | null
          custom_agents?: boolean | null
          data_retention_days?: number | null
          features?: Json | null
          max_agents?: number | null
          monitoring?: string | null
          monthly_price_cents?: number | null
          name?: string | null
          plan_id: string
          priority_support?: boolean | null
          slug?: string | null
          support?: string | null
          tokens_per_day?: number | null
        }
        Update: {
          advanced_security?: boolean | null
          agent_limit?: number | null
          api_calls_per_day?: number | null
          api_calls_per_min?: number | null
          core_api_access?: boolean | null
          created_at?: string | null
          custom_agents?: boolean | null
          data_retention_days?: number | null
          features?: Json | null
          max_agents?: number | null
          monitoring?: string | null
          monthly_price_cents?: number | null
          name?: string | null
          plan_id?: string
          priority_support?: boolean | null
          slug?: string | null
          support?: string | null
          tokens_per_day?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_agent_cascade: { Args: { p_agent_id: string }; Returns: undefined }
      hash_token: { Args: { input_text: string }; Returns: string }
      insert_agent_metrics: {
        Args: {
          p_agent_id: string
          p_cpu_percent: number
          p_disk_percent: number
          p_extra: Json
          p_load1: number
          p_load15: number
          p_load5: number
          p_memory_mb: number
          p_network_in_kbps: number
          p_network_out_kbps: number
        }
        Returns: undefined
      }
      sign_jwt: {
        Args: { key: string; payload: Json; ttl_seconds: number }
        Returns: string
      }
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
    Enums: {},
  },
} as const
