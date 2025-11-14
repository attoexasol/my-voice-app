import React from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { SocialAuth } from "../components/auth/SocialAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { MyAIInvoicesLogo } from "../components/MyAIInvoicesLogo";

interface AuthPageProps {
  onComplete: (user: any, token: string) => void;
  supabase: SupabaseClient;
}

export function AuthPage({ onComplete, supabase }: AuthPageProps) {
  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <MyAIInvoicesLogo height={64} className="mx-auto mb-6" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome to My AI Invoices
          </h1>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Create Your Account</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <SocialAuth supabase={supabase} onSuccess={onComplete} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
