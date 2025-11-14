// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { supabase } from "../utils/supabase/client";
// import {
//   Loader2,
//   ArrowLeft,
//   Printer,
//   Edit,
//   Plus,
//   Trash2,
//   CreditCard,
//   Lock,
//   Send,
//   Save,
//   Clock,
//   CheckCircle2,
//   X,
//   Eye,
// } from "lucide-react";
// import { toast } from "sonner";

// // TypeScript declarations for payment APIs
// declare global {
//   interface Window {
//     ApplePaySession?: {
//       canMakePayments(): boolean;
//       new (version: number, paymentRequest: any): any;
//     };
//     google?: {
//       payments?: any;
//     };
//   }
// }

// interface InvoiceItem {
//   // New invoice item fields (from generate_invoice)
//   category?: string;
//   service_description?: string;
//   type?: string;
//   min_price?: number;
//   max_price?: number;
//   ave_price?: number;
//   currency_code?: string;
//   // Common/legacy fields
//   name?: string;
//   description?: string;
//   quantity: number;
//   unit_price: number;
//   total: number;
// }

// interface InvoiceData {
//   id: string;
//   invoice_number: string;
//   customer_name: string;
//   customer_email: string | null;
//   customer_phone?: string | null;
//   customer_address?: string;
//   amount: number;
//   status: string;
//   date: string;
//   sent_at?: string; // Add sent_at field for quotes
//   due_date: string;
//   items: InvoiceItem[];
//   notes: string | null;
//   subtotal: number;
//   tax_rate: number;
//   tax_amount: number;
//   currency: string;
//   discount_rate?: number;
//   discount_amount?: number;
// }

// export default function InvoicePage() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [invoice, setInvoice] = useState<InvoiceData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [editMode, setEditMode] = useState(false);
//   const [items, setItems] = useState<InvoiceItem[]>([]);
//   const [originalItems, setOriginalItems] = useState<InvoiceItem[]>([]);
//   const [originalInvoice, setOriginalInvoice] = useState<InvoiceData | null>(
//     null
//   );
//   const [saving, setSaving] = useState(false);
//   const [showDiscardDialog, setShowDiscardDialog] = useState(false);
//   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
//   const [isQuote, setIsQuote] = useState(false);

//   useEffect(() => {
//     if (id) {
//       fetchInvoice(id);
//     }
//   }, [id]);

//   const fetchInvoice = async (invoiceId: string) => {
//     try {
//       setLoading(true);

//       // Try fetching from invoices table first
//       const { data: invoiceData, error: invoiceError } = await supabase
//         .from("invoices")
//         .select("*")
//         .eq("id_invoice", invoiceId)
//         .single();

//       // If not found in invoices, try quotes table as fallback
//       if (invoiceError || !invoiceData) {
//         const { data: quoteData, error: quoteError } = await supabase
//           .from("quotes")
//           .select("*")
//           .eq("id_quote", invoiceId)
//           .single();

//         if (quoteError) throw quoteError;

//         if (!quoteData) {
//           toast.error("Invoice or Quote not found");
//           navigate("/invoices");
//           return;
//         }

//         // Parse quote data as invoice
//         const itemsData = quoteData.items || {};
//         const invoiceItems = Array.isArray(quoteData.items)
//           ? quoteData.items
//           : itemsData.items || [];

//         // Extract metadata if stored in items object
//         const metadata = itemsData.metadata || {};

//         const parsedInvoiceData: InvoiceData = {
//           id: String(quoteData.id_quote),
//           invoice_number: `QUO-${String(quoteData.id_quote)
//             .substring(0, 8)
//             .toUpperCase()}`,
//           customer_name: quoteData.client_name ?? "Unknown",
//           customer_email: quoteData.client_email || null,
//           customer_phone: metadata.client_phone || null,
//           customer_address: metadata.client_address || "",
//           amount: Number(quoteData.total ?? 0),
//           status: quoteData.status, // Preserve original quote status
//           date: quoteData.created_at,
//           sent_at: quoteData.sent_at, // Include sent_at timestamp
//           due_date: quoteData.expires_at || quoteData.created_at,
//           items: invoiceItems.map((item: any) => ({
//             name:
//               item.category ||
//               item.name ||
//               item.service_description ||
//               "Unnamed Item",
//             description: item.service_description || item.description || "",
//             quantity: item.quantity || item.qty || 1,
//             unit_price: item.unit_price || item.price || item.ave_price || 0,
//             total:
//               item.total ||
//               (item.quantity || item.qty || 1) *
//                 (item.unit_price || item.price || item.ave_price || 0),
//           })),
//           notes: metadata.notes || null,
//           subtotal:
//             metadata.subtotal || (quoteData.total ? quoteData.total / 1.21 : 0),
//           tax_rate: metadata.tax_rate || 0.21,
//           tax_amount:
//             metadata.tax_amount ||
//             (quoteData.total ? (quoteData.total * 0.21) / 1.21 : 0),
//           currency: "EUR",
//           discount_rate: metadata.discount_rate || 0,
//           discount_amount: metadata.discount_amount || 0,
//         };

//         setInvoice(parsedInvoiceData);
//         setItems(parsedInvoiceData.items);
//         setIsQuote(true);
//         return;
//       }

//       // Parse invoice data from invoices table
//       const invoiceItems = Array.isArray(invoiceData.items)
//         ? invoiceData.items
//         : [];

//       const parsedInvoiceData: InvoiceData = {
//         id: String(invoiceData.id_invoice),
//         invoice_number: invoiceData.invoice_number,
//         customer_name: invoiceData.customer_name,
//         customer_email: invoiceData.customer_email || null,
//         customer_phone: invoiceData.customer_phone || null,
//         customer_address: invoiceData.customer_address || "",
//         amount: Number(invoiceData.total),
//         status: invoiceData.status,
//         date: invoiceData.invoice_date,
//         due_date: invoiceData.due_date,
//         items: invoiceItems.map((item: any) => ({
//           // Support both old format (name/description) and new format (category/service_description)
//           name: item.name || item.category || "Unnamed Item",
//           description: item.description || item.service_description || "",
//           quantity: item.quantity || 1,
//           unit_price: item.unit_price || item.ave_price || 0,
//           total:
//             item.total ||
//             (item.quantity || 1) * (item.unit_price || item.ave_price || 0),
//           // Keep original fields for display
//           category: item.category,
//           service_description: item.service_description,
//           type: item.type,
//           ave_price: item.ave_price,
//           min_price: item.min_price,
//           max_price: item.max_price,
//           currency_code: item.currency_code,
//         })),
//         notes: invoiceData.notes || null,
//         subtotal: Number(invoiceData.subtotal),
//         tax_rate: Number(invoiceData.tax_rate),
//         tax_amount: Number(invoiceData.tax_amount),
//         currency: invoiceData.currency || "USD",
//         discount_rate: Number(invoiceData.discount_rate),
//         discount_amount: Number(invoiceData.discount_amount),
//       };

//       setInvoice(parsedInvoiceData);
//       setItems(parsedInvoiceData.items);
//       setIsQuote(false);
//       // Store original values for potential reset
//       setOriginalItems(JSON.parse(JSON.stringify(parsedInvoiceData.items)));
//       setOriginalInvoice(JSON.parse(JSON.stringify(parsedInvoiceData)));
//     } catch (error: any) {
//       console.error("Error fetching invoice:", error);
//       toast.error(error.message || "Failed to load invoice");
//       navigate("/invoices");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleEditMode = () => {
//     if (editMode && hasUnsavedChanges) {
//       // Show discard warning dialog
//       setShowDiscardDialog(true);
//     } else {
//       setEditMode(!editMode);
//       if (!editMode) {
//         // Entering edit mode
//         setHasUnsavedChanges(false);
//       }
//     }
//   };

//   const handleDiscardChanges = () => {
//     // Revert to original values
//     if (originalInvoice && originalItems) {
//       setInvoice(JSON.parse(JSON.stringify(originalInvoice)));
//       setItems(JSON.parse(JSON.stringify(originalItems)));
//     }
//     setEditMode(false);
//     setHasUnsavedChanges(false);
//     setShowDiscardDialog(false);
//     toast.info("Changes discarded");
//   };

//   const addNewItem = () => {
//     const newItem: InvoiceItem = {
//       name: "New Service",
//       description: "Service description",
//       quantity: 1,
//       unit_price: 100,
//       total: 100,
//     };
//     setItems([...items, newItem]);
//     calculateTotals([...items, newItem]);
//     setHasUnsavedChanges(true);
//   };

//   const removeItem = (index: number) => {
//     const updatedItems = items.filter((_, i) => i !== index);
//     setItems(updatedItems);
//     calculateTotals(updatedItems);
//     setHasUnsavedChanges(true);
//   };

//   const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
//     const updatedItems = [...items];
//     updatedItems[index] = { ...updatedItems[index], [field]: value };

//     // Recalculate total for this item
//     if (field === "quantity" || field === "unit_price") {
//       updatedItems[index].total =
//         updatedItems[index].quantity * updatedItems[index].unit_price;
//     }

//     setItems(updatedItems);
//     calculateTotals(updatedItems);
//     setHasUnsavedChanges(true);
//   };

//   const calculateTotals = (currentItems: InvoiceItem[]) => {
//     if (!invoice) return;

//     const subtotal = currentItems.reduce((sum, item) => sum + item.total, 0);
//     const discountRate = invoice.discount_rate || 0.05;
//     const taxRate = invoice.tax_rate || 0.085;

//     const discountAmount = subtotal * discountRate;
//     const taxableAmount = subtotal - discountAmount;
//     const taxAmount = taxableAmount * taxRate;
//     const total = taxableAmount + taxAmount;

//     setInvoice({
//       ...invoice,
//       items: currentItems,
//       subtotal,
//       discount_amount: discountAmount,
//       tax_amount: taxAmount,
//       amount: total,
//     });
//   };

//   const updateTaxRate = (newRate: number) => {
//     if (!invoice) return;
//     const taxRate = newRate / 100; // Convert percentage to decimal
//     const discountAmount = invoice.subtotal * (invoice.discount_rate || 0);
//     const taxableAmount = invoice.subtotal - discountAmount;
//     const taxAmount = taxableAmount * taxRate;
//     const total = taxableAmount + taxAmount;

//     setInvoice({
//       ...invoice,
//       tax_rate: taxRate,
//       tax_amount: taxAmount,
//       amount: total,
//     });
//     setHasUnsavedChanges(true);
//   };

//   const updateDiscountRate = (newRate: number) => {
//     if (!invoice) return;
//     const discountRate = newRate / 100; // Convert percentage to decimal
//     const discountAmount = invoice.subtotal * discountRate;
//     const taxableAmount = invoice.subtotal - discountAmount;
//     const taxAmount = taxableAmount * (invoice.tax_rate || 0);
//     const total = taxableAmount + taxAmount;

//     setInvoice({
//       ...invoice,
//       discount_rate: discountRate,
//       discount_amount: discountAmount,
//       tax_amount: taxAmount,
//       amount: total,
//     });
//     setHasUnsavedChanges(true);
//   };

//   const handleSaveChanges = async () => {
//     if (!invoice) return;

