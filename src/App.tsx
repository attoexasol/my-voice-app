// import React, { useState, useEffect } from "react";
// import { supabase } from "./utils/supabase/client";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
//   useNavigate,
//   useLocation,
// } from "react-router-dom";
// import { AuthPage } from "./pages/AuthPage";
// import { Dashboard } from "./components/Dashboard";
// import { VoiceRecorder } from "./components/VoiceRecorder";
// import { ChatBot } from "./components/ChatBot";
// import { InvoicesView } from "./components/InvoicesView";
// import { InvoiceDashboard } from "./components/InvoiceDashboard";
// import { CalendarView } from "./components/CalendarView";
// import { EmailInbox } from "./components/EmailInbox";
// import { PublicBookingPage } from "./components/design/PublicBookingPage";
// import { DatabaseDashboard } from "./components/DatabaseDashboard";
// import { ClientManagement } from "./components/ClientManagement";
// import { ItemCatalog } from "./components/ItemCatalog";
// import { MyAIInvoicesLogo } from "./components/MyAIInvoicesLogo";
// import { BuilderWrapper } from "./components/BuilderWrapper";
// import { Toaster } from "./components/ui/sonner";
// import { ComingSoonPage } from "./components/ComingSoonPage";
// import { toast } from "sonner";
// import { Loader2 } from "lucide-react";
// import InvoicePage from "./pages/invoice";
// import QuoteResponse from "./pages/QuoteResponse";
// import OnboardingUpload from "./pages/OnboardingUpload";
// import { useParams } from "react-router-dom";
// import { User } from "./utils/user";

// // Supabase client is initialized in utils/supabase/client
// // Protected Route Component

// function ProtectedRoute({
//   children,
//   user,
// }: {
//   children: React.ReactNode;
//   user: User | null;
// }) {
//   if (!user) {
//     return <Navigate to="/signup" replace />;
//   }
//   return <>{children}</>;
// }

// // Main App Content Component
// function AppContent() {
//   const [user, setUser] = useState<User | null>(null);

//   // Debug user changes
//   useEffect(() => {
//     console.log("🔍 App: User object changed:", user?.id, user?.email);
//   }, [user]);
//   const [loading, setLoading] = useState(true);
//   const [accessToken, setAccessToken] = useState<string>("");
//   const [lastActivity, setLastActivity] = useState<number>(Date.now());
//   const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     checkSession();

//     // Listen for online/offline events
//     const handleOnline = () => setIsOnline(true);
//     const handleOffline = () => setIsOnline(false);

//     window.addEventListener("online", handleOnline);
//     window.addEventListener("offline", handleOffline);

