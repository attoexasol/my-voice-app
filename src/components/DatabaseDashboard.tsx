import { useState } from "react";
import { ClientManagement } from "./ClientManagement";
import { ItemCatalog } from "./ItemCatalog";
import { useQuotes } from "../hooks/useSupabase";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { SidebarNavigation } from "./SidebarNavigation";
import {
  Users,
  FileText,
  Package,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";

interface DatabaseDashboardProps {
  userId: string;
  onSignOut: () => void;
}

export function DatabaseDashboard({
  userId,
  onSignOut,
}: DatabaseDashboardProps) {
  const { quotes, loading: quotesLoading } = useQuotes(userId);
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate quote statistics
  const stats = {
    total: quotes.length,
    draft: quotes.filter((q) => q.status === "draft").length,
    sent: quotes.filter((q) => q.status === "sent").length,
    accepted: quotes.filter((q) => q.status === "accepted").length,
    rejected: quotes.filter((q) => q.status === "rejected").length,
    totalValue: quotes.reduce((sum, q) => sum + (q.total || 0), 0),
  };

  const recentQuotes = quotes.slice(0, 5);

  if (quotesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading dashboard...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen">
      <SidebarNavigation onSignOut={onSignOut} />

      <div className="ml-20 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Business Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage your clients, quotes, and inventory
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Total Quotes</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold">
                        €{stats.totalValue.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Accepted</p>
                      <p className="text-2xl font-bold">{stats.accepted}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-amber-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-bold">
                        {stats.draft + stats.sent}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="clients">Clients</TabsTrigger>
                <TabsTrigger value="catalog">Catalog</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quote Status Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Quote Status Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-sm">Draft</span>
                        </div>
                        <Badge variant="secondary">{stats.draft}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                          <span className="text-sm">Sent</span>
                        </div>
                        <Badge variant="secondary">{stats.sent}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm">Accepted</span>
                        </div>
                        <Badge variant="secondary">{stats.accepted}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-sm">Rejected</span>
                        </div>
                        <Badge variant="secondary">{stats.rejected}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Quotes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Recent Quotes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentQuotes.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          No quotes yet
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {recentQuotes.map((quote) => {
                            const itemsArray = Array.isArray(quote.items)
                              ? quote.items
                              : [];
                            return (
                              <div
                                key={quote.id_quote}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium">
                                    {quote.client_name || "Unnamed Client"}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {itemsArray.length} items • €
                                    {(quote.total || 0).toFixed(2)}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant={
                                      quote.status === "accepted"
                                        ? "default"
                                        : quote.status === "sent"
                                        ? "secondary"
                                        : quote.status === "rejected"
                                        ? "destructive"
                                        : "outline"
                                    }
                                  >
                                    {quote.status || "draft"}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center"
                        onClick={() => setActiveTab("clients")}
                      >
                        <Users className="w-6 h-6 mb-2" />
                        Manage Clients
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center"
                        onClick={() => (window.location.href = "/invoices")}
                      >
                        <FileText className="w-6 h-6 mb-2" />
                        View Invoices & Quotes
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center"
                        onClick={() => setActiveTab("catalog")}
                      >
                        <Package className="w-6 h-6 mb-2" />
                        Browse Catalog
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="clients">
                <ClientManagement userId={userId} />
              </TabsContent>

              <TabsContent value="catalog">
                <ItemCatalog userId={userId} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
