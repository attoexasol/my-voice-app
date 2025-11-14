import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Search,
  FileText,
  Filter,
  TrendingUp,
  Eye,
  RefreshCw,
  Send,
  Package,
  Wrench,
  History,
  Edit,
  Plus,
  Minus,
  Calculator,
  Users,
  Calendar,
  Trash2,
  Copy,
  Loader2,
  Clock,
  Save,
  CheckCircle,
} from "lucide-react";
import { MyAIInvoicesLogo } from "./MyAIInvoicesLogo";
import {
  useQuotes,
  useClients,
  useItems,
  useUserPrices,
} from "../hooks/useSupabase";
import { toast } from "sonner";

// Get the Supabase URL from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
import { SidebarNavigation } from "./SidebarNavigation";

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  amount: number;
  status: "pending" | "paid" | "overdue" | "canceled";
  date: string;
  due_date: string;
  description?: string;
  currency?: string;
  items?: any[];
  materials_cost?: number;
  customer_address?: string;
  customer_email?: string;
  customer_phone?: string;
}

interface Quote {
  id_quote: string;
  transaction_id: string;
  client_name?: string;
  client_email?: string | null;
  client_phone?: string | null;
  client_address?: string;
  items: any[];
  total?: number;
  status?: "draft" | "sent" | "accepted" | "rejected";
  created_at: string;
  updated_at?: string;
  expires_at?: string | null;
  sent_at?: string; // Add sent_at field
  responded_at?: string; // Add responded_at field
  notes?: string;
  recording_title?: string;
  transcription_text?: string;
  user_id?: string;
}

interface QuoteItem {
  item_id: number;
  qty: number;
  price: number;
}

interface InvoicesViewProps {
  accessToken: string;
  onSignOut: () => void;
  onViewDashboard: () => void;
}

