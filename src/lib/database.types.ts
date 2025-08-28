export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          currency: string
          initial_balance: number
          hide_balance: boolean
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          currency?: string
          initial_balance?: number
          hide_balance?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          currency?: string
          initial_balance?: number
          hide_balance?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      trades: {
        Row: {
          id: string
          user_id: string
          date: string
          payout: number
          entry_value: number
          result: string
          profit_loss: number
          trade_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          payout: number
          entry_value: number
          result: string
          profit_loss: number
          trade_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          payout?: number
          entry_value?: number
          result?: string
          profit_loss?: number
          trade_type?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      deposits: {
        Row: {
          id: string
          user_id: string
          date: string
          amount: number
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          amount: number
          currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          amount?: number
          currency?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      daily_notes: {
        Row: {
          id: string
          user_id: string
          date: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_notes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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