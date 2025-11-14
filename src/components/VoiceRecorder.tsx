// import React, { useState, useRef, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Mic,
//   Square,
//   Play,
//   Pause,
//   Loader2,
//   CheckCircle2,
//   FileText,
//   Brain,
//   Sparkles,
// } from "lucide-react";
// import { Button } from "./ui/button";

// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import { Alert, AlertDescription } from "./ui/alert";
// import { Progress } from "./ui/progress";
// import { toast } from "sonner";

// // Get the Supabase URL from environment variables
// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// import { MyAIInvoicesLogo } from "./MyAIInvoicesLogo";
// import { SidebarNavigation } from "./SidebarNavigation";
// import { QuoteReviewEditor } from "./QuoteReviewEditor";

// interface VoiceRecorderProps {
//   accessToken: string;
//   onSignOut: () => void;
//   onRecordingSaved?: () => void;
// }

// export function VoiceRecorder({
//   accessToken,
//   onSignOut,
//   onRecordingSaved,
// }: VoiceRecorderProps) {
//   const navigate = useNavigate();
//   const [isRecording, setIsRecording] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
//   const [audioUrl, setAudioUrl] = useState<string>("");
//   // const [isPlaying, setIsPlaying] = useState(false);
//   const [duration, setDuration] = useState(0);
//   const [recordingTitle, setRecordingTitle] = useState("");
//   const [isSaving, setIsSaving] = useState(false);
//   const [error, setError] = useState<string>("");
//   const [permissionState, setPermissionState] = useState<
//     "unknown" | "granted" | "denied" | "prompt"
//   >("unknown");
//   const [isCheckingPermission, setIsCheckingPermission] = useState(false);

//   // Progress tracking for AI processing
//   const [processingStage, setProcessingStage] = useState<
//     | "idle"
//     | "uploading"
//     | "transcribing"
//     | "categorising"
//     | "reviewing"
//     | "generating"
//     | "complete"
//   >("idle");

//   // Quote data for review
//   const [quoteData, setQuoteData] = useState<{
//     id_output: string;
//     client_name: string;
//     client_email?: string;
//     items: any[];
//     tax_rate?: number;
//     discount_rate?: number;
//   } | null>(null);

//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const chunksRef = useRef<Blob[]>([]);
//   const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   // Check microphone permission on component mount
//   React.useEffect(() => {
//     checkMicrophonePermission();
//   }, []);

//   // Cleanup blob URL on component unmount or when audioUrl changes
//   React.useEffect(() => {
//     return () => {
//       if (audioUrl) {
//         URL.revokeObjectURL(audioUrl);
//       }
//     };
//   }, [audioUrl]);

//   // Note: Auto-start functionality removed - recording now only starts when user clicks the microphone button

//   const checkMicrophonePermission = async () => {
//     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//       setError(
//         "Your browser does not support microphone access. Please use a modern browser like Chrome, Firefox, or Safari."
//       );
//       setPermissionState("denied");
//       return;
//     }

//     try {
//       // Check if we're on HTTPS or localhost
//       if (
//         location.protocol !== "https:" &&
//         !location.hostname.includes("localhost")
//       ) {
//         setError(
//           "Microphone access requires a secure connection (HTTPS). Please ensure you're using a secure connection."
//         );
//         setPermissionState("denied");
//         return;
//       }

//       // Check permission status if available
//       if (navigator.permissions) {
//         try {
//           const result = await navigator.permissions.query({
//             name: "microphone" as PermissionName,
//           });
//           setPermissionState(result.state);

//           result.addEventListener("change", () => {
//             setPermissionState(result.state);
//           });
//         } catch (err) {
//           // Permission API not supported, we'll check on first use
//           setPermissionState("unknown");
//         }
//       } else {
//         setPermissionState("unknown");
//       }
//     } catch (err) {
//       console.error("Error checking microphone permission:", err);
//       setPermissionState("unknown");
//     }
//   };

//   const requestMicrophonePermission = async () => {
//     setIsCheckingPermission(true);
//     setError("");

//     try {
//       // Clear any cached permission state first
//       setPermissionState("unknown");

//       // Add a small delay to ensure UI updates
//       await new Promise((resolve) => setTimeout(resolve, 100));

//       // Check if we're in a secure context first
//       if (
//         !window.isSecureContext &&
//         location.protocol !== "http:" &&
//         location.hostname !== "localhost"
//       ) {
//         throw new Error("Microphone access requires a secure context (HTTPS)");
//       }

//       // Try with minimal constraints first to increase success chance
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//       });

//       // Permission granted, stop the stream immediately
//       stream.getTracks().forEach((track) => track.stop());
//       setPermissionState("granted");
//       toast.success("Microphone access granted! You can now start recording.");
//     } catch (err: any) {
//       console.error("Error requesting microphone permission:", err);

//       if (err.name === "NotAllowedError") {
//         // Check if this is a permanent denial or temporary
//         try {
//           const permissionStatus = await navigator.permissions.query({
//             name: "microphone" as PermissionName,
//           });
//           if (permissionStatus.state === "denied") {
//             setError(
//               "Microphone access was permanently denied. Please reset permissions in your browser settings and refresh this page."
//             );
//           } else {
//             setError(
//               'Microphone access was denied. Please click "Allow" when prompted by your browser.'
//             );
//           }
//         } catch {
//           setError(
//             "Microphone access was denied. Please enable microphone permissions in your browser settings."
//           );
//         }
//         setPermissionState("denied");
//       } else if (err.name === "NotFoundError") {
//         setError(
//           "No microphone detected. Please connect a microphone and try again."
//         );
//         setPermissionState("denied");
//       } else if (err.name === "NotSupportedError") {
//         setError(
//           "Your browser does not support microphone access. Please use Chrome, Firefox, Safari, or Edge."
//         );
//         setPermissionState("denied");
//       } else if (err.name === "AbortError") {
//         setError(
//           "Microphone request was cancelled. Please try again and allow access when prompted."
//         );
//         setPermissionState("prompt");
//       } else if (err.name === "NotReadableError") {
//         setError(
//           "Microphone is being used by another application. Please close other apps using the microphone and try again."
//         );
//         setPermissionState("denied");
//       } else if (err.name === "OverconstrainedError") {
//         setError(
//           "Your microphone does not meet the required specifications. Please try with a different microphone."
//         );
//         setPermissionState("denied");
//       } else if (err.message && err.message.includes("secure context")) {
//         setError(
//           "Microphone access requires HTTPS or localhost. Please use a secure connection."
//         );
//         setPermissionState("denied");
//       } else {
//         setError(
//           `Unable to access microphone: ${
//             err.message || "Unknown error"
//           }. Please check your browser and device settings.`
//         );
//         setPermissionState("denied");
//       }
//     } finally {
//       setIsCheckingPermission(false);
//     }
//   };

//   const startRecording = useCallback(async () => {
//     setError("");

//     // Check permission first
//     if (permissionState === "denied") {
//       setError(
//         "Microphone access denied. Please enable microphone permissions and try again."
//       );
//       return;
//     }

//     try {
//       // Try progressive fallback for audio constraints
//       let stream: MediaStream | null = null;
//       const constraintOptions = [
//         {
//           audio: {
//             echoCancellation: true,
//             noiseSuppression: true,
//             autoGainControl: true,
//             sampleRate: 44100,
//           },
//         },
//         {
//           audio: {
//             echoCancellation: true,
//             noiseSuppression: true,
//             autoGainControl: true,
//           },
//         },
//         { audio: true },
//       ];

