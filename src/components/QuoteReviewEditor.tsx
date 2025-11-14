import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit2,
  Trash2,
  Plus,
  Save,
  FileText,
  Loader2,
  CheckCircle2,
  X,
  Send,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";

// Get the Supabase URL and anon key from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface QuoteItem {
  category: string;
  service_description: string;
  type: string;
  quantity: number;
  unit_price?: number;
  currency_code?: string;
}

interface QuoteData {
  id_output: string;
  client_name: string;
  client_email?: string;
  items: QuoteItem[];
  tax_rate?: number;
  discount_rate?: number;
}

interface Category {
  id: string;
  category: string;
  service_description: string;
  type: string;
  ave_price: number;
  currency_code: string;
}

interface QuoteReviewEditorProps {
  quoteData: QuoteData;
  accessToken: string;
  recordingTitle?: string;
  onGenerateInvoice: () => void;
  onCancel: () => void;
  onQuoteCreated?: (quoteId: string) => void;
}

export function QuoteReviewEditor({
  quoteData,
  accessToken,
  recordingTitle,
  onGenerateInvoice,
  onCancel,
  onQuoteCreated,
}: QuoteReviewEditorProps) {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState(quoteData.client_name);
  const [clientEmail, setClientEmail] = useState(quoteData.client_email || "");
  const [items, setItems] = useState<QuoteItem[]>(quoteData.items);
  const [categories, setCategories] = useState<Category[]>([]);
  const [taxRate, setTaxRate] = useState((quoteData.tax_rate || 0.085) * 100); // Convert to percentage
  const [discountRate, setDiscountRate] = useState(
    (quoteData.discount_rate || 0.05) * 100
  ); // Convert to percentage
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Fetch available categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/plumbing_categories?select=*`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            apikey: publicAnonKey,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddItem = () => {
    const newItem: QuoteItem = {
      category: "",
      service_description: "",
      type: "maintenance",
      quantity: 1,
      unit_price: 0,
      currency_code: items[0]?.currency_code || "EUR",
    };
    setItems([...items, newItem]);
    setEditingIndex(items.length);
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
    toast.success("Item removed");
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setItems(updatedItems);
  };

  const validateData = () => {
    if (!clientName.trim()) {
      toast.error("Client name is required");
      return false;
    }

    if (items.length === 0) {
      toast.error("At least one item is required");
      return false;
    }

    // Validate all items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (
        !item.category ||
        !item.service_description ||
        !item.type ||
        item.quantity < 1 ||
        !item.unit_price ||
        item.unit_price <= 0
      ) {
        toast.error(
          `Item ${
            i + 1
          } is incomplete. Please fill all fields and ensure price is greater than 0.`
        );
        return false;
      }
    }
    return true;
  };

  const handleCreateQuote = async (status: "draft" | "sent") => {
    if (!validateData()) return;

    // Validate email if sending quote
    if (status === "sent" && !clientEmail.trim()) {
      toast.error("Client email is required to send quote");
      return;
    }

    setIsSaving(true);

    try {
      // Create or update quote with status
      const response = await fetch(`${SUPABASE_URL}/functions/v1/quote`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_output: quoteData.id_output,
          client_name: clientName,
          client_email: clientEmail,
          items: items,
          tax_rate: taxRate / 100,
          discount_rate: discountRate / 100,
          status: status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create quote");
      }

      toast.success(
        status === "sent"
          ? "Quote created! (Email sending not yet implemented)"
          : "Quote saved as draft!"
      );

      if (onQuoteCreated) {
        onQuoteCreated(result.id_quote || result.id_output || "temp-quote-id");
      }

      // Navigate to invoice page to view/edit the quote
      if (result.id_quote) {
        navigate(`/invoice/${result.id_quote}`);
      }
    } catch (error) {
      console.error("Error creating quote:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create quote"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateInvoiceDirectly = async () => {
    if (!validateData()) return;

    setIsSaving(true);
    setIsGenerating(true);

    try {
      // First, save the quote data to gpt_output AND create a quote record with 'draft' status
      // This ensures we maintain the audit trail even for direct invoices
      const saveResponse = await fetch(`${SUPABASE_URL}/functions/v1/quote`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_output: quoteData.id_output,
          client_name: clientName,
          client_email: clientEmail,
          items: items,
          tax_rate: taxRate / 100,
          discount_rate: discountRate / 100,
          status: "draft", // Save as draft quote for tracking
        }),
      });

      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(saveData.error || "Failed to save quote data");
      }

      console.log(
        "✅ Quote saved (draft) before generating invoice:",
        saveData.id_quote
      );
      toast.success("Quote saved, generating invoice...");

      // Then generate the invoice
      onGenerateInvoice();
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate invoice"
      );
      setIsSaving(false);
      setIsGenerating(false);
    }
  };

  const getUniqueCategories = () => {
    const uniqueCategories = new Set<string>();
    categories.forEach((cat) => uniqueCategories.add(cat.category));
    return Array.from(uniqueCategories).sort();
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const price = item.unit_price || 0;
      const quantity = item.quantity || 1;
      return sum + price * quantity;
    }, 0);
  };

  const calculateDiscount = () => {
    return calculateSubtotal() * (discountRate / 100);
  };

  const calculateTax = () => {
    return (calculateSubtotal() - calculateDiscount()) * (taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <FileText className="w-6 h-6 text-blue-600" />
          Review & Edit Quote
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Review the extracted information and make any necessary changes before
          generating the invoice.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Client Information */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-name" className="text-lg font-semibold">
              Client Name
            </Label>
            <Input
              id="client-name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter client name"
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-email" className="text-lg font-semibold">
              Client Email (Required for sending quotes)
            </Label>
            <Input
              id="client-email"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="Enter client email address"
              className="text-lg"
            />
            <p className="text-sm text-gray-500">
              Email is required when sending quotes to customers
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Service Items</Label>
            <Button
              onClick={handleAddItem}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No items yet. Click "Add Item" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <Card
                  key={index}
                  className="bg-white border-2 border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {/* Item Header */}
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">
                          Item {index + 1}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              setEditingIndex(
                                editingIndex === index ? null : index
                              )
                            }
                            variant="ghost"
                            size="sm"
                          >
                            {editingIndex === index ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <Edit2 className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => handleDeleteItem(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Item Fields */}
                      {editingIndex === index ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Category */}
                          <div className="space-y-2">
                            <Label htmlFor={`category-${index}`}>
                              Category
                            </Label>
                            <Select
                              value={item.category}
                              onValueChange={(value: string) =>
                                handleUpdateItem(index, "category", value)
                              }
                            >
                              <SelectTrigger id={`category-${index}`}>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {getUniqueCategories().map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Type */}
                          <div className="space-y-2">
                            <Label htmlFor={`type-${index}`}>Type</Label>
                            <Select
                              value={item.type}
                              onValueChange={(value: string) =>
                                handleUpdateItem(index, "type", value)
                              }
                            >
                              <SelectTrigger id={`type-${index}`}>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="maintenance">
                                  Maintenance
                                </SelectItem>
                                <SelectItem value="repair">Repair</SelectItem>
                                <SelectItem value="installation">
                                  Installation
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Service Description */}
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`description-${index}`}>
                              Service Description
                            </Label>
                            <Input
                              id={`description-${index}`}
                              value={item.service_description}
                              onChange={(e) =>
                                handleUpdateItem(
                                  index,
                                  "service_description",
                                  e.target.value
                                )
                              }
                              placeholder="Describe the service"
                            />
                          </div>

                          {/* Quantity */}
                          <div className="space-y-2">
                            <Label htmlFor={`quantity-${index}`}>
                              Quantity
                            </Label>
                            <Input
                              id={`quantity-${index}`}
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateItem(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value) || 1
                                )
                              }
                            />
                          </div>

                          {/* Unit Price (Editable) */}
                          <div className="space-y-2">
                            <Label htmlFor={`price-${index}`}>
                              Unit Price ({item.currency_code || "EUR"})
                            </Label>
                            <Input
                              id={`price-${index}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price || 0}
                              onChange={(e) =>
                                handleUpdateItem(
                                  index,
                                  "unit_price",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-semibold">Category:</span>{" "}
                            {item.category}
                          </div>
                          <div>
                            <span className="font-semibold">Type:</span>{" "}
                            {item.type}
                          </div>
                          <div>
                            <span className="font-semibold">Description:</span>{" "}
                            {item.service_description}
                          </div>
                          <div>
                            <span className="font-semibold">Quantity:</span>{" "}
                            {item.quantity}
                          </div>
                          {item.unit_price && (
                            <div>
                              <span className="font-semibold">Price:</span>{" "}
                              {item.currency_code || "EUR"}{" "}
                              {item.unit_price.toFixed(2)} × {item.quantity} ={" "}
                              {item.currency_code || "EUR"}{" "}
                              {(item.unit_price * item.quantity).toFixed(2)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        {items.length > 0 && (
          <Card className="bg-white border-2 border-blue-200">
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg mb-4">Pricing Summary</h3>

              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  {items[0]?.currency_code || "EUR"}{" "}
                  {calculateSubtotal().toFixed(2)}
                </span>
              </div>

              {/* Discount Rate (Editable) */}
              <div className="space-y-2">
                <Label htmlFor="discount-rate">Discount Rate (%)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="discount-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={discountRate}
                    onChange={(e) =>
                      setDiscountRate(parseFloat(e.target.value) || 0)
                    }
                    className="w-32"
                  />
                  <span className="text-sm text-gray-600">
                    = {items[0]?.currency_code || "EUR"}{" "}
                    {calculateDiscount().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-gray-600">After Discount:</span>
                <span className="font-medium">
                  {items[0]?.currency_code || "EUR"}{" "}
                  {(calculateSubtotal() - calculateDiscount()).toFixed(2)}
                </span>
              </div>

              {/* Tax Rate (Editable) */}
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="tax-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) =>
                      setTaxRate(parseFloat(e.target.value) || 0)
                    }
                    className="w-32"
                  />
                  <span className="text-sm text-gray-600">
                    = {items[0]?.currency_code || "EUR"}{" "}
                    {calculateTax().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t-2 border-blue-200">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-3xl font-bold text-blue-600">
                  {items[0]?.currency_code || "EUR"}{" "}
                  {calculateTotal().toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          {/* Two Main Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quote Workflow */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Quote Workflow
              </h3>
              <p className="text-sm text-gray-600">
                Create a quote and wait for customer approval before generating
                invoice
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => handleCreateQuote("draft")}
                  disabled={isSaving || isGenerating}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save as Draft Quote
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleCreateQuote("sent")}
                  disabled={isSaving || isGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Quote to Customer
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Direct Invoice Workflow */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Direct Invoice
              </h3>
              <p className="text-sm text-gray-600">
                Generate invoice directly and send to customer immediately
              </p>
              <Button
                onClick={handleGenerateInvoiceDirectly}
                disabled={isSaving || isGenerating}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold"
              >
                {isSaving || isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isSaving ? "Saving..." : "Generating Invoice..."}
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Invoice Directly
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Cancel Button */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={onCancel}
              variant="outline"
              disabled={isSaving || isGenerating}
              className="px-8"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
