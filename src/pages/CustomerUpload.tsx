// import React from "react";
// import { Button } from "../ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import { Progress } from "../ui/progress";
// import { Alert, AlertDescription } from "../ui/alert";
// import {
//   Upload,
//   FileText,
//   Users,
//   CheckCircle,
//   AlertCircle,
//   X,
//   ArrowLeft,
//   Download,
// } from "lucide-react";
// import { MyAIInvoicesLogo } from "../MyAIInvoicesLogo";

// interface UploadFile {
//   id: string;
//   name: string;
//   size: number;
//   type: "invoices" | "customers";
//   status: "uploading" | "success" | "error";
//   progress: number;
//   error?: string;
// }

// interface DocumentUploadPageProps {
//   onFileUpload?: (files: FileList, type: "invoices" | "customers") => void;
//   onFileRemove?: (fileId: string) => void;
//   onBack?: () => void;
//   onContinue?: () => void;
//   onSkip?: () => void;
//   uploadedFiles?: UploadFile[];
//   isUploading?: boolean;
// }

// export function DocumentUploadPage({
//   onFileUpload,
//   onFileRemove,
//   onBack,
//   onContinue,
//   onSkip,
//   uploadedFiles = [],
//   isUploading = false,
// }: DocumentUploadPageProps) {
//   const [dragOver, setDragOver] = React.useState<
//     "invoices" | "customers" | null
//   >(null);

//   const handleDragOver = (
//     e: React.DragEvent,
//     type: "invoices" | "customers"
//   ) => {
//     e.preventDefault();
//     setDragOver(type);
//   };

//   const handleDragLeave = (e: React.DragEvent) => {
//     e.preventDefault();
//     setDragOver(null);
//   };

//   const handleDrop = (e: React.DragEvent, type: "invoices" | "customers") => {
//     e.preventDefault();
//     setDragOver(null);
//     const files = e.dataTransfer.files;
//     if (files.length > 0) {
//       onFileUpload?.(files, type);
//     }
//   };

//   const handleFileSelect = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     type: "invoices" | "customers"
//   ) => {
//     const files = e.target.files;
//     if (files && files.length > 0) {
//       onFileUpload?.(files, type);
//     }
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return "0 Bytes";
//     const k = 1024;
//     const sizes = ["Bytes", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   };

 
//   const customerFiles = uploadedFiles.filter((f) => f.type === "customers");

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
//       {/* Background decoration */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
//       </div>

//       <div className="max-w-4xl mx-auto relative">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-8">
//           <Button
//             onClick={onBack}
//             variant="outline"
//             size="sm"
//             className="bg-white/80 backdrop-blur-sm border border-white/30 hover:bg-white/90"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back
//           </Button>

//           <div className="flex items-center gap-3">
//             <MyAIInvoicesLogo height={40} />
//             <div>
//               <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//                 Upload Your Documents
//               </h1>
//               <p className="text-gray-600">
//                 Upload your invoice history and customer data to get started
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="grid gap-6 mb-8">
         
         

//           {/* Customer Upload */}
//           <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl relative overflow-hidden">
//             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 pointer-events-none" />

//             <CardHeader className="relative">
//               <CardTitle className="flex items-center gap-3">
//                 <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
//                   <Users className="w-6 h-6 text-white" />
//                 </div>
//                 Customer Data
//               </CardTitle>
//               <p className="text-gray-600">
//                 Upload your customer information (CSV format)
//               </p>
//             </CardHeader>