//     // Only quotes can be edited, not invoices
//     if (!isQuote) {
//       toast.error("Invoices cannot be edited");
//       return;
//     }

//     try {
//       setSaving(true);

//       // Update only fields that exist in quotes table
//       // Store additional fields (tax_rate, discount_rate, etc.) in items JSONB metadata
//       // Check if items is already an object with metadata or just an array
//       // We need to fetch the current quote to check existing structure
//       const { data: currentQuote } = await supabase
//         .from("quotes")
//         .select("items")
//         .eq("id_quote", invoice.id)
//         .single();

//       const existingItemsData = currentQuote?.items || items;
//       const existingMetadata =
//         typeof existingItemsData === "object" &&
//         !Array.isArray(existingItemsData) &&
//         existingItemsData.metadata
//           ? existingItemsData.metadata
//           : {};

//       // Prepare items structure - store as object with items array and metadata
//       const itemsWithMetadata = {
//         items: items,
//         metadata: {
//           ...existingMetadata,
//           subtotal: invoice.subtotal,
//           tax_rate: invoice.tax_rate,
//           tax_amount: invoice.tax_amount,
//           discount_rate: invoice.discount_rate || 0,
//           discount_amount: invoice.discount_amount || 0,
//           notes: invoice.notes,
//           client_phone: invoice.customer_phone,
//           client_address: invoice.customer_address,
//         },
//       };

//       const { error } = await supabase
//         .from("quotes")
//         .update({
//           client_name: invoice.customer_name,
//           client_email: invoice.customer_email,
//           items: itemsWithMetadata,
//           total: invoice.amount,
//           updated_at: new Date().toISOString(),
//         })
//         .eq("id_quote", invoice.id);

//       if (error) throw error;

//       toast.success("Quote saved successfully!");
//       setEditMode(false);
//       setHasUnsavedChanges(false);

//       // Refresh quote data
//       await fetchInvoice(invoice.id);
//     } catch (error: any) {
//       console.error("Error saving quote:", error);
//       toast.error(error.message || "Failed to save quote");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const formatCurrency = (amount: number) => {
//     const currencyCode = invoice?.currency || "USD";
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: currencyCode,
//     }).format(amount);
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const getStatusBadgeClass = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case "paid":
//         return "status-paid";
//       case "pending":
//         return "status-pending";
//       case "overdue":
//         return "status-overdue";
//       case "canceled":
//         return "status-canceled";
//       case "draft":
//         return "status-draft";
//       case "sent":
//         return "status-sent";
//       case "accepted":
//         return "status-paid"; // Use same styling as paid
//       case "rejected":
//         return "status-canceled"; // Use same styling as canceled
//       default:
//         return "status-pending";
//     }
//   };

//   const handlePayment = (method: string) => {
//     if (!invoice) return;

//     const invoiceAmount = invoice.amount.toFixed(2);
//     const invoiceNumber = invoice.invoice_number;

//     toast.info(
//       `Initiating ${method} payment for ${formatCurrency(invoice.amount)}`
//     );

