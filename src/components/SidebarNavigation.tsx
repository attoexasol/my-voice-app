import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  LogOut,
  Home,
  Mic,
  MessageCircle,
  FileText,
  Calendar,
  Mail,
  Database,
} from "lucide-react";
import { MyAIInvoicesLogo } from "./MyAIInvoicesLogo";

interface SidebarNavigationProps {
  onSignOut: () => void;
}

export function SidebarNavigation({ onSignOut }: SidebarNavigationProps) {
  const location = useLocation();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOutClick = async () => {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } catch (error) {
      console.error("Sign out failed:", error);
      // Don't show error to user since we handle it in the main app
    } finally {
      // Reset signing out state after a brief delay
      setTimeout(() => setIsSigningOut(false), 1000);
    }
  };
  const navigationItems = [
    {
      path: "/dashboard",
      icon: Home,
      label: "Dashboard",
      className: "hover:bg-blue-500/20",
    },
    {
      path: "/recorder",
      icon: Mic,
      label: "Voice Recorder",
      className: "hover:bg-purple-500/20",
    },
    {
      path: "/chatbot",
      icon: MessageCircle,
      label: "AI Chatbot",
      className: "hover:bg-pink-500/20",
    },
    {
      path: "/invoices",
      icon: FileText,
      label: "View Invoices",
      className: "hover:bg-green-500/20",
    },
    {
      path: "/calendar",
      icon: Calendar,
      label: "Calendar",
      className: "hover:bg-orange-500/20",
    },
    {
      path: "/email",
      icon: Mail,
      label: "Email",
      className: "hover:bg-cyan-500/20",
    },
    {
      path: "/database",
      icon: Database,
      label: "Database",
      className: "hover:bg-indigo-500/20",
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-20 bg-white/80 backdrop-blur-sm border-r border-white/30 shadow-xl z-50 flex flex-col">
      {/* Logo at top */}
      <div className="p-4 flex justify-center border-b border-white/20">
        <MyAIInvoicesLogo height={32} />
      </div>

      {/* Navigation Icons */}
      <div className="flex-1 flex flex-col gap-2 p-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`
                  w-14 h-14 p-0 flex flex-col items-center justify-center rounded-lg
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                      : `bg-white/60 text-gray-700 ${item.className}`
                  }
                  transition-all duration-200 group relative
                `}
                title={item.label}
              >
                <Icon className="w-5 h-5" />

                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {item.label}
                </div>
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Sign Out at bottom */}
      <div className="p-3 border-t border-white/20">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isSigningOut}
              className="w-14 h-14 p-0 bg-white/60 text-gray-700 hover:bg-red-500/20 hover:text-red-600 rounded-lg transition-all duration-200 group relative disabled:opacity-50"
              title="Sign Out"
            >
              <LogOut
                className={`w-5 h-5 ${isSigningOut ? "animate-spin" : ""}`}
              />

              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Sign Out
              </div>
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="bg-white/95 backdrop-blur-sm border border-white/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-800">
                Sign Out
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to sign out of My AI Invoices? You'll need
                to sign back in to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/60 hover:bg-white/80 text-gray-700 border border-gray-300">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSignOutClick}
                disabled={isSigningOut}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                {isSigningOut ? "Signing Out..." : "Sign Out"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
