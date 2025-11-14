import React, { useState, memo } from "react";
import { useClients, useClientSearch } from "../hooks/useSupabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  Upload,
  FileText,
  Download,
  X,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ClientManagementProps {
  userId: string;
}

export const ClientManagement = memo(function ClientManagement({
  userId,
}: ClientManagementProps) {
  console.log("🔍 ClientManagement rendering for user:", userId);
  console.log(
    "🔍 ClientManagement render timestamp:",
    new Date().toISOString()
  );

  const {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    refetch,
  } = useClients(userId);

  console.log("📊 ClientManagement state:", { clients, loading, error });
  const { searchResults, searchClients, clearResults } =
    useClientSearch(userId);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // const [isSearching, setIsSearching] = useState(false);

  // CSV Upload state
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvAllData, setCsvAllData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [failedImports, setFailedImports] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    client_name: "",
    email: "",
    phone: "",
  });

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // setIsSearching(true);
      await searchClients(query);
      // setIsSearching(false);
    } else {
      clearResults();
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClient({
        client_name: formData.client_name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
      });
      setFormData({ client_name: "", email: "", phone: "" });
      setIsCreateDialogOpen(false);
      toast.success("Client created successfully");
    } catch (error) {
      toast.error("Failed to create client");
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      await updateClient(editingClient.id, {
        client_name: formData.client_name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
      });
      setEditingClient(null);
      setFormData({ client_name: "", email: "", phone: "" });
      toast.success("Client updated successfully");
    } catch (error) {
      toast.error("Failed to update client");
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await deleteClient(clientId);
        toast.success("Client deleted successfully");
      } catch (error) {
        toast.error("Failed to delete client");
      }
    }
  };

  const openEditDialog = (client: any) => {
    setEditingClient(client);
    setFormData({
      client_name: client.client_name,
      email: client.email || "",
      phone: client.phone || "",
    });
  };

  const closeEditDialog = () => {
    setEditingClient(null);
    setFormData({ client_name: "", email: "", phone: "" });
  };

  // CSV Upload handlers
  const handleCsvFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please select a CSV file");
      return;
    }

    setCsvFile(file);
    parseCsvFile(file);
  };

  const parseCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        toast.error("CSV file must have at least a header and one data row");
        return;
      }

      // Improved CSV parsing that handles quoted fields and commas
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }

        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]).map((h) =>
        h.replace(/"/g, "").trim()
      );
      const dataRows = lines
        .slice(1)
        .filter((line) => line.trim()) // Remove empty lines
        .map((line) => {
          const values = parseCSVLine(line).map((v) =>
            v.replace(/"/g, "").trim()
          );
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          return row;
        })
        .filter((row) => {
          // Filter out completely empty rows
          return Object.values(row).some(
            (value) => value && typeof value === "string" && value.trim() !== ""
          );
        });

      setCsvPreview(dataRows.slice(0, 5)); // Show first 5 rows as preview
      setCsvAllData(dataRows); // Store all data for processing
      setCsvFile(file); // Store the file for later processing
    };
    reader.readAsText(file);
  };

  const handleCsvUpload = async () => {
    if (!csvFile || csvAllData.length === 0) return;

    setIsUploading(true);
    setFailedImports([]);
    let successCount = 0;
    let failedCount = 0;

    try {
      // Process each CSV row
      for (const row of csvAllData) {
        try {
          // Map CSV columns to client fields (try different possible column names)
          const name =
            row.name ||
            row.Name ||
            row.customer_name ||
            row.customer ||
            row.client_name ||
            "";
          const email =
            row.email ||
            row.Email ||
            row.customer_email ||
            row.customer_email ||
            "";
          const phone =
            row.phone ||
            row.Phone ||
            row.customer_phone ||
            row.phone_number ||
            "";

          // Validate required fields
          if (!name || name.trim() === "") {
            console.warn("Skipping row with missing name:", row);
            failedCount++;
            setFailedImports((prev) => [
              ...prev,
              { row, error: "Missing name field" },
            ]);
            continue;
          }

          // Validate email format if provided
          if (email && email.trim() !== "") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
              console.warn("Invalid email format:", email);
              // Don't skip the row, just set email to null
            }
          }

          // Create client using the existing hook
          await createClient({
            client_name: name.trim(),
            email: email && email.trim() !== "" ? email.trim() : undefined,
            phone: phone && phone.trim() !== "" ? phone.trim() : undefined,
          });

          successCount++;
        } catch (error: any) {
          console.error("Failed to create client:", error);
          failedCount++;
          setFailedImports((prev) => [
            ...prev,
            { row, error: error.message || "Unknown error" },
          ]);
        }
      }

      setUploadedCount(successCount);
      setUploadSuccess(true);

      if (successCount > 0) {
        toast.success(
          `Successfully imported ${successCount} client${
            successCount !== 1 ? "s" : ""
          } to your database!`
        );
      }

      if (failedCount > 0) {
        toast.warning(
          `${failedCount} client${
            failedCount !== 1 ? "s" : ""
          } failed to import. Check the details below.`
        );
      }

      // Refresh the client list
      if (refetch) {
        refetch();
      }
    } catch (error: any) {
      console.error("CSV upload error:", error);
      toast.error(error.message || "Failed to process CSV file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleCsvFileSelect(files[0]);
    }
  };

  const downloadSampleCsv = () => {
    const sampleData = [
      ["client_name", "email", "phone"],
      ["John Doe", "john@example.com", "+1-555-0123"],
      ["Jane Smith", "jane@example.com", "+1-555-0456"],
    ];

    const csvContent = sampleData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_customers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetCsvDialog = () => {
    setCsvFile(null);
    setCsvPreview([]);
    setCsvAllData([]);
    setUploadSuccess(false);
    setUploadedCount(0);
    setFailedImports([]);
    setIsUploading(false);
    setDragOver(false);
  };

  const closeCsvDialog = () => {
    setIsCsvDialogOpen(false);
    resetCsvDialog();
  };

  const displayClients = searchQuery.trim() ? searchResults : clients;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading clients...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't return early on error - show the interface with error message
  // if (error) {
  //   return (
  //     <Alert className="border-red-200 bg-red-50">
  //       <AlertDescription className="text-red-700">
  //         Error loading clients: {error}
  //       </AlertDescription>
  //     </Alert>
  //   );
  // }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            Error loading clients: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Client Management
          </h2>
          <p className="text-gray-600">
            Manage your clients and customer information
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCsvDialogOpen} onOpenChange={setIsCsvDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Client</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div>
                  <Label htmlFor="client_name">Name *</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) =>
                      setFormData({ ...formData, client_name: e.target.value })
                    }
                    required
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="client@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Client</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Client List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {client.client_name}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Added {new Date(client.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(client)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteClient(client.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {client.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {client.phone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {displayClients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              {searchQuery.trim()
                ? "No clients found matching your search."
                : "No clients yet. Create your first client to get started."}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingClient} onOpenChange={closeEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateClient} className="space-y-4">
            <div>
              <Label htmlFor="edit-client_name">Name *</Label>
              <Input
                id="edit-client_name"
                value={formData.client_name}
                onChange={(e) =>
                  setFormData({ ...formData, client_name: e.target.value })
                }
                required
                placeholder="Client name"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="client@example.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={closeEditDialog}>
                Cancel
              </Button>
              <Button type="submit">Update Client</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* CSV Upload Dialog */}
      <Dialog open={isCsvDialogOpen} onOpenChange={setIsCsvDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Customers from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {uploadSuccess ? (
              /* Success State */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Import Complete!
                </h3>
                <p className="text-gray-600 mb-4">
                  Successfully imported {uploadedCount} client
                  {uploadedCount !== 1 ? "s" : ""} to your database.
                  {failedImports.length > 0 && (
                    <span className="block mt-2 text-orange-600">
                      {failedImports.length} client
                      {failedImports.length !== 1 ? "s" : ""} failed to import.
                    </span>
                  )}
                </p>

                {/* Failed Imports Display */}
                {failedImports.length > 0 && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg text-left">
                    <h4 className="font-medium text-orange-800 mb-2">
                      Failed Imports:
                    </h4>
                    <div className="max-h-32 overflow-y-auto">
                      {failedImports.map((failed, index) => (
                        <div
                          key={index}
                          className="text-sm text-orange-700 mb-1"
                        >
                          <strong>
                            {failed.row.client_name ||
                              failed.row.name ||
                              "Unknown"}
                            :
                          </strong>{" "}
                          {failed.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center space-x-2 mt-4">
                  <Button
                    onClick={closeCsvDialog}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Sample CSV Download */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Need a sample format?
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadSampleCsv}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download Sample
                  </Button>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                    dragOver
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-green-400 hover:bg-green-50/40"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your CSV file here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">or</p>
                  <Button
                    variant="outline"
                    disabled={isUploading}
                    onClick={() =>
                      document.getElementById("csv-upload")?.click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCsvFileSelect(file);
                    }}
                  />
                </div>

                {/* File Preview */}
                {csvFile && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium">
                          {csvFile.name}
                        </span>
                        <Badge variant="secondary">
                          {csvPreview.length} records
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCsvFile(null);
                          setCsvPreview([]);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Preview Table */}
                    {csvPreview.length > 0 && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                          Preview (first 5 rows)
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                {Object.keys(csvPreview[0] || {}).map(
                                  (header) => (
                                    <th
                                      key={header}
                                      className="px-3 py-2 text-left font-medium text-gray-700"
                                    >
                                      {header}
                                    </th>
                                  )
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {csvPreview.map((row, index) => (
                                <tr key={index} className="border-t">
                                  {Object.values(row).map(
                                    (value: any, cellIndex) => (
                                      <td
                                        key={cellIndex}
                                        className="px-3 py-2 text-gray-600"
                                      >
                                        {value || "-"}
                                      </td>
                                    )
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={closeCsvDialog}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCsvUpload}
                    disabled={!csvFile || isUploading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300 mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {csvFile ? "Upload CSV" : "Select CSV First"}
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});