//     setTimeout(() => {
//       switch (method) {
//         case "stripe":
//           // Enhanced Stripe integration with proper parameters
//           const stripeAmount = Math.round(invoice.amount * 100); // Convert to cents
//           window.open(
//             `https://checkout.stripe.com/pay?amount=${stripeAmount}&currency=${
//               invoice.currency || "usd"
//             }&invoice=${invoiceNumber}&client_reference_id=${invoiceNumber}`,
//             "_blank"
//           );
//           break;
//         case "paypal":
//           // Enhanced PayPal integration with proper parameters
//           window.open(
//             `https://www.paypal.com/invoice/pay?invoice=${invoiceNumber}&amount=${invoiceAmount}&currency=${
//               invoice.currency || "USD"
//             }`,
//             "_blank"
//           );
//           break;
//         case "apple":
//           // Check if Apple Pay is available
//           if (
//             window.ApplePaySession &&
//             window.ApplePaySession.canMakePayments()
//           ) {
//             toast.info(
//               `Apple Pay available - Invoice: ${invoiceNumber}, Amount: ${formatCurrency(
//                 invoice.amount
//               )}`
//             );
//             // In a real implementation, you would initialize Apple Pay session here
//             // const session = new ApplePaySession(3, paymentRequest);
//           } else {
//             toast.error("Apple Pay is not available on this device");
//           }
//           break;
//         case "google":
//           // Check if Google Pay is available
//           if (window.google && window.google.payments) {
//             toast.info(
//               `Google Pay available - Invoice: ${invoiceNumber}, Amount: ${formatCurrency(
//                 invoice.amount
//               )}`
//             );
//             // In a real implementation, you would initialize Google Pay here
//           } else {
//             toast.error(
//               "Google Pay is not available. Please use an alternative payment method."
//             );
//           }
//           break;
//         case "revolut":
//           // Open Revolut Business payment link
//           window.open(
//             `https://business.revolut.com/pay?invoice=${invoiceNumber}&amount=${invoiceAmount}&currency=${
//               invoice.currency || "USD"
//             }`,
//             "_blank"
//           );
//           break;
//         default:
//           toast.error("Payment method not configured");
//       }
//     }, 500);
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   const handleSendQuote = async () => {
//     if (!invoice || !isQuote) return;

//     if (!invoice.customer_email) {
//       toast.error("Client email is required to send quote");
//       return;
//     }

//     const confirmed = window.confirm(
//       `Send quote ${invoice.invoice_number} to ${invoice.customer_email}?`
//     );

//     if (!confirmed) return;

//     try {
//       setSaving(true);

//       // Update quote status to 'sent'
//       const { error: updateError } = await supabase
//         .from("quotes")
//         .update({
//           status: "sent",
//           updated_at: new Date().toISOString(),
//           sent_at: new Date().toISOString(), // Explicitly set sent_at for consistency
//         })
//         .eq("id_quote", invoice.id);

//       if (updateError) throw updateError;

//       // Send email to customer
//       const response = await fetch(
//         `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${
//               (
//                 await supabase.auth.getSession()
//               ).data.session?.access_token
//             }`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             type: "quote",
//             to: invoice.customer_email,
//             data: {
//               quoteId: invoice.id,
//               customerName: invoice.customer_name,
//               items: invoice.items,
//               totalCost: invoice.amount,
//               responseUrl: `${window.location.origin}/quote/${invoice.id}/response`,
//               companyName: "MyAI Company",
//             },
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to send quote email");
//       }

//       toast.success("Quote sent successfully!");
//       await fetchInvoice(invoice.id);
//     } catch (error: any) {
//       console.error("Error sending quote:", error);
//       toast.error(error.message || "Failed to send quote");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleResendQuote = async () => {
//     if (!invoice || !isQuote) return;

//     if (!invoice.customer_email) {
//       toast.error("Client email is required to resend quote");
//       return;
//     }

//     try {
//       setSaving(true);

//       // Update status to 'sent' if currently rejected
//       if (invoice.status?.toLowerCase() === "rejected") {
//         const { error: updateError } = await supabase
//           .from("quotes")
//           .update({
//             status: "sent",
//             updated_at: new Date().toISOString(),
//           })
//           .eq("id_quote", invoice.id);

//         if (updateError) throw updateError;
//       }

//       const response = await fetch(
//         `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${
//               (
//                 await supabase.auth.getSession()
//               ).data.session?.access_token
//             }`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             type: "quote",
//             to: invoice.customer_email,
//             data: {
//               quoteId: invoice.id,
//               customerName: invoice.customer_name,
//               items: invoice.items,
//               totalCost: invoice.amount,
//               responseUrl: `${window.location.origin}/quote/${invoice.id}/response`,
//               companyName: "MyAI Company",
//             },
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to resend quote email");
//       }

//       toast.success("Quote resent successfully!");

//       // Refresh quote data to show new status
//       await fetchInvoice(invoice.id);
//     } catch (error: any) {
//       console.error("Error resending quote:", error);
//       toast.error(error.message || "Failed to resend quote");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDeleteQuote = async () => {
//     if (!invoice || !isQuote) return;

//     const confirmed = window.confirm(
//       `Delete quote ${invoice.invoice_number} for ${invoice.customer_name}? This action cannot be undone.`
//     );

//     if (!confirmed) return;

//     try {
//       setSaving(true);

//       const { error } = await supabase
//         .from("quotes")
//         .delete()
//         .eq("id_quote", invoice.id);

//       if (error) throw error;

//       toast.success("Quote deleted successfully");
//       navigate("/invoices");
//     } catch (error: any) {
//       console.error("Error deleting quote:", error);
//       toast.error(error.message || "Failed to delete quote");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
//           <p className="text-gray-600">Loading invoice...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!invoice) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-600 mb-4">Invoice not found</p>
//           <button
//             onClick={() => navigate("/invoices")}
//             className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//           >
//             Back to Invoices
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <style>{`
//         * {
//           box-sizing: border-box;
//         }

//         .invoice-container {
//           max-width: 800px;
//           margin: 20px auto;
//           background: white;
//           box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
//           border-radius: 10px;
//           overflow: hidden;
//         }

//         .invoice-header {
//           background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
//           color: white;
//           padding: 40px;
//           position: relative;
//         }

//         .invoice-header::before {
//           content: '';
//           position: absolute;
//           top: 0;
//           right: 0;
//           width: 100px;
//           height: 100px;
//           background: rgba(255, 255, 255, 0.1);
//           border-radius: 50%;
//           transform: translate(30px, -30px);
//         }

//         .header-content {
//           display: flex;
//           justify-content: space-between;
//           align-items: flex-start;
//           flex-wrap: wrap;
//           gap: 20px;
//         }

//         .company-info h1 {
//           font-size: 2.5rem;
//           font-weight: 700;
//           margin-bottom: 10px;
//           text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
//         }

//         .company-info p {
//           font-size: 1.1rem;
//           opacity: 0.9;
//           margin-bottom: 5px;
//         }

//         .invoice-details {
//           text-align: right;
//         }

//         .invoice-number {
//           font-size: 1.8rem;
//           font-weight: 600;
//           margin-bottom: 10px;
//         }

//         .invoice-date {
//           font-size: 1.1rem;
//           opacity: 0.9;
//         }

//         .invoice-body {
//           padding: 40px;
//         }

//         .billing-section {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 40px;
//           margin-bottom: 40px;
//         }

//         .billing-info h3 {
//           color: #8B5CF6;
//           font-size: 1.2rem;
//           margin-bottom: 15px;
//           padding-bottom: 8px;
//           border-bottom: 2px solid #e9ecef;
//         }

//         .billing-info p {
//           margin-bottom: 8px;
//           font-size: 1rem;
//         }

//         .edit-controls {
//           background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
//           padding: 20px;
//           margin-bottom: 30px;
//           border-radius: 8px;
//           border: 2px solid rgba(139, 92, 246, 0.2);
//           display: flex;
//           gap: 10px;
//           flex-wrap: wrap;
//           align-items: center;
//           justify-content: center;
//         }

//         .nav-button {
//           background: #6B7280;
//           color: white;
//           border: none;
//           padding: 12px 24px;
//           border-radius: 6px;
//           font-size: 1rem;
//           font-weight: 600;
//           cursor: pointer;
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           transition: all 0.3s ease;
//         }

//         .nav-button:hover {
//           background: #4B5563;
//           transform: translateY(-2px);
//         }

//         .edit-toggle {
//           background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
//           color: white;
//           border: none;
//           padding: 12px 24px;
//           border-radius: 6px;
//           font-size: 1rem;
//           font-weight: 600;
//           cursor: pointer;
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           transition: all 0.3s ease;
//         }

//         .edit-toggle:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
//         }

//         .edit-toggle.active {
//           background: #EF4444;
//         }

//         .add-item-btn {
//           background: #10B981;
//           color: white;
//           border: none;
//           padding: 12px 24px;
//           border-radius: 6px;
//           font-size: 1rem;
//           font-weight: 600;
//           cursor: pointer;
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           transition: all 0.3s ease;
//         }

//         .add-item-btn:hover {
//           background: #059669;
//           transform: translateY(-2px);
//         }

//         .print-btn {
//           background: #6366F1;
//           color: white;
//           border: none;
//           padding: 12px 24px;
//           border-radius: 6px;
//           font-size: 1rem;
//           font-weight: 600;
//           cursor: pointer;
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           transition: all 0.3s ease;
//         }

//         .print-btn:hover {
//           background: #4F46E5;
//           transform: translateY(-2px);
//         }

//         .approve-btn {
//           background: linear-gradient(135deg, #10B981 0%, #059669 100%);
//           color: white;
//           border: none;
//           padding: 12px 24px;
//           border-radius: 6px;
//           font-size: 1rem;
//           font-weight: 600;
//           cursor: pointer;
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           transition: all 0.3s ease;
//         }

//         .approve-btn:hover:not(:disabled) {
//           background: linear-gradient(135deg, #059669 0%, #047857 100%);
//           transform: translateY(-2px);
//           box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
//         }

//         .approve-btn:disabled {
//           opacity: 0.6;
//           cursor: not-allowed;
//         }

//         .send-btn {
//           background: #94A3B8;
//           color: white;
//           border: none;
//           padding: 12px 24px;
//           border-radius: 6px;
//           font-size: 1rem;
//           font-weight: 600;
//           cursor: not-allowed;
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           opacity: 0.7;
//         }

//         .save-btn {
//           background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
//           color: white;
//           border: none;
//           padding: 12px 24px;
//           border-radius: 6px;
//           font-size: 1rem;
//           font-weight: 600;
//           cursor: pointer;
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           transition: all 0.3s ease;
//         }

//         .save-btn:hover:not(:disabled) {
//           background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
//           transform: translateY(-2px);
//           box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
//         }

//         .save-btn:disabled {
//           opacity: 0.6;
//           cursor: not-allowed;
//         }

//         .items-table {
//           width: 100%;
//           border-collapse: collapse;
//           margin-bottom: 30px;
//           border-radius: 8px;
//           overflow: hidden;
//           box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//         }

//         .items-table thead {
//           background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
//           color: white;
//         }

//         .items-table th,
//         .items-table td {
//           padding: 15px;
//           text-align: left;
//           border-bottom: 1px solid #e9ecef;
//         }

//         .items-table th {
//           font-weight: 600;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//           font-size: 0.9rem;
//         }

//         .items-table tbody tr:hover {
//           background-color: #f8f9fa;
//           transition: background-color 0.3s ease;
//         }

//         .items-table .text-right {
//           text-align: right;
//         }

//         .editable {
//           background: transparent;
//           border: 2px solid transparent;
//           padding: 4px 8px;
//           border-radius: 4px;
//           font-family: inherit;
//           font-size: inherit;
//           font-weight: inherit;
//           color: inherit;
//           width: 100%;
//           transition: all 0.3s ease;
//         }

//         .editable:focus {
//           outline: none;
//           border-color: #8B5CF6;
//           background: rgba(139, 92, 246, 0.05);
//         }

//         .editable:disabled {
//           border-color: transparent;
//           background: transparent;
//         }

//         .editable.editing {
//           border-color: #8B5CF6;
//           background: rgba(139, 92, 246, 0.05);
//         }

//         .remove-item-btn {
//           background: #EF4444;
//           color: white;
//           border: none;
//           padding: 8px 12px;
//           border-radius: 4px;
//           font-size: 0.8rem;
//           cursor: pointer;
//           display: inline-flex;
//           align-items: center;
//           gap: 4px;
//           transition: all 0.3s ease;
//         }

//         .remove-item-btn:hover {
//           background: #DC2626;
//         }

//         .totals-section {
//           display: flex;
//           justify-content: flex-end;
//           margin-bottom: 40px;
//         }

//         .totals-table {
//           width: 300px;
//           border-collapse: collapse;
//         }

//         .totals-table td {
//           padding: 12px 15px;
//           border-bottom: 1px solid #e9ecef;
//         }

//         .totals-table .label {
//           font-weight: 500;
//           color: #666;
//         }

//         .totals-table .amount {
//           text-align: right;
//           font-weight: 600;
//         }

//         .totals-table .total-row {
//           background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
//           color: white;
//           font-size: 1.2rem;
//           font-weight: 700;
//         }

//         .totals-table .total-row td {
//           border-bottom: none;
//         }

//         .payment-section {
//           background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
//           border-radius: 12px;
//           padding: 30px;
//           margin-bottom: 30px;
//           border: 2px solid rgba(139, 92, 246, 0.1);
//         }

//         .payment-buttons {
//           text-align: center;
//         }

//         .payment-options {
//           display: flex;
//           flex-direction: column;
//           gap: 15px;
//           align-items: center;
//         }

//         .pay-button {
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           gap: 10px;
//           padding: 15px 30px;
//           border: none;
//           border-radius: 8px;
//           font-size: 1rem;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           min-width: 200px;
//         }

//         .pay-primary {
//           background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
//           color: white;
//           font-size: 1.1rem;
//           padding: 18px 40px;
//           box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
//         }

//         .pay-primary:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
//         }

//         .pay-secondary {
//           background: white;
//           color: #666;
//           border: 2px solid #e5e7eb;
//           padding: 12px 20px;
//           min-width: 120px;
//           font-size: 0.9rem;
//         }

//         .pay-secondary:hover {
//           border-color: #8B5CF6;
//           color: #8B5CF6;
//           transform: translateY(-1px);
//           box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
//         }

//         .payment-methods-row {
//           display: flex;
//           gap: 12px;
//           flex-wrap: wrap;
//           justify-content: center;
//         }

//         .payment-security {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 8px;
//           margin-top: 20px;
//           font-size: 0.85rem;
//           color: #666;
//         }

//         .payment-terms {
//           background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
//           padding: 25px;
//           border-radius: 8px;
//           margin-bottom: 30px;
//           border-left: 4px solid #8B5CF6;
//         }

//         .payment-terms h4 {
//           color: #8B5CF6;
//           margin-bottom: 15px;
//           font-size: 1.1rem;
//         }

//         .payment-terms p {
//           margin-bottom: 10px;
//           color: #666;
//         }

//         .footer {
//           text-align: center;
//           padding: 30px;
//           background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
//           color: #666;
//           font-size: 0.9rem;
//         }

//         .footer p {
//           margin-bottom: 5px;
//         }

//         .status-badge {
//           display: inline-block;
//           padding: 8px 16px;
//           border-radius: 20px;
//           font-size: 0.9rem;
//           font-weight: 600;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//         }

//         .status-paid {
//           background: linear-gradient(135deg, #10B981 0%, #059669 100%);
//           color: white;
//         }

//         .status-pending {
//           background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
//           color: white;
//         }

//         .status-overdue {
//           background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
//           color: white;
//         }

//         .status-canceled {
//           background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
//           color: white;
//         }

//         .status-draft {
//           background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
//           color: white;
//         }

//         .status-sent {
//           background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
//           color: white;
//         }

//         @media (max-width: 768px) {
//           .billing-section {
//             grid-template-columns: 1fr;
//           }

//           .header-content {
//             flex-direction: column;
//             text-align: center;
//           }

//           .invoice-details {
//             text-align: center;
//           }

//           .edit-controls {
//             flex-direction: column;
//           }

//           .payment-methods-row {
//             flex-direction: column;
//           }
//         }

//         @media print {
//           body {
//             background: white;
//           }

//           .edit-controls,
//           .nav-button,
//           .remove-item-btn {
//             display: none !important;
//           }

//           .invoice-container {
//             box-shadow: none;
//             border-radius: 0;
//             max-width: none;
//           }
//         }
//       `}</style>

//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
//         <div className="invoice-container">
//           {/* Header */}
//           <div className="invoice-header">
//             <div className="header-content">
//               <div className="company-info">
//                 <h1>MyAI Company</h1>
//                 <p>123 Innovation Street</p>
//                 <p>Tech City, State 12345</p>
//                 <p>Phone: (555) 123-4567</p>
//                 <p>Email: info@myai.com</p>
//               </div>
//               <div className="invoice-details">
//                 <div className="invoice-number">
//                   {invoice.invoice_number}
//                   {invoice.invoice_number.startsWith("QUO-") && (
//                     <span
//                       style={{
//                         marginLeft: "10px",
//                         padding: "4px 8px",
//                         backgroundColor: "rgba(34, 197, 94, 0.2)",
//                         border: "1px solid rgba(34, 197, 94, 0.3)",
//                         borderRadius: "4px",
//                         fontSize: "0.8rem",
//                         color: "#15803d",
//                         fontWeight: "500",
//                       }}
//                     >
//                       QUOTE
//                     </span>
//                   )}
//                 </div>
//                 <div className="invoice-date">
//                   Date: {formatDate(invoice.date)}
//                   {invoice.sent_at && (
//                     <div className="text-sm text-gray-600 mt-1">
//                       Sent: {formatDate(invoice.sent_at)}
//                     </div>
//                   )}
//                 </div>
//                 <div className="invoice-date">
//                   {invoice.invoice_number.startsWith("QUO-")
//                     ? "Expires:"
//                     : "Due Date:"}{" "}
//                   {formatDate(invoice.due_date)}
//                 </div>
//                 <div style={{ marginTop: "15px" }}>
//                   <span
//                     className={`status-badge ${getStatusBadgeClass(
//                       invoice.status
//                     )}`}
//                   >
//                     {invoice.status}
//                   </span>
//                   {invoice.status === "pending" && (
//                     <div
//                       style={{
//                         marginTop: "10px",
//                         padding: "8px 12px",
//                         backgroundColor: "rgba(245, 158, 11, 0.1)",
//                         border: "1px solid rgba(245, 158, 11, 0.3)",
//                         borderRadius: "6px",
//                         fontSize: "0.9rem",
//                         color: "#92400e",
//                       }}
//                     >
//                       <strong>Payment Pending</strong> - Send reminder to
//                       customer
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Status-specific banners */}
//           {isQuote && invoice.status?.toLowerCase() === "sent" && (
//             <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mx-6 mb-4">
//               <div className="flex items-center gap-2">
//                 <Clock size={20} className="text-blue-600" />
//                 <p className="text-blue-800 font-medium">
//                   ⏳ Waiting for customer response
//                 </p>
//               </div>
//               <p className="text-blue-600 text-sm mt-1">
//                 The customer has been sent this quote and can respond via the
//                 link in their email.
//               </p>
//             </div>
//           )}