//       for (const constraints of constraintOptions) {
//         try {
//           stream = await navigator.mediaDevices.getUserMedia(constraints);
//           break;
//         } catch (err: any) {
//           if (err.name === "NotAllowedError") {
//             throw err; // Re-throw permission errors immediately
//           }
//           // Continue with simpler constraints
//           continue;
//         }
//       }

//       if (!stream) {
//         throw new Error(
//           "Unable to access microphone with any audio constraints"
//         );
//       }

//       // Check if MediaRecorder is supported
//       if (!window.MediaRecorder) {
//         throw new Error("MediaRecorder is not supported in this browser");
//       }

//       const mediaRecorder = new MediaRecorder(stream);
//       mediaRecorderRef.current = mediaRecorder;
//       chunksRef.current = [];

//       mediaRecorder.ondataavailable = (event) => {
//         console.log("📼 Data available:", event.data.size, "bytes");
//         if (event.data.size > 0) {
//           chunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorder.onstop = () => {
//         console.log("⏹️ Recording stopped, chunks:", chunksRef.current.length);
//         const blob = new Blob(chunksRef.current, { type: "audio/webm" });
//         console.log("📦 Created blob:", blob.size, "bytes, type:", blob.type);
//         setAudioBlob(blob);
//         const url = URL.createObjectURL(blob);
//         setAudioUrl(url);

//         // Stop all tracks to release microphone
//         stream?.getTracks().forEach((track) => track.stop());

//         // Automatically begin processing to create invoice using the local blob
//         saveRecording(blob);
//       };

//       mediaRecorder.onerror = (event: any) => {
//         console.error("MediaRecorder error:", event.error);
//         setError("Recording error occurred. Please try again.");
//         setIsRecording(false);
//         stream?.getTracks().forEach((track) => track.stop());
//       };

//       // Start recording with timeslice to ensure data is captured in chunks
//       // This helps ensure we get data even for short recordings
//       mediaRecorder.start(1000); // Capture data every 1 second
//       console.log("🎙️ MediaRecorder started with state:", mediaRecorder.state);
//       setIsRecording(true);
//       setDuration(0);
//       setPermissionState("granted");

//       // Start timer
//       timerRef.current = setInterval(() => {
//         setDuration((prev) => prev + 1);
//       }, 1000);
//     } catch (err: any) {
//       console.error("Error accessing microphone:", err);

//       if (err.name === "NotAllowedError") {
//         setError(
//           "Microphone access was denied. Please enable microphone permissions in your browser settings."
//         );
//         setPermissionState("denied");
//       } else if (err.name === "NotFoundError") {
//         setError(
//           "No microphone detected. Please connect a microphone and refresh the page."
//         );
//         setPermissionState("denied");
//       } else if (err.name === "NotReadableError") {
//         setError(
//           "Microphone is being used by another application. Please close other apps and try again."
//         );
//         setPermissionState("denied");
//       } else if (err.name === "OverconstrainedError") {
//         setError(
//           "Your microphone does not meet the audio requirements. Please try with a different microphone."
//         );
//         setPermissionState("denied");
//       } else if (err.message && err.message.includes("MediaRecorder")) {
//         setError(
//           "Audio recording is not supported in this browser. Please use Chrome, Firefox, or Safari."
//         );
//         setPermissionState("denied");
//       } else {
//         setError(
//           `Unable to start recording: ${
//             err.message || "Unknown error"
//           }. Please check your device settings.`
//         );
//         setPermissionState("denied");
//       }
//     }
//   }, [permissionState]);

//   const stopRecording = useCallback(() => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//       setIsPaused(false);

//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//         timerRef.current = null;
//       }
//     }
//   }, [isRecording]);

//   const pauseRecording = useCallback(() => {
//     if (mediaRecorderRef.current && isRecording) {
//       if (isPaused) {
//         mediaRecorderRef.current.resume();
//         setIsPaused(false);
//         timerRef.current = setInterval(() => {
//           setDuration((prev) => prev + 1);
//         }, 1000);
//       } else {
//         mediaRecorderRef.current.pause();
//         setIsPaused(true);
//         if (timerRef.current) {
//           clearInterval(timerRef.current);
//         }
//       }
//     }
//   }, [isRecording, isPaused]);

//   const clearRecording = useCallback(() => {
//     // Clear audio element BEFORE revoking URL
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
//       audioRef.current.src = ""; // Clear src before revoking
//     }

//     if (audioUrl) {
//       URL.revokeObjectURL(audioUrl);
//     }

//     setAudioBlob(null);
//     setAudioUrl("");
//     setDuration(0);
//     setRecordingTitle("");
//     setError("");
//     setQuoteData(null);
//     setProcessingStage("idle");
//   }, [audioUrl]);

//   // Playback removed in auto-processing flow

//   const saveRecording = useCallback(
//     async (inputBlob?: Blob) => {
//       const blobToUse = inputBlob || audioBlob;
//       if (!blobToUse || isSaving) return;

//       // Validate audio blob before sending
//       console.log("🎵 AUDIO BLOB INFO:");
//       console.log("  - Size:", blobToUse.size, "bytes");
//       console.log("  - Type:", blobToUse.type);
//       console.log("  - Duration:", duration, "seconds");

//       if (blobToUse.size === 0) {
//         setError("Audio file is empty. Please try recording again.");
//         return;
//       }

//       if (blobToUse.size < 100) {
//         setError("Audio file is too small. Please record a longer message.");
//         return;
//       }

//       setIsSaving(true);
//       setError("");
//       setProcessingStage("uploading");

//       try {
//         const formData = new FormData();
//         formData.append("file", blobToUse, "recording.webm");
//         formData.append(
//           "title",
//           recordingTitle || `Recording ${new Date().toLocaleString()}`
//         );
//         formData.append("duration", duration.toString());

//         // Get user id from access token (JWT)
//         let currentUserId: string;
//         try {
//           // Decode JWT to get user_id (JWT format: header.payload.signature)
//           const payload = JSON.parse(atob(accessToken.split(".")[1]));
//           currentUserId = payload.sub;

//           if (!currentUserId) {
//             throw new Error("User ID not found in token");
//           }
//         } catch (tokenError) {
//           console.error("Token decode error:", tokenError);
//           throw new Error("Not authenticated - invalid token");
//         }

//         formData.append("user_id", currentUserId);

//         // Stage 1: Uploading & Transcribing
//         setProcessingStage("transcribing");
//         const response = await fetch(
//           `${SUPABASE_URL}/functions/v1/transcribe`,
//           {
//             method: "POST",
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//             },
//             body: formData,
//           }
//         );

//         console.log("📥 TRANSCRIBE RESPONSE:", {
//           status: response.status,
//           ok: response.ok,
//         });

//         const data = await response.json();
//         console.log("  - Response data:", data);

//         if (!response.ok) {
//           console.error("❌ TRANSCRIBE FAILED:", {
//             status: response.status,
//             error: data.error,
//             data: data,
//           });

//           const errorMessage = data.error || "Failed to save recording";
//           setError(errorMessage);
//           throw new Error(errorMessage);
//         }

//         console.log("  - Transcription:", data.text);
//         console.log("  - ID Trans:", data.id_trans);

//         // Stage 2: Categorising (AI extracts structured data with categories)
//         setProcessingStage("categorising");
//         console.log("🔄 Calling categorise function...");

