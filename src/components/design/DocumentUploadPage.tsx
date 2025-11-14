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

//   const invoiceFiles = uploadedFiles.filter((f) => f.type === "invoices");
 

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
//           {/* Invoice Upload */}
//           <Card className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl relative overflow-hidden">
//             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />

//             <CardHeader className="relative">
//               <CardTitle className="flex items-center gap-3">
//                 <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
//                   <FileText className="w-6 h-6 text-white" />
//                 </div>
//                 Invoice History
//               </CardTitle>
//               <p className="text-gray-600">
//                 Upload your previous invoices (CSV format)
//               </p>
//             </CardHeader>

//             <CardContent className="relative space-y-4">
//               <div
//                 className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
//                   dragOver === "invoices"
//                     ? "border-blue-500 bg-blue-50/80"
//                     : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/40"
//                 }`}
//                 onDragOver={(e) => handleDragOver(e, "invoices")}
//                 onDragLeave={handleDragLeave}
//                 onDrop={(e) => handleDrop(e, "invoices")}
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
//                     htmlFor="invoice-upload"
//                     className="cursor-pointer flex items-center gap-2"
//                   >
//                     <FileText className="w-4 h-4" />
//                     Choose Files
//                   </label>
//                 </Button>
//                 <input
//                   id="invoice-upload"
//                   type="file"
//                   multiple
//                   accept=".csv"
//                   className="hidden"
//                   onChange={(e) => handleFileSelect(e, "invoices")}
//                 />
//               </div>

//               {/* Invoice Files List */}
//               {invoiceFiles.length > 0 && (
//                 <div className="space-y-2">
//                   <h4 className="font-medium text-gray-700">
//                     Uploaded Invoice Files:
//                   </h4>
//                   {invoiceFiles.map((file) => (
//                     <div
//                       key={file.id}
//                       className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/30"
//                     >
//                       <div className="flex items-center gap-3 flex-1">
//                         <FileText className="w-5 h-5 text-blue-500" />
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

//               {/* <Button
//                 variant="outline"
//                 size="sm"
//                 className="w-full bg-blue-50/80 border-blue-200 text-blue-700 hover:bg-blue-100/80"
//               >
//                 <Download className="w-4 h-4 mr-2" />
//                 Download Sample CSV Template
//               </Button> */}
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
//         <div className="flex justify-end gap-3">
//           {/* <Button
//             type="button"
//             variant="outline"
//             onClick={onSkip}
//             className="bg-white/70"
//             disabled={isUploading}
//           >
//             Skip for now
//           </Button> */}
//           <Button
//             onClick={onContinue}
//             className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl transform hover:scale-[1.02] transition-all duration-200 px-8"
//             disabled={
//               isUploading ||
//               uploadedFiles.length === 0 ||
//               uploadedFiles.some((f) => f.status === "uploading")
//             }
//           >
//             {isUploading ? "Processing..." : "Next"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }



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
//   mode?: "invoices" | "customers";
//   showSkip?: boolean;
// }

// export function DocumentUploadPage({
//   onFileUpload,
//   onFileRemove,
//   onBack,
//   onContinue,
//   onSkip,
//   uploadedFiles = [],
//   isUploading = false,
//   mode = "invoices",
//   showSkip = false,
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

//   const handleDragLeave = () => setDragOver(null);

//   const handleDrop = (e: React.DragEvent, type: "invoices" | "customers") => {
//     e.preventDefault();
//     setDragOver(null);
//     if (e.dataTransfer.files.length > 0) {
//       onFileUpload?.(e.dataTransfer.files, type);
//     }
//   };

//   const handleFileSelect = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     type: "invoices" | "customers"
//   ) => {
//     if (!e.target.files?.length) return;
//     onFileUpload?.(e.target.files, type);
//   };

//   // Filter invoice files or customer files based on current mode
//   const filteredFiles = uploadedFiles.filter((f) => f.type === mode);

//   const nextDisabled =
//     isUploading ||
//     filteredFiles.length === 0 ||
//     filteredFiles.some((f) => f.status === "uploading");

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-8">
//           <Button onClick={onBack} variant="outline" size="sm">
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back
//           </Button>

