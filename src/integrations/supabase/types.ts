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
      daily_zmanim: {
        Row: {
          alot_hashachar: string | null
          chatzot: string | null
          gregorian_date: string
          hebrew_date: string | null
          id: string
          mincha_gedola: string | null
          misheyakir: string | null
          plag_hamincha: string | null
          raw_json: Json | null
          sof_zman_shma_gra: string | null
          sof_zman_shma_mga: string | null
          sof_zman_tfilla_gra: string | null
          sof_zman_tfilla_mga: string | null
          sunrise: string | null
          sunset: string | null
          tzait_hakochavim: string | null
        }
        Insert: {
          alot_hashachar?: string | null
          chatzot?: string | null
          gregorian_date: string
          hebrew_date?: string | null
          id: string
          mincha_gedola?: string | null
          misheyakir?: string | null
          plag_hamincha?: string | null
          raw_json?: Json | null
          sof_zman_shma_gra?: string | null
          sof_zman_shma_mga?: string | null
          sof_zman_tfilla_gra?: string | null
          sof_zman_tfilla_mga?: string | null
          sunrise?: string | null
          sunset?: string | null
          tzait_hakochavim?: string | null
        }
        Update: {
          alot_hashachar?: string | null
          chatzot?: string | null
          gregorian_date?: string
          hebrew_date?: string | null
          id?: string
          mincha_gedola?: string | null
          misheyakir?: string | null
          plag_hamincha?: string | null
          raw_json?: Json | null
          sof_zman_shma_gra?: string | null
          sof_zman_shma_mga?: string | null
          sof_zman_tfilla_gra?: string | null
          sof_zman_tfilla_mga?: string | null
          sunrise?: string | null
          sunset?: string | null
          tzait_hakochavim?: string | null
        }
        Relationships: []
      }
      holidays: {
        Row: {
          category: string | null
          date: string
          hebrew: string | null
          id: string
          raw_json: Json | null
          title: string | null
        }
        Insert: {
          category?: string | null
          date: string
          hebrew?: string | null
          id: string
          raw_json?: Json | null
          title?: string | null
        }
        Update: {
          category?: string | null
          date?: string
          hebrew?: string | null
          id?: string
          raw_json?: Json | null
          title?: string | null
        }
        Relationships: []
      }
      shabbat_times: {
        Row: {
          candle_lighting_petah_tikva: string | null
          candle_lighting_tel_aviv: string | null
          date: string
          early_mincha_time: string | null
          havdalah_petah_tikva: string | null
          id: string
          parasha: string | null
          raw_json: Json | null
          special_shabbat: string | null
        }
        Insert: {
          candle_lighting_petah_tikva?: string | null
          candle_lighting_tel_aviv?: string | null
          date: string
          early_mincha_time?: string | null
          havdalah_petah_tikva?: string | null
          id: string
          parasha?: string | null
          raw_json?: Json | null
          special_shabbat?: string | null
        }
        Update: {
          candle_lighting_petah_tikva?: string | null
          candle_lighting_tel_aviv?: string | null
          date?: string
          early_mincha_time?: string | null
          havdalah_petah_tikva?: string | null
          id?: string
          parasha?: string | null
          raw_json?: Json | null
          special_shabbat?: string | null
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