//         let categoriseData: any = null;

//         const categoriseResponse = await fetch(
//           `${SUPABASE_URL}/functions/v1/categorise`,
//           {
//             method: "POST",
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               id_trans: data.id_trans,
//               text: data.text,
//             }),
//           }
//         );

//         console.log("📥 CATEGORISE RESPONSE:", {
//           status: categoriseResponse.status,
//           ok: categoriseResponse.ok,
//         });

//         categoriseData = await categoriseResponse.json();
//         console.log("  - Categorise data:", categoriseData);

//         if (!categoriseResponse.ok) {
//           console.warn("⚠️ CATEGORISE FAILED:", {
//             status: categoriseResponse.status,
//             error: categoriseData.error,
//           });
//           const errorMsg =
//             categoriseData.error || "Failed to categorize recording";
//           toast.error("AI Processing Failed", {
//             description: errorMsg,
//             duration: 6000,
//           });
//           setProcessingStage("idle");
//           setError(errorMsg);
//           return;
//         } else {
//           console.log("  - ID Output:", categoriseData.id_output);
//           console.log("  - Client Name:", categoriseData.client_name);
//           console.log(
//             "  - Client Email:",
//             categoriseData.client_email || "Not provided"
//           );
//           console.log(
//             "  - Items:",
//             categoriseData.items?.length || 0,
//             "items extracted"
//           );

//           // Validate extracted data
//           if (!categoriseData.items || categoriseData.items.length === 0) {
//             toast.error("No services were extracted from the recording", {
//               description:
//                 "Please try recording again with more details about the services",
//               duration: 6000,
//             });

//             setProcessingStage("idle");
//             setError("No services extracted");
//             return;
//           }
//         }

//         // Stage 3: Automatically create draft quote and navigate to invoice page
//         setProcessingStage("generating");

//         try {
//           // Create draft quote automatically
//           const quoteResponse = await fetch(`${SUPABASE_URL}/functions/v1/quote`, {
//             method: "POST",
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               id_output: categoriseData.id_output,
//               client_name: categoriseData.client_name || "Unknown Client",
//               client_email: categoriseData.client_email || "",
//               items: categoriseData.items || [],
//               tax_rate: categoriseData.tax_rate || 0.085,
//               discount_rate: categoriseData.discount_rate || 0.05,
//               status: "draft",
//               recording_title: recordingTitle || `Recording ${new Date().toLocaleString()}`,
//             }),
//           });

//           const quoteResult = await quoteResponse.json();

//           if (!quoteResponse.ok) {
//             throw new Error(quoteResult.error || "Failed to create quote");
//           }

//           console.log("✅ Quote created:", quoteResult.id_quote);

//           // Navigate to invoice page to view/edit the quote
//           if (quoteResult.id_quote || quoteResult.quote?.id_quote) {
//             const quoteId = quoteResult.id_quote || quoteResult.quote?.id_quote;
//             navigate(`/invoice/${quoteId}`);
//           } else {
//             throw new Error("Quote ID not found in response");
//           }
//         } catch (quoteErr) {
//           console.error("❌ ERROR CREATING QUOTE:", quoteErr);

//           const quoteErrorMessage =
//             quoteErr instanceof Error
//               ? quoteErr.message
//               : "Failed to create quote";

//           toast.error(quoteErrorMessage, {
//             duration: 5000,
//           });

//           setProcessingStage("idle");
//           setError(quoteErrorMessage);
//         }
//       } catch (err) {
//         console.error("❌ ERROR SAVING RECORDING:", err);

//         const errorMessage =
//           err instanceof Error ? err.message : "An unexpected error occurred";

//         // Show error in UI
//         setError(errorMessage);

//         // Show toast with detailed error
//         toast.error(errorMessage, {
//           duration: 5000,
//           description: "Check the console for more details",
//         });

//         setProcessingStage("idle");
//       } finally {
//         setIsSaving(false);
//       }
//     },
//     [
//       audioBlob,
//       recordingTitle,
//       duration,
//       isSaving,
//       onRecordingSaved,
//       accessToken,
//       clearRecording,
//       navigate,
//     ]
//   );

//   const handleGenerateInvoice = useCallback(async () => {
//     if (!quoteData) return;

//     setProcessingStage("generating");

//     try {
//       const generateInvoiceResponse = await fetch(
//         `${SUPABASE_URL}/functions/v1/generate_invoice`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             id_output: quoteData.id_output,
//           }),
//         }
//       );

//       console.log("📥 GENERATE_INVOICE RESPONSE:", {
//         status: generateInvoiceResponse.status,
//         ok: generateInvoiceResponse.ok,
//       });

//       const generateInvoiceData = await generateInvoiceResponse.json();
//       console.log("  - Generate Invoice data:", generateInvoiceData);

//       if (!generateInvoiceResponse.ok) {
//         throw new Error(
//           generateInvoiceData.error || "Failed to generate invoice"
//         );
//       }

//       console.log("  - ID Invoice:", generateInvoiceData.id_invoice);
//       console.log("  - File URL:", generateInvoiceData.file_url);
//       console.log("  - Invoice Number:", generateInvoiceData.invoice_number);

//       // Stage 4: Complete
//       setProcessingStage("complete");

//       toast.success("Invoice generated successfully!", {
//         description: `Invoice: ${generateInvoiceData.invoice_number}`,
//       });

//       // Reset after a short delay
//       setTimeout(() => {
//         setQuoteData(null);
//         setProcessingStage("idle");
//         clearRecording();
//         onRecordingSaved?.();
//       }, 2000);
//     } catch (err) {
//       console.error("❌ ERROR GENERATING INVOICE:", err);

//       const errorMessage =
//         err instanceof Error ? err.message : "Failed to generate invoice";

//       toast.error(errorMessage, {
//         duration: 5000,
//       });

//       setProcessingStage("reviewing");
//     }
//   }, [quoteData, accessToken, onRecordingSaved]);

//   const handleCancelQuoteReview = useCallback(() => {
//     setQuoteData(null);
//     setProcessingStage("idle");
//     clearRecording();
//   }, [clearRecording]);

//   const formatDuration = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   const getBrowserName = () => {
//     const userAgent = navigator.userAgent;
//     if (userAgent.includes("Chrome") && !userAgent.includes("Edg"))
//       return "Chrome";
//     if (userAgent.includes("Firefox")) return "Firefox";
//     if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
//       return "Safari";
//     if (userAgent.includes("Edg")) return "Edge";
//     return "Unknown";
//   };

//   const resetBrowserPermissions = () => {
//     const browser = getBrowserName();
//     let instructions = "";

//     switch (browser) {
//       case "Chrome":
//       case "Edge":
//         instructions = "chrome://settings/content/microphone";
//         break;
//       case "Firefox":
//         instructions = "about:preferences#privacy";
//         break;
//       case "Safari":
//         instructions = "Safari → Preferences → Websites → Microphone";
//         break;
//       default:
//         instructions = "Browser settings → Privacy → Microphone";
//     }

//     toast.info(`To reset permissions, go to: ${instructions}`);
//   };