//             <CardContent className="relative space-y-4">
//               <div
//                 className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
//                   dragOver === "customers"
//                     ? "border-purple-500 bg-purple-50/80"
//                     : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/40"
//                 }`}
//                 onDragOver={(e) => handleDragOver(e, "customers")}
//                 onDragLeave={handleDragLeave}
//                 onDrop={(e) => handleDrop(e, "customers")}
//               >
//                 <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-600 mb-2">
//                   Drag and drop your CSV files here
//                 </p>
//                 <p className="text-sm text-gray-500 mb-4">or</p>
//                 <Button
//                   variant="outline"
//                   className="bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80"
//                   disabled={isUploading}
//                 >
//                   <label
//                     htmlFor="customer-upload"
//                     className="cursor-pointer flex items-center gap-2"
//                   >
//                     <Users className="w-4 h-4" />
//                     Choose Files
//                   </label>
//                 </Button>
//                 <input
//                   id="customer-upload"
//                   type="file"
//                   multiple
//                   accept=".csv"
//                   className="hidden"
//                   onChange={(e) => handleFileSelect(e, "customers")}
//                 />
//               </div>

//               {/* Customer Files List */}
//               {customerFiles.length > 0 && (
//                 <div className="space-y-2">
//                   <h4 className="font-medium text-gray-700">
//                     Uploaded Customer Files:
//                   </h4>
//                   {customerFiles.map((file) => (
//                     <div
//                       key={file.id}
//                       className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/30"
//                     >
//                       <div className="flex items-center gap-3 flex-1">
//                         <Users className="w-5 h-5 text-purple-500" />
//                         <div className="flex-1">
//                           <p className="text-sm truncate">{file.name}</p>
//                           <p className="text-xs text-gray-500">
//                             {formatFileSize(file.size)}
//                           </p>
//                           {file.status === "uploading" && (
//                             <Progress value={file.progress} className="mt-1" />
//                           )}
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         {file.status === "success" && (
//                           <CheckCircle className="w-5 h-5 text-green-500" />
//                         )}
//                         {file.status === "error" && (
//                           <AlertCircle className="w-5 h-5 text-red-500" />
//                         )}
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => onFileRemove?.(file.id)}
//                           className="text-gray-500 hover:text-red-500"
//                         >
//                           <X className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="w-full bg-purple-50/80 border-purple-200 text-purple-700 hover:bg-purple-100/80"
//               >
//                 <Download className="w-4 h-4 mr-2" />
//                 Download Sample CSV Template
//               </Button>
//             </CardContent>
//           </Card>
//         </div>

//         {/* File Requirements */}
//         <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg mb-8">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <AlertCircle className="w-5 h-5 text-blue-500" />
//               File Requirements
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid md:grid-cols-2 gap-6">
//               <div>
//                 <h4 className="font-medium text-gray-800 mb-2">
//                   Invoice Files Should Include:
//                 </h4>
//                 <ul className="text-sm text-gray-600 space-y-1">
//                   <li>• Invoice Number</li>
//                   <li>• Customer Name/ID</li>
//                   <li>• Amount</li>
//                   <li>• Date</li>
//                   <li>• Status (Paid/Unpaid)</li>
//                 </ul>
//               </div>
//               <div>
//                 <h4 className="font-medium text-gray-800 mb-2">
//                   Customer Files Should Include:
//                 </h4>
//                 <ul className="text-sm text-gray-600 space-y-1">
//                   <li>• Customer Name</li>
//                   <li>• Email Address</li>
//                   <li>• Phone Number</li>
//                   <li>• Company (optional)</li>
//                   <li>• Address (optional)</li>
//                 </ul>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Upload Errors */}
//         {uploadedFiles.some((f) => f.status === "error") && (
//           <Alert className="border-red-200 bg-red-50 mb-8">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription className="text-red-700">
//               Some files failed to upload. Please check the file format and try
//               again.
//             </AlertDescription>
//           </Alert>
//         )}

//         {/* Actions */}
//         <div className="flex justify-between gap-3">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={onSkip}
//             className="bg-white/70"
//             disabled={isUploading}
//           >
//             Skip for now
//           </Button>
//           <Button
//             onClick={onContinue}
//             className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl transform hover:scale-[1.02] transition-all duration-200 px-8"
//             disabled={
//               isUploading ||
//               uploadedFiles.length === 0 ||
//               uploadedFiles.some((f) => f.status === "uploading")
//             }
//           >
//             {isUploading ? "Processing..." : "Continue to Dashboard"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// import React, { useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { DocumentUploadPage } from "../components/design/DocumentUploadPage";
// import { supabase } from "../utils/supabase/client";

// type UploadKind = "customers";

// interface UploadFile {
//   id: string;
//   name: string;
//   size: number;
//   type: UploadKind;
//   status: "uploading" | "success" | "error";
//   progress: number;
//   error?: string;
// }

// function CustomerUploadPage() {
//   const navigate = useNavigate();
//   const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [accessToken, setAccessToken] = useState<string>("");

//   useEffect(() => {
//     (async () => {
//       const { data } = await supabase.auth.getSession();
//       if (data.session?.access_token) {
//         setAccessToken(data.session.access_token);
//       }
//     })();
//   }, []);

//   const updateFile = (id: string, patch: Partial<UploadFile>) => {
//     setUploadedFiles((prev) =>
//       prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
//     );
//   };

//   const handleFileUpload = useCallback(
//     async (files: FileList, type: UploadKind) => {
//       if (!files || files.length === 0) return;

//       setIsUploading(true);

//       for (const file of Array.from(files)) {
//         const id = `${type}-${Date.now()}-${Math.random()
//           .toString(36)
//           .slice(2)}`;
//         setUploadedFiles((prev) => [
//           ...prev,
//           {
//             id,
//             name: file.name,
//             size: file.size,
//             type,
//             status: "uploading",
//             progress: 10,
//           },
//         ]);

//         try {
//           const form = new FormData();
//           form.append("file", file);
//           form.append("type", type);

//           const resp = await fetch(
//             `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-csv`,
//             {
//               method: "POST",
//               headers: { Authorization: `Bearer ${accessToken}` },
//               body: form,
//             }
//           );

//           if (!resp.ok) {
//             const err = await resp.text();
//             updateFile(id, { status: "error", progress: 100, error: err });
//           } else {
//             updateFile(id, { status: "success", progress: 100 });
//           }
//         } catch (e: any) {
//           updateFile(id, {
//             status: "error",
//             progress: 100,
//             error: e?.message || "Upload failed",
//           });
//         }
//       }

//       setIsUploading(false);
//     },
//     [accessToken]
//   );

//   const handleFileRemove = (fileId: string) =>
//     setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));

//   const handleBack = () => navigate("/onboarding/upload"); // go back to invoice upload
//   const handleContinue = () => navigate("/dashboard"); // after uploading customers go to dashboard
//   const handleSkip = () => navigate("/dashboard"); // user chooses to skip customers

//   // optional: when all customer files succeed automatically go to dashboard
//   useEffect(() => {
//     if (
//       !isUploading &&
//       uploadedFiles.length > 0 &&
//       uploadedFiles.every((f) => f.status === "success")
//     ) {
//       const t = setTimeout(() => navigate("/dashboard"), 600);
//       return () => clearTimeout(t);
//     }
//   }, [isUploading, uploadedFiles, navigate]);

//   return (
//     <DocumentUploadPage
//       onFileUpload={handleFileUpload}
//       onFileRemove={handleFileRemove}
//       onBack={handleBack}
//       onContinue={handleContinue}
//       onSkip={handleSkip}
//       uploadedFiles={uploadedFiles}
//       isUploading={isUploading}
//     />
//   );
// }

// // IMPORTANT: default export so App.tsx import works
// export default CustomerUploadPage;




// import React, { useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { DocumentUploadPage } from "../components/design/DocumentUploadPage";
// import { supabase } from "../utils/supabase/client";

// type UploadKind = "customers";

// interface UploadFile {
//   id: string;
//   name: string;
//   size: number;
//   type: UploadKind;
//   status: "uploading" | "success" | "error";
//   progress: number;
//   error?: string;
// }

// function CustomerUploadPage() {
//   const navigate = useNavigate();
//   const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [accessToken, setAccessToken] = useState<string>("");

//   useEffect(() => {
//     (async () => {
//       const { data } = await supabase.auth.getSession();
//       if (data.session?.access_token) {
//         setAccessToken(data.session.access_token);
//       }
//     })();
//   }, []);

//   const updateFile = (id: string, patch: Partial<UploadFile>) => {
//     setUploadedFiles((prev) =>
//       prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
//     );
//   };

//   const handleFileUpload = useCallback(
//     async (files: FileList, type: UploadKind) => {
//       if (!files || files.length === 0) return;

//       setIsUploading(true);

//       for (const file of Array.from(files)) {
//         const id = `${type}-${Date.now()}-${Math.random()
//           .toString(36)
//           .slice(2)}`;

//         setUploadedFiles((prev) => [
//           ...prev,
//           {
//             id,
//             name: file.name,
//             size: file.size,
//             type,
//             status: "uploading",
//             progress: 10,
//           },
//         ]);

//         try {
//           const form = new FormData();
//           form.append("file", file);
//           form.append("type", type);

//           const resp = await fetch(
//             `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-csv`,
//             {
//               method: "POST",
//               headers: { Authorization: `Bearer ${accessToken}` },
//               body: form,
//             }
//           );

//           if (!resp.ok) {
//             const err = await resp.text();
//             updateFile(id, { status: "error", progress: 100, error: err });
//           } else {
//             updateFile(id, { status: "success", progress: 100 });
//           }
//         } catch (e: any) {
//           updateFile(id, {
//             status: "error",
//             progress: 100,
//             error: e?.message || "Upload failed",
//           });
//         }
//       }

//       setIsUploading(false);
//     },
//     [accessToken]
//   );

//   const handleFileRemove = (fileId: string) =>
//     setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));

//   const handleBack = () => navigate("/onboarding/upload");
//   const handleContinue = () => navigate("/dashboard");
//   const handleSkip = () => navigate("/dashboard");

//   return (
//     <DocumentUploadPage
//       onFileUpload={handleFileUpload}
//       onFileRemove={handleFileRemove}
//       onBack={handleBack}
//       onContinue={handleContinue}
//       onSkip={handleSkip}
//       uploadedFiles={uploadedFiles}
//       isUploading={isUploading}
//       mode="customers"
//     />
//   );
// }

// export default CustomerUploadPage;



import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentUploadPage } from "../components/design/DocumentUploadPage";
import { supabase } from "../utils/supabase/client";

