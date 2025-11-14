import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "../utils/supabase/client";
import {
  Quote,
  getStatusDisplayName,
  getStatusColor,
} from "../utils/supabase/database";
import { MyAIInvoicesLogo } from "../components/MyAIInvoicesLogo";
import { toast } from "sonner";

interface QuoteResponseProps {}

export default function QuoteResponse({}: QuoteResponseProps) {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (quoteId) {
      fetchQuote();
    }
  }, [quoteId]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching quote for public access:", quoteId);

      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id_quote", quoteId)
        .single();

      if (error) {
        console.error("❌ Quote fetch error:", error);

        // Handle specific error cases
        if (error.code === "PGRST301") {
          throw new Error(
            "Quote not found. Please check the link and try again."
          );
        } else if (error.code === "42501") {
          throw new Error(
            "This quote is not available for public viewing. It may not be sent yet or has been responded to."
          );
        } else {
          throw new Error(error.message);
        }
      }

      if (!data) {
        throw new Error(
          "Quote not found. Please check the link and try again."
        );
      }

      // Additional validation for public access
      if (data.status !== "sent") {
        throw new Error(
          `This quote is not available for response. Current status: ${data.status}. Only quotes that have been sent can be viewed publicly.`
        );
      }

      console.log("✅ Quote fetched successfully:", data.id_quote);
      setQuote(data);
    } catch (err) {
      console.error("Error fetching quote:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load quote";

      // Retry logic for network errors
      if (retryCount < 2 && errorMessage.includes("Failed to load quote")) {
        console.log(`🔄 Retrying quote fetch (attempt ${retryCount + 1})`);
        setRetryCount((prev) => prev + 1);
        setTimeout(() => fetchQuote(), 1000);
        return;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteResponse = async (status: "accepted" | "rejected") => {
    if (!quote || !quoteId) return;

    // Validate quote can be responded to
    if (quote.status !== "sent") {
      setError(
        `Cannot ${
          status === "accepted" ? "accept" : "reject"
        } this quote. Current status: ${quote.status}`
      );
      toast.error("Quote cannot be responded to", {
        description:
          "This quote has already been responded to or is not ready for review.",
      });
      return;
    }

    // Check expiration
    if (quote.expires_at && new Date(quote.expires_at) < new Date()) {
      setError("This quote has expired and can no longer be responded to.");
      toast.error("Quote has expired", {
        description: "Please contact the business for a new quote.",
      });
      return;
    }

    try {
      setResponding(true);
      setError(null);

      console.log("📤 Updating quote status:", {
        quoteId,
        status,
        currentStatus: quote.status,
      });

      toast.loading(
        `${status === "accepted" ? "Accepting" : "Rejecting"} quote...`,
        { id: "quote-response" }
      );

      // Call the update quote status function using Supabase client
      const { data: result, error: functionError } =
        await supabase.functions.invoke("update-quote-status", {
          body: {
            quote_id: quoteId,
            status: status,
          },
        });

      console.log("📥 Function response:", result);
      console.log("📥 Function error:", functionError);

      if (functionError) {
        throw new Error(
          functionError.message || "Failed to update quote status"
        );
      }

      if (!result || result.error) {
        const errorMsg = result?.error || "Failed to update quote status";
        throw new Error(errorMsg);
      }

      toast.dismiss("quote-response");

      // Update local quote state
      setQuote((prev) => (prev ? { ...prev, status } : null));

      // Show appropriate success message
      if (status === "accepted") {
        if (result.invoice) {
          setSuccess(
            `Quote accepted successfully! An invoice has been created and sent to your email.`
          );
          toast.success("Quote Accepted!", {
            description: `Invoice ${result.invoice.invoice_number} has been created and sent to you.`,
            duration: 6000,
          });
        } else {
          setSuccess(`Quote accepted successfully!`);
          toast.success("Quote Accepted!", {
            description: "The business has been notified of your acceptance.",
            duration: 6000,
          });
        }
      } else {
        setSuccess(`Quote declined. Thank you for your consideration.`);
        toast.success("Quote Declined", {
          description: "The business has been notified.",
          duration: 4000,
        });
      }

      // Redirect after a delay
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      console.error("Error updating quote status:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to respond to quote";

      // Handle specific error cases
      if (errorMessage.includes("Quote not found")) {
        setError(
          "This quote is no longer available. It may have been deleted or the link is invalid."
        );
      } else if (errorMessage.includes("expired")) {
        setError("This quote has expired and can no longer be responded to.");
      } else if (errorMessage.includes("already been responded to")) {
        setError(
          "This quote has already been responded to and cannot be changed."
        );
      } else {
        setError(errorMessage);
      }

      toast.error("Failed to respond to quote", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setResponding(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      currencyDisplay: "symbol",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isExpired = quote?.expires_at
    ? new Date(quote.expires_at) < new Date()
    : false;
  const canRespond = quote?.status === "sent" && !isExpired;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="space-y-2 mt-4">
              <Button
                onClick={() => {
                  setError(null);
                  setRetryCount(0);
                  fetchQuote();
                }}
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate("/")}
                className="w-full"
                variant="outline"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Quote not found</AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate("/")}
              className="w-full mt-4"
              variant="outline"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = Array.isArray(quote.items) ? quote.items : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <MyAIInvoicesLogo height={60} className="mx-auto mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Quote Review
          </h1>
          <p className="text-gray-600">
            Please review the quote below and respond accordingly
          </p>
        </div>

        {/* Expired Quote Alert */}
        {isExpired && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This quote expired on {formatDate(quote.expires_at!)}. You can no
              longer accept or reject it.
            </AlertDescription>
          </Alert>
        )}

        {/* Quote Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Quote Details</CardTitle>
                <p className="text-gray-600 mt-1">
                  Created on {formatDate(quote.created_at)}
                </p>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(quote.status || "draft")}>
                  {getStatusDisplayName(quote.status || "draft")}
                </Badge>
                {quote.expires_at && (
                  <p className="text-sm text-gray-500 mt-1">
                    Expires: {formatDate(quote.expires_at)}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Client Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Client Information</h3>
              <p>
                <strong>Name:</strong> {quote.client_name || "Not specified"}
              </p>
              <p>
                <strong>Email:</strong> {quote.client_email || "Not specified"}
              </p>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-4">Quote Items</h3>
              {items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {item.category ||
                                item.name ||
                                item.service_description ||
                                "Unnamed Item"}
                            </p>
                            {(item.description || item.service_description) && (
                              <p className="text-sm text-gray-600">
                                {item.description || item.service_description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity || item.qty || 1}</TableCell>
                        <TableCell>
                          {formatCurrency(item.unit_price || item.price || 0)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(
                            (item.unit_price || item.price || 0) *
                              (item.quantity || item.qty || 1)
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 italic">No items specified</p>
              )}
            </div>

            {/* Total */}
            {quote.total && (
              <div className="border-t-2 pt-4 bg-blue-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">
                    {formatCurrency(quote.total)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Section */}
        {success ? (
          <Card>
            <CardContent className="pt-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
              <p className="text-center text-gray-600 mt-4">
                You will be redirected shortly...
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Response</CardTitle>
            </CardHeader>
            <CardContent>
              {!canRespond ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {isExpired
                      ? "This quote has expired and can no longer be responded to."
                      : quote.status !== "sent"
                      ? "This quote has already been responded to."
                      : "This quote cannot be responded to at this time."}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Please review the quote above and choose your response:
                  </p>

                  <div className="flex gap-4 justify-center flex-wrap">
                    <Button
                      onClick={() => handleQuoteResponse("accepted")}
                      disabled={responding}
                      size="lg"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-10 py-6 text-lg shadow-lg"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Accept Quote
                    </Button>

                    <Button
                      onClick={() => handleQuoteResponse("rejected")}
                      disabled={responding}
                      size="lg"
                      variant="destructive"
                      className="px-10 py-6 text-lg shadow-lg"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reject Quote
                    </Button>
                  </div>

                  {responding && (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">
                        Processing your response...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Thank you for using our quote system.</p>
          <p>If you have any questions, please contact us directly.</p>
        </div>
      </div>
    </div>
  );
}
