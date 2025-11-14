import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Mic, MessageCircle, FileText, Calendar, Database } from "lucide-react";
import { supabase } from "../utils/supabase/client";
import { SidebarNavigation } from "./SidebarNavigation";
import { getUserDisplayName } from "../utils/user";

// Get the Supabase URL from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface DashboardProps {
  user: any;
  onSignOut: () => void;
  isOnline?: boolean;
}

export function Dashboard({
  user,
  onSignOut,
  isOnline = true,
}: DashboardProps) {
  const navigate = useNavigate();
  const userName = getUserDisplayName(user);
  const [invoiceStats, setInvoiceStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceStats();
  }, []);

  const fetchInvoiceStats = async () => {
    try {
      // Get the current session token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error("No session token available");
        setLoading(false);
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/invoices`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const invoices = data.invoices || [];
        const stats = {
          pending: invoices.filter((inv: any) => inv.status === "pending")
            .length,
          paid: invoices.filter((inv: any) => inv.status === "paid").length,
          overdue: invoices.filter((inv: any) => inv.status === "overdue")
            .length,
          sent: invoices.filter((inv: any) => inv.status === "sent").length,
        };
        setInvoiceStats(stats);
      }
    } catch (error) {
      console.error("Error fetching invoice stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SidebarNavigation onSignOut={onSignOut} />

      <div className="ml-20 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                My AI Invoices
              </h1>
              <p className="text-gray-600">
                Welcome back,{" "}
                <span className="font-medium text-gray-800">{userName}</span>!
              </p>
              {!isOnline && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-700 border border-yellow-200"
                  >
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Offline Mode
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Voice Recorder Card */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-gray-800">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg group-hover:shadow-lg transition-shadow">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl">Voice Recorder</h3>
                    <p className="text-sm text-gray-600 font-normal">
                      Use voice commands to record Items for the Quotes or to
                      Update existing Quotes and send to customers
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700"
                    >
                      Voice Recording
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-700"
                    >
                      AI Analysis
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Use voice commands to record business insights, customer
                    feedback, or quick notes. Our AI will help analyze and
                    organize your recordings.
                  </p>
                  <Button
                    onClick={() => navigate("/recorder")}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                  >
                    Start Recording
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Chatbot Card */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-gray-800">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg group-hover:shadow-lg transition-shadow">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl">AI Chatbot</h3>
                    <p className="text-sm text-gray-600 font-normal">
                      Chat about customers and invoices
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-700"
                    >
                      Smart Chat
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-pink-100 text-pink-700"
                    >
                      Business Insights
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Ask questions about your customers, invoices, and business
                    data. Get intelligent responses and actionable insights from
                    our AI assistant.
                  </p>
                  <Button
                    onClick={() => navigate("/chatbot")}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                  >
                    Start Chatting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Features */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Database Management Card */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  Database Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Manage clients, quotes, and item catalog
                </p>
                <Button
                  onClick={() => navigate("/database")}
                  variant="outline"
                  className="w-full bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50"
                >
                  Open Database
                </Button>
              </CardContent>
            </Card>

            {/* Invoices Card */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  View Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Manage invoices with status tracking and analytics
                </p>
                <Button
                  onClick={() => navigate("/invoices")}
                  variant="outline"
                  className="w-full bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50"
                >
                  View Invoices
                </Button>
              </CardContent>
            </Card>

            {/* Invoice Status Overview */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  Invoice Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : invoiceStats ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Paid</span>
                      <Badge className="bg-green-100 text-green-700">
                        {invoiceStats.paid}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending</span>
                      <Badge className="bg-blue-100 text-blue-700">
                        {invoiceStats.pending}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overdue</span>
                      <Badge className="bg-red-100 text-red-700">
                        {invoiceStats.overdue}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sent</span>
                      <Badge className="bg-purple-100 text-purple-700">
                        {invoiceStats.sent}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                      No invoice data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calendar Meetings */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Upcoming Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Client Review</p>
                      <p className="text-gray-600">Tomorrow 2:00 PM</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">
                      Scheduled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">
                        Project Planning
                      </p>
                      <p className="text-gray-600">Friday 10:00 AM</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      Confirmed
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">
                        Budget Discussion
                      </p>
                      <p className="text-gray-600">Next Week</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">
                      Pending
                    </Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => navigate("/calendar")}
                    variant="outline"
                    size="sm"
                    className="w-full bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    View Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-white/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Need Help Getting Started?
                </h3>
                <p className="text-gray-600 mb-4">
                  Check out our quick tips to make the most of your AI assistant
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Badge variant="outline" className="text-xs">
                    💬 Use the chatbot to upload documents and manage data
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    🎤 Use voice commands for quick note-taking
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    📊 Ask the chatbot about your business metrics
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
