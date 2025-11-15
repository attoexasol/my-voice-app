// import React, { useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { DocumentUploadPage } from "../components/design/DocumentUploadPage";
// import { supabase } from "../utils/supabase/client";

// type UploadKind = "invoices" | "customers";

// interface UploadFile {
//   id: string;
//   name: string;
//   size: number;
//   type: UploadKind;
//   status: "uploading" | "success" | "error";
//   progress: number;
//   error?: string;
// }

// export default function OnboardingUpload() {
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

//       const list = Array.from(files);
//       for (const file of list) {
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
//               headers: {
//                 Authorization: `Bearer ${accessToken}`,
//               },
//               body: form,
//             }
//           );

//           if (!resp.ok) {
//             const errText = await resp.text();
//             updateFile(id, { status: "error", progress: 100, error: errText });
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

//   const handleFileRemove = (fileId: string) => {
//     setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
//   };

//   const handleContinue = () => {
//     navigate("/dashboard");
//   };

//   const handleBack = () => {
//     navigate("/dashboard");
//   };

//   const handleSkip = () => {
//     navigate("/dashboard");
//   };

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









// import React, { useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { DocumentUploadPage } from "../components/design/DocumentUploadPage";
// import { supabase } from "../utils/supabase/client";

// export interface OnboardingUploadProps {
//   onComplete?: () => void | Promise<void>;
// }

// type UploadKind = "invoices" | "customers";

// interface UploadFile {
//   id: string;
//   name: string;
//   size: number;
//   type: UploadKind;
//   status: "uploading" | "success" | "error";
//   progress: number;
//   error?: string;
// }

// export default function OnboardingUpload({ onComplete }: OnboardingUploadProps) {
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
//     setUploadedFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
//   };

//   const handleFileUpload = useCallback(
//     async (files: FileList, type: UploadKind) => {
//       if (!files || files.length === 0) return;
//       setIsUploading(true);
//       for (const file of Array.from(files)) {
//         const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
//         setUploadedFiles((p) => [...p, { id, name: file.name, size: file.size, type, status: "uploading", progress: 10 }]);
//         try {
//           const form = new FormData();
//           form.append("file", file);
//           form.append("type", type);
//           const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-csv`, {
//             method: "POST",
//             headers: { Authorization: `Bearer ${accessToken}` },
//             body: form,
//           });
//           if (!resp.ok) {
//             const err = await resp.text();
//             updateFile(id, { status: "error", progress: 100, error: err });
//           } else {
//             updateFile(id, { status: "success", progress: 100 });
//           }
//         } catch (e: any) {
//           updateFile(id, { status: "error", progress: 100, error: e?.message || "Upload failed" });
//         }
//       }
//       setIsUploading(false);
//     },
//     [accessToken]
//   );

//   const handleFileRemove = (fileId: string) => setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));

//   const handleContinue = () => {
//     if (onComplete) onComplete();
//     else navigate("/dashboard");
//   };

//   const handleSkip = () => handleContinue();
//   const handleBack = () => navigate("/profile-steps");

//   // Auto-finish: when all uploaded files are "success" (optional)
//   useEffect(() => {
//     if (!isUploading && uploadedFiles.length > 0 && uploadedFiles.every((f) => f.status === "success")) {
//       const t = setTimeout(() => handleContinue(), 600);
//       return () => clearTimeout(t);
//     }
//   }, [isUploading, uploadedFiles]);

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









// import React, { useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { DocumentUploadPage } from "../components/design/DocumentUploadPage";
// import { supabase } from "../utils/supabase/client";

// export interface OnboardingUploadProps {
//   onComplete?: () => void | Promise<void>;
// }

// type UploadKind = "invoices" | "customers";

// interface UploadFile {
//   id: string;
//   name: string;
//   size: number;
//   type: UploadKind;
//   status: "uploading" | "success" | "error";
//   progress: number;
//   error?: string;
// }

// export default function OnboardingUpload({
//   onComplete,
// }: OnboardingUploadProps) {
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

//         setUploadedFiles((p) => [
//           ...p,
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

//   /** ⭐ Redirect to customer-upload page */
//   const handleContinue = () => {
//     navigate("/customer-upload");
//   };

//   const handleBack = () => navigate("/profile-steps");

//   const handleSkip = () => navigate("/customer-upload");

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





// import React, { useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { DocumentUploadPage } from "../components/design/DocumentUploadPage";
// import { supabase } from "../utils/supabase/client";

// type UploadKind = "invoices" | "customers";

// interface UploadFile {
//   id: string;
//   name: string;
//   size: number;
//   type: UploadKind;
//   status: "uploading" | "success" | "error";
//   progress: number;
//   error?: string;
// }

// export default function OnboardingUpload() {
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
//       prev.map((file) => (file.id === id ? { ...file, ...patch } : file))
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

//   const handleFileRemove = (fileId: string) => {
//     setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
//   };

//   // ⭐ FIXED LOGIC ⭐
//   const handleContinue = () => {
//     // NEXT → Customer Upload Page
//     navigate("/customer-upload");
//   };

//   const handleSkip = () => {
//     // SKIP → Dashboard
//     navigate("/dashboard");
//   };

//   const handleBack = () => navigate("/profile-steps");

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


import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentUploadPage } from "../components/design/DocumentUploadPage";
import { supabase } from "../utils/supabase/client";

type UploadKind = "invoices";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: UploadKind;
  status: "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

export default function OnboardingUpload() {
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
            error: e?.message ?? "Upload failed",
          });
        }
      }

      setIsUploading(false);
    },
    [accessToken]
  );

  return (
    // <DocumentUploadPage
    //   mode="invoices"
    //   onFileUpload={handleFileUpload}
    //   onFileRemove={(fileId) =>
    //     setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
    //   }
    //   onBack={() => navigate("/profile-steps")}
    //   onContinue={() => navigate("/customer-upload")}
    //   uploadedFiles={uploadedFiles}
    //   isUploading={isUploading}
    //   showSkip={false}
    // />

    <DocumentUploadPage
      mode="invoices"
      onFileUpload={handleFileUpload}
      onFileRemove={(fileId) =>
        setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
      }
      // onBack={() => navigate(-1)} 
      onContinue={() => navigate("/customer-upload")}
      uploadedFiles={uploadedFiles}
      isUploading={isUploading}
      showSkip={false}
    />
  );
}