//   const getProcessingStageInfo = () => {
//     switch (processingStage) {
//       case "uploading":
//         return { label: "Uploading audio...", progress: 25, icon: Loader2 };
//       case "transcribing":
//         return {
//           label: "Transcribing with AI...",
//           progress: 50,
//           icon: FileText,
//         };
//       case "categorising":
//         return {
//           label: "Extracting invoice data...",
//           progress: 75,
//           icon: Brain,
//         };
//       case "reviewing":
//         return {
//           label: "Ready for review",
//           progress: 80,
//           icon: FileText,
//         };
//       case "generating":
//         return { label: "Generating invoice...", progress: 90, icon: Sparkles };
//       case "complete":
//         return { label: "Complete!", progress: 100, icon: CheckCircle2 };
//       default:
//         return { label: "Ready", progress: 0, icon: FileText };
//     }
//   };

//   const forcePermissionDialog = async () => {
//     setIsCheckingPermission(true);
//     setError("");

//     try {
//       // Try to trigger permission dialog by requesting different constraints
//       const constraints = [
//         { audio: true },
//         { audio: { sampleRate: 44100 } },
//         { audio: { channelCount: 1 } },
//         { audio: { sampleSize: 16 } },
//       ];

//       for (const constraint of constraints) {
//         try {
//           const stream = await navigator.mediaDevices.getUserMedia(constraint);
//           stream.getTracks().forEach((track) => track.stop());
//           setPermissionState("granted");
//           toast.success("Microphone access granted!");
//           return;
//         } catch (err: any) {
//           if (err.name !== "NotAllowedError") {
//             continue;
//           }
//         }
//       }

//       // If all attempts failed
//       setError(
//         "Unable to access microphone. Please manually reset browser permissions."
//       );
//       setPermissionState("denied");
//     } catch (err) {
//       console.error("Force permission dialog error:", err);
//       setError(
//         "Unable to request microphone permission. Please check browser settings."
//       );
//       setPermissionState("denied");
//     } finally {
//       setIsCheckingPermission(false);
//     }
//   };

//   return (
//     <div className="min-h-screen">
//       <SidebarNavigation onSignOut={onSignOut} />

//       <div className="ml-20 p-4">
//         <div className="max-w-4xl mx-auto">
//           {/* Header */}
//           <div className="flex items-center gap-3 mb-8">
//             <MyAIInvoicesLogo height={40} />
//             <div>
//               <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
//                 Voice Recorder
//               </h1>
//               <p className="text-gray-600">Record and save your voice memos</p>
//             </div>
//           </div>

//           <div className="space-y-6">
//             {/* HTTPS Warning */}
//             {location.protocol !== "https:" &&
//               !location.hostname.includes("localhost") && (
//                 <Alert className="border-yellow-200 bg-yellow-50">
//                   <AlertDescription className="text-yellow-700">
//                     ⚠️ <strong>Security Warning:</strong> Microphone access
//                     requires a secure connection (HTTPS). Please ensure you're
//                     accessing this site over HTTPS for full functionality.
//                   </AlertDescription>
//                 </Alert>
//               )}

//             {/* Browser Compatibility Check */}
//             {(!navigator.mediaDevices ||
//               !navigator.mediaDevices.getUserMedia ||
//               !window.MediaRecorder) && (
//               <Alert className="border-red-200 bg-red-50">
//                 <AlertDescription className="text-red-700">
//                   ❌ <strong>Browser Not Supported:</strong> Your browser
//                   doesn't support audio recording. Please use Chrome 53+,
//                   Firefox 36+, Safari 11+, or Edge 79+ for full functionality.
//                 </AlertDescription>
//               </Alert>
//             )}

//             {error && (
//               <Alert className="border-red-200 bg-red-50">
//                 <AlertDescription className="text-red-700">
//                   {error}
//                 </AlertDescription>
//               </Alert>
//             )}

//             {/* AI Processing Progress */}
//             {processingStage !== "idle" && (
//               <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
//                 <CardContent className="pt-6">
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-3">
//                         {React.createElement(getProcessingStageInfo().icon, {
//                           className: `w-5 h-5 ${
//                             processingStage === "complete"
//                               ? "text-green-600"
//                               : "text-blue-600 animate-spin"
//                           }`,
//                         })}
//                         <span className="font-medium text-gray-800">
//                           {getProcessingStageInfo().label}
//                         </span>
//                       </div>
//                       <span className="text-sm text-gray-600">
//                         {getProcessingStageInfo().progress}%
//                       </span>
//                     </div>
//                     <Progress
//                       value={getProcessingStageInfo().progress}
//                       className="h-2"
//                     />
//                     <div className="flex items-center justify-between text-xs text-gray-500">
//                       <span>
//                         Audio → Transcription → AI Analysis → Quote Review →
//                         Invoice
//                       </span>
//                       {processingStage === "complete" && (
//                         <CheckCircle2 className="w-4 h-4 text-green-600" />
//                       )}
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Permission Status */}
//             {permissionState === "denied" && (
//               <Card className="border-red-200 bg-red-50">
//                 <CardHeader>
//                   <CardTitle className="text-red-800 flex items-center gap-2">
//                     🔒 Microphone Access Required
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <p className="text-red-700">
//                     Microphone access was blocked. Please follow these steps to
//                     enable it:
//                   </p>

//                   <div className="bg-white/80 rounded-lg p-4 space-y-3">
//                     <div className="space-y-2">
//                       <h4 className="font-medium text-gray-800">
//                         For Chrome/Edge:
//                       </h4>
//                       <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
//                         <li>Click the 🔒 or 🔊 icon in the address bar</li>
//                         <li>Set "Microphone" to "Allow"</li>
//                         <li>Refresh the page</li>
//                       </ol>
//                     </div>

//                     <div className="space-y-2">
//                       <h4 className="font-medium text-gray-800">
//                         For Firefox:
//                       </h4>
//                       <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
//                         <li>Click the 🔒 shield icon in the address bar</li>
//                         <li>Click "Permissions"</li>
//                         <li>Toggle "Use the Microphone" to "Allow"</li>
//                       </ol>
//                     </div>

//                     <div className="space-y-2">
//                       <h4 className="font-medium text-gray-800">For Safari:</h4>
//                       <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
//                         <li>Go to Safari → Preferences → Websites</li>
//                         <li>Select "Microphone" in the left sidebar</li>
//                         <li>Set this website to "Allow"</li>
//                       </ol>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
//                     <p className="text-sm text-red-600">
//                       After changing permissions, try the button below:
//                     </p>
//                     <div className="flex gap-2">
//                       <Button
//                         onClick={() => window.location.reload()}
//                         variant="outline"
//                         size="sm"
//                         className="bg-white hover:bg-gray-50"
//                       >
//                         Refresh Page
//                       </Button>
//                       <Button
//                         onClick={requestMicrophonePermission}
//                         disabled={isCheckingPermission}
//                         className="bg-red-600 hover:bg-red-700 text-white"
//                       >
//                         {isCheckingPermission ? "Checking..." : "Try Again"}
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Additional Troubleshooting for Permission Issues */}
//             {permissionState === "denied" && (
//               <Card className="border-amber-200 bg-amber-50">
//                 <CardHeader>
//                   <CardTitle className="text-amber-800 flex items-center gap-2">
//                     🔧 Advanced Troubleshooting
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <p className="text-amber-700">
//                     If the standard method doesn't work, try these advanced
//                     options:
//                   </p>

//                   <div className="space-y-3">
//                     <div className="flex flex-wrap gap-2">
//                       <Button
//                         onClick={forcePermissionDialog}
//                         disabled={isCheckingPermission}
//                         className="bg-amber-600 hover:bg-amber-700 text-white"
//                       >
//                         {isCheckingPermission
//                           ? "Requesting..."
//                           : "Force Permission Request"}
//                       </Button>
//                       <Button
//                         onClick={resetBrowserPermissions}
//                         variant="outline"
//                         size="sm"
//                         className="bg-white hover:bg-gray-50"
//                       >
//                         Browser Settings Guide
//                       </Button>
//                     </div>

