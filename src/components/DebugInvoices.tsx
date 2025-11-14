import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Loader2, RefreshCw, Database, AlertCircle } from "lucide-react";

// Get the Supabase URL from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface DebugInvoicesProps {
  accessToken: string;
}

export function DebugInvoices({ accessToken }: DebugInvoicesProps) {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch debug info
      const debugResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-31b2da65/debug-db`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (debugResponse.ok) {
        const debugData = await debugResponse.json();
        setDebugInfo(debugData);
        console.log("Debug info:", debugData);
      }

      // Fetch user files (which includes invoice files)
      const filesResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-31b2da65/files`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        setInvoices(filesData.invoice_files || []);
        console.log("Invoice files:", filesData.invoice_files);
      } else {
        throw new Error(`Files fetch failed: ${filesResponse.status}`);
      }
    } catch (err: any) {
      console.error("Debug fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          <h3 className="font-medium">Invoice Database Status</h3>
        </div>
        <Button
          onClick={fetchData}
          disabled={loading}
          size="sm"
          variant="outline"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {debugInfo && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">Storage Connection:</span>
            <Badge className="bg-green-100 text-green-700">Connected</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">User ID:</span>
            <code className="text-xs bg-gray-100 px-1 rounded">
              {debugInfo.userId}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Invoice Files:</span>
            <Badge variant="outline">{debugInfo.invoiceFiles || 0}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Customer Files:</span>
            <Badge variant="outline">{debugInfo.customerFiles || 0}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Storage Buckets:</span>
            <Badge variant="outline">{debugInfo.buckets?.length || 0}</Badge>
          </div>
        </div>
      )}

      {invoices.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploaded Invoice Files:</h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {invoices.slice(0, 5).map((file, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <strong>Filename:</strong>{" "}
                    {file.filename || file.original_name || "N/A"}
                  </div>
                  <div>
                    <strong>Size:</strong>{" "}
                    {file.size ? `${Math.round(file.size / 1024)} KB` : "N/A"}
                  </div>
                  <div>
                    <strong>Uploaded:</strong>{" "}
                    {file.uploaded_at
                      ? new Date(file.uploaded_at).toLocaleDateString()
                      : "N/A"}
                  </div>
                  <div>
                    <strong>Bucket:</strong> {file.bucket || "inv_history"}
                  </div>
                </div>
                {file.file_url && (
                  <div className="mt-1">
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-xs"
                    >
                      View File
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && invoices.length === 0 && !error && (
        <div className="text-center py-4 text-gray-500">
          <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No invoice files uploaded</p>
          <p className="text-xs mt-1">
            Upload a CSV file to see it stored in the inv_history bucket
          </p>
        </div>
      )}
    </div>
  );
}