//           <div className="flex items-center gap-3">
//             <MyAIInvoicesLogo height={40} />
//             <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-lg font-semibold">
//               {mode === "customers"
//                 ? "Upload Customer CSV"
//                 : "Upload Invoice CSV"}
//             </h1>
//           </div>
//         </div>

//         {/* Upload Area */}
//         <Card className="bg-white/80 backdrop-blur-xl shadow-lg mb-8">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               {mode === "customers" ? (
//                 <Users className="w-6 h-6 text-purple-500" />
//               ) : (
//                 <FileText className="w-6 h-6 text-blue-500" />
//               )}
//               {mode === "customers" ? "Customer Data" : "Invoice History"}
//             </CardTitle>
//           </CardHeader>

//           <CardContent className="space-y-4">
//             {/* Drag & Drop Box */}
//             <div
//               className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
//                 dragOver === mode
//                   ? "border-purple-500 bg-purple-50"
//                   : "border-gray-300 hover:border-purple-400"
//               }`}
//               onDragOver={(e) => handleDragOver(e, mode)}
//               onDragLeave={handleDragLeave}
//               onDrop={(e) => handleDrop(e, mode)}
//             >
//               <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-700 mb-2">Drag & Drop CSV file here</p>

//               <Button variant="outline" disabled={isUploading}>
//                 <label
//                   htmlFor={`${mode}-upload`}
//                   className="cursor-pointer flex items-center gap-2"
//                 >
//                   Choose File
//                 </label>
//               </Button>

//               <input
//                 id={`${mode}-upload`}
//                 type="file"
//                 accept=".csv"
//                 className="hidden"
//                 onChange={(e) => handleFileSelect(e, mode)}
//               />
//             </div>

//             {/* Uploaded Files */}
//             {filteredFiles.length > 0 && (
//               <div className="space-y-2">
//                 {filteredFiles.map((file) => (
//                   <div
//                     key={file.id}
//                     className="flex items-center justify-between bg-white p-3 rounded-lg border"
//                   >
//                     <div className="flex items-center gap-3">
//                       {mode === "customers" ? (
//                         <Users className="w-5 h-5 text-purple-500" />
//                       ) : (
//                         <FileText className="w-5 h-5 text-blue-500" />
//                       )}

//                       <div>
//                         <p className="text-sm">{file.name}</p>
//                         <p className="text-xs text-gray-500">
//                           {(file.size / 1024).toFixed(2)} KB
//                         </p>
//                         {file.status === "uploading" && (
//                           <Progress value={file.progress} className="mt-1" />
//                         )}
//                       </div>
//                     </div>

//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => onFileRemove?.(file.id)}
//                     >
//                       <X className="w-4 h-4" />
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Buttons */}
//         <div className="flex justify-between">
//           {showSkip && (
//             <Button variant="outline" onClick={onSkip}>
//               Skip
//             </Button>
//           )}
//           <Button
//             onClick={onContinue}
//             disabled={nextDisabled}
//             className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
//           >
//             {mode === "invoices" ? "Next" : "Dashboard"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }









import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Upload, FileText, Users, X, ArrowLeft } from "lucide-react";
import { MyAIInvoicesLogo } from "../MyAIInvoicesLogo";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: "invoices" | "customers";
  status: "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

interface DocumentUploadPageProps {
  onFileUpload?: (files: FileList, type: "invoices" | "customers") => void;
  onFileRemove?: (fileId: string) => void;
  onBack?: () => void;
  onContinue?: () => void;
  onSkip?: () => void;
  uploadedFiles?: UploadFile[];
  isUploading?: boolean;
  mode?: "invoices" | "customers";
  showSkip?: boolean;
}

