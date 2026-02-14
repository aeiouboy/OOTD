export type OccasionType = 'weekend_social' | 'date_night' | 'everyday_casual'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          sku: string | null
          product_name: string
          brand: string | null
          category: string
          price: number | null
          original_price: number | null
          image_url: string | null
          link: string | null
          availability: string | null
          product_description: string | null
          occasion_weekend_social: number | null
          occasion_date_night: number | null
          occasion_everyday_casual: number | null
          primary_occasion: string | null
          thai_climate_rating: number | null
          temple_appropriate: boolean | null
          ac_friendly: boolean | null
          embedding: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          sku?: string | null
          product_name: string
          brand?: string | null
          category?: string
          price?: number | null
          original_price?: number | null
          image_url?: string | null
          link?: string | null
          availability?: string | null
          product_description?: string | null
          occasion_weekend_social?: number | null
          occasion_date_night?: number | null
          occasion_everyday_casual?: number | null
          primary_occasion?: string | null
          thai_climate_rating?: number | null
          temple_appropriate?: boolean | null
          ac_friendly?: boolean | null
          embedding?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          sku?: string | null
          product_name?: string
          brand?: string | null
          category?: string
          price?: number | null
          original_price?: number | null
          image_url?: string | null
          link?: string | null
          availability?: string | null
          product_description?: string | null
          occasion_weekend_social?: number | null
          occasion_date_night?: number | null
          occasion_everyday_casual?: number | null
          primary_occasion?: string | null
          thai_climate_rating?: number | null
          temple_appropriate?: boolean | null
          ac_friendly?: boolean | null
          embedding?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_chunks: {
        Row: {
          id: string
          source_file: string
          category: string
          tier: number
          title: string | null
          content: string
          embedding: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          source_file: string
          category: string
          tier: number
          title?: string | null
          content: string
          embedding?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          source_file?: string
          category?: string
          tier?: number
          title?: string | null
          content?: string
          embedding?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_products: {
        Args: {
          query_embedding: string
          occasion_filter?: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          product_name: string
          brand: string
          price: number
          image_url: string
          link: string
          primary_occasion: string
          occasion_weekend_social: number
          occasion_date_night: number
          occasion_everyday_casual: number
          similarity: number
        }[]
      }
      search_knowledge: {
        Args: {
          query_embedding: string
          category_filter?: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          source_file: string
          category: string
          title: string
          content: string
          similarity: number
        }[]
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

// Convenience types for application use
export type DbProduct = Database['public']['Tables']['products']['Row']
export type DbProductInsert = Database['public']['Tables']['products']['Insert']
export type DbKnowledgeChunk = Database['public']['Tables']['knowledge_chunks']['Row']
export type DbKnowledgeChunkInsert = Database['public']['Tables']['knowledge_chunks']['Insert']