//           {isQuote && invoice.status?.toLowerCase() === "accepted" && (
//             <div className="bg-green-50 border border-green-200 p-4 rounded-lg mx-6 mb-4">
//               <div className="flex items-center gap-2">
//                 <CheckCircle2 size={20} className="text-green-600" />
//                 <p className="text-green-800 font-medium">✓ Quote Accepted</p>
//               </div>
//               <p className="text-green-600 text-sm mt-1">
//                 This quote has been accepted by the customer and an invoice has
//                 been generated.
//               </p>
//             </div>
//           )}

//           {isQuote && invoice.status?.toLowerCase() === "rejected" && (
//             <div className="bg-red-50 border border-red-200 p-4 rounded-lg mx-6 mb-4">
//               <div className="flex items-center gap-2">
//                 <X size={20} className="text-red-600" />
//                 <p className="text-red-800 font-medium">✗ Quote Rejected</p>
//               </div>
//               <p className="text-red-600 text-sm mt-1">
//                 This quote has been rejected by the customer. You can edit the
//                 quote and resend it for reconsideration.
//               </p>
//             </div>
//           )}

//           {/* Body */}
//           <div className="invoice-body">
//             {/* Controls */}
//             <div className="edit-controls no-print">
//               <button
//                 className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 text-gray-700 rounded-lg transition-all duration-200"
//                 onClick={() => navigate("/invoices")}
//               >
//                 <ArrowLeft size={18} />
//                 Back to Invoices
//               </button>

//               {/* Invoice-specific controls */}
//               {!isQuote && (
//                 <>
//                   {/* Send Payment Reminder button - show if pending */}
//                   {invoice.status === "pending" && (
//                     <button
//                       className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg transition-all duration-200"
//                       onClick={async () => {
//                         if (!invoice.customer_email) {
//                           toast.error(
//                             "Customer email is required to send invoice"
//                           );
//                           return;
//                         }

//                         const confirmed = window.confirm(
//                           `Send payment reminder for invoice ${invoice.invoice_number} to ${invoice.customer_email}?`
//                         );

//                         if (!confirmed) return;

//                         try {
//                           setSaving(true);
//                           const response = await fetch(
//                             `${
//                               import.meta.env.VITE_SUPABASE_URL
//                             }/functions/v1/send-email`,
//                             {
//                               method: "POST",
//                               headers: {
//                                 Authorization: `Bearer ${
//                                   (
//                                     await supabase.auth.getSession()
//                                   ).data.session?.access_token
//                                 }`,
//                                 "Content-Type": "application/json",
//                               },
//                               body: JSON.stringify({
//                                 type: "payment_reminder",
//                                 to: invoice.customer_email,
//                                 data: {
//                                   customerName: invoice.customer_name,
//                                   invoiceNumber: invoice.invoice_number,
//                                   amount: invoice.amount,
//                                   dueDate: invoice.due_date,
//                                   companyName: "MyAI Company",
//                                   invoiceUrl: window.location.href,
//                                 },
//                               }),
//                             }
//                           );

//                           if (!response.ok) {
//                             throw new Error("Failed to send payment reminder");
//                           }

//                           toast.success(
//                             `Payment reminder sent successfully to ${invoice.customer_email}!`
//                           );
//                         } catch (error) {
//                           console.error(
//                             "Error sending payment reminder:",
//                             error
//                           );
//                           toast.error(
//                             "Failed to send payment reminder. Please try again."
//                           );
//                         } finally {
//                           setSaving(false);
//                         }
//                       }}
//                       disabled={saving}
//                     >
//                       <Send size={18} />
//                       {saving ? "Sending..." : "Send Payment Reminder"}
//                     </button>
//                   )}
//                 </>
//               )}

//               {/* Quote-specific controls */}
//               {isQuote && (
//                 <>
//                   {/* Draft quote controls */}
//                   {invoice.status?.toLowerCase() === "draft" && (
//                     <>
//                       <button
//                         className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-lg transition-all duration-200"
//                         onClick={toggleEditMode}
//                       >
//                         <Edit size={18} />
//                         {editMode ? "Disable Editing" : "Enable Editing"}
//                       </button>

//                       {editMode && (
//                         <>
//                           <button
//                             className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg shadow-lg transition-all duration-200"
//                             onClick={addNewItem}
//                           >
//                             <Plus size={18} />
//                             Add New Item
//                           </button>
//                           <button
//                             className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                             onClick={handleSaveChanges}
//                             disabled={saving}
//                           >
//                             <Save size={18} />
//                             {saving ? "Saving..." : "Save Changes"}
//                           </button>
//                         </>
//                       )}

//                       <button
//                         className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg shadow-lg transition-all duration-200"
//                         onClick={handleSendQuote}
//                         disabled={saving}
//                       >
//                         <Send size={18} />
//                         {saving ? "Sending..." : "Send to Customer"}
//                       </button>

//                       <button
//                         className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg shadow-lg transition-all duration-200"
//                         onClick={handleDeleteQuote}
//                         disabled={saving}
//                       >
//                         <Trash2 size={18} />
//                         Delete Draft
//                       </button>
//                     </>
//                   )}

//                   {/* Sent quote controls */}
//                   {invoice.status?.toLowerCase() === "sent" && (
//                     <>
//                       <button
//                         className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-lg transition-all duration-200"
//                         onClick={handleResendQuote}
//                         disabled={saving}
//                       >
//                         <Send size={18} />
//                         {saving ? "Resending..." : "Resend to Customer"}
//                       </button>

//                       <a
//                         href={`/quote/${invoice.id}/response`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg transition-all duration-200"
//                       >
//                         <Eye size={18} />
//                         View Customer Response Page
//                       </a>
//                     </>
//                   )}

//                   {/* Accepted quote controls */}
//                   {invoice.status?.toLowerCase() === "accepted" && (
//                     <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-lg">
//                       <CheckCircle2 size={18} />
//                       Quote Accepted
//                     </div>
//                   )}

//                   {/* Rejected quote controls */}
//                   {invoice.status?.toLowerCase() === "rejected" && (
//                     <>
//                       <button
//                         className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-lg transition-all duration-200"
//                         onClick={toggleEditMode}
//                       >
//                         <Edit size={18} />
//                         {editMode ? "Disable Editing" : "Enable Editing"}
//                       </button>

//                       {editMode && (
//                         <>
//                           <button
//                             className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg shadow-lg transition-all duration-200"
//                             onClick={addNewItem}
//                           >
//                             <Plus size={18} />
//                             Add New Item
//                           </button>
//                           <button
//                             className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                             onClick={handleSaveChanges}
//                             disabled={saving}
//                           >
//                             <Save size={18} />
//                             {saving ? "Saving..." : "Save Changes"}
//                           </button>
//                         </>
//                       )}

//                       <button
//                         className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg shadow-lg transition-all duration-200"
//                         onClick={handleResendQuote}
//                         disabled={saving}
//                       >
//                         <Send size={18} />
//                         {saving ? "Resending..." : "Resend to Customer"}
//                       </button>
//                     </>
//                   )}
//                 </>
//               )}

//               <button
//                 className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 text-gray-700 rounded-lg transition-all duration-200"
//                 onClick={handlePrint}
//               >
//                 <Printer size={18} />
//                 Print {isQuote ? "Quote" : "Invoice"}
//               </button>
//             </div>

//             {/* Billing Information */}
//             <div className="billing-section">
//               <div className="billing-info">
//                 <h3>Bill To:</h3>
//                 <p>
//                   <strong>{invoice.customer_name}</strong>
//                 </p>
//                 {invoice.customer_email && <p>{invoice.customer_email}</p>}
//                 {invoice.customer_phone && <p>{invoice.customer_phone}</p>}
//                 {invoice.customer_address && <p>{invoice.customer_address}</p>}
//               </div>
//               <div className="billing-info">
//                 <h3>Ship To:</h3>
//                 <p>
//                   <strong>Same as Billing Address</strong>
//                 </p>
//                 {invoice.customer_address && <p>{invoice.customer_address}</p>}
//               </div>
//             </div>

//             {/* Items Table */}
//             <table className="items-table">
//               <thead>
//                 <tr>
//                   <th>Description</th>
//                   <th className="text-right">Qty</th>
//                   <th className="text-right">Rate</th>
//                   <th className="text-right">Amount</th>
//                   {editMode && <th className="text-right">Actions</th>}
//                 </tr>
//               </thead>
//               <tbody>
//                 {items.map((item, index) => (
//                   <tr key={index}>
//                     <td>
//                       <input
//                         type="text"
//                         className={`editable ${editMode ? "editing" : ""}`}
//                         value={
//                           item.category ||
//                           item.name ||
//                           item.service_description ||
//                           ""
//                         }
//                         disabled={!editMode}
//                         onChange={(e) =>
//                           updateItem(index, "name", e.target.value)
//                         }
//                         style={{ fontWeight: 600, marginBottom: "5px" }}
//                       />
//                       {(item.service_description || item.description) && (
//                         <input
//                           type="text"
//                           className={`editable ${editMode ? "editing" : ""}`}
//                           value={
//                             item.service_description || item.description || ""
//                           }
//                           disabled={!editMode}
//                           onChange={(e) =>
//                             updateItem(index, "description", e.target.value)
//                           }
//                           style={{ fontSize: "0.9rem", color: "#666" }}
//                         />
//                       )}
//                     </td>
//                     <td className="text-right">
//                       <input
//                         type="number"
//                         className={`editable ${editMode ? "editing" : ""}`}
//                         value={item.quantity}
//                         disabled={!editMode}
//                         onChange={(e) =>
//                           updateItem(
//                             index,
//                             "quantity",
//                             parseFloat(e.target.value) || 0
//                           )
//                         }
//                         style={{ textAlign: "right", fontWeight: 500 }}
//                       />
//                     </td>
//                     <td className="text-right">
//                       <input
//                         type="number"
//                         className={`editable ${editMode ? "editing" : ""}`}
//                         value={item.unit_price.toFixed(2)}
//                         disabled={!editMode}
//                         onChange={(e) =>
//                           updateItem(
//                             index,
//                             "unit_price",
//                             parseFloat(e.target.value) || 0
//                           )
//                         }
//                         style={{ textAlign: "right", fontWeight: 500 }}
//                         step="0.01"
//                       />
//                     </td>
//                     <td className="text-right" style={{ fontWeight: 500 }}>
//                       {formatCurrency(item.total)}
//                     </td>
//                     {editMode && (
//                       <td className="text-right">
//                         <button
//                           className="remove-item-btn"
//                           onClick={() => removeItem(index)}
//                         >
//                           <Trash2 size={14} />
//                           Remove
//                         </button>
//                       </td>
//                     )}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* Totals */}
//             <div className="totals-section">
//               <table className="totals-table">
//                 <tbody>
//                   <tr>
//                     <td className="label">Subtotal:</td>
//                     <td className="amount">
//                       {formatCurrency(invoice.subtotal)}
//                     </td>
//                   </tr>
//                   {(invoice.discount_rate && invoice.discount_rate > 0) ||
//                   editMode ? (
//                     <tr>
//                       <td className="label">
//                         Discount (
//                         {editMode ? (
//                           <input
//                             type="number"
//                             className="editable editing"
//                             value={((invoice.discount_rate || 0) * 100).toFixed(
//                               1
//                             )}
//                             onChange={(e) =>
//                               updateDiscountRate(
//                                 parseFloat(e.target.value) || 0
//                               )
//                             }
//                             style={{
//                               width: "50px",
//                               display: "inline-block",
//                               textAlign: "center",
//                               padding: "2px 4px",
//                               margin: "0 2px",
//                             }}
//                             step="0.1"
//                             min="0"
//                             max="100"
//                           />
//                         ) : (
//                           ((invoice.discount_rate || 0) * 100).toFixed(1)
//                         )}
//                         %):
//                       </td>
//                       <td className="amount">
//                         -{formatCurrency(invoice.discount_amount || 0)}
//                       </td>
//                     </tr>
//                   ) : null}
//                   {invoice.tax_rate > 0 || editMode ? (
//                     <tr>
//                       <td className="label">
//                         Tax (
//                         {editMode ? (
//                           <input
//                             type="number"
//                             className="editable editing"
//                             value={(invoice.tax_rate * 100).toFixed(1)}
//                             onChange={(e) =>
//                               updateTaxRate(parseFloat(e.target.value) || 0)
//                             }
//                             style={{
//                               width: "50px",
//                               display: "inline-block",
//                               textAlign: "center",
//                               padding: "2px 4px",
//                               margin: "0 2px",
//                             }}
//                             step="0.1"
//                             min="0"
//                             max="100"
//                           />
//                         ) : (
//                           (invoice.tax_rate * 100).toFixed(1)
//                         )}
//                         %):
//                       </td>
//                       <td className="amount">
//                         {formatCurrency(invoice.tax_amount)}
//                       </td>
//                     </tr>
//                   ) : null}
//                   <tr className="total-row">
//                     <td>Total:</td>
//                     <td>{formatCurrency(invoice.amount)}</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>