type UploadKind = "customers";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: UploadKind;
  status: "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

function CustomerUploadPage() {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [accessToken, setAccessToken] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        setAccessToken(data.session.access_token);
      }
    })();
  }, []);

  const updateFile = (id: string, patch: Partial<UploadFile>) =>
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );

  const handleFileUpload = useCallback(
    async (files: FileList, type: UploadKind) => {
      if (!files || files.length === 0) return;

      setIsUploading(true);

      for (const file of Array.from(files)) {
        const id = `${type}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;
        setUploadedFiles((prev) => [
          ...prev,
          {
            id,
            name: file.name,
            size: file.size,
            type,
            status: "uploading",
            progress: 10,
          },
        ]);

        try {
          const form = new FormData();
          form.append("file", file);
          form.append("type", type);

          const resp = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-csv`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${accessToken}` },
              body: form,
            }
          );

          if (!resp.ok) {
            const err = await resp.text();
            updateFile(id, { status: "error", progress: 100, error: err });
          } else {
            updateFile(id, { status: "success", progress: 100 });
          }
        } catch (e: any) {
          updateFile(id, {
            status: "error",
            progress: 100,
            error: e?.message || "Upload failed",
          });
        }
      }

      setIsUploading(false);
    },
    [accessToken]
  );

  return (
    <DocumentUploadPage
      mode="customers"
      onFileUpload={handleFileUpload}
      onFileRemove={(fileId) =>
        setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
      }
      onBack={() => navigate("/onboarding/upload")}
      onContinue={() => navigate("/dashboard")} 
      onSkip={() => navigate("/dashboard")} 
      uploadedFiles={uploadedFiles}
      isUploading={isUploading}
      showSkip={true} 
    />
  );
}

export default CustomerUploadPage;