//     // Listen for auth state changes (handles token refresh errors automatically)
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((event: string, session: any) => {
//       // console.log(`🔐 Auth state changed: ${event}`);

//       if (event === "SIGNED_IN" && session) {
//         setUser(session.user as User);
//         setAccessToken(session.access_token);
//       } else if (event === "SIGNED_UP" && session) {
//         // Explicitly handle post-signup redirect
//         setUser(session.user as User);
//         setAccessToken(session.access_token);
//         navigate("/onboarding/upload");
//       } else if (event === "SIGNED_OUT") {
//         setUser(null);
//         setAccessToken("");
//         if (location.pathname !== "/signup") {
//           navigate("/signup");
//         }
//       } else if (event === "TOKEN_REFRESHED" && session) {
//         console.log("✅ Token refreshed successfully");
//         setAccessToken(session.access_token);
//       } else if (event === "TOKEN_REFRESHED" && !session) {
//         // Token refresh failed - enhanced client has already cleaned up
//         console.warn("⚠️ Token refresh failed - signing out");
//         setUser(null);
//         setAccessToken("");
//         navigate("/signup");
//         toast.info("Session expired. Please sign in again.");
//       }
//     });

//     return () => {
//       window.removeEventListener("online", handleOnline);
//       window.removeEventListener("offline", handleOffline);
//       subscription.unsubscribe();
//     };
//   }, []);

//   useEffect(() => {
//     if (!user) return;

//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (event.ctrlKey && event.shiftKey && event.key === "Q") {
//         event.preventDefault();
//         console.log("🔐 Quick sign out triggered by keyboard shortcut");
//         handleSignOut();
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);
//     return () => document.removeEventListener("keydown", handleKeyDown);
//   }, [user]);

//   const checkSession = async () => {
//     try {
//       // Enhanced getSession with built-in timeout and error handling
//       const {
//         data: { session },
//         error,
//       } = await supabase.auth.getSession();

//       if (error) {
//         console.error("Session check error:", error);
//         // Error is already handled by enhanced client
//         // Just redirect to signup
//         if (location.pathname !== "/signup") {
//           navigate("/signup");
//         }
//         if (!isOnline) {
//           toast.info("App started in offline mode");
//         }
//         return;
//       }

//       if (session && session.user) {
//         console.log("✅ Valid session found");
//         setUser(session.user as User);
//         setAccessToken(session.access_token);
//         // Redirect to onboarding only when currently on signup (post-signup)
//         if (location.pathname === "/signup") {
//           navigate("/onboarding/upload");
//         }
//       } else {
//         console.log("ℹ️ No active session");
//         // Redirect to signup if not authenticated and not already there
//         if (location.pathname !== "/signup") {
//           navigate("/signup");
//         }
//       }
//     } catch (error) {
//       console.error("Unexpected session check error:", error);
//       // If session check fails, redirect to signup but don't block the app
//       if (location.pathname !== "/signup") {
//         navigate("/signup");
//       }
//       if (!isOnline) {
//         toast.info("App started in offline mode");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSignUpComplete = (userData: User, token: string) => {
//     setUser(userData);
//     setAccessToken(token);
//     navigate("/onboarding/upload");
//   };

//   const handleSignOut = async () => {
//     try {
//       console.log("🔐 Signing out user...");

//       // Clear local state first for immediate UI feedback
//       setUser(null);
//       setAccessToken("");
//       navigate("/signup");

//       // Enhanced signOut handles all cleanup and error cases
//       const { error } = await supabase.auth.signOut();

//       if (!error) {
//         toast.success("You have been signed out successfully");
//       } else {
//         // Even with error, enhanced client has cleaned up local storage
//         toast.success("Signed out locally");
//       }
//     } catch (error) {
//       console.error("❌ Unexpected error during sign out:", error);
//       // Enhanced client ensures cleanup happens regardless
//       toast.info("Signed out locally");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
//         <div className="text-center">
//           <MyAIInvoicesLogo height={120} className="mx-auto mb-6" />
//           <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
//           <p className="text-gray-600 mt-2">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <BuilderWrapper
//       user={user}
//       accessToken={accessToken}
//       onSignOut={handleSignOut}
//       fallbackToOriginal={true}
//     >
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
//         <Toaster position="top-right" expand={false} richColors closeButton />
//         <Routes>
//           {/* Public Routes */}
//           <Route
//             path="/signup"
//             element={
//               !user ? (
//                 <AuthPage
//                   onComplete={handleSignUpComplete}
//                   supabase={supabase}
//                 />
//               ) : (
//                 <Navigate to="/onboarding/upload" replace />
//               )
//             }
//           />

//           {/* Protected Routes */}
//           <Route
//             path="/onboarding/upload"
//             element={
//               <ProtectedRoute user={user}>
//                 <OnboardingUpload />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute user={user}>
//                 <Dashboard
//                   user={user!}
//                   onSignOut={handleSignOut}
//                   isOnline={isOnline}
//                 />
//               </ProtectedRoute>
//             }
//           />

// <Route
//   path="/recorder"
//   element={
//     <ProtectedRoute user={user}>
//       <VoiceRecorder
//         accessToken={accessToken}
//         onSignOut={handleSignOut}
//       />
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/chatbot"
//   element={
//     <ProtectedRoute user={user}>
//       <ChatBot
//         user={user!}
//         accessToken={accessToken}
//         onSignOut={handleSignOut}
//       />
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/invoices"
//   element={
//     <ProtectedRoute user={user}>
//       <InvoicesView
//         accessToken={accessToken}
//         onSignOut={handleSignOut}
//         onViewDashboard={() => navigate("/invoice-dashboard")}
//       />
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/invoice-dashboard"
//   element={
//     <ProtectedRoute user={user}>
//       <InvoiceDashboard
//         accessToken={accessToken}
//         onSignOut={handleSignOut}
//       />
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/calendar"
//   element={
//     <ProtectedRoute user={user}>
//       <CalendarView
//         onSignOut={handleSignOut}
//         accessToken={accessToken}
//       />
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/email"
//   element={
//     <ProtectedRoute user={user}>
//       <EmailInbox
//         accessToken={accessToken}
//         onSignOut={handleSignOut}
//       />
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/database"
//   element={
//     <ProtectedRoute user={user}>
//       {user ? (
//         <DatabaseDashboard
//           userId={user.id}
//           onSignOut={handleSignOut}
//         />
//       ) : null}
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/clients"
//   element={
//     <ProtectedRoute user={user}>
//       {user ? <ClientManagement userId={user.id} /> : null}
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/catalog"
//   element={
//     <ProtectedRoute user={user}>
//       {user ? <ItemCatalog userId={user.id} /> : null}
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/invoice/:id"
//   element={
//     <ProtectedRoute user={user}>
//       <InvoicePage />
//     </ProtectedRoute>
//   }
// />

// {/* Coming soon page for /book */}
// <Route path="/book" element={<ComingSoonPage />} />

// {/* Public booking page (no auth) */}
// <Route path="/book/:bookingCode" element={<ComingSoonPage />} />

// {/* Public quote response page (no auth) */}
// <Route path="/quote/:quoteId/response" element={<QuoteResponse />} />

// {/* Default redirect */}
// <Route
//   path="/"
//   element={<Navigate to={user ? "/dashboard" : "/signup"} replace />}
// />

// {/* Catch all route */}
// <Route
//   path="*"
//   element={<Navigate to={user ? "/dashboard" : "/signup"} replace />}
// />
//         </Routes>
//       </div>
//     </BuilderWrapper>
//   );
// }

// // Main App Component with Router
// export default function App() {
//   return (
//     <Router>
//       <AppContent />
//     </Router>
//   );
// }

// function PublicBookingPageWrapper() {
//   const params = useParams();
//   const bookingCode = params.bookingCode || "";
//   return <PublicBookingPage bookingCode={bookingCode} />;
// }

// import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
// import { Loader2 } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import {
//   Navigate,
//   Route,
//   BrowserRouter as Router,
//   Routes,
//   useLocation,
//   useNavigate,
//   useParams,
// } from "react-router-dom";
// import { toast } from "sonner";
// import { MyAIInvoicesLogo } from "./components/MyAIInvoicesLogo";
// import { Toaster } from "./components/ui/sonner";
// import { supabase } from "./utils/supabase/client";
// import { User } from "./utils/user";

// // Your pages (adjust named/default imports if your project uses different exports)
// import { AuthPage } from "./pages/AuthPage";
// import InvoicePage from "./pages/invoice";
// import OnboardingUpload from "./pages/OnboardingUpload";
// import QuoteResponse from "./pages/QuoteResponse";

// // Main app components (keep as you already have)
// import BuilderWrapper from "./components/BuilderWrapper";
// import { Dashboard } from "./components/Dashboard";
// import { PublicBookingPage } from "./components/design/PublicBookingPage";
// import { VoiceRecorder } from "./components/VoiceRecorder";

// // Step components — MUST be default exports (see files provided below)
// import StepContact from "./components/StepContact";
// import StepLocation from "./components/StepLocation";
// import StepTeam from "./components/StepTeam";
// import StepTrade from "./components/StepTrade";

// /* ProtectedRoute */
// function ProtectedRoute({
//   children,
//   user,
// }: {
//   children: React.ReactNode;
//   user: User | null;
// }) {
//   if (!user) return <Navigate to="/signup" replace />;
//   return <>{children}</>;
// }

// /* Profile Steps page (route: /profile-steps) */
// function ProfileStepsPage({ onFinish }: { onFinish: () => void }) {
//   const [currentStep, setCurrentStep] = useState(1);
//   const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 4));
//   const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));
//   const handleFinish = () => {
//     toast.success("Profile setup complete");
//     onFinish();
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
//       <h1 className="text-3xl font-bold text-indigo-700 mb-6">
//         Complete Your Profile
//       </h1>
//       <div className="w-full max-w-2xl">
//         {currentStep === 1 && <StepContact onNext={handleNext} />}
//         {currentStep === 2 && (
//           <StepTrade onNext={handleNext} onBack={handleBack} />
//         )}
//         {currentStep === 3 && (
//           <StepTeam onNext={handleNext} onBack={handleBack} />
//         )}
//         {currentStep === 4 && (
//           <StepLocation onNext={handleFinish} onBack={handleBack} />
//         )}
//       </div>
//     </div>
//   );
// }

// /* AppContent */
// function AppContent() {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [accessToken, setAccessToken] = useState("");
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     (async () => {
//       try {
//         const { data } = await supabase.auth.getSession();
//         if (data?.session?.user) {
//           setUser(data.session.user as User);
//           setAccessToken(data.session.access_token ?? "");
//         }
//       } catch (err) {
//         console.error("session get error", err);
//       } finally {
//         setLoading(false);
//       }
//     })();

//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event: AuthChangeEvent, session: Session | null) => {
//         if (session?.user) {
//           setUser(session.user as User);
//           setAccessToken(session.access_token ?? "");
//         } else {
//           setUser(null);
//           setAccessToken("");
//         }
//       }
//     );

//     return () => {
//       if (listener?.subscription) {
//         listener.subscription.unsubscribe();
//       }
//     };
//   }, []);

//   const handleSignUpComplete = (userData: User, token: string) => {
//     setUser(userData);
//     setAccessToken(token);
//     navigate("/profile-steps");
//   };

//   const handleFinishSteps = () => navigate("/onboarding/upload");
//   const handleFinishOnboarding = () => navigate("/dashboard");

//   const handleSignOut = async () => {
//     await supabase.auth.signOut();
//     setUser(null);
//     setAccessToken("");
//     navigate("/signup");
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <MyAIInvoicesLogo height={96} />
//         <Loader2 className="animate-spin w-8 h-8 mt-4" />
//       </div>
//     );
//   }

//   return (
//     <BuilderWrapper
//       user={user}
//       accessToken={accessToken}
//       onSignOut={handleSignOut}
//     >
//       <Toaster position="top-right" />
//       <Routes>
//         <Route
//           path="/signup"
//           element={
//             !user ? (
//               <AuthPage onComplete={handleSignUpComplete} supabase={supabase} />
//             ) : (
//               <Navigate to="/profile-steps" replace />
//             )
//           }
//         />

//         <Route
//           path="/profile-steps"
//           element={
//             <ProtectedRoute user={user}>
//               <ProfileStepsPage onFinish={handleFinishSteps} />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/onboarding/upload"
//           element={
//             <ProtectedRoute user={user}>
//               <OnboardingUpload onComplete={handleFinishOnboarding} />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute user={user}>
//               <Dashboard user={user!} onSignOut={handleSignOut} />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/recorder"
//           element={
//             <ProtectedRoute user={user}>
//               <VoiceRecorder
//                 accessToken={accessToken}
//                 onSignOut={handleSignOut}
//               />
//             </ProtectedRoute>
//           }
//         />

//         {/* keep the other routes you had — add them here if needed */}
//         <Route
//           path="/invoice/:id"
//           element={
//             <ProtectedRoute user={user}>
//               <InvoicePage />
//             </ProtectedRoute>
//           }
//         />
//         <Route path="/quote/:quoteId/response" element={<QuoteResponse />} />
//         <Route
//           path="/"
//           element={<Navigate to={user ? "/dashboard" : "/signup"} replace />}
//         />
//         <Route
//           path="*"
//           element={<Navigate to={user ? "/dashboard" : "/signup"} replace />}
//         />
//       </Routes>
//     </BuilderWrapper>
//   );
// }

// export default function App() {
//   return (
//     <Router>
//       <AppContent />
//     </Router>
//   );
// }

// /* Optional booking wrapper kept (no change) */
// export function PublicBookingPageWrapper() {
//   const params = useParams();
//   const bookingCode = params.bookingCode || "";
//   return <PublicBookingPage bookingCode={bookingCode} />;
// }

// import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
// import { Loader2 } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import {
//   Navigate,
//   Route,
//   BrowserRouter as Router,
//   Routes,
//   useLocation,
//   useNavigate,
//   useParams,
// } from "react-router-dom";
// import { toast } from "sonner";
// import { MyAIInvoicesLogo } from "./components/MyAIInvoicesLogo";
// import { Toaster } from "./components/ui/sonner";
// import { supabase } from "./utils/supabase/client";
// import { User } from "./utils/user";

// // ✅ Pages
// import { AuthPage } from "./pages/AuthPage";
// import InvoicePage from "./pages/invoice";
// import OnboardingUpload from "./pages/OnboardingUpload";
// import QuoteResponse from "./pages/QuoteResponse";

// // ✅ Components
// import BuilderWrapper from "./components/BuilderWrapper";
// import { CalendarView } from "./components/CalendarView";
// import { ChatBot } from "./components/ChatBot";
// import { ClientManagement } from "./components/ClientManagement";
// import { ComingSoonPage } from "./components/ComingSoonPage";
// import { Dashboard } from "./components/Dashboard";
// import { DatabaseDashboard } from "./components/DatabaseDashboard";
// import { PublicBookingPage } from "./components/design/PublicBookingPage";
// import { EmailInbox } from "./components/EmailInbox";
// import { InvoiceDashboard } from "./components/InvoiceDashboard";
// import { InvoicesView } from "./components/InvoicesView";
// import { ItemCatalog } from "./components/ItemCatalog";
// import { VoiceRecorder } from "./components/VoiceRecorder";

// // ✅ Step components
// import StepContact from "./components/StepContact";
// import StepLocation from "./components/StepLocation";
// import StepTrade from "./components/StepTrade";

// /* =============================
//    🔒 ProtectedRoute Component
// ============================= */
// function ProtectedRoute({
//   children,
//   user,
// }: {
//   children: React.ReactNode;
//   user: User | null;
// }) {
//   if (!user) return <Navigate to="/signup" replace />;
//   return <>{children}</>;
// }

// /* =============================
//    🧩 Profile Steps Page
// ============================= */
// function ProfileStepsPage({ onFinish }: { onFinish: () => void }) {
//   const [currentStep, setCurrentStep] = useState(1);

//   const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 3));
//   const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

//   const handleFinish = () => {
//     toast.success("Profile setup complete!");
//     onFinish();
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
//       <h1 className="text-3xl font-bold text-indigo-700 mb-6">
//         Complete Your Profile
//       </h1>
//       <div className="w-full max-w-2xl">
//         {currentStep === 1 && <StepContact onNext={handleNext} />}
//         {currentStep === 2 && (
//           <StepTrade onNext={handleNext} onBack={handleBack} />
//         )}
//         {currentStep === 3 && (
//           <StepLocation onNext={handleFinish} onBack={handleBack} />
//         )}
//       </div>
//     </div>
//   );
// }

// /* =============================
//    ⚙️ AppContent Component
// ============================= */
// function AppContent() {
//   const [user, setUser] = useState<User | null>(null);
//   const [accessToken, setAccessToken] = useState<string>("");
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // ✅ Fetch session & auth listener
//   useEffect(() => {
//     (async () => {
//       try {
//         const { data } = await supabase.auth.getSession();
//         if (data?.session?.user) {
//           setUser(data.session.user as User);
//           setAccessToken(data.session.access_token ?? "");
//         }
//       } catch (err) {
//         console.error("Session get error:", err);
//       } finally {
//         setLoading(false);
//       }
//     })();

//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event: AuthChangeEvent, session: Session | null) => {
//         if (session?.user) {
//           setUser(session.user as User);
//           setAccessToken(session.access_token ?? "");
//         } else {
//           setUser(null);
//           setAccessToken("");
//         }
//       }
//     );

//     return () => {
//       listener?.subscription?.unsubscribe();
//     };
//   }, []);

//   // ✅ Auth handlers
//   const handleSignUpComplete = (userData: User, token: string) => {
//     setUser(userData);
//     setAccessToken(token);
//     navigate("/profile-steps");
//   };

//   const handleFinishSteps = () => navigate("/onboarding/upload");
//   const handleFinishOnboarding = () => navigate("/dashboard");

//   const handleSignOut = async () => {
//     await supabase.auth.signOut();
//     setUser(null);
//     setAccessToken("");
//     navigate("/signup");
//   };

//   // ✅ Loading UI
//   if (loading) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
//         <MyAIInvoicesLogo height={96} />
//         <Loader2 className="animate-spin w-8 h-8 mt-4 text-indigo-600" />
//         <p className="text-gray-500 mt-2">Loading...</p>
//       </div>
//     );
//   }

//   /* =============================
//      🧭 App Routes
//   ============================= */
//   return (
//     <BuilderWrapper
//       user={user}
//       accessToken={accessToken}
//       onSignOut={handleSignOut}
//     >
//       <Toaster position="top-right" />

//       <Routes>
//         {/* Public Signup */}
//         <Route
//           path="/signup"
//           element={
//             !user ? (
//               <AuthPage onComplete={handleSignUpComplete} supabase={supabase} />
//             ) : (
//               <Navigate to="/profile-steps" replace />
//             )
//           }
//         />

//         {/* Profile setup steps */}
//         <Route
//           path="/profile-steps"
//           element={
//             <ProtectedRoute user={user}>
//               <ProfileStepsPage onFinish={handleFinishSteps} />
//             </ProtectedRoute>
//           }
//         />

//         {/* Onboarding */}
//         <Route
//           path="/onboarding/upload"
//           element={
//             <ProtectedRoute user={user}>
//               <OnboardingUpload onComplete={handleFinishOnboarding} />
//             </ProtectedRoute>
//           }
//         />

//         {/* Dashboard */}
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute user={user}>
//               <Dashboard user={user!} onSignOut={handleSignOut} />
//             </ProtectedRoute>
//           }
//         />

//         {/* Voice Recorder */}
//         <Route
//           path="/recorder"
//           element={
//             <ProtectedRoute user={user}>
//               <VoiceRecorder
//                 accessToken={accessToken}
//                 onSignOut={handleSignOut}
//               />
//             </ProtectedRoute>
//           }
//         />

//         {/* ChatBot */}
//         <Route
//           path="/chatbot"
//           element={
//             <ProtectedRoute user={user}>
//               <ChatBot
//                 user={user!}
//                 accessToken={accessToken}
//                 onSignOut={handleSignOut}
//               />
//             </ProtectedRoute>
//           }
//         />

//         {/* Invoices */}
//         <Route
//           path="/invoices"
//           element={
//             <ProtectedRoute user={user}>
//               <InvoicesView
//                 accessToken={accessToken}
//                 onSignOut={handleSignOut}
//                 onViewDashboard={() => navigate("/invoice-dashboard")}
//               />
//             </ProtectedRoute>
//           }
//         />

//         {/* Invoice Dashboard */}
//         <Route
//           path="/invoice-dashboard"
//           element={
//             <ProtectedRoute user={user}>
//               <InvoiceDashboard
//                 accessToken={accessToken}
//                 onSignOut={handleSignOut}
//               />
//             </ProtectedRoute>
//           }
//         />

//         {/* Calendar */}
//         <Route
//           path="/calendar"
//           element={
//             <ProtectedRoute user={user}>
//               <CalendarView
//                 accessToken={accessToken}
//                 onSignOut={handleSignOut}
//               />
//             </ProtectedRoute>
//           }
//         />

//         {/* Email Inbox */}
//         <Route
//           path="/email"
//           element={
//             <ProtectedRoute user={user}>
//               <EmailInbox accessToken={accessToken} onSignOut={handleSignOut} />
//             </ProtectedRoute>
//           }
//         />

//         {/* Database */}
//         <Route
//           path="/database"
//           element={
//             <ProtectedRoute user={user}>
//               {user && (
//                 <DatabaseDashboard userId={user.id} onSignOut={handleSignOut} />
//               )}
//             </ProtectedRoute>
//           }
//         />

//         {/* Clients */}
//         <Route
//           path="/clients"
//           element={
//             <ProtectedRoute user={user}>
//               {user && <ClientManagement userId={user.id} />}
//             </ProtectedRoute>
//           }
//         />

//         {/* Catalog */}
//         <Route
//           path="/catalog"
//           element={
//             <ProtectedRoute user={user}>
//               {user && <ItemCatalog userId={user.id} />}
//             </ProtectedRoute>
//           }
//         />

//         {/* Invoice Page */}
//         <Route
//           path="/invoice/:id"
//           element={
//             <ProtectedRoute user={user}>
//               <InvoicePage />
//             </ProtectedRoute>
//           }
//         />

//         {/* Booking */}
//         <Route path="/book" element={<ComingSoonPage />} />
//         <Route
//           path="/book/:bookingCode"
//           element={<PublicBookingPageWrapper />}
//         />

//         {/* Quote Response (Public) */}
//         <Route path="/quote/:quoteId/response" element={<QuoteResponse />} />

//         {/* Default redirect */}
//         <Route
//           path="/"
//           element={<Navigate to={user ? "/dashboard" : "/signup"} replace />}
//         />

//         {/* Catch all */}
//         <Route
//           path="*"
//           element={<Navigate to={user ? "/dashboard" : "/signup"} replace />}
//         />
//       </Routes>
//     </BuilderWrapper>
//   );
// }

// /* =============================
//    🌐 Main App Wrapper
// ============================= */
// export default function App() {
//   return (
//     <Router>
//       <AppContent />
//     </Router>
//   );
// }

// /* =============================
//    🔗 Public Booking Wrapper
// ============================= */
// export function PublicBookingPageWrapper() {
//   const params = useParams();
//   const bookingCode = params.bookingCode || "";
//   return <PublicBookingPage bookingCode={bookingCode} />;
// }





import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { toast } from "sonner";
import { MyAIInvoicesLogo } from "./components/MyAIInvoicesLogo";
import { Toaster } from "./components/ui/sonner";
import { supabase } from "./utils/supabase/client";
import { User } from "./utils/user";

// ✅ Pages
import { AuthPage } from "./pages/AuthPage";
import InvoicePage from "./pages/invoice";
import OnboardingUpload from "./pages/OnboardingUpload";
import QuoteResponse from "./pages/QuoteResponse";
import CustomerUpload from "./pages/CustomerUpload";
// ✅ Components
import BuilderWrapper from "./components/BuilderWrapper";
import { CalendarView } from "./components/CalendarView";
import { ChatBot } from "./components/ChatBot";
import { ClientManagement } from "./components/ClientManagement";
import { ComingSoonPage } from "./components/ComingSoonPage";
import { Dashboard } from "./components/Dashboard";
import { DatabaseDashboard } from "./components/DatabaseDashboard";
import { PublicBookingPage } from "./components/design/PublicBookingPage";
import { EmailInbox } from "./components/EmailInbox";
import { InvoiceDashboard } from "./components/InvoiceDashboard";
import { InvoicesView } from "./components/InvoicesView";
import { ItemCatalog } from "./components/ItemCatalog";
import { VoiceRecorder } from "./components/VoiceRecorder";

// ✅ Step components
import StepContact from "./components/StepContact";
import StepLocation from "./components/StepLocation";
import StepTrade from "./components/StepTrade";

/* =============================
   🔒 ProtectedRoute Component
============================= */
function ProtectedRoute({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  if (!user) return <Navigate to="/signup" replace />;
  return <>{children}</>;
}

/* =============================
   🧩 Profile Steps Page (StepTeam removed)
============================= */
function ProfileStepsPage({ onFinish }: { onFinish: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);

  // ADD this:
  const [formData, setFormData] = useState<any>({});
  // existing handlers
  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleFinish = () => {
    toast.success("Profile setup complete!");
    onFinish(); // existing: navigate to upload
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8e6f5] via-[#f0eff8] to-[#e8e6f5] flex flex-col">
      {/* Header */}
      {currentStep < 4 && (
        <header className="flex items-center justify-between px-8 py-6">
          <div
            className="text-[#5b4dff]"
            style={{ fontSize: "24px", fontWeight: 600 }}
          >
            My AI
          </div>
          <div
            className="text-[#8b7fff]"
            style={{ fontSize: "14px", fontWeight: 500 }}
          >
            Invoices
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 pt-8">
        {/* Title + Subtitle */}
        {currentStep < 4 && (
          <>
            <h1
              className="text-center text-[#7c3aed] mb-3"
              style={{
                fontSize: "48px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Complete Your Profile
            </h1>

            <p
              className="text-center text-[#6b7280] mb-10"
              style={{ fontSize: "16px", fontWeight: 400 }}
            >
              {currentStep === 1 &&
                "Enter your business address and contact number"}
              {currentStep === 2 && "What is your trade or profession?"}
              {currentStep === 3 && "Where do you supply your services?"}
            </p>
          </>
        )}

        {/* Step Progress Indicator */}
        {currentStep < 4 && (
          <div className="flex items-center gap-4 mb-16">
            {["Contact", "Trade", "Location"].map((label, index) => {
              const stepNum = index + 1;
              const isActive = currentStep === stepNum;
              const isCompleted = currentStep > stepNum;

              return (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-[#10b981]"
                          : isActive
                          ? "bg-[#5b4dff]"
                          : "bg-[#d1d5db]"
                      }`}
                    >
                      {isCompleted ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M16.6667 5L7.50004 14.1667L3.33337 10"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <span
                          className="text-white"
                          style={{ fontSize: "18px", fontWeight: 600 }}
                        >
                          {stepNum}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-[#374151]"
                      style={{ fontSize: "13px", fontWeight: 500 }}
                    >
                      {label}
                    </span>
                  </div>

                  {index < 2 && (
                    <div
                      className={`h-0.5 w-16 ${
                        currentStep > stepNum ? "bg-[#10b981]" : "bg-[#d1d5db]"
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Step Content */}
        <div className="w-full max-w-[680px] mb-12">
          {currentStep === 1 && (
            <StepContact
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <StepTrade
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <StepLocation
              formData={formData}
              setFormData={setFormData}
              onBack={handleBack}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* =============================
   ⚙️ AppContent Component
============================= */
function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          setUser(data.session.user as User);
          setAccessToken(data.session.access_token ?? "");
        }
      } catch (err) {
        console.error("Session get error:", err);
      } finally {
        setLoading(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setUser(session.user as User);
          setAccessToken(session.access_token ?? "");
        } else {
          setUser(null);
          setAccessToken("");
        }
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSignUpComplete = (userData: User, token: string) => {
    setUser(userData);
    setAccessToken(token);
    navigate("/profile-steps");
  };

  const handleFinishSteps = () => navigate("/onboarding/upload");
  const handleFinishOnboarding = () => navigate("/dashboard");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken("");
    navigate("/signup");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <MyAIInvoicesLogo height={96} />
        <Loader2 className="animate-spin w-8 h-8 mt-4 text-indigo-600" />
        <p className="text-gray-500 mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <BuilderWrapper
      user={user}
      accessToken={accessToken}
      onSignOut={handleSignOut}
    >
      <Toaster position="top-right" />

      <Routes>
        {/* Signup */}
        <Route
          path="/signup"
          element={
            !user ? (
              <AuthPage onComplete={handleSignUpComplete} supabase={supabase} />
            ) : (
              <Navigate to="/profile-steps" replace />
            )
          }
        />

        {/* Profile setup (no Team step) */}
        <Route
          path="/profile-steps"
          element={
            <ProtectedRoute user={user}>
              <ProfileStepsPage onFinish={handleFinishSteps} />
            </ProtectedRoute>
          }
        />
       
        {/* Onboarding Upload */}
        <Route
          path="/onboarding/upload"
          element={
            <ProtectedRoute user={user}>
              <OnboardingUpload onComplete={handleFinishOnboarding} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer-upload"
          element={
            <ProtectedRoute user={user}>
              <CustomerUpload />
            </ProtectedRoute>
          }
        />
        {/* Dashboard + other app pages */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user!} onSignOut={handleSignOut} />
            </ProtectedRoute>
          }
        />

        {/* Voice Recorder */}
        <Route
          path="/recorder"
          element={
            <ProtectedRoute user={user}>
              <VoiceRecorder
                accessToken={accessToken}
                onSignOut={handleSignOut}
              />
            </ProtectedRoute>
          }
        />

        {/* Chatbot */}
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute user={user}>
              <ChatBot
                user={user!}
                accessToken={accessToken}
                onSignOut={handleSignOut}
              />
            </ProtectedRoute>
          }
        />

        {/* Invoices */}
        <Route
          path="/invoices"
          element={
            <ProtectedRoute user={user}>
              <InvoicesView
                accessToken={accessToken}
                onSignOut={handleSignOut}
                onViewDashboard={() => navigate("/invoice-dashboard")}
              />
            </ProtectedRoute>
          }
        />

        {/* Invoice Dashboard */}
        <Route
          path="/invoice-dashboard"
          element={
            <ProtectedRoute user={user}>
              <InvoiceDashboard
                accessToken={accessToken}
                onSignOut={handleSignOut}
              />
            </ProtectedRoute>
          }
        />

        {/* Other routes (Calendar, Email, etc.) */}
        <Route
          path="/calendar"
          element={
            <ProtectedRoute user={user}>
              <CalendarView
                accessToken={accessToken}
                onSignOut={handleSignOut}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/email"
          element={
            <ProtectedRoute user={user}>
              <EmailInbox accessToken={accessToken} onSignOut={handleSignOut} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/database"
          element={
            <ProtectedRoute user={user}>
              {user && (
                <DatabaseDashboard userId={user.id} onSignOut={handleSignOut} />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute user={user}>
              {user && <ClientManagement userId={user.id} />}
            </ProtectedRoute>
          }
        />

        <Route
          path="/catalog"
          element={
            <ProtectedRoute user={user}>
              {user && <ItemCatalog userId={user.id} />}
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoice/:id"
          element={
            <ProtectedRoute user={user}>
              <InvoicePage />
            </ProtectedRoute>
          }
        />

        <Route path="/book" element={<ComingSoonPage />} />
        <Route
          path="/book/:bookingCode"
          element={<PublicBookingPageWrapper />}
        />
        <Route path="/quote/:quoteId/response" element={<QuoteResponse />} />

        {/* Default redirect */}
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/signup"} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/signup"} replace />}
        />
      </Routes>
    </BuilderWrapper>
  );
}

/* =============================
   🌐 Main App Wrapper
============================= */
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

/* =============================
   🔗 Public Booking Wrapper
============================= */
export function PublicBookingPageWrapper() {
  const params = useParams();
  const bookingCode = params.bookingCode || "";
  return <PublicBookingPage bookingCode={bookingCode} />;
}







// import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
// import { Loader2 } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import {
//   Navigate,
//   Route,
//   BrowserRouter as Router,
//   Routes,
//   useLocation,
//   useNavigate,
//   useParams,
// } from "react-router-dom";
// import { toast } from "sonner";
// import { MyAIInvoicesLogo } from "./components/MyAIInvoicesLogo";
// import { Toaster } from "./components/ui/sonner";
// import { supabase } from "./utils/supabase/client";
// import { User } from "./utils/user";

// // Pages
// import { AuthPage } from "./pages/AuthPage";
// import InvoicePage from "./pages/invoice";
// import OnboardingUpload from "./pages/OnboardingUpload";
// import QuoteResponse from "./pages/QuoteResponse";
// import CustomerUpload from "./pages/CustomerUpload";

// // Components
// import BuilderWrapper from "./components/BuilderWrapper";
// import { CalendarView } from "./components/CalendarView";
// import { ChatBot } from "./components/ChatBot";
// import { ClientManagement } from "./components/ClientManagement";
// import { ComingSoonPage } from "./components/ComingSoonPage";
// import { Dashboard } from "./components/Dashboard";
// import { DatabaseDashboard } from "./components/DatabaseDashboard";
// import { PublicBookingPage } from "./components/design/PublicBookingPage";
// import { EmailInbox } from "./components/EmailInbox";
// import { InvoiceDashboard } from "./components/InvoiceDashboard";
// import { InvoicesView } from "./components/InvoicesView";
// import { ItemCatalog } from "./components/ItemCatalog";
// import { VoiceRecorder } from "./components/VoiceRecorder";

// // Step components
// import StepContact from "./components/StepContact";
// import StepLocation from "./components/StepLocation";
// import StepTrade from "./components/StepTrade";

// /* =============================
//    ProtectedRoute Component
// ============================= */
// function ProtectedRoute({
//   children,
//   user,
// }: {
//   children: React.ReactNode;
//   user: User | null;
// }) {
//   if (!user) return <Navigate to="/signup" replace />;
//   return <>{children}</>;
// }

// /* =============================
//    Profile Steps Page
// ============================= */
// function ProfileStepsPage({ onFinish }: { onFinish: () => void }) {
//   const location = useLocation();
//   const [currentStep, setCurrentStep] = useState(location.state?.step || 1);
//   const [formData, setFormData] = useState<any>({});

//   const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 3));
//   const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

//   const handleFinish = () => {
//     toast.success("Profile setup complete!");
//     onFinish();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#e8e6f5] via-[#f0eff8] to-[#e8e6f5] flex flex-col">
//       {/* Header */}
//       {currentStep < 4 && (
//         <header className="flex items-center justify-between px-8 py-6">
//           <div
//             className="text-[#5b4dff]"
//             style={{ fontSize: "24px", fontWeight: 600 }}
//           >
//             My AI
//           </div>
//           <div
//             className="text-[#8b7fff]"
//             style={{ fontSize: "14px", fontWeight: 500 }}
//           >
//             Invoices
//           </div>
//         </header>
//       )}

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col items-center px-4 pt-8">
//         {/* Title + Subtitle */}
//         {currentStep < 4 && (
//           <>
//             <h1
//               className="text-center text-[#7c3aed] mb-3"
//               style={{
//                 fontSize: "48px",
//                 fontWeight: 700,
//                 letterSpacing: "-0.02em",
//               }}
//             >
//               Complete Your Profile
//             </h1>

//             <p
//               className="text-center text-[#6b7280] mb-10"
//               style={{ fontSize: "16px", fontWeight: 400 }}
//             >
//               {currentStep === 1 &&
//                 "Enter your business address and contact number"}
//               {currentStep === 2 && "What is your trade or profession?"}
//               {currentStep === 3 && "Where do you supply your services?"}
//             </p>
//           </>
//         )}

//         {/* Step Progress Indicator */}
//         {currentStep < 4 && (
//           <div className="flex items-center gap-4 mb-16">
//             {["Contact", "Trade", "Location"].map((label, index) => {
//               const stepNum = index + 1;
//               const isActive = currentStep === stepNum;
//               const isCompleted = currentStep > stepNum;

//               return (
//                 <React.Fragment key={label}>
//                   <div className="flex flex-col items-center gap-2">
//                     <div
//                       className={`w-12 h-12 rounded-full flex items-center justify-center ${
//                         isCompleted
//                           ? "bg-[#10b981]"
//                           : isActive
//                           ? "bg-[#5b4dff]"
//                           : "bg-[#d1d5db]"
//                       }`}
//                     >
//                       {isCompleted ? (
//                         <svg
//                           width="20"
//                           height="20"
//                           viewBox="0 0 20 20"
//                           fill="none"
//                         >
//                           <path
//                             d="M16.6667 5L7.50004 14.1667L3.33337 10"
//                             stroke="white"
//                             strokeWidth="2.5"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                           />
//                         </svg>
//                       ) : (
//                         <span
//                           className="text-white"
//                           style={{ fontSize: "18px", fontWeight: 600 }}
//                         >
//                           {stepNum}
//                         </span>
//                       )}
//                     </div>
//                     <span
//                       className="text-[#374151]"
//                       style={{ fontSize: "13px", fontWeight: 500 }}
//                     >
//                       {label}
//                     </span>
//                   </div>

//                   {index < 2 && (
//                     <div
//                       className={`h-0.5 w-16 ${
//                         currentStep > stepNum ? "bg-[#10b981]" : "bg-[#d1d5db]"
//                       }`}
//                     ></div>
//                   )}
//                 </React.Fragment>
//               );
//             })}
//           </div>
//         )}

//         {/* Step Content */}
//         <div className="w-full max-w-[680px] mb-12">
//           {currentStep === 1 && (
//             <StepContact
//               formData={formData}
//               setFormData={setFormData}
//               onNext={handleNext}
//             />
//           )}
//           {currentStep === 2 && (
//             <StepTrade
//               formData={formData}
//               setFormData={setFormData}
//               onNext={handleNext}
//               onBack={handleBack}
//             />
//           )}
//           {currentStep === 3 && (
//             <StepLocation
//               formData={formData}
//               setFormData={setFormData}
//               onBack={handleBack}
//               onFinish={handleFinish}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* =============================
//    AppContent Component
// ============================= */
// function AppContent() {
//   const [user, setUser] = useState<User | null>(null);
//   const [accessToken, setAccessToken] = useState<string>("");
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     (async () => {
//       try {
//         const { data } = await supabase.auth.getSession();
//         if (data?.session?.user) {
//           setUser(data.session.user as User);
//           setAccessToken(data.session.access_token ?? "");
//         }
//       } catch (err) {
//         console.error("Session get error:", err);
//       } finally {
//         setLoading(false);
//       }
//     })();

//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event: AuthChangeEvent, session: Session | null) => {
//         if (session?.user) {
//           setUser(session.user as User);
//           setAccessToken(session.access_token ?? "");
//         } else {
//           setUser(null);
//           setAccessToken("");
//         }
//       }
//     );

//     return () => {
//       listener?.subscription?.unsubscribe();
//     };
//   }, []);

//   const handleSignUpComplete = (userData: User, token: string) => {
//     setUser(userData);
//     setAccessToken(token);
//     navigate("/profile-steps");
//   };

//   const handleFinishSteps = () => navigate("/onboarding/upload");

//   const handleFinishOnboarding = () => navigate("/dashboard");

//   const handleSignOut = async () => {
//     await supabase.auth.signOut();
//     setUser(null);
//     setAccessToken("");
//     navigate("/signup");
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
//         <MyAIInvoicesLogo height={96} />
//         <Loader2 className="animate-spin w-8 h-8 mt-4 text-indigo-600" />
//         <p className="text-gray-500 mt-2">Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <BuilderWrapper
//       user={user}
//       accessToken={accessToken}
//       onSignOut={handleSignOut}
//     >
//       <Toaster position="top-right" />

//       <Routes>
//         {/* Signup */}
//         <Route
//           path="/signup"
//           element={
//             !user ? (
//               <AuthPage onComplete={handleSignUpComplete} supabase={supabase} />
//             ) : (
//               <Navigate to="/profile-steps" replace />
//             )
//           }
//         />

//         {/* Profile Steps */}
//         <Route
//           path="/profile-steps"
//           element={
//             <ProtectedRoute user={user}>
//               <ProfileStepsPage onFinish={handleFinishSteps} />
//             </ProtectedRoute>
//           }
//         />

//         {/* Invoice Upload */}
//         <Route
//           path="/onboarding/upload"
//           element={
//             <ProtectedRoute user={user}>
//               <OnboardingUpload onBackRoute="/profile-steps" />
//             </ProtectedRoute>
//           }
//         />

//         {/* Customer Upload */}
//         <Route
//           path="/customer-upload"
//           element={
//             <ProtectedRoute user={user}>
//               <CustomerUpload />
//             </ProtectedRoute>
//           }
//         />

//         {/* Dashboard */}
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute user={user}>
//               <Dashboard user={user!} onSignOut={handleSignOut} />
//             </ProtectedRoute>
//           }
//         />

//         {/* Other routes */}
//         <Route
//           path="/calendar"
//           element={
//             <CalendarView accessToken={accessToken} onSignOut={handleSignOut} />
//           }
//         />
//         <Route
//           path="/email"
//           element={
//             <EmailInbox accessToken={accessToken} onSignOut={handleSignOut} />
//           }
//         />
//         <Route
//           path="/clients"
//           element={<ClientManagement userId={user?.id!} />}
//         />
//         <Route path="/catalog" element={<ItemCatalog userId={user?.id!} />} />
//         <Route
//           path="/invoice-dashboard"
//           element={
//             <InvoiceDashboard
//               accessToken={accessToken}
//               onSignOut={handleSignOut}
//             />
//           }
//         />
//         <Route
//           path="/invoices"
//           element={
//             <InvoicesView accessToken={accessToken} onSignOut={handleSignOut} />
//           }
//         />
//         <Route path="/invoice/:id" element={<InvoicePage />} />
//         <Route path="/book" element={<ComingSoonPage />} />
//         <Route path="/quote/:quoteId/response" element={<QuoteResponse />} />

//         {/* Default */}
//         <Route
//           path="/"
//           element={<Navigate to={user ? "/dashboard" : "/signup"} replace />}
//         />
//         <Route
//           path="*"
//           element={<Navigate to={user ? "/dashboard" : "/signup"} replace />}
//         />
//       </Routes>
//     </BuilderWrapper>
//   );
// }

// /* =============================
//    Main App Wrapper
// ============================= */
// export default function App() {
//   return (
//     <Router>
//       <AppContent />
//     </Router>
//   );
// }

// /* =============================
//    Public Booking Wrapper
// ============================= */
// export function PublicBookingPageWrapper() {
//   const params = useParams();
//   const bookingCode = params.bookingCode || "";
//   return <PublicBookingPage bookingCode={bookingCode} />;
// }