//             {/* Payment Section - Only show for invoices and accepted quotes */}
//             {(!isQuote || invoice.status === "accepted") && (
//               <div className="payment-section">
//                 <div className="payment-buttons">
//                   <h4 style={{ color: "#8B5CF6", marginBottom: "20px" }}>
//                     Pay Online Instantly
//                   </h4>
//                   <div className="payment-options">
//                     <button
//                       className="pay-button pay-primary"
//                       onClick={() => handlePayment("stripe")}
//                     >
//                       <CreditCard size={20} />
//                       Pay {formatCurrency(invoice.amount)} Now
//                     </button>
//                     <div className="payment-methods-row">
//                       <button
//                         className="pay-button pay-secondary"
//                         onClick={() => handlePayment("paypal")}
//                       >
//                         PayPal
//                       </button>
//                       <button
//                         className="pay-button pay-secondary"
//                         onClick={() => handlePayment("apple")}
//                       >
//                         Apple Pay
//                       </button>
//                       <button
//                         className="pay-button pay-secondary"
//                         onClick={() => handlePayment("google")}
//                       >
//                         Google Pay
//                       </button>
//                       <button
//                         className="pay-button pay-secondary"
//                         onClick={() => handlePayment("revolut")}
//                       >
//                         Revolut
//                       </button>
//                     </div>
//                   </div>
//                   <p className="payment-security">
//                     <Lock size={16} color="#10B981" />
//                     Secure 256-bit SSL encryption • PCI DSS compliant
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Payment Terms - Only show for invoices and accepted quotes */}
//             {(!isQuote || invoice.status === "accepted") && (
//               <div className="payment-terms">
//                 <h4>Payment Terms & Instructions</h4>
//                 {invoice.status === "pending" && (
//                   <div
//                     style={{
//                       backgroundColor: "rgba(245, 158, 11, 0.1)",
//                       border: "1px solid rgba(245, 158, 11, 0.3)",
//                       borderRadius: "6px",
//                       padding: "15px",
//                       marginBottom: "15px",
//                     }}
//                   >
//                     <p
//                       style={{ margin: 0, color: "#92400e", fontWeight: "600" }}
//                     >
//                       <strong>⚠️ Payment Reminder:</strong> This invoice is
//                       currently pending payment. Please complete payment as soon
//                       as possible to avoid any late fees.
//                     </p>
//                   </div>
//                 )}
//                 <p>
//                   <strong>Payment Due:</strong> Net 30 days from invoice date
//                 </p>
//                 <p>
//                   <strong>Late Fee:</strong> 1.5% per month on overdue amounts
//                 </p>
//                 <p>
//                   <strong>Alternative Payment Methods:</strong> Check, Bank
//                   Transfer
//                 </p>
//                 <p>
//                   <strong>Bank Details:</strong> Account #123456789, Routing
//                   #987654321
//                 </p>
//                 {invoice.notes && (
//                   <p>
//                     <strong>Notes:</strong> {invoice.notes}
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Footer */}
//           <div className="footer">
//             <p>
//               <strong>Thank you for choosing MyAI!</strong>
//             </p>
//             <p>
//               For questions about this invoice, please contact us at
//               billing@myai.com
//             </p>
//             <p>Visit us online at www.myai.com</p>
//           </div>
//         </div>

//         {/* Discard Changes Warning Dialog */}
//         {showDiscardDialog && (
//           <div
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               backgroundColor: "rgba(0, 0, 0, 0.5)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               zIndex: 1000,
//             }}
//             onClick={() => setShowDiscardDialog(false)}
//           >
//             <div
//               style={{
//                 backgroundColor: "white",
//                 borderRadius: "12px",
//                 padding: "30px",
//                 maxWidth: "500px",
//                 width: "90%",
//                 boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
//               }}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <h3
//                 style={{
//                   color: "#EF4444",
//                   marginBottom: "15px",
//                   fontSize: "1.5rem",
//                 }}
//               >
//                 ⚠️ Discard Unsaved Changes?
//               </h3>
//               <p
//                 style={{
//                   color: "#666",
//                   marginBottom: "20px",
//                   lineHeight: "1.6",
//                 }}
//               >
//                 You have unsaved changes to this invoice. If you disable editing
//                 mode now, all your changes will be lost. Are you sure you want
//                 to discard your changes?
//               </p>
//               <div
//                 style={{
//                   display: "flex",
//                   gap: "10px",
//                   justifyContent: "flex-end",
//                 }}
//               >
//                 <button
//                   style={{
//                     padding: "10px 20px",
//                     borderRadius: "6px",
//                     border: "2px solid #e5e7eb",
//                     background: "white",
//                     color: "#666",
//                     fontWeight: 600,
//                     cursor: "pointer",
//                   }}
//                   onClick={() => setShowDiscardDialog(false)}
//                 >
//                   Keep Editing
//                 </button>
//                 <button
//                   style={{
//                     padding: "10px 20px",
//                     borderRadius: "6px",
//                     border: "none",
//                     background:
//                       "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
//                     color: "white",
//                     fontWeight: 600,
//                     cursor: "pointer",
//                   }}
//                   onClick={handleDiscardChanges}
//                 >
//                   Discard Changes
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit,
  Eye,
  Loader2,
  Lock,
  Plus,
  Printer,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../utils/supabase/client";

// TypeScript declarations for payment APIs
declare global {
  interface Window {
    ApplePaySession?: {
      canMakePayments(): boolean;
      new (version: number, paymentRequest: any): any;
    };
    google?: {
      payments?: any;
    };
  }
}

interface InvoiceItem {
  // New invoice item fields (from generate_invoice)
  category?: string;
  service_description?: string;
  type?: string;
  min_price?: number;
  max_price?: number;
  ave_price?: number;
  currency_code?: string;
  // Common/legacy fields
  name?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoiceData {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone?: string | null;
  customer_address?: string;
  amount: number;
  status: string;
  date: string;
  sent_at?: string; // Add sent_at field for quotes
  due_date: string;
  items: InvoiceItem[];
  notes: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  currency: string;
  discount_rate?: number;
  discount_amount?: number;
}

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [originalItems, setOriginalItems] = useState<InvoiceItem[]>([]);
  const [originalInvoice, setOriginalInvoice] = useState<InvoiceData | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isQuote, setIsQuote] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInvoice(id);
    }
  }, [id]);