//                     <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
//                       <strong>Last Resort Options:</strong>
//                       <ul className="mt-1 space-y-1">
//                         <li>• Open this site in an incognito/private window</li>
//                         <li>
//                           • Clear browser data for this site
//                           (chrome://settings/content/all)
//                         </li>
//                         <li>
//                           • Try a different browser (Chrome, Firefox, Safari)
//                         </li>
//                         <li>
//                           • Check if your antivirus is blocking microphone
//                           access
//                         </li>
//                       </ul>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {(permissionState === "prompt" ||
//               permissionState === "unknown") && (
//               <Card className="border-blue-200 bg-blue-50">
//                 <CardContent className="pt-6">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h3 className="font-medium text-blue-800">
//                         🎤 Enable Microphone Access
//                       </h3>
//                       <p className="text-sm text-blue-700 mt-1">
//                         Click the button below and select{" "}
//                         <strong>"Allow"</strong> when your browser asks for
//                         permission.
//                       </p>
//                     </div>
//                     <Button
//                       onClick={requestMicrophonePermission}
//                       disabled={isCheckingPermission}
//                       className="bg-blue-600 hover:bg-blue-700 text-white"
//                     >
//                       {isCheckingPermission
//                         ? "Requesting..."
//                         : "Request Access"}
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {permissionState === "granted" && !isRecording && !audioBlob && (
//               <Card className="border-green-200 bg-green-50">
//                 <CardContent className="pt-6">
//                   <div className="flex items-center gap-3">
//                     <div className="w-3 h-3 bg-green-500 rounded-full" />
//                     <div>
//                       <h3 className="font-medium text-green-800">
//                         Microphone Ready
//                       </h3>
//                       <p className="text-sm text-green-700">
//                         Microphone access granted. You can now start recording!
//                       </p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Recording Controls */}
//             <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-transparent relative">
//               <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg pointer-events-none" />
//               <CardContent className="relative z-10 pt-6">
//                 <div className="flex flex-col items-center space-y-4">
//                   <div className="text-3xl font-mono text-gray-800 bg-white/60 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/30">
//                     {formatDuration(duration)}
//                   </div>

//                   <div className="flex items-center space-x-4">
//                     {!isRecording ? (
//                       <Button
//                         onClick={startRecording}
//                         disabled={permissionState === "denied"}
//                         size="lg"
//                         className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full p-6 shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//                       >
//                         <Mic className="w-8 h-8" />
//                       </Button>
//                     ) : (
//                       <>
//                         <Button
//                           onClick={pauseRecording}
//                           variant="outline"
//                           size="lg"
//                           className="rounded-full p-4 bg-white/80 backdrop-blur-sm border-2 border-white/30 hover:bg-white/90"
//                         >
//                           {isPaused ? (
//                             <Play className="w-6 h-6" />
//                           ) : (
//                             <Pause className="w-6 h-6" />
//                           )}
//                         </Button>
//                         <Button
//                           onClick={stopRecording}
//                           size="lg"
//                           className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-full p-4 shadow-lg"
//                         >
//                           <Square className="w-6 h-6" />
//                         </Button>
//                       </>
//                     )}
//                   </div>

//                   {isRecording && (
//                     <div className="flex items-center space-x-2 bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm border border-white/30">
//                       <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse" />
//                       <span className="text-sm font-medium text-gray-800">
//                         {isPaused ? "Paused" : "Recording..."}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Quote Review Editor */}
//             {quoteData && processingStage === "reviewing" && (
//               <QuoteReviewEditor
//                 quoteData={quoteData}
//                 accessToken={accessToken}
//                 recordingTitle={recordingTitle}
//                 onGenerateInvoice={handleGenerateInvoice}
//                 onCancel={handleCancelQuoteReview}
//                 onQuoteCreated={(quoteId) => {
//                   toast.success("Quote created successfully!");
//                   // Keep quote visible for review - don't clear yet
//                   // User can now send the quote or generate invoice from the quote page
//                   console.log("Quote created with ID:", quoteId);
//                 }}
//               />
//             )}

//             {/* Playback and Save removed: recording auto-processes and redirects */}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import {
  Brain,
  CheckCircle2,
  FileText,
  Loader2,
  Mic,
  Pause,
  Play,
  Sparkles,
  Square,
} from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

import { toast } from "sonner";
import { MyAIInvoicesLogo } from "./MyAIInvoicesLogo";
import { QuoteReviewEditor } from "./QuoteReviewEditor";
import { SidebarNavigation } from "./SidebarNavigation";
import { Alert, AlertDescription } from "./ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

// Get the Supabase URL from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface VoiceRecorderProps {
  accessToken: string;
  onSignOut: () => void;
  onRecordingSaved?: () => void;
}