export function DocumentUploadPage({
  onFileUpload,
  onFileRemove,
  onBack,
  onContinue,
  onSkip,
  uploadedFiles = [],
  isUploading = false,
  mode = "invoices",
  showSkip = false,
}: DocumentUploadPageProps) {
  const [dragOver, setDragOver] = React.useState<
    "invoices" | "customers" | null
  >(null);

  const handleDragOver = (
    e: React.DragEvent,
    type: "invoices" | "customers"
  ) => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = () => setDragOver(null);

  const handleDrop = (e: React.DragEvent, type: "invoices" | "customers") => {
    e.preventDefault();
    setDragOver(null);
    if (e.dataTransfer.files.length > 0) {
      onFileUpload?.(e.dataTransfer.files, type);
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "invoices" | "customers"
  ) => {
    if (e.target.files?.length) {
      onFileUpload?.(e.target.files, type);
    }
  };

  const filtered = uploadedFiles.filter((f) => f.type === mode);

  const nextDisabled =
    isUploading ||
    filtered.length === 0 ||
    filtered.some((f) => f.status === "uploading");

  return (
    <div className="min-h-screen bg-[#f5f2ff] p-4 ">
      <div className="max-w-4xl mx-auto ">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs uppercase text-gray-500">Invoices</p>
              <h1 className="text-2xl font-bold text-purple-700">
                Complete Your Profile
              </h1>
              <p className="text-gray-500 text-sm">
                {mode === "customers"
                  ? "Import your existing customers (optional)"
                  : "Upload your invoice history"}
              </p>
            </div>
          </div>

          <MyAIInvoicesLogo height={40} />
        </div>

        {/* MAIN CARD */}
        <Card className="bg-white shadow-md rounded-2xl border border-gray-200">
          <CardHeader>
            <p className="text-gray-600 text-sm py-4">
              Upload a CSV file with your customer information. You can skip
              this step and add customers later.
            </p>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-center gap-2">
              {mode === "customers" ? (
                <Users className="w-6 h-6 text-purple-600" />
              ) : (
                <FileText className="w-6 h-6 text-blue-600" />
              )}
              {mode === "customers" ? "Customer List" : "Invoice History"}
            </CardTitle>

            <p className="text-gray-600 text-sm text-center">
              {mode === "customers"
                ? "Upload your customer database"
                : "Upload your invoice history"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Flexible Format Box */}
            <div className="p-4 border rounded-lg bg-white">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span>⭐</span> Flexible Format
              </h3>
              <p className="text-gray-600 mt-1">
                Upload your customer list in <strong>any CSV format</strong>!
                We’ll automatically detect and import your customer data
                regardless of column names or structure.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Common formats include: names, emails, phone numbers, addresses,
                company names, or any combination that works for you.
              </p>
            </div>

            {/* NO TEMPLATE BOX */}
            <div className="rounded-xl border border-gray-300 border-dashed p-6 text-center">
              <div className="text-3xl mb-2">📄</div>
              <p className="text-gray-600 text-sm">
                No template needed! Upload your file in any CSV format.
              </p>
            </div>

            {/* UPLOAD BOX */}
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragOver === mode
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-300 hover:border-purple-500"
              }`}
              onDragOver={(e) => handleDragOver(e, mode)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, mode)}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />

              <p className="text-gray-700 font-medium">
                Drop your CSV file here or click to browse
              </p>

              <input
                id={`${mode}-upload`}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFileSelect(e, mode)}
              />

              <Button
                variant="outline"
                className="mt-3"
                onClick={() =>
                  document.getElementById(`${mode}-upload`)?.click()
                }
              >
                Choose File
              </Button>
            </div>

            {/* Uploaded Files */}
            {filtered.length > 0 && (
              <div className="space-y-3">
                {filtered.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between bg-gray-100 rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {mode === "customers" ? (
                        <Users className="w-5 h-5 text-purple-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-600" />
                      )}

                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>

                        {file.status === "uploading" && (
                          <Progress value={file.progress} className="mt-1" />
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onFileRemove?.(file.id)}
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-gray-700 font-medium text-center">
              Skip for now (you can upload later)
            </p>
          </CardContent>
        </Card>

        {/* FOOTER BUTTONS */}
        {/* FOOTER BUTTONS */}
        {mode === "invoices" ? (
          // 👉 Invoice Page Footer
          <div className="flex justify-end items-center mt-6">
            <div className="flex gap-4">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="bg-white shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={onContinue}
                disabled={nextDisabled}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8"
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          // 👉 Customer Page Footer
          <div className="flex justify-between items-center mt-6">
            <Button
              onClick={onSkip}
              variant="outline"
              size="sm"
              className="bg-white shadow-sm cursor-pointer"
            >
              Skip
            </Button>

            <div className="flex gap-4">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="bg-white shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={onContinue}
                disabled={nextDisabled}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8"
              >
                Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