const fetchInvoice = async (invoiceId: string) => {
  try {
    setLoading(true);

    
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id_invoice", invoiceId)
      .maybeSingle();

   
    if (invoiceError || !invoiceData) {
      console.log(
        "Invoice not found in 'invoices', checking 'quotes' table..."
      );
      const { data: quoteData, error: quoteError } = await supabase
        .from("quotes")
        .select("*")
        .eq("id_quote", invoiceId)
        .maybeSingle(); // maybeSingle here too (safer)

      if (quoteError) throw quoteError;
      if (!quoteData) {
        toast.error("Invoice or Quote not found");
        navigate("/invoices");
        return;
      }

     
      const itemsData = quoteData.items || {};
      const invoiceItems = Array.isArray(quoteData.items)
        ? quoteData.items
        : itemsData.items || [];
      const metadata = itemsData.metadata || {};

      const parsedInvoiceData: InvoiceData = {
        id: String(quoteData.id_quote),
        invoice_number: `QUO-${String(quoteData.id_quote)
          .substring(0, 8)
          .toUpperCase()}`,
        customer_name: quoteData.client_name ?? "Unknown",
        customer_email: quoteData.client_email || null,
        customer_phone: metadata.client_phone || null,
        customer_address: metadata.client_address || "",
        amount: Number(quoteData.total ?? 0),
        status: quoteData.status,
        date: quoteData.created_at,
        sent_at: quoteData.sent_at,
        due_date: quoteData.expires_at || quoteData.created_at,
        items: invoiceItems.map((item: any) => ({
          name:
            item.category ||
            item.name ||
            item.service_description ||
            "Unnamed Item",
          description: item.service_description || item.description || "",
          quantity: item.quantity || item.qty || 1,
          unit_price: item.unit_price || item.price || item.ave_price || 0,
          total:
            item.total ||
            (item.quantity || item.qty || 1) *
              (item.unit_price || item.price || item.ave_price || 0),
        })),
        notes: metadata.notes || null,
        subtotal:
          metadata.subtotal || (quoteData.total ? quoteData.total / 1.21 : 0),
        tax_rate: metadata.tax_rate || 0.21,
        tax_amount:
          metadata.tax_amount ||
          (quoteData.total ? (quoteData.total * 0.21) / 1.21 : 0),
        currency: "EUR",
        discount_rate: metadata.discount_rate || 0,
        discount_amount: metadata.discount_amount || 0,
      };

      setInvoice(parsedInvoiceData);
      setItems(parsedInvoiceData.items);
      setIsQuote(true);
      return;
    }

   
    const invoiceItems = Array.isArray(invoiceData.items)
      ? invoiceData.items
      : [];

    const parsedInvoiceData: InvoiceData = {
      id: String(invoiceData.id_invoice),
      invoice_number: invoiceData.invoice_number,
      customer_name: invoiceData.customer_name,
      customer_email: invoiceData.customer_email || null,
      customer_phone: invoiceData.customer_phone || null,
      customer_address: invoiceData.customer_address || "",
      amount: Number(invoiceData.total || 0),
      status: invoiceData.status,
      date: invoiceData.invoice_date || invoiceData.created_at,
      due_date: invoiceData.due_date || invoiceData.invoice_date,
      items: invoiceItems.map((item: any) => ({
        name: item.name || item.category || "Unnamed Item",
        description: item.description || item.service_description || "",
        quantity: item.quantity || 1,
        unit_price: item.unit_price || item.ave_price || 0,
        total:
          item.total ||
          (item.quantity || 1) * (item.unit_price || item.ave_price || 0),
        category: item.category,
        service_description: item.service_description,
        type: item.type,
        ave_price: item.ave_price,
        min_price: item.min_price,
        max_price: item.max_price,
        currency_code: item.currency_code,
      })),
      notes: invoiceData.notes || null,
      subtotal: Number(invoiceData.subtotal || 0),
      tax_rate: Number(invoiceData.tax_rate || 0),
      tax_amount: Number(invoiceData.tax_amount || 0),
      currency: invoiceData.currency || "USD",
      discount_rate: Number(invoiceData.discount_rate || 0),
      discount_amount: Number(invoiceData.discount_amount || 0),
    };

    setInvoice(parsedInvoiceData);
    setItems(parsedInvoiceData.items);
    setIsQuote(false);
    setOriginalItems(JSON.parse(JSON.stringify(parsedInvoiceData.items)));
    setOriginalInvoice(JSON.parse(JSON.stringify(parsedInvoiceData)));
  } catch (error: any) {
    console.error("Error fetching invoice:", error);
    toast.error(error.message || "Failed to load invoice");
    navigate("/invoices");
  } finally {
    setLoading(false);
  }
};


  const toggleEditMode = () => {
    if (editMode && hasUnsavedChanges) {
      // Show discard warning dialog
      setShowDiscardDialog(true);
    } else {
      setEditMode(!editMode);
      if (!editMode) {
        // Entering edit mode
        setHasUnsavedChanges(false);
      }
    }
  };

  const handleDiscardChanges = () => {
    // Revert to original values
    if (originalInvoice && originalItems) {
      setInvoice(JSON.parse(JSON.stringify(originalInvoice)));
      setItems(JSON.parse(JSON.stringify(originalItems)));
    }
    setEditMode(false);
    setHasUnsavedChanges(false);
    setShowDiscardDialog(false);
    toast.info("Changes discarded");
  };

  const addNewItem = () => {
    const newItem: InvoiceItem = {
      name: "New Service",
      description: "Service description",
      quantity: 1,
      unit_price: 100,
      total: 100,
    };
    setItems([...items, newItem]);
    calculateTotals([...items, newItem]);
    setHasUnsavedChanges(true);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    calculateTotals(updatedItems);
    setHasUnsavedChanges(true);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Recalculate total for this item
    if (field === "quantity" || field === "unit_price") {
      updatedItems[index].total =
        updatedItems[index].quantity * updatedItems[index].unit_price;
    }

    setItems(updatedItems);
    calculateTotals(updatedItems);
    setHasUnsavedChanges(true);
  };

  const calculateTotals = (currentItems: InvoiceItem[]) => {
    if (!invoice) return;

    const subtotal = currentItems.reduce((sum, item) => sum + item.total, 0);
    const discountRate = invoice.discount_rate || 0.05;
    const taxRate = invoice.tax_rate || 0.085;

    const discountAmount = subtotal * discountRate;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * taxRate;
    const total = taxableAmount + taxAmount;

    setInvoice({
      ...invoice,
      items: currentItems,
      subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      amount: total,
    });
  };

  const updateTaxRate = (newRate: number) => {
    if (!invoice) return;
    const taxRate = newRate / 100; // Convert percentage to decimal
    const discountAmount = invoice.subtotal * (invoice.discount_rate || 0);
    const taxableAmount = invoice.subtotal - discountAmount;
    const taxAmount = taxableAmount * taxRate;
    const total = taxableAmount + taxAmount;

    setInvoice({
      ...invoice,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      amount: total,
    });
    setHasUnsavedChanges(true);
  };

  const updateDiscountRate = (newRate: number) => {
    if (!invoice) return;
    const discountRate = newRate / 100; // Convert percentage to decimal
    const discountAmount = invoice.subtotal * discountRate;
    const taxableAmount = invoice.subtotal - discountAmount;
    const taxAmount = taxableAmount * (invoice.tax_rate || 0);
    const total = taxableAmount + taxAmount;

    setInvoice({
      ...invoice,
      discount_rate: discountRate,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      amount: total,
    });
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!invoice) return;

    // Only quotes can be edited, not invoices
    if (!isQuote) {
      toast.error("Invoices cannot be edited");
      return;
    }

    try {
      setSaving(true);

      // Update only fields that exist in quotes table
      // Store additional fields (tax_rate, discount_rate, etc.) in items JSONB metadata
      // Check if items is already an object with metadata or just an array
      // We need to fetch the current quote to check existing structure
      const { data: currentQuote } = await supabase
        .from("quotes")
        .select("items")
        .eq("id_quote", invoice.id)
        .single();

      const existingItemsData = currentQuote?.items || items;
      const existingMetadata =
        typeof existingItemsData === "object" &&
        !Array.isArray(existingItemsData) &&
        existingItemsData.metadata
          ? existingItemsData.metadata
          : {};

      // Prepare items structure - store as object with items array and metadata
      const itemsWithMetadata = {
        items: items,
        metadata: {
          ...existingMetadata,
          subtotal: invoice.subtotal,
          tax_rate: invoice.tax_rate,
          tax_amount: invoice.tax_amount,
          discount_rate: invoice.discount_rate || 0,
          discount_amount: invoice.discount_amount || 0,
          notes: invoice.notes,
          client_phone: invoice.customer_phone,
          client_address: invoice.customer_address,
        },
      };

      const { error } = await supabase
        .from("quotes")
        .update({
          client_name: invoice.customer_name,
          client_email: invoice.customer_email,
          items: itemsWithMetadata,
          total: invoice.amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id_quote", invoice.id);

      if (error) throw error;

      toast.success("Quote saved successfully!");
      setEditMode(false);
      setHasUnsavedChanges(false);

      // Refresh quote data
      await fetchInvoice(invoice.id);
    } catch (error: any) {
      console.error("Error saving quote:", error);
      toast.error(error.message || "Failed to save quote");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const currencyCode = invoice?.currency || "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "status-paid";
      case "pending":
        return "status-pending";
      case "overdue":
        return "status-overdue";
      case "canceled":
        return "status-canceled";
      case "draft":
        return "status-draft";
      case "sent":
        return "status-sent";
      case "accepted":
        return "status-paid"; // Use same styling as paid
      case "rejected":
        return "status-canceled"; // Use same styling as canceled
      default:
        return "status-pending";
    }
  };

  const handlePayment = (method: string) => {
    if (!invoice) return;

    const invoiceAmount = invoice.amount.toFixed(2);
    const invoiceNumber = invoice.invoice_number;

    toast.info(
      `Initiating ${method} payment for ${formatCurrency(invoice.amount)}`
    );

    setTimeout(() => {
      switch (method) {
        case "stripe":
          // Enhanced Stripe integration with proper parameters
          const stripeAmount = Math.round(invoice.amount * 100); // Convert to cents
          window.open(
            `https://checkout.stripe.com/pay?amount=${stripeAmount}&currency=${
              invoice.currency || "usd"
            }&invoice=${invoiceNumber}&client_reference_id=${invoiceNumber}`,
            "_blank"
          );
          break;
        case "paypal":
          // Enhanced PayPal integration with proper parameters
          window.open(
            `https://www.paypal.com/invoice/pay?invoice=${invoiceNumber}&amount=${invoiceAmount}&currency=${
              invoice.currency || "USD"
            }`,
            "_blank"
          );
          break;
        case "apple":
          // Check if Apple Pay is available
          if (
            window.ApplePaySession &&
            window.ApplePaySession.canMakePayments()
          ) {
            toast.info(
              `Apple Pay available - Invoice: ${invoiceNumber}, Amount: ${formatCurrency(
                invoice.amount
              )}`
            );
            // In a real implementation, you would initialize Apple Pay session here
            // const session = new ApplePaySession(3, paymentRequest);
          } else {
            toast.error("Apple Pay is not available on this device");
          }
          break;
        case "google":
          // Check if Google Pay is available
          if (window.google && window.google.payments) {
            toast.info(
              `Google Pay available - Invoice: ${invoiceNumber}, Amount: ${formatCurrency(
                invoice.amount
              )}`
            );
            // In a real implementation, you would initialize Google Pay here
          } else {
            toast.error(
              "Google Pay is not available. Please use an alternative payment method."
            );
          }
          break;
        case "revolut":
          // Open Revolut Business payment link
          window.open(
            `https://business.revolut.com/pay?invoice=${invoiceNumber}&amount=${invoiceAmount}&currency=${
              invoice.currency || "USD"
            }`,
            "_blank"
          );
          break;
        default:
          toast.error("Payment method not configured");
      }
    }, 500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendQuote = async () => {
    if (!invoice || !isQuote) return;

    if (!invoice.customer_email) {
      toast.error("Client email is required to send quote");
      return;
    }

    const confirmed = window.confirm(
      `Send quote ${invoice.invoice_number} to ${invoice.customer_email}?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      // Update quote status to 'sent'
      const { error: updateError } = await supabase
        .from("quotes")
        .update({
          status: "sent",
          updated_at: new Date().toISOString(),
          sent_at: new Date().toISOString(), // Explicitly set sent_at for consistency
        })
        .eq("id_quote", invoice.id);

      if (updateError) throw updateError;

      // Send email to customer
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${
              (
                await supabase.auth.getSession()
              ).data.session?.access_token
            }`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "quote",
            to: invoice.customer_email,
            data: {
              quoteId: invoice.id,
              customerName: invoice.customer_name,
              items: invoice.items,
              totalCost: invoice.amount,
              responseUrl: `${window.location.origin}/quote/${invoice.id}/response`,
              companyName: "MyAI Company",
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send quote email");
      }

      toast.success("Quote sent successfully!");
      await fetchInvoice(invoice.id);
    } catch (error: any) {
      console.error("Error sending quote:", error);
      toast.error(error.message || "Failed to send quote");
    } finally {
      setSaving(false);
    }
  };

  const handleResendQuote = async () => {
    if (!invoice || !isQuote) return;

    if (!invoice.customer_email) {
      toast.error("Client email is required to resend quote");
      return;
    }

    try {
      setSaving(true);

      // Update status to 'sent' if currently rejected
      if (invoice.status?.toLowerCase() === "rejected") {
        const { error: updateError } = await supabase
          .from("quotes")
          .update({
            status: "sent",
            updated_at: new Date().toISOString(),
          })
          .eq("id_quote", invoice.id);

        if (updateError) throw updateError;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${
              (
                await supabase.auth.getSession()
              ).data.session?.access_token
            }`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "quote",
            to: invoice.customer_email,
            data: {
              quoteId: invoice.id,
              customerName: invoice.customer_name,
              items: invoice.items,
              totalCost: invoice.amount,
              responseUrl: `${window.location.origin}/quote/${invoice.id}/response`,
              companyName: "MyAI Company",
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to resend quote email");
      }

      toast.success("Quote resent successfully!");

      // Refresh quote data to show new status
      await fetchInvoice(invoice.id);
    } catch (error: any) {
      console.error("Error resending quote:", error);
      toast.error(error.message || "Failed to resend quote");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuote = async () => {
    if (!invoice || !isQuote) return;

    const confirmed = window.confirm(
      `Delete quote ${invoice.invoice_number} for ${invoice.customer_name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id_quote", invoice.id);

      if (error) throw error;

      toast.success("Quote deleted successfully");
      navigate("/invoices");
    } catch (error: any) {
      console.error("Error deleting quote:", error);
      toast.error(error.message || "Failed to delete quote");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Invoice not found</p>
          <button
            onClick={() => navigate("/invoices")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .invoice-container {
          max-width: 800px;
          margin: 20px auto;
          background: white;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          overflow: hidden;
        }

        .invoice-header {
          background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
          color: white;
          padding: 40px;
          position: relative;
        }

        .invoice-header::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          transform: translate(30px, -30px);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
        }

        .company-info h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .company-info p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 5px;
        }

        .invoice-details {
          text-align: right;
        }

        .invoice-number {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .invoice-date {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .invoice-body {
          padding: 40px;
        }

        .billing-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }

        .billing-info h3 {
          color: #8B5CF6;
          font-size: 1.2rem;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e9ecef;
        }

        .billing-info p {
          margin-bottom: 8px;
          font-size: 1rem;
        }

        .edit-controls {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
          padding: 20px;
          margin-bottom: 30px;
          border-radius: 8px;
          border: 2px solid rgba(139, 92, 246, 0.2);
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
        }

        .nav-button {
          background: #6B7280;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .nav-button:hover {
          background: #4B5563;
          transform: translateY(-2px);
        }

        .edit-toggle {
          background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .edit-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .edit-toggle.active {
          background: #EF4444;
        }

        .add-item-btn {
          background: #10B981;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .add-item-btn:hover {
          background: #059669;
          transform: translateY(-2px);
        }

        .print-btn {
          background: #6366F1;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .print-btn:hover {
          background: #4F46E5;
          transform: translateY(-2px);
        }

        .approve-btn {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .approve-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .approve-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .send-btn {
          background: #94A3B8;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: not-allowed;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          opacity: 0.7;
        }

        .save-btn {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .save-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .items-table thead {
          background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
          color: white;
        }

        .items-table th,
        .items-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
        }

        .items-table th {
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.9rem;
        }

        .items-table tbody tr:hover {
          background-color: #f8f9fa;
          transition: background-color 0.3s ease;
        }

        .items-table .text-right {
          text-align: right;
        }

        .editable {
          background: transparent;
          border: 2px solid transparent;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          color: inherit;
          width: 100%;
          transition: all 0.3s ease;
        }

        .editable:focus {
          outline: none;
          border-color: #8B5CF6;
          background: rgba(139, 92, 246, 0.05);
        }

        .editable:disabled {
          border-color: transparent;
          background: transparent;
        }

        .editable.editing {
          border-color: #8B5CF6;
          background: rgba(139, 92, 246, 0.05);
        }

        .remove-item-btn {
          background: #EF4444;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.3s ease;
        }

        .remove-item-btn:hover {
          background: #DC2626;
        }

        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
        }

        .totals-table {
          width: 300px;
          border-collapse: collapse;
        }

        .totals-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #e9ecef;
        }

        .totals-table .label {
          font-weight: 500;
          color: #666;
        }

        .totals-table .amount {
          text-align: right;
          font-weight: 600;
        }

        .totals-table .total-row {
          background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
          color: white;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .totals-table .total-row td {
          border-bottom: none;
        }

        .payment-section {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          border: 2px solid rgba(139, 92, 246, 0.1);
        }

        .payment-buttons {
          text-align: center;
        }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 15px;
          align-items: center;
        }

        .pay-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 30px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 200px;
        }

        .pay-primary {
          background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
          color: white;
          font-size: 1.1rem;
          padding: 18px 40px;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }

        .pay-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        }

        .pay-secondary {
          background: white;
          color: #666;
          border: 2px solid #e5e7eb;
          padding: 12px 20px;
          min-width: 120px;
          font-size: 0.9rem;
        }

        .pay-secondary:hover {
          border-color: #8B5CF6;
          color: #8B5CF6;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
        }

        .payment-methods-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .payment-security {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          font-size: 0.85rem;
          color: #666;
        }

        .payment-terms {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
          padding: 25px;
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid #8B5CF6;
        }

        .payment-terms h4 {
          color: #8B5CF6;
          margin-bottom: 15px;
          font-size: 1.1rem;
        }

        .payment-terms p {
          margin-bottom: 10px;
          color: #666;
        }

        .footer {
          text-align: center;
          padding: 30px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
          color: #666;
          font-size: 0.9rem;
        }

        .footer p {
          margin-bottom: 5px;
        }

        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-paid {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
        }

        .status-pending {
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          color: white;
        }

        .status-overdue {
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          color: white;
        }

        .status-canceled {
          background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
          color: white;
        }

        .status-draft {
          background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
          color: white;
        }

        .status-sent {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          color: white;
        }

        @media (max-width: 768px) {
          .billing-section {
            grid-template-columns: 1fr;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
          }

          .invoice-details {
            text-align: center;
          }

          .edit-controls {
            flex-direction: column;
          }

          .payment-methods-row {
            flex-direction: column;
          }
        }

        @media print {
          body {
            background: white;
          }

          .edit-controls,
          .nav-button,
          .remove-item-btn {
            display: none !important;
          }

          .invoice-container {
            box-shadow: none;
            border-radius: 0;
            max-width: none;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
        <div className="invoice-container">
          {/* Header */}
          <div className="invoice-header">
            <div className="header-content">
              <div className="company-info">
                <h1>MyAI Company</h1>
                <p>123 Innovation Street</p>
                <p>Tech City, State 12345</p>
                <p>Phone: (555) 123-4567</p>
                <p>Email: info@myai.com</p>
              </div>
              <div className="invoice-details">
                <div className="invoice-number">
                  {invoice.invoice_number}
                  {invoice.invoice_number.startsWith("QUO-") && (
                    <span
                      style={{
                        marginLeft: "10px",
                        padding: "4px 8px",
                        backgroundColor: "rgba(34, 197, 94, 0.2)",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        color: "#15803d",
                        fontWeight: "500",
                      }}
                    >
                      QUOTE
                    </span>
                  )}
                </div>
                <div className="invoice-date">
                  Date: {formatDate(invoice.date)}
                  {invoice.sent_at && (
                    <div className="text-sm text-gray-600 mt-1">
                      Sent: {formatDate(invoice.sent_at)}
                    </div>
                  )}
                </div>
                <div className="invoice-date">
                  {invoice.invoice_number.startsWith("QUO-")
                    ? "Expires:"
                    : "Due Date:"}{" "}
                  {formatDate(invoice.due_date)}
                </div>
                <div style={{ marginTop: "15px" }}>
                  <span
                    className={`status-badge ${getStatusBadgeClass(
                      invoice.status
                    )}`}
                  >
                    {invoice.status}
                  </span>
                  {invoice.status === "pending" && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "8px 12px",
                        backgroundColor: "rgba(245, 158, 11, 0.1)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        borderRadius: "6px",
                        fontSize: "0.9rem",
                        color: "#92400e",
                      }}
                    >
                      <strong>Payment Pending</strong> - Send reminder to
                      customer
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status-specific banners */}
          {isQuote && invoice.status?.toLowerCase() === "sent" && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mx-6 mb-4">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-blue-600" />
                <p className="text-blue-800 font-medium">
                  ⏳ Waiting for customer response
                </p>
              </div>
              <p className="text-blue-600 text-sm mt-1">
                The customer has been sent this quote and can respond via the
                link in their email.
              </p>
            </div>
          )}

          {isQuote && invoice.status?.toLowerCase() === "accepted" && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mx-6 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-green-600" />
                <p className="text-green-800 font-medium">✓ Quote Accepted</p>
              </div>
              <p className="text-green-600 text-sm mt-1">
                This quote has been accepted by the customer and an invoice has
                been generated.
              </p>
            </div>
          )}

          {isQuote && invoice.status?.toLowerCase() === "rejected" && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mx-6 mb-4">
              <div className="flex items-center gap-2">
                <X size={20} className="text-red-600" />
                <p className="text-red-800 font-medium">✗ Quote Rejected</p>
              </div>
              <p className="text-red-600 text-sm mt-1">
                This quote has been rejected by the customer. You can edit the
                quote and resend it for reconsideration.
              </p>
            </div>
          )}

          {/* Body */}
          <div className="invoice-body">
            {/* Controls */}
            <div className="edit-controls no-print">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 text-gray-700 rounded-lg transition-all duration-200"
                onClick={() => navigate("/invoices")}
              >
                <ArrowLeft size={18} />
                Back to Invoices
              </button>

              {/* Invoice-specific controls */}
              {!isQuote && (
                <>
                  {/* Send Payment Reminder button - show if pending */}
                  {invoice.status === "pending" && (
                    <button
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg transition-all duration-200"
                      onClick={async () => {
                        if (!invoice.customer_email) {
                          toast.error(
                            "Customer email is required to send invoice"
                          );
                          return;
                        }

                        const confirmed = window.confirm(
                          `Send payment reminder for invoice ${invoice.invoice_number} to ${invoice.customer_email}?`
                        );

                        if (!confirmed) return;

                        try {
                          setSaving(true);
                          const response = await fetch(
                            `${
                              import.meta.env.VITE_SUPABASE_URL
                            }/functions/v1/send-email`,
                            {
                              method: "POST",
                              headers: {
                                Authorization: `Bearer ${
                                  (
                                    await supabase.auth.getSession()
                                  ).data.session?.access_token
                                }`,
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                type: "payment_reminder",
                                to: invoice.customer_email,
                                data: {
                                  customerName: invoice.customer_name,
                                  invoiceNumber: invoice.invoice_number,
                                  amount: invoice.amount,
                                  dueDate: invoice.due_date,
                                  companyName: "MyAI Company",
                                  invoiceUrl: window.location.href,
                                },
                              }),
                            }
                          );

                          if (!response.ok) {
                            throw new Error("Failed to send payment reminder");
                          }

                          toast.success(
                            `Payment reminder sent successfully to ${invoice.customer_email}!`
                          );
                        } catch (error) {
                          console.error(
                            "Error sending payment reminder:",
                            error
                          );
                          toast.error(
                            "Failed to send payment reminder. Please try again."
                          );
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
                    >
                      <Send size={18} />
                      {saving ? "Sending..." : "Send Payment Reminder"}
                    </button>
                  )}
                </>
              )}

              {/* Quote-specific controls */}
              {isQuote && (
                <>
                  {/* Draft quote controls */}
                  {invoice.status?.toLowerCase() === "draft" && (
                    <>
                      <button
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-lg transition-all duration-200"
                        onClick={toggleEditMode}
                      >
                        <Edit size={18} />
                        {editMode ? "Disable Editing" : "Enable Editing"}
                      </button>

                      {editMode && (
                        <>
                          <button
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg shadow-lg transition-all duration-200"
                            onClick={addNewItem}
                          >
                            <Plus size={18} />
                            Add New Item
                          </button>
                          <button
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSaveChanges}
                            disabled={saving}
                          >
                            <Save size={18} />
                            {saving ? "Saving..." : "Save Changes"}
                          </button>
                        </>
                      )}

                      <button
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg shadow-lg transition-all duration-200"
                        onClick={handleSendQuote}
                        disabled={saving}
                      >
                        <Send size={18} />
                        {saving ? "Sending..." : "Send to Customer"}
                      </button>

                      <button
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg shadow-lg transition-all duration-200"
                        onClick={handleDeleteQuote}
                        disabled={saving}
                      >
                        <Trash2 size={18} />
                        Delete Draft
                      </button>
                    </>
                  )}

                  {/* Sent quote controls */}
                  {invoice.status?.toLowerCase() === "sent" && (
                    <>
                      <button
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-lg transition-all duration-200"
                        onClick={handleResendQuote}
                        disabled={saving}
                      >
                        <Send size={18} />
                        {saving ? "Resending..." : "Resend to Customer"}
                      </button>

                      <a
                        href={`/quote/${invoice.id}/response`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg transition-all duration-200"
                      >
                        <Eye size={18} />
                        View Customer Response Page
                      </a>
                    </>
                  )}

                  {/* Accepted quote controls */}
                  {invoice.status?.toLowerCase() === "accepted" && (
                    <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-lg">
                      <CheckCircle2 size={18} />
                      Quote Accepted
                    </div>
                  )}

                  {/* Rejected quote controls */}
                  {invoice.status?.toLowerCase() === "rejected" && (
                    <>
                      <button
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-lg transition-all duration-200"
                        onClick={toggleEditMode}
                      >
                        <Edit size={18} />
                        {editMode ? "Disable Editing" : "Enable Editing"}
                      </button>

                      {editMode && (
                        <>
                          <button
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg shadow-lg transition-all duration-200"
                            onClick={addNewItem}
                          >
                            <Plus size={18} />
                            Add New Item
                          </button>
                          <button
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSaveChanges}
                            disabled={saving}
                          >
                            <Save size={18} />
                            {saving ? "Saving..." : "Save Changes"}
                          </button>
                        </>
                      )}

                      <button
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg shadow-lg transition-all duration-200"
                        onClick={handleResendQuote}
                        disabled={saving}
                      >
                        <Send size={18} />
                        {saving ? "Resending..." : "Resend to Customer"}
                      </button>
                    </>
                  )}
                </>
              )}

              <button
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 text-gray-700 rounded-lg transition-all duration-200"
                onClick={handlePrint}
              >
                <Printer size={18} />
                Print {isQuote ? "Quote" : "Invoice"}
              </button>
            </div>

            {/* Billing Information */}
            <div className="billing-section">
              <div className="billing-info">
                <h3>Bill To:</h3>
                <p>
                  <strong>{invoice.customer_name}</strong>
                </p>
                {invoice.customer_email && <p>{invoice.customer_email}</p>}
                {invoice.customer_phone && <p>{invoice.customer_phone}</p>}
                {invoice.customer_address && <p>{invoice.customer_address}</p>}
              </div>
              <div className="billing-info">
                <h3>Ship To:</h3>
                <p>
                  <strong>Same as Billing Address</strong>
                </p>
                {invoice.customer_address && <p>{invoice.customer_address}</p>}
              </div>
            </div>

            {/* Items Table */}
            <table className="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Amount</th>
                  {editMode && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        className={`editable ${editMode ? "editing" : ""}`}
                        value={
                          item.category ||
                          item.name ||
                          item.service_description ||
                          ""
                        }
                        disabled={!editMode}
                        onChange={(e) =>
                          updateItem(index, "name", e.target.value)
                        }
                        style={{ fontWeight: 600, marginBottom: "5px" }}
                      />
                      {(item.service_description || item.description) && (
                        <input
                          type="text"
                          className={`editable ${editMode ? "editing" : ""}`}
                          value={
                            item.service_description || item.description || ""
                          }
                          disabled={!editMode}
                          onChange={(e) =>
                            updateItem(index, "description", e.target.value)
                          }
                          style={{ fontSize: "0.9rem", color: "#666" }}
                        />
                      )}
                    </td>
                    <td className="text-right">
                      <input
                        type="number"
                        className={`editable ${editMode ? "editing" : ""}`}
                        value={item.quantity}
                        disabled={!editMode}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        style={{ textAlign: "right", fontWeight: 500 }}
                      />
                    </td>
                    <td className="text-right">
                      <input
                        type="number"
                        className={`editable ${editMode ? "editing" : ""}`}
                        value={item.unit_price.toFixed(2)}
                        disabled={!editMode}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "unit_price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        style={{ textAlign: "right", fontWeight: 500 }}
                        step="0.01"
                      />
                    </td>
                    <td className="text-right" style={{ fontWeight: 500 }}>
                      {formatCurrency(item.total)}
                    </td>
                    {editMode && (
                      <td className="text-right">
                        <button
                          className="remove-item-btn"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="totals-section">
              <table className="totals-table">
                <tbody>
                  <tr>
                    <td className="label">Subtotal:</td>
                    <td className="amount">
                      {formatCurrency(invoice.subtotal)}
                    </td>
                  </tr>
                  {(invoice.discount_rate && invoice.discount_rate > 0) ||
                  editMode ? (
                    <tr>
                      <td className="label">
                        Discount (
                        {editMode ? (
                          <input
                            type="number"
                            className="editable editing"
                            value={((invoice.discount_rate || 0) * 100).toFixed(
                              1
                            )}
                            onChange={(e) =>
                              updateDiscountRate(
                                parseFloat(e.target.value) || 0
                              )
                            }
                            style={{
                              width: "50px",
                              display: "inline-block",
                              textAlign: "center",
                              padding: "2px 4px",
                              margin: "0 2px",
                            }}
                            step="0.1"
                            min="0"
                            max="100"
                          />
                        ) : (
                          ((invoice.discount_rate || 0) * 100).toFixed(1)
                        )}
                        %):
                      </td>
                      <td className="amount">
                        -{formatCurrency(invoice.discount_amount || 0)}
                      </td>
                    </tr>
                  ) : null}
                  {invoice.tax_rate > 0 || editMode ? (
                    <tr>
                      <td className="label">
                        Tax (
                        {editMode ? (
                          <input
                            type="number"
                            className="editable editing"
                            value={(invoice.tax_rate * 100).toFixed(1)}
                            onChange={(e) =>
                              updateTaxRate(parseFloat(e.target.value) || 0)
                            }
                            style={{
                              width: "50px",
                              display: "inline-block",
                              textAlign: "center",
                              padding: "2px 4px",
                              margin: "0 2px",
                            }}
                            step="0.1"
                            min="0"
                            max="100"
                          />
                        ) : (
                          (invoice.tax_rate * 100).toFixed(1)
                        )}
                        %):
                      </td>
                      <td className="amount">
                        {formatCurrency(invoice.tax_amount)}
                      </td>
                    </tr>
                  ) : null}
                  <tr className="total-row">
                    <td>Total:</td>
                    <td>{formatCurrency(invoice.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Section - Only show for invoices and accepted quotes */}
            {(!isQuote || invoice.status === "accepted") && (
              <div className="payment-section">
                <div className="payment-buttons">
                  <h4 style={{ color: "#8B5CF6", marginBottom: "20px" }}>
                    Pay Online Instantly
                  </h4>
                  <div className="payment-options">
                    <button
                      className="pay-button pay-primary"
                      onClick={() => handlePayment("stripe")}
                    >
                      <CreditCard size={20} />
                      Pay {formatCurrency(invoice.amount)} Now
                    </button>
                    <div className="payment-methods-row">
                      <button
                        className="pay-button pay-secondary"
                        onClick={() => handlePayment("paypal")}
                      >
                        PayPal
                      </button>
                      <button
                        className="pay-button pay-secondary"
                        onClick={() => handlePayment("apple")}
                      >
                        Apple Pay
                      </button>
                      <button
                        className="pay-button pay-secondary"
                        onClick={() => handlePayment("google")}
                      >
                        Google Pay
                      </button>
                      <button
                        className="pay-button pay-secondary"
                        onClick={() => handlePayment("revolut")}
                      >
                        Revolut
                      </button>
                    </div>
                  </div>
                  <p className="payment-security">
                    <Lock size={16} color="#10B981" />
                    Secure 256-bit SSL encryption • PCI DSS compliant
                  </p>
                </div>
              </div>
            )}

            {/* Payment Terms - Only show for invoices and accepted quotes */}
            {(!isQuote || invoice.status === "accepted") && (
              <div className="payment-terms">
                <h4>Payment Terms & Instructions</h4>
                {invoice.status === "pending" && (
                  <div
                    style={{
                      backgroundColor: "rgba(245, 158, 11, 0.1)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      borderRadius: "6px",
                      padding: "15px",
                      marginBottom: "15px",
                    }}
                  >
                    <p
                      style={{ margin: 0, color: "#92400e", fontWeight: "600" }}
                    >
                      <strong>⚠️ Payment Reminder:</strong> This invoice is
                      currently pending payment. Please complete payment as soon
                      as possible to avoid any late fees.
                    </p>
                  </div>
                )}
                <p>
                  <strong>Payment Due:</strong> Net 30 days from invoice date
                </p>
                <p>
                  <strong>Late Fee:</strong> 1.5% per month on overdue amounts
                </p>
                <p>
                  <strong>Alternative Payment Methods:</strong> Check, Bank
                  Transfer
                </p>
                <p>
                  <strong>Bank Details:</strong> Account #123456789, Routing
                  #987654321
                </p>
                {invoice.notes && (
                  <p>
                    <strong>Notes:</strong> {invoice.notes}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="footer">
            <p>
              <strong>Thank you for choosing MyAI!</strong>
            </p>
            <p>
              For questions about this invoice, please contact us at
              billing@myai.com
            </p>
            <p>Visit us online at www.myai.com</p>
          </div>
        </div>

        {/* Discard Changes Warning Dialog */}
        {showDiscardDialog && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowDiscardDialog(false)}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "30px",
                maxWidth: "500px",
                width: "90%",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                style={{
                  color: "#EF4444",
                  marginBottom: "15px",
                  fontSize: "1.5rem",
                }}
              >
                ⚠️ Discard Unsaved Changes?
              </h3>
              <p
                style={{
                  color: "#666",
                  marginBottom: "20px",
                  lineHeight: "1.6",
                }}
              >
                You have unsaved changes to this invoice. If you disable editing
                mode now, all your changes will be lost. Are you sure you want
                to discard your changes?
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  style={{
                    padding: "10px 20px",
                    borderRadius: "6px",
                    border: "2px solid #e5e7eb",
                    background: "white",
                    color: "#666",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() => setShowDiscardDialog(false)}
                >
                  Keep Editing
                </button>
                <button
                  style={{
                    padding: "10px 20px",
                    borderRadius: "6px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={handleDiscardChanges}
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