export function VoiceRecorder({
  accessToken,
  onSignOut,
  onRecordingSaved,
}: VoiceRecorderProps) {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  // const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordingTitle, setRecordingTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [permissionState, setPermissionState] = useState<
    "unknown" | "granted" | "denied" | "prompt"
  >("unknown");
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);

  // Progress tracking for AI processing
  const [processingStage, setProcessingStage] = useState<
    | "idle"
    | "uploading"
    | "transcribing"
    | "categorising"
    | "reviewing"
    | "generating"
    | "complete"
  >("idle");

  // Quote data for review
  const [quoteData, setQuoteData] = useState<{
    id_output: string;
    client_name: string;
    client_email?: string;
    items: any[];
    tax_rate?: number;
    discount_rate?: number;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check microphone permission on component mount
  React.useEffect(() => {
    checkMicrophonePermission();
  }, []);

  // Cleanup blob URL on component unmount or when audioUrl changes
  React.useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Note: Auto-start functionality removed - recording now only starts when user clicks the microphone button

  const checkMicrophonePermission = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(
        "Your browser does not support microphone access. Please use a modern browser like Chrome, Firefox, or Safari."
      );
      setPermissionState("denied");
      return;
    }

    try {
      // Check if we're on HTTPS or localhost
      if (
        location.protocol !== "https:" &&
        !location.hostname.includes("localhost")
      ) {
        setError(
          "Microphone access requires a secure connection (HTTPS). Please ensure you're using a secure connection."
        );
        setPermissionState("denied");
        return;
      }

      // Check permission status if available
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });
          setPermissionState(result.state);

          result.addEventListener("change", () => {
            setPermissionState(result.state);
          });
        } catch (err) {
          // Permission API not supported, we'll check on first use
          setPermissionState("unknown");
        }
      } else {
        setPermissionState("unknown");
      }
    } catch (err) {
      console.error("Error checking microphone permission:", err);
      setPermissionState("unknown");
    }
  };

  const requestMicrophonePermission = async () => {
    setIsCheckingPermission(true);
    setError("");

    try {
      // Clear any cached permission state first
      setPermissionState("unknown");

      // Add a small delay to ensure UI updates
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if we're in a secure context first
      if (
        !window.isSecureContext &&
        location.protocol !== "http:" &&
        location.hostname !== "localhost"
      ) {
        throw new Error("Microphone access requires a secure context (HTTPS)");
      }

      // Try with minimal constraints first to increase success chance
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Permission granted, stop the stream immediately
      stream.getTracks().forEach((track) => track.stop());
      setPermissionState("granted");
      toast.success("Microphone access granted! You can now start recording.");
    } catch (err: any) {
      console.error("Error requesting microphone permission:", err);

      if (err.name === "NotAllowedError") {
        // Check if this is a permanent denial or temporary
        try {
          const permissionStatus = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });
          if (permissionStatus.state === "denied") {
            setError(
              "Microphone access was permanently denied. Please reset permissions in your browser settings and refresh this page."
            );
          } else {
            setError(
              'Microphone access was denied. Please click "Allow" when prompted by your browser.'
            );
          }
        } catch {
          setError(
            "Microphone access was denied. Please enable microphone permissions in your browser settings."
          );
        }
        setPermissionState("denied");
      } else if (err.name === "NotFoundError") {
        setError(
          "No microphone detected. Please connect a microphone and try again."
        );
        setPermissionState("denied");
      } else if (err.name === "NotSupportedError") {
        setError(
          "Your browser does not support microphone access. Please use Chrome, Firefox, Safari, or Edge."
        );
        setPermissionState("denied");
      } else if (err.name === "AbortError") {
        setError(
          "Microphone request was cancelled. Please try again and allow access when prompted."
        );
        setPermissionState("prompt");
      } else if (err.name === "NotReadableError") {
        setError(
          "Microphone is being used by another application. Please close other apps using the microphone and try again."
        );
        setPermissionState("denied");
      } else if (err.name === "OverconstrainedError") {
        setError(
          "Your microphone does not meet the required specifications. Please try with a different microphone."
        );
        setPermissionState("denied");
      } else if (err.message && err.message.includes("secure context")) {
        setError(
          "Microphone access requires HTTPS or localhost. Please use a secure connection."
        );
        setPermissionState("denied");
      } else {
        setError(
          `Unable to access microphone: ${
            err.message || "Unknown error"
          }. Please check your browser and device settings.`
        );
        setPermissionState("denied");
      }
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const startRecording = useCallback(async () => {
    setError("");

    // Check permission first
    if (permissionState === "denied") {
      setError(
        "Microphone access denied. Please enable microphone permissions and try again."
      );
      return;
    }

    try {
      // Try progressive fallback for audio constraints
      let stream: MediaStream | null = null;
      const constraintOptions = [
        {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
          },
        },
        {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        },
        { audio: true },
      ];

      for (const constraints of constraintOptions) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          break;
        } catch (err: any) {
          if (err.name === "NotAllowedError") {
            throw err; // Re-throw permission errors immediately
          }
          // Continue with simpler constraints
          continue;
        }
      }

      if (!stream) {
        throw new Error(
          "Unable to access microphone with any audio constraints"
        );
      }

      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder is not supported in this browser");
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log("📼 Data available:", event.data.size, "bytes");
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log("⏹️ Recording stopped, chunks:", chunksRef.current.length);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        console.log("📦 Created blob:", blob.size, "bytes, type:", blob.type);
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks to release microphone
        stream?.getTracks().forEach((track) => track.stop());

        // Automatically begin processing to create invoice using the local blob
        saveRecording(blob);
      };

      mediaRecorder.onerror = (event: any) => {
        console.error("MediaRecorder error:", event.error);
        setError("Recording error occurred. Please try again.");
        setIsRecording(false);
        stream?.getTracks().forEach((track) => track.stop());
      };

      // Start recording with timeslice to ensure data is captured in chunks
      // This helps ensure we get data even for short recordings
      mediaRecorder.start(1000); // Capture data every 1 second
      console.log("🎙️ MediaRecorder started with state:", mediaRecorder.state);
      setIsRecording(true);
      setDuration(0);
      setPermissionState("granted");

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Error accessing microphone:", err);

      if (err.name === "NotAllowedError") {
        setError(
          "Microphone access was denied. Please enable microphone permissions in your browser settings."
        );
        setPermissionState("denied");
      } else if (err.name === "NotFoundError") {
        setError(
          "No microphone detected. Please connect a microphone and refresh the page."
        );
        setPermissionState("denied");
      } else if (err.name === "NotReadableError") {
        setError(
          "Microphone is being used by another application. Please close other apps and try again."
        );
        setPermissionState("denied");
      } else if (err.name === "OverconstrainedError") {
        setError(
          "Your microphone does not meet the audio requirements. Please try with a different microphone."
        );
        setPermissionState("denied");
      } else if (err.message && err.message.includes("MediaRecorder")) {
        setError(
          "Audio recording is not supported in this browser. Please use Chrome, Firefox, or Safari."
        );
        setPermissionState("denied");
      } else {
        setError(
          `Unable to start recording: ${
            err.message || "Unknown error"
          }. Please check your device settings.`
        );
        setPermissionState("denied");
      }
    }
  }, [permissionState]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }
  }, [isRecording, isPaused]);

  const clearRecording = useCallback(() => {
    // Clear audio element BEFORE revoking URL
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = ""; // Clear src before revoking
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioBlob(null);
    setAudioUrl("");
    setDuration(0);
    setRecordingTitle("");
    setError("");
    setQuoteData(null);
    setProcessingStage("idle");
  }, [audioUrl]);

  // Playback removed in auto-processing flow

  const saveRecording = useCallback(
    async (inputBlob?: Blob) => {
      const blobToUse = inputBlob || audioBlob;
      if (!blobToUse || isSaving) return;

      // Validate audio blob before sending
      console.log("🎵 AUDIO BLOB INFO:");
      console.log("  - Size:", blobToUse.size, "bytes");
      console.log("  - Type:", blobToUse.type);
      console.log("  - Duration:", duration, "seconds");

      if (blobToUse.size === 0) {
        setError("Audio file is empty. Please try recording again.");
        return;
      }

      if (blobToUse.size < 100) {
        setError("Audio file is too small. Please record a longer message.");
        return;
      }

      setIsSaving(true);
      setError("");
      setProcessingStage("uploading");

      try {
        const formData = new FormData();
        formData.append("file", blobToUse, "recording.webm");
        formData.append(
          "title",
          recordingTitle || `Recording ${new Date().toLocaleString()}`
        );
        formData.append("duration", duration.toString());

        // Get user id from access token (JWT)
        let currentUserId: string;
        try {
          // Decode JWT to get user_id (JWT format: header.payload.signature)
          const payload = JSON.parse(atob(accessToken.split(".")[1]));
          currentUserId = payload.sub;

          if (!currentUserId) {
            throw new Error("User ID not found in token");
          }
        } catch (tokenError) {
          console.error("Token decode error:", tokenError);
          throw new Error("Not authenticated - invalid token");
        }

        formData.append("user_id", currentUserId);

        // Stage 1: Uploading & Transcribing
        setProcessingStage("transcribing");
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/transcribe`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          }
        );

        console.log("📥 TRANSCRIBE RESPONSE:", {
          status: response.status,
          ok: response.ok,
        });

        const data = await response.json();
        console.log("  - Response data:", data);

        if (!response.ok) {
          console.error("❌ TRANSCRIBE FAILED:", {
            status: response.status,
            error: data.error,
            data: data,
          });

          const errorMessage = data.error || "Failed to save recording";
          setError(errorMessage);
          throw new Error(errorMessage);
        }

        console.log("  - Transcription:", data.text);
        console.log("  - ID Trans:", data.id_trans);

        // Stage 2: Categorising (AI extracts structured data with categories)
        setProcessingStage("categorising");
        console.log("🔄 Calling categorise function...");

        let categoriseData: any = null;

        const categoriseResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/categorise`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id_trans: data.id_trans,
              text: data.text,
            }),
          }
        );

        console.log("📥 CATEGORISE RESPONSE:", {
          status: categoriseResponse.status,
          ok: categoriseResponse.ok,
        });

        categoriseData = await categoriseResponse.json();
        console.log("  - Categorise data:", categoriseData);

        if (!categoriseResponse.ok) {
          console.warn("⚠️ CATEGORISE FAILED:", {
            status: categoriseResponse.status,
            error: categoriseData.error,
          });
          const errorMsg =
            categoriseData.error || "Failed to categorize recording";
          toast.error("AI Processing Failed", {
            description: errorMsg,
            duration: 6000,
          });
          setProcessingStage("idle");
          setError(errorMsg);
          return;
        } else {
          console.log("  - ID Output:", categoriseData.id_output);
          console.log("  - Client Name:", categoriseData.client_name);
          console.log(
            "  - Client Email:",
            categoriseData.client_email || "Not provided"
          );
          console.log(
            "  - Items:",
            categoriseData.items?.length || 0,
            "items extracted"
          );

          // Validate extracted data
          if (!categoriseData.items || categoriseData.items.length === 0) {
            toast.error("No services were extracted from the recording", {
              description:
                "Please try recording again with more details about the services",
              duration: 6000,
            });

            setProcessingStage("idle");
            setError("No services extracted");
            return;
          }

          // if (!categoriseData.items || categoriseData.items.length === 0) {
          //   categoriseData.items = [
          //     {
          //       category: "General Service",
          //       service_description: "Uncategorized voice note",
          //       type: "service",
          //       quantity: 1,
          //       unit_price: 100,
          //       ave_price: 100,
          //       min_price: 100,
          //       max_price: 100,
          //       currency_code: "EUR",
          //     },
          //   ];
          // }
        }

        // Stage 3: Automatically create draft quote and navigate to invoice page
        setProcessingStage("generating");

        try {
          // Create draft quote automatically
          const quoteResponse = await fetch(
            `${SUPABASE_URL}/functions/v1/quote`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id_output: categoriseData.id_output,
                client_name: categoriseData.client_name || "Unknown Client",
                client_email: categoriseData.client_email || "",
                items: categoriseData.items || [],
                tax_rate: categoriseData.tax_rate || 0.085,
                discount_rate: categoriseData.discount_rate || 0.05,
                status: "draft",
                recording_title:
                  recordingTitle || `Recording ${new Date().toLocaleString()}`,
              }),
            }
          );

          const quoteResult = await quoteResponse.json();

          if (!quoteResponse.ok) {
            throw new Error(quoteResult.error || "Failed to create quote");
          }

          console.log("✅ Quote created:", quoteResult.id_quote);

          // Navigate to invoice page to view/edit the quote
          if (quoteResult.id_quote || quoteResult.quote?.id_quote) {
            const quoteId = quoteResult.id_quote || quoteResult.quote?.id_quote;
            navigate(`/invoice/${quoteId}`);
          } else {
            throw new Error("Quote ID not found in response");
          }
        } catch (quoteErr) {
          console.error("❌ ERROR CREATING QUOTE:", quoteErr);

          const quoteErrorMessage =
            quoteErr instanceof Error
              ? quoteErr.message
              : "Failed to create quote";

          toast.error(quoteErrorMessage, {
            duration: 5000,
          });

          setProcessingStage("idle");
          setError(quoteErrorMessage);
        }
      } catch (err) {
        console.error("❌ ERROR SAVING RECORDING:", err);

        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";

        // Show error in UI
        setError(errorMessage);

        // Show toast with detailed error
        toast.error(errorMessage, {
          duration: 5000,
          description: "Check the console for more details",
        });

        setProcessingStage("idle");
      } finally {
        setIsSaving(false);
      }
    },
    [
      audioBlob,
      recordingTitle,
      duration,
      isSaving,
      onRecordingSaved,
      accessToken,
      clearRecording,
      navigate,
    ]
  );

  const handleGenerateInvoice = useCallback(async () => {
    if (!quoteData) return;

    setProcessingStage("generating");

    try {
      const generateInvoiceResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/generate_invoice`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_output: quoteData.id_output,
          }),
        }
      );

      console.log("📥 GENERATE_INVOICE RESPONSE:", {
        status: generateInvoiceResponse.status,
        ok: generateInvoiceResponse.ok,
      });

      const generateInvoiceData = await generateInvoiceResponse.json();
      console.log("  - Generate Invoice data:", generateInvoiceData);

      if (!generateInvoiceResponse.ok) {
        throw new Error(
          generateInvoiceData.error || "Failed to generate invoice"
        );
      }

      console.log("  - ID Invoice:", generateInvoiceData.id_invoice);
      console.log("  - File URL:", generateInvoiceData.file_url);
      console.log("  - Invoice Number:", generateInvoiceData.invoice_number);

      // Stage 4: Complete
      setProcessingStage("complete");

      toast.success("Invoice generated successfully!", {
        description: `Invoice: ${generateInvoiceData.invoice_number}`,
      });

      // Reset after a short delay
      setTimeout(() => {
        setQuoteData(null);
        setProcessingStage("idle");
        clearRecording();
        onRecordingSaved?.();
      }, 2000);
    } catch (err) {
      console.error("❌ ERROR GENERATING INVOICE:", err);

      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate invoice";

      toast.error(errorMessage, {
        duration: 5000,
      });

      setProcessingStage("reviewing");
    }
  }, [quoteData, accessToken, onRecordingSaved]);

  const handleCancelQuoteReview = useCallback(() => {
    setQuoteData(null);
    setProcessingStage("idle");
    clearRecording();
  }, [clearRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg"))
      return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
      return "Safari";
    if (userAgent.includes("Edg")) return "Edge";
    return "Unknown";
  };

  const resetBrowserPermissions = () => {
    const browser = getBrowserName();
    let instructions = "";

    switch (browser) {
      case "Chrome":
      case "Edge":
        instructions = "chrome://settings/content/microphone";
        break;
      case "Firefox":
        instructions = "about:preferences#privacy";
        break;
      case "Safari":
        instructions = "Safari → Preferences → Websites → Microphone";
        break;
      default:
        instructions = "Browser settings → Privacy → Microphone";
    }

    toast.info(`To reset permissions, go to: ${instructions}`);
  };

  const getProcessingStageInfo = () => {
    switch (processingStage) {
      case "uploading":
        return { label: "Uploading audio...", progress: 25, icon: Loader2 };
      case "transcribing":
        return {
          label: "Transcribing with AI...",
          progress: 50,
          icon: FileText,
        };
      case "categorising":
        return {
          label: "Extracting invoice data...",
          progress: 75,
          icon: Brain,
        };
      case "reviewing":
        return {
          label: "Ready for review",
          progress: 80,
          icon: FileText,
        };
      case "generating":
        return { label: "Generating invoice...", progress: 90, icon: Sparkles };
      case "complete":
        return { label: "Complete!", progress: 100, icon: CheckCircle2 };
      default:
        return { label: "Ready", progress: 0, icon: FileText };
    }
  };

  const forcePermissionDialog = async () => {
    setIsCheckingPermission(true);
    setError("");

    try {
      // Try to trigger permission dialog by requesting different constraints
      const constraints = [
        { audio: true },
        { audio: { sampleRate: 44100 } },
        { audio: { channelCount: 1 } },
        { audio: { sampleSize: 16 } },
      ];

      for (const constraint of constraints) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraint);
          stream.getTracks().forEach((track) => track.stop());
          setPermissionState("granted");
          toast.success("Microphone access granted!");
          return;
        } catch (err: any) {
          if (err.name !== "NotAllowedError") {
            continue;
          }
        }
      }

      // If all attempts failed
      setError(
        "Unable to access microphone. Please manually reset browser permissions."
      );
      setPermissionState("denied");
    } catch (err) {
      console.error("Force permission dialog error:", err);
      setError(
        "Unable to request microphone permission. Please check browser settings."
      );
      setPermissionState("denied");
    } finally {
      setIsCheckingPermission(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SidebarNavigation onSignOut={onSignOut} />

      <div className="ml-20 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <MyAIInvoicesLogo height={40} />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Voice Recorder
              </h1>
              <p className="text-gray-600">Record and save your voice memos</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* HTTPS Warning */}
            {location.protocol !== "https:" &&
              !location.hostname.includes("localhost") && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertDescription className="text-yellow-700">
                    ⚠️ <strong>Security Warning:</strong> Microphone access
                    requires a secure connection (HTTPS). Please ensure you're
                    accessing this site over HTTPS for full functionality.
                  </AlertDescription>
                </Alert>
              )}

            {/* Browser Compatibility Check */}
            {(!navigator.mediaDevices ||
              !navigator.mediaDevices.getUserMedia ||
              !window.MediaRecorder) && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  ❌ <strong>Browser Not Supported:</strong> Your browser
                  doesn't support audio recording. Please use Chrome 53+,
                  Firefox 36+, Safari 11+, or Edge 79+ for full functionality.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* AI Processing Progress */}
            {processingStage !== "idle" && (
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {React.createElement(getProcessingStageInfo().icon, {
                          className: `w-5 h-5 ${
                            processingStage === "complete"
                              ? "text-green-600"
                              : "text-blue-600 animate-spin"
                          }`,
                        })}
                        <span className="font-medium text-gray-800">
                          {getProcessingStageInfo().label}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {getProcessingStageInfo().progress}%
                      </span>
                    </div>
                    <Progress
                      value={getProcessingStageInfo().progress}
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Audio → Transcription → AI Analysis → Quote Review →
                        Invoice
                      </span>
                      {processingStage === "complete" && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Permission Status */}
            {permissionState === "denied" && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    🔒 Microphone Access Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-red-700">
                    Microphone access was blocked. Please follow these steps to
                    enable it:
                  </p>

                  <div className="bg-white/80 rounded-lg p-4 space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-800">
                        For Chrome/Edge:
                      </h4>
                      <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                        <li>Click the 🔒 or 🔊 icon in the address bar</li>
                        <li>Set "Microphone" to "Allow"</li>
                        <li>Refresh the page</li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-800">
                        For Firefox:
                      </h4>
                      <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                        <li>Click the 🔒 shield icon in the address bar</li>
                        <li>Click "Permissions"</li>
                        <li>Toggle "Use the Microphone" to "Allow"</li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-800">For Safari:</h4>
                      <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                        <li>Go to Safari → Preferences → Websites</li>
                        <li>Select "Microphone" in the left sidebar</li>
                        <li>Set this website to "Allow"</li>
                      </ol>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                    <p className="text-sm text-red-600">
                      After changing permissions, try the button below:
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-gray-50"
                      >
                        Refresh Page
                      </Button>
                      <Button
                        onClick={requestMicrophonePermission}
                        disabled={isCheckingPermission}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isCheckingPermission ? "Checking..." : "Try Again"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Troubleshooting for Permission Issues */}
            {permissionState === "denied" && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-amber-800 flex items-center gap-2">
                    🔧 Advanced Troubleshooting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-amber-700">
                    If the standard method doesn't work, try these advanced
                    options:
                  </p>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={forcePermissionDialog}
                        disabled={isCheckingPermission}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        {isCheckingPermission
                          ? "Requesting..."
                          : "Force Permission Request"}
                      </Button>
                      <Button
                        onClick={resetBrowserPermissions}
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-gray-50"
                      >
                        Browser Settings Guide
                      </Button>
                    </div>

                    <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                      <strong>Last Resort Options:</strong>
                      <ul className="mt-1 space-y-1">
                        <li>• Open this site in an incognito/private window</li>
                        <li>
                          • Clear browser data for this site
                          (chrome://settings/content/all)
                        </li>
                        <li>
                          • Try a different browser (Chrome, Firefox, Safari)
                        </li>
                        <li>
                          • Check if your antivirus is blocking microphone
                          access
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {(permissionState === "prompt" ||
              permissionState === "unknown") && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-800">
                        🎤 Enable Microphone Access
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Click the button below and select{" "}
                        <strong>"Allow"</strong> when your browser asks for
                        permission.
                      </p>
                    </div>
                    <Button
                      onClick={requestMicrophonePermission}
                      disabled={isCheckingPermission}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isCheckingPermission
                        ? "Requesting..."
                        : "Request Access"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {permissionState === "granted" && !isRecording && !audioBlob && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <div>
                      <h3 className="font-medium text-green-800">
                        Microphone Ready
                      </h3>
                      <p className="text-sm text-green-700">
                        Microphone access granted. You can now start recording!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recording Controls */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-transparent relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg pointer-events-none" />
              <CardContent className="relative z-10 pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-3xl font-mono text-gray-800 bg-white/60 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/30">
                    {formatDuration(duration)}
                  </div>

                  <div className="flex items-center space-x-4">
                    {!isRecording ? (
                      <Button
                        onClick={startRecording}
                        disabled={permissionState === "denied"}
                        size="lg"
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full p-6 shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <Mic className="w-8 h-8" />
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={pauseRecording}
                          variant="outline"
                          size="lg"
                          className="rounded-full p-4 bg-white/80 backdrop-blur-sm border-2 border-white/30 hover:bg-white/90"
                        >
                          {isPaused ? (
                            <Play className="w-6 h-6" />
                          ) : (
                            <Pause className="w-6 h-6" />
                          )}
                        </Button>
                        <Button
                          onClick={stopRecording}
                          size="lg"
                          className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-full p-4 shadow-lg"
                        >
                          <Square className="w-6 h-6" />
                        </Button>
                      </>
                    )}
                  </div>

                  {isRecording && (
                    <div className="flex items-center space-x-2 bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm border border-white/30">
                      <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-gray-800">
                        {isPaused ? "Paused" : "Recording..."}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quote Review Editor */}
            {quoteData && processingStage === "reviewing" && (
              <QuoteReviewEditor
                quoteData={quoteData}
                accessToken={accessToken}
                recordingTitle={recordingTitle}
                onGenerateInvoice={handleGenerateInvoice}
                onCancel={handleCancelQuoteReview}
                onQuoteCreated={(quoteId) => {
                  toast.success("Quote created successfully!");
                  // Keep quote visible for review - don't clear yet
                  // User can now send the quote or generate invoice from the quote page
                  console.log("Quote created with ID:", quoteId);
                }}
              />
            )}

            {/* Playback and Save removed: recording auto-processes and redirects */}
          </div>
        </div>
      </div>
    </div>
  );
}
