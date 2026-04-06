export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_usd: number;
  stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParsedProduct {
  name: string;
  category: string;
  price_usd: number;
  stock: number;
  description: string | null;
}

export interface Config {
  id: number;
  exchange_rate: number;
  profit_margin: number;
  whatsapp_number: string | null;
  store_name: string;
  updated_at: string;
}

export interface StockHistory {
  id: string;
  raw_message: string;
  parsed_products: ParsedProduct[];
  action: "replace" | "add";
  products_created: number;
  products_updated: number;
  products_deactivated: number;
  source: "whatsapp" | "admin_panel";
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
}

export type StockAction = "replace" | "add";
export type StockSource = "whatsapp" | "admin_panel";

export interface ConversationState {
  step: "idle" | "awaiting_exchange_rate" | "awaiting_stock_action";
  parsed_products?: ParsedProduct[];
  raw_message?: string;
  updated_at: string;
}