export function InvoicesView({
  accessToken,
  onSignOut,
  onViewDashboard,
}: InvoicesViewProps) {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [error, setError] = useState<string>("");
  const [showDebug, setShowDebug] = useState(false);
  const [activeTab, setActiveTab] = useState("invoices");
  const [materialsQuoteDialogOpen, setMaterialsQuoteDialogOpen] =
    useState(false);

  // Quote-related state
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<QuoteItem[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedInvoiceForMaterials, setSelectedInvoiceForMaterials] =
    useState<Invoice | null>(null);

  // Get user ID from access token or session
  const [userId, setUserId] = useState<string>("");

  // Quote hooks
  const { clients } = useClients(userId);
  const { items } = useItems();
  const { userPrices } = useUserPrices(userId);
  const {
    quotes: quotesData,
    loading: quotesDataLoading,
    createQuote,
    deleteQuote,
    refetch: refetchQuotes,
  } = useQuotes(userId);

  useEffect(() => {
    fetchInvoices();
    // Get user ID from session
    const getUserId = async () => {
      try {
        const {
          data: { session },
        } = await import("../utils/supabase/client").then((mod) =>
          mod.supabase.auth.getSession()
        );
        if (session?.user?.id) {
          setUserId(session.user.id);
        }
      } catch (error) {
        console.error("Error getting user ID:", error);
      }
    };
    getUserId();
  }, []);

  // Update quotes when quotesData changes
  useEffect(() => {
    if (quotesData) {
      setQuotes(quotesData);
      setQuotesLoading(quotesDataLoading);
    }
  }, [quotesData, quotesDataLoading]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "Fetching invoices from:",
        `${SUPABASE_URL}/functions/v1/invoices`
      );

      const response = await fetch(`${SUPABASE_URL}/functions/v1/invoices`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Received data:", data);

      if (data.error) {
        throw new Error(data.error);
      }

      const invoicesList = data.invoices || [];
      console.log("Invoices loaded:", invoicesList.length);
      setInvoices(invoicesList);

      if (invoicesList.length === 0) {
        console.warn("No invoices found in the response");
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load invoices. Please try again.";
      setError(errorMessage);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshAllData = async () => {
    try {
      setLoading(true);
      setQuotesLoading(true);

      // Refresh both invoices and quotes in parallel
      await Promise.all([fetchInvoices(), refetchQuotes()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
      setQuotesLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-700";
      case "paid":
        return "bg-green-100 text-green-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      case "canceled":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;
    const matchesType = typeFilter === "all" || typeFilter === "invoices";
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalAmount = filteredInvoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0
  );
  const paidAmount = filteredInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingAmount = filteredInvoices
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  // Quote-related functions
  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.id_quote?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || quote.status === statusFilter;
    const matchesType = typeFilter === "all" || typeFilter === "quotes";

    // Exclude accepted quotes from display (they become invoices)
    const isNotAccepted = quote.status !== "accepted";

    return matchesSearch && matchesStatus && matchesType && isNotAccepted;
  });

  // Combined list for unified display
  const combinedItems = [
    ...filteredInvoices.map((invoice) => ({
      ...invoice,
      type: "invoice" as const,
    })),
    ...filteredQuotes.map((quote) => ({
      ...quote,
      type: "quote" as const,
      sent_at: quote.sent_at, // Ensure sent_at is included
    })),
  ].sort((a, b) => {
    const dateA =
      a.type === "invoice" ? new Date(a.date) : new Date(a.created_at);
    const dateB =
      b.type === "invoice" ? new Date(b.date) : new Date(b.created_at);
    return dateB.getTime() - dateA.getTime();
  });

  const addItemToQuote = (itemId: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const existingItemIndex = selectedItems.findIndex(
      (i) => i.item_id === itemId
    );
    if (existingItemIndex >= 0) {
      setSelectedItems((prev) =>
        prev.map((item, index) =>
          index === existingItemIndex ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      const userPrice = userPrices.find((up) => up.item_id === itemId);
      const price = userPrice?.custom_price || item.default_price || 0;

      setSelectedItems((prev) => [
        ...prev,
        {
          item_id: itemId,
          qty: 1,
          price: price,
        },
      ]);
    }
  };

  const updateItemQuantity = (itemId: number, newQty: number) => {
    if (newQty <= 0) {
      setSelectedItems((prev) =>
        prev.filter((item) => item.item_id !== itemId)
      );
      return;
    }

    setSelectedItems((prev) =>
      prev.map((item) =>
        item.item_id === itemId ? { ...item, qty: newQty } : item
      )
    );
  };

  const updateItemPrice = (itemId: number, newPrice: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.item_id === itemId ? { ...item, price: newPrice } : item
      )
    );
  };

  const removeItemFromQuote = (itemId: number) => {
    setSelectedItems((prev) => prev.filter((item) => item.item_id !== itemId));
  };

  const handleCreateQuote = async (status: "draft" | "sent" = "draft") => {
    if (selectedItems.length === 0) {
      toast.error("Please add at least one item to the quote");
      return;
    }

    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    setIsCreating(true);
    try {
      const selectedClient = clients.find(
        (c) => c.id.toString() === selectedClientId
      );

      const transactionId = crypto.randomUUID();
      const subtotal = selectedItems.reduce(
        (sum, item) => sum + item.qty * item.price,
        0
      );
      const tax = subtotal * 0.21;
      const total = subtotal + tax;

      await createQuote({
        transaction_id: transactionId,
        client_name: selectedClient?.client_name || "",
        client_email: selectedClient?.email || "",
        items: selectedItems,
        total: total,
        status: status,
        expires_at: expirationDate || undefined,
      });

      setSelectedClientId("");
      setSelectedItems([]);
      setExpirationDate("");
      setIsQuoteDialogOpen(false);

      toast.success(
        `Quote ${status === "draft" ? "saved as draft" : "sent"} successfully`
      );
    } catch (error) {
      toast.error("Failed to create quote");
    } finally {
      setIsCreating(false);
    }
  };

  const getItemName = (itemId: number) => {
    const item = items.find((i) => i.id === itemId);
    return item?.name || "Unknown Item";
  };

  const handleViewQuote = (quote: Quote) => {
    navigate(`/invoice/${quote.id_quote}`);
  };

  const handleSendToCustomer = (quote: Quote) => {
    if (!quote.client_email) {
      toast.error("Client email is required to send quote");
      return;
    }
    setSelectedQuote(quote);
    setIsSendDialogOpen(true);
  };

  const handleConfirmSend = async () => {
    if (!selectedQuote) return;

    if (!selectedQuote.client_email) {
      toast.error("Cannot send quote: Client email is missing");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(selectedQuote.client_email)) {
      toast.error("Cannot send quote: Invalid email address");
      return;
    }

    try {
      setIsSending(true);
      toast.loading("Sending quote to customer...", { id: "sending-quote" });

      const { error: updateError } = await import(
        "../utils/supabase/client"
      ).then((mod) =>
        mod.supabase
          .from("quotes")
          .update({
            status: "sent",
            updated_at: new Date().toISOString(),
            sent_at: new Date().toISOString(), // Explicitly set sent_at for consistency
          })
          .eq("id_quote", selectedQuote.id_quote)
      );

      if (updateError) {
        throw new Error(
          `Failed to update quote status: ${updateError.message}`
        );
      }

      const session = await import("../utils/supabase/client").then((mod) =>
        mod.supabase.auth.getSession()
      );
      const accessToken = session.data.session?.access_token;

      const reviewLink = `${window.location.origin}/quote/${selectedQuote.id_quote}/response`;

      const emailResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/send-email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "quote",
            to: selectedQuote.client_email,
            data: {
              quoteId: selectedQuote.id_quote,
              invoiceNumber: `QUO-${selectedQuote.id_quote.slice(-8)}`,
              customerName: selectedQuote.client_name,
              items: selectedQuote.items,
              totalCost: selectedQuote.total,
              responseUrl: reviewLink,
              companyName: "MyAI Invoices",
            },
          }),
        }
      );

      const emailResult = await emailResponse.json();

      if (!emailResponse.ok) {
        throw new Error(
          `Email delivery failed: ${
            emailResult.error || "Failed to send email"
          }`
        );
      }

      toast.dismiss("sending-quote");
      toast.success(
        `Quote sent successfully to ${selectedQuote.client_email}!`,
        {
          description: `Review link: /quote/${selectedQuote.id_quote.slice(
            0,
            8
          )}.../response`,
          duration: 5000,
        }
      );

      setIsSendDialogOpen(false);
      setSelectedQuote(null);
    } catch (error) {
      console.error("Error sending quote:", error);
      toast.dismiss("sending-quote");
      toast.error("Failed to send quote", {
        description:
          error instanceof Error ? error.message : "Please try again",
        duration: 5000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteQuote = async (quote: Quote) => {
    if (!confirm(`Delete quote for ${quote.client_name}?`)) return;

    try {
      await deleteQuote(quote.id_quote);
      toast.success("Quote deleted successfully");
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast.error("Failed to delete quote");
    }
  };

  // Calculate quote totals
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );
  const tax = subtotal * 0.21;
  const total = subtotal + tax;

  // Calculate quote summary statistics
  const totalQuoteAmount = filteredQuotes.reduce(
    (sum, quote) => sum + (quote.total || 0),
    0
  );
  const sentQuotes = filteredQuotes.filter((q) => q.status === "sent").length;
  // Calculate accepted quotes from unfiltered quotes array since they're hidden from display
  const acceptedQuotes = quotes.filter((q) => q.status === "accepted").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <SidebarNavigation onSignOut={onSignOut} />

      <div className="ml-20 p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <MyAIInvoicesLogo height={40} />
              <div>
                <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Invoices & Quotes Management
                </h1>
                <p className="text-gray-600">
                  Track and manage your invoices and quotes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsQuoteDialogOpen(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Quote
              </Button>
              <Button
                onClick={onViewDashboard}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="space-y-6 mb-8">
            {/* Invoice Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Total Invoice Amount
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        €{totalAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {filteredInvoices.length} invoices
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Paid Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        €{paidAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Amount</p>
                      <p className="text-2xl font-bold text-amber-600">
                        €{pendingAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quote Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Quote Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        €{totalQuoteAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {filteredQuotes.length} quotes
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Sent Quotes</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {sentQuotes}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Accepted Quotes</p>
                      <p className="text-2xl font-bold text-green-600">
                        {acceptedQuotes}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filters and Search */}
          <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search invoices and quotes by customer/client name or number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/60 backdrop-blur-sm border border-white/30"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48 bg-white/60 backdrop-blur-sm border border-white/30">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="invoices">Invoices Only</SelectItem>
                      <SelectItem value="quotes">Quotes Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 bg-white/60 backdrop-blur-sm border border-white/30">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Interface */}
          <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Invoice Management
                </CardTitle>
                <Button
                  onClick={refreshAllData}
                  variant="outline"
                  size="sm"
                  disabled={loading || quotesLoading}
                  className="ml-auto"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      loading || quotesLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>
            </CardHeader>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="px-6 pt-2 pb-4 border-b">
                <TabsList className="inline-flex h-auto w-full items-center justify-start gap-2 rounded-xl bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-1">
                  <TabsTrigger
                    value="invoices"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=active]:font-bold"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Invoices & Quotes</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="service-items"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=active]:font-bold"
                  >
                    <Wrench className="h-4 w-4" />
                    <span>Service Items</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="bill-of-materials"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=active]:font-bold"
                  >
                    <Package className="h-4 w-4" />
                    <span>Materials</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="invoice-history"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=active]:font-bold"
                  >
                    <History className="h-4 w-4" />
                    <span>History</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Invoices Tab */}
              <TabsContent value="invoices" className="mt-0 p-0">
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading invoices...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                        <div className="flex items-center justify-center mb-3">
                          <div className="bg-red-100 p-3 rounded-full">
                            <FileText className="w-8 h-8 text-red-600" />
                          </div>
                        </div>
                        <h3 className="text-red-800 font-semibold mb-2">
                          Error Loading Invoices
                        </h3>
                        <p className="text-red-600 mb-4">{error}</p>

                        <div className="flex items-center justify-center gap-3 mb-4">
                          <Button
                            onClick={refreshAllData}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Try Again
                          </Button>
                          <Button
                            onClick={() => setShowDebug(!showDebug)}
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            {showDebug ? "Hide" : "Show"} Debug Info
                          </Button>
                        </div>

                        {showDebug && (
                          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
                            <h4 className="font-semibold text-gray-800 mb-2">
                              Debug Information:
                            </h4>
                            <div className="text-sm text-gray-700 space-y-1">
                              <p>
                                <strong>API Endpoint:</strong> {SUPABASE_URL}
                                /functions/v1/invoices
                              </p>
                              <p>
                                <strong>Has Access Token:</strong>{" "}
                                {accessToken ? "Yes" : "No"}
                              </p>
                              <p>
                                <strong>Error Message:</strong> {error}
                              </p>
                              <p className="text-xs text-gray-600 mt-2">
                                Check browser console (F12) for detailed logs
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Number</TableHead>
                            <TableHead>Customer/Client</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Due/Expires</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {combinedItems.map((item) => (
                            <TableRow
                              key={
                                item.type === "invoice"
                                  ? item.id
                                  : item.id_quote
                              }
                              className={`hover:${
                                item.type === "invoice"
                                  ? "bg-blue-50/50"
                                  : "bg-green-50/50"
                              }`}
                            >
                              <TableCell>
                                <Badge
                                  className={`${
                                    item.type === "invoice"
                                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                      : "bg-gradient-to-r from-green-500 to-blue-500 text-white"
                                  }`}
                                >
                                  {item.type === "invoice"
                                    ? "INVOICE"
                                    : "QUOTE"}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.type === "invoice"
                                  ? item.invoice_number
                                  : `QUO-${item.id_quote
                                      .slice(0, 8)
                                      .toUpperCase()}`}
                              </TableCell>
                              <TableCell>
                                {item.type === "invoice"
                                  ? item.customer_name
                                  : item.client_name || "Unnamed Client"}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {item.type === "invoice"
                                  ? item.customer_email || (
                                      <span className="text-gray-400 italic">
                                        No email
                                      </span>
                                    )
                                  : item.client_email || (
                                      <span className="text-gray-400 italic">
                                        No email
                                      </span>
                                    )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`${
                                    item.type === "invoice"
                                      ? getStatusColor(item.status)
                                      : item.status === "draft"
                                      ? "bg-gray-100 text-gray-800 border-gray-200"
                                      : item.status === "sent"
                                      ? "bg-blue-100 text-blue-800 border-blue-200"
                                      : item.status === "accepted"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : item.status === "rejected"
                                      ? "bg-red-100 text-red-800 border-red-200"
                                      : "bg-gray-100 text-gray-800 border-gray-200"
                                  }`}
                                  variant="outline"
                                >
                                  {item.status
                                    ? item.status.charAt(0).toUpperCase() +
                                      item.status.slice(1)
                                    : "Unknown"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {item.type === "invoice" ? (
                                  new Date(item.date).toLocaleDateString()
                                ) : (
                                  <div className="flex flex-col">
                                    <span className="text-sm">
                                      {new Date(
                                        item.created_at
                                      ).toLocaleDateString()}
                                    </span>
                                    {item.sent_at && (
                                      <span className="text-xs text-gray-500">
                                        Sent:{" "}
                                        {new Date(
                                          item.sent_at
                                        ).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {item.type === "invoice" ? (
                                  new Date(item.due_date).toLocaleDateString()
                                ) : item.expires_at ? (
                                  <span
                                    className={
                                      new Date(item.expires_at) < new Date()
                                        ? "text-red-600 font-medium"
                                        : ""
                                    }
                                  >
                                    {new Date(
                                      item.expires_at
                                    ).toLocaleDateString()}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 italic">
                                    No expiry
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="font-semibold">
                                {item.type === "invoice"
                                  ? `${
                                      item.currency === "EUR" ? "€" : "$"
                                    }${item.amount.toLocaleString()}`
                                  : `€${(item.total || 0).toFixed(2)}`}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {item.type === "invoice" ? (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          navigate(`/invoice/${item.id}`)
                                        }
                                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        title="View Invoice"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      {item.status === "pending" && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            alert(
                                              `Sending invoice ${item.invoice_number} to ${item.customer_name}`
                                            );
                                          }}
                                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                          title="Send Payment Reminder"
                                        >
                                          <Send className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      {/* Quote actions based on status */}
                                      {item.status === "draft" && (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleViewQuote(item)
                                            }
                                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            title="View/Edit Quote"
                                          >
                                            <Edit className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleSendToCustomer(item)
                                            }
                                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                            title="Send to Customer"
                                          >
                                            <Send className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleDeleteQuote(item)
                                            }
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            title="Delete Quote"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </>
                                      )}
                                      {item.status === "sent" && (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleViewQuote(item)
                                            }
                                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            title="View Quote"
                                          >
                                            <Eye className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleSendToCustomer(item)
                                            }
                                            className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                            title="Resend Email"
                                          >
                                            <RefreshCw className="w-4 h-4" />
                                          </Button>
                                        </>
                                      )}
                                      {(item.status === "accepted" ||
                                        item.status === "rejected") && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleViewQuote(item)}
                                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                          title="View Quote"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {combinedItems.length === 0 && !error && (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-gray-800 mb-2">
                            No invoices or quotes found
                          </h3>
                          <p className="text-gray-600">
                            {searchTerm ||
                            statusFilter !== "all" ||
                            typeFilter !== "all"
                              ? "Try adjusting your search or filters"
                              : "Create your first invoice or quote using voice recording or chatbot"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </TabsContent>

              {/* Service Items Tab */}
              <TabsContent value="service-items" className="mt-0 p-0">
                <CardContent className="py-12">
                  <div className="text-center max-w-2xl mx-auto">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Wrench className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Service Items Management
                    </h3>
                    <p className="text-gray-600 mb-8">
                      Manage your service catalog and pricing. This feature is
                      coming soon!
                    </p>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                      <p className="text-sm text-gray-700">
                        <strong>Coming Soon:</strong> You'll be able to create
                        and manage service items, set custom pricing, and
                        organize your service catalog for easy quote and invoice
                        generation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>

              {/* Bill of Materials Tab */}
              <TabsContent value="bill-of-materials" className="mt-0 p-0">
                <CardContent className="py-12">
                  <div className="text-center max-w-2xl mx-auto">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Package className="w-12 h-12 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Bill of Materials
                    </h3>
                    <p className="text-gray-600 mb-8">
                      Track materials and costs for your projects. This feature
                      is coming soon!
                    </p>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                      <p className="text-sm text-gray-700">
                        <strong>Coming Soon:</strong> You'll be able to create
                        detailed bills of materials, track material costs, and
                        integrate them into your quotes and invoices.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>

              {/* Invoice History Tab */}
              <TabsContent value="invoice-history" className="mt-0 p-0">
                <CardContent className="py-12">
                  <div className="text-center max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <History className="w-12 h-12 text-pink-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Invoice History
                    </h3>
                    <p className="text-gray-600 mb-8">
                      View detailed history and analytics for all your invoices
                      and quotes.
                    </p>
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-xl border border-pink-200">
                      <p className="text-sm text-gray-700">
                        <strong>Coming Soon:</strong> Comprehensive history
                        tracking, analytics dashboard, and detailed reporting
                        for your business insights.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Materials Quote Dialog */}
          <Dialog
            open={materialsQuoteDialogOpen}
            onOpenChange={setMaterialsQuoteDialogOpen}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Request Materials Quote</DialogTitle>
              </DialogHeader>
              {selectedInvoiceForMaterials && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Invoice: {selectedInvoiceForMaterials.invoice_number}
                    </h4>
                    <p className="text-blue-700">
                      Customer: {selectedInvoiceForMaterials.customer_name}
                    </p>
                    <p className="text-blue-700">
                      Amount: €
                      {selectedInvoiceForMaterials.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="materials-description">
                        Materials Description
                      </Label>
                      <textarea
                        id="materials-description"
                        className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        placeholder="Describe the materials needed for this project..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="materials-budget">Estimated Budget</Label>
                      <Input
                        id="materials-budget"
                        type="number"
                        placeholder="Enter estimated budget for materials"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setMaterialsQuoteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        toast.success("Materials quote request sent!");
                        setMaterialsQuoteDialogOpen(false);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Send Request
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* New Quote Dialog */}
          <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
            <DialogContent
              className="max-w-5xl p-0 flex flex-col [&>button]:top-6 [&>button]:right-6 [&>button]:bg-white [&>button]:hover:bg-gray-100 [&>button]:rounded-full [&>button]:shadow-md [&>button]:h-8 [&>button]:w-8 [&>button]:opacity-100"
              style={{ height: "85vh", maxHeight: "85vh" }}
            >
              <DialogHeader className="px-6 py-4 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-b flex-shrink-0">
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-green-600" />
                  Create New Quote
                </DialogTitle>
              </DialogHeader>

              <div
                className="flex-1 overflow-y-auto p-6"
                style={{ minHeight: 0 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Client */}
                    <Card className="border-green-200">
                      <CardHeader className="p-4 pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-600" />
                          Client
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Select
                          value={selectedClientId}
                          onValueChange={setSelectedClientId}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select client..." />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem
                                key={client.id}
                                value={client.id.toString()}
                              >
                                {client.client_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>

                    {/* Expiration Date */}
                    <Card className="border-orange-200">
                      <CardHeader className="p-4 pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          Expiration Date
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <input
                          type="date"
                          value={expirationDate}
                          onChange={(e) => setExpirationDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full h-10 text-sm border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Select expiration date (optional)"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Leave empty for no expiration (default: 30 days)
                        </p>
                      </CardContent>
                    </Card>

                    {/* Items */}
                    <Card className="border-purple-200">
                      <CardHeader className="p-4 pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Package className="w-4 h-4 text-purple-600" />
                          Available Items
                          <Badge
                            variant="secondary"
                            className="ml-auto text-xs"
                          >
                            {items.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div
                          className="overflow-y-auto px-4 pb-4"
                          style={{ height: "300px", maxHeight: "300px" }}
                        >
                          {items.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                              <Package className="w-12 h-12 mx-auto mb-2" />
                              <p className="text-sm">No items available</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between p-3 hover:bg-purple-50 rounded-lg border border-transparent hover:border-purple-200 transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                      {item.name}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {item.default_price
                                        ? `€${item.default_price.toFixed(2)}`
                                        : "No price"}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => addItemToQuote(item.id)}
                                    className="ml-3 h-8 w-8 p-0 bg-purple-600 hover:bg-purple-700"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column */}
                  <div>
                    <Card className="border-green-200">
                      <CardHeader className="p-4 pb-3 bg-gradient-to-r from-green-50 to-emerald-50">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          Quote Preview
                          {selectedItems.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-auto text-xs bg-green-100"
                            >
                              {selectedItems.length}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>

                      {selectedItems.length === 0 ? (
                        <CardContent className="p-12 text-center">
                          <Calculator className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                          <p className="text-sm text-gray-400">
                            Add items to preview your quote
                          </p>
                        </CardContent>
                      ) : (
                        <>
                          <CardContent className="p-0">
                            <div
                              className="overflow-y-auto divide-y"
                              style={{ maxHeight: "350px" }}
                            >
                              {selectedItems.map((item, index) => (
                                <div key={index} className="p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="text-sm font-medium flex-1">
                                      {getItemName(item.item_id)}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        removeItemFromQuote(item.item_id)
                                      }
                                      className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 -mt-1"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <Label className="text-xs text-gray-600 mb-1">
                                        Qty
                                      </Label>
                                      <Input
                                        type="number"
                                        min="1"
                                        value={item.qty}
                                        onChange={(e) =>
                                          updateItemQuantity(
                                            item.item_id,
                                            parseInt(e.target.value) || 0
                                          )
                                        }
                                        className="h-9 text-sm"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-600 mb-1">
                                        Price
                                      </Label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={item.price}
                                        onChange={(e) =>
                                          updateItemPrice(
                                            item.item_id,
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                        className="h-9 text-sm"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs text-gray-600 mb-1">
                                        Total
                                      </Label>
                                      <div className="h-9 flex items-center justify-center bg-green-50 border border-green-200 rounded-md text-sm font-semibold text-green-700">
                                        €{(item.qty * item.price).toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>

                          <CardContent className="p-4 bg-gray-50 border-t">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">
                                  €{subtotal.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  VAT (21%):
                                </span>
                                <span className="font-medium">
                                  €{tax.toFixed(2)}
                                </span>
                              </div>
                              <div className="border-t pt-2">
                                <div className="flex justify-between text-base font-bold text-green-700">
                                  <span>Total:</span>
                                  <span>€{total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </>
                      )}
                    </Card>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                <div className="text-sm text-gray-600">
                  {selectedItems.length > 0 && (
                    <span>
                      {selectedItems.length} item
                      {selectedItems.length !== 1 ? "s" : ""} • €
                      {total.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsQuoteDialogOpen(false)}
                    className="h-10 px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleCreateQuote("draft")}
                    disabled={isCreating || selectedItems.length === 0}
                    variant="outline"
                    className="h-10 px-4 border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button>
                  <Button
                    onClick={() => handleCreateQuote("sent")}
                    disabled={isCreating || selectedItems.length === 0}
                    className="h-10 px-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isCreating ? "Sending..." : "Send Quote"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Send Quote Confirmation Dialog */}
          <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Send Quote to Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm">
                    <strong>Client:</strong> {selectedQuote?.client_name}
                  </p>
                  <p className="text-sm">
                    <strong>Email:</strong> {selectedQuote?.client_email}
                  </p>
                  <p className="text-sm">
                    <strong>Quote Number:</strong> QUO-
                    {selectedQuote?.id_quote?.slice(-8)}
                  </p>
                  <p className="text-sm">
                    <strong>Total:</strong> €
                    {selectedQuote?.total?.toFixed(2) || "0.00"}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-gray-800 mb-2">
                    📧 What will be sent:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>Email with quote details and itemized list</li>
                    <li>Accept and Reject buttons in email</li>
                    <li>Professional quote presentation</li>
                  </ul>

                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">Review Link:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-white px-2 py-1 rounded flex-1 truncate">
                        {window.location.origin}/quote/
                        {selectedQuote?.id_quote?.slice(0, 8)}.../response
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => {
                          const link = `${window.location.origin}/quote/${selectedQuote?.id_quote}/response`;
                          navigator.clipboard.writeText(link);
                          toast.success("Link copied to clipboard!", {
                            duration: 2000,
                          });
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  The customer will receive an email with a link to review and
                  respond to the quote. They can accept or reject it directly
                  from the email or review page.
                </p>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsSendDialogOpen(false)}
                    disabled={isSending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmSend}
                    disabled={isSending}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    size="lg"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Quote Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
