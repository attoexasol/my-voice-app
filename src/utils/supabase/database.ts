import { supabase } from "./client";

// Database Types based on schema
export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface Item {
  id: number;
  category_id: number;
  name: string;
  unit?: string;
  default_price?: number;
  currency_code: string;
  source_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserPrice {
  user_id: string;
  item_id: number;
  custom_price?: number;
  currency_code: string;
  last_used_at: string;
}

export interface Client {
  id: number;
  user_id: string;
  client_name: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export interface QuoteItem {
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// Invoice item structure (from generate_invoice function)
export interface InvoiceItem {
  category?: string;
  service_description?: string;
  type?: string;
  quantity: number;
  unit_price: number;
  min_price?: number;
  max_price?: number;
  ave_price?: number;
  currency_code?: string;
  total?: number;
  // Legacy fields for backwards compatibility
  name?: string;
  description?: string;
}

// Standardized status types matching database constraints
export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";
export type InvoiceStatus = "pending" | "paid" | "overdue" | "canceled";

export interface Quote {
  id_quote: string; // UUID
  id_trans?: string; // UUID, nullable
  transaction_id: string; // UUID
  client_name?: string;
  client_email?: string;
  items: any; // JSONB field (can be array or object)
  total?: number;
  status?: QuoteStatus;
  created_at: string;
  updated_at?: string; // Add missing updated_at field
  expires_at?: string; // Add expiration date
  is_expired?: boolean; // Add expiration flag
  sent_at?: string; // timestamp when quote was sent
  responded_at?: string; // timestamp when customer responded
  user_id?: string; // UUID, nullable
  recording_title?: string; // Voice recording title
  transcription_text?: string; // Full transcription text
}

export interface Invoice {
  id_invoice: string; // UUID
  id_output?: string; // UUID, link to gpt_output
  id_trans?: string; // UUID, link to transcriptions
  id_quote?: string; // UUID, nullable (legacy)
  user_id: string; // UUID
  invoice_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  items: InvoiceItem[]; // Changed from QuoteItem[] to InvoiceItem[]
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_rate: number;
  discount_amount: number;
  total: number;
  currency: string;
  status: InvoiceStatus; // Use standardized type
  invoice_date: string;
  due_date: string;
  payment_date?: string;
  payment_method?: string;
  notes?: string;
  file_path?: string; // Path to invoice HTML/PDF in storage
  created_at: string;
  updated_at: string;
}

// Helper function to get display name from invoice item
export function getInvoiceItemName(item: InvoiceItem): string {
  return (
    item.category || item.name || item.service_description || "Unnamed Item"
  );
}

// Helper function to get display description from invoice item
export function getInvoiceItemDescription(item: InvoiceItem): string {
  return item.service_description || item.description || "";
}

// Helper function to calculate item total
export function calculateItemTotal(item: InvoiceItem): number {
  return (
    item.total ||
    (item.quantity || 1) * (item.unit_price || item.ave_price || 0)
  );
}

// Using shared Supabase client

// Database operations class
export class DatabaseService {
  // Categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  }

  // Items
  async getItems(categoryId?: number): Promise<Item[]> {
    let query = supabase
      .from("items")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getItemById(itemId: number): Promise<Item | null> {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (error) throw error;
    return data;
  }

  // User Prices
  async getUserPrices(userId: string): Promise<UserPrice[]> {
    const { data, error } = await supabase
      .from("user_prices")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    return data || [];
  }

  async setUserPrice(
    userId: string,
    itemId: number,
    customPrice: number
  ): Promise<void> {
    const { error } = await supabase.from("user_prices").upsert({
      user_id: userId,
      item_id: itemId,
      custom_price: customPrice,
      currency_code: "EUR",
      last_used_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  async deleteUserPrice(userId: string, itemId: number): Promise<void> {
    const { error } = await supabase
      .from("user_prices")
      .delete()
      .eq("user_id", userId)
      .eq("item_id", itemId);

    if (error) throw error;
  }

  // Clients
  async getClients(userId: string): Promise<Client[]> {
    console.log("🔍 Fetching clients for user:", userId);
    
    try {
      // Try a simpler query first
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", userId)
        .order("client_name", { ascending: true });

      if (error) {
        console.error("❌ Error fetching clients:", error);
        console.error("❌ Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log("✅ Clients fetched successfully:", data);
      return data || [];
    } catch (err) {
      console.error("❌ Exception in getClients:", err);
      throw err;
    }
  }

  async createClient(
    userId: string,
    clientData: Omit<Client, "id" | "user_id" | "created_at">
  ): Promise<Client> {
    console.log("🔍 createClient called with:", { userId, clientData });
    
    // Check current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log("🔍 Current session:", { 
      hasSession: !!sessionData.session, 
      userId: sessionData.session?.user?.id,
      sessionError 
    });
    
    const insertData = {
      user_id: userId,
      ...clientData,
    };
    console.log("🔍 Insert data:", insertData);
    
    const { data, error } = await supabase
      .from("clients")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("❌ createClient error:", error);
      console.error("❌ Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log("✅ createClient success:", data);
    return data;
  }

  async updateClient(
    clientId: number,
    updates: Partial<Omit<Client, "id" | "user_id" | "created_at">>
  ): Promise<void> {
    const { error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", clientId);

    if (error) throw error;
  }

  async deleteClient(clientId: number): Promise<void> {
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", clientId);

    if (error) throw error;
  }

  // Quotes
  async getQuotes(userId: string): Promise<Quote[]> {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getQuoteById(quoteId: string): Promise<Quote | null> {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("id_quote", quoteId)
      .single();

    if (error) throw error;
    return data;
  }

  async createQuote(
    userId: string,
    quoteData: Omit<Quote, "id_quote" | "created_at">
  ): Promise<Quote> {
    const { data, error } = await supabase
      .from("quotes")
      .insert({
        user_id: userId,
        ...quoteData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateQuote(
    quoteId: string,
    updates: Partial<Omit<Quote, "id_quote" | "created_at">>
  ): Promise<void> {
    const { error } = await supabase
      .from("quotes")
      .update(updates)
      .eq("id_quote", quoteId);

    if (error) throw error;
  }

  async deleteQuote(quoteId: string): Promise<void> {
    const { error } = await supabase
      .from("quotes")
      .delete()
      .eq("id_quote", quoteId);

    if (error) throw error;
  }

  // Invoices
  async getInvoices(userId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("invoice_date", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id_invoice", invoiceId)
      .single();

    if (error) throw error;
    return data;
  }

  async createInvoice(
    userId: string,
    invoiceData: Omit<
      Invoice,
      "id_invoice" | "user_id" | "created_at" | "updated_at"
    >
  ): Promise<Invoice> {
    const { data, error } = await supabase
      .from("invoices")
      .insert({
        user_id: userId,
        ...invoiceData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateInvoice(
    invoiceId: string,
    updates: Partial<Omit<Invoice, "id_invoice" | "created_at" | "updated_at">>
  ): Promise<void> {
    const { error } = await supabase
      .from("invoices")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id_invoice", invoiceId);

    if (error) throw error;
  }

  async deleteInvoice(invoiceId: string): Promise<void> {
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id_invoice", invoiceId);

    if (error) throw error;
  }

  async convertQuoteToInvoice(quoteId: string): Promise<Invoice> {
    // Fetch the quote
    const quote = await this.getQuoteById(quoteId);
    if (!quote) throw new Error("Quote not found");

    // Parse quote items
    const items = Array.isArray(quote.items) ? quote.items : [];
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + (item.total || 0),
      0
    );

    // Create invoice from quote
    const invoiceNumber = `INV-${Date.now()}`;
    const invoiceDate = new Date().toISOString();
    const dueDate = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(); // 30 days from now

    const invoiceData: Omit<
      Invoice,
      "id_invoice" | "user_id" | "created_at" | "updated_at"
    > = {
      id_quote: quoteId,
      invoice_number: invoiceNumber,
      customer_name: quote.client_name || "Unknown",
      items: items,
      subtotal: subtotal,
      tax_rate: 0,
      tax_amount: 0,
      discount_rate: 0,
      discount_amount: 0,
      total: subtotal,
      currency: "USD",
      status: "pending",
      invoice_date: invoiceDate,
      due_date: dueDate,
    };

    return this.createInvoice(quote.user_id || "", invoiceData);
  }

  // Get items with user prices
  async getItemsWithUserPrices(
    userId: string,
    categoryId?: number
  ): Promise<(Item & { user_price?: UserPrice })[]> {
    let query = supabase
      .from("items")
      .select(
        `
        *,
        user_prices!inner(*)
      `
      )
      .eq("is_active", true)
      .eq("user_prices.user_id", userId);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Search functionality
  async searchItems(query: string, _userId?: string): Promise<Item[]> {
    let dbQuery = supabase
      .from("items")
      .select("*")
      .ilike("name", `%${query}%`)
      .eq("is_active", true)
      .order("name");

    const { data, error } = await dbQuery;
    if (error) throw error;
    return data || [];
  }

  async searchClients(userId: string, query: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", userId)
      .or(`client_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order("client_name");

    if (error) throw error;
    return data || [];
  }
}

// Status Management Utilities
export function getStatusDisplayName(status: QuoteStatus | InvoiceStatus): string {
  const statusMap: Record<string, string> = {
    // Quote statuses
    draft: "Draft",
    sent: "Sent",
    accepted: "Accepted",
    rejected: "Rejected",
    // Invoice statuses
    pending: "Pending Payment",
    paid: "Paid",
    overdue: "Overdue",
    canceled: "Canceled"
  };
  return statusMap[status] || status;
}

export function getStatusColor(status: QuoteStatus | InvoiceStatus): string {
  const colorMap: Record<string, string> = {
    // Quote statuses
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    // Invoice statuses
    pending: "bg-orange-100 text-orange-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
    canceled: "bg-gray-100 text-gray-700"
  };
  return colorMap[status] || "bg-gray-100 text-gray-700";
}

export function canTransitionTo(fromStatus: QuoteStatus | InvoiceStatus, toStatus: QuoteStatus | InvoiceStatus): boolean {
  // Quote status transitions
  const quoteTransitions: Record<QuoteStatus, QuoteStatus[]> = {
    draft: ["sent"],
    sent: ["accepted", "rejected"],
    accepted: [], // Final state
    rejected: [] // Final state
  };

  // Invoice status transitions
  const invoiceTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    pending: ["paid", "overdue", "canceled"],
    paid: [], // Final state
    overdue: ["paid", "canceled"],
    canceled: [] // Final state
  };

  if (fromStatus in quoteTransitions) {
    return quoteTransitions[fromStatus as QuoteStatus].includes(toStatus as QuoteStatus);
  }
  
  if (fromStatus in invoiceTransitions) {
    return invoiceTransitions[fromStatus as InvoiceStatus].includes(toStatus as InvoiceStatus);
  }

  return false;
}

export function getNextValidStatuses(currentStatus: QuoteStatus | InvoiceStatus): (QuoteStatus | InvoiceStatus)[] {
  // Quote status transitions
  const quoteTransitions: Record<QuoteStatus, QuoteStatus[]> = {
    draft: ["sent"],
    sent: ["accepted", "rejected"],
    accepted: [],
    rejected: []
  };

  // Invoice status transitions
  const invoiceTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    pending: ["paid", "overdue", "canceled"],
    paid: [],
    overdue: ["paid", "canceled"],
    canceled: []
  };

  if (currentStatus in quoteTransitions) {
    return quoteTransitions[currentStatus as QuoteStatus];
  }
  
  if (currentStatus in invoiceTransitions) {
    return invoiceTransitions[currentStatus as InvoiceStatus];
  }

  return [];
}

// Export singleton instance
export const db = new DatabaseService();
