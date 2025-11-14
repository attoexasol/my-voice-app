import React, { useState, useEffect } from "react";
import { builder, BuilderComponent, withChildren } from "@builder.io/react";
import { supabase } from "../utils/supabase/client";
import { MyAIInvoicesLogo } from "./MyAIInvoicesLogo";
import { Loader2 } from "lucide-react";

// Using shared Supabase client

interface BuilderPageProps {
  model?: string;
  url?: string;
  user?: any;
  accessToken?: string;
  onNavigate?: (view: string) => void;
  onSignOut?: () => void;
}

export function BuilderPage({
  model = "page",
  url,
  user,
  accessToken,
  onNavigate,
  onSignOut,
}: BuilderPageProps) {
  const [builderContent, setBuilderContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Builder content based on current URL path
    const currentUrl = url || window.location.pathname;

    builder
      .get(model, {
        url: currentUrl,
        // You can add targeting here
        userAttributes: {
          userId: user?.id,
          email: user?.email,
        },
      })
      .promise()
      .then((content) => {
        setBuilderContent(content);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Builder.io loading error:", err);
        setError("Failed to load content from Builder.io");
        setLoading(false);
      });
  }, [model, url, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <MyAIInvoicesLogo height={120} className="mx-auto mb-6" />
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-600 mt-2">Loading Builder.io content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <MyAIInvoicesLogo height={80} className="mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Builder.io Not Connected
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
            <h3 className="font-medium text-yellow-800 mb-2">
              To enable Builder.io:
            </h3>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>
                1. Create an account at{" "}
                <a
                  href="https://builder.io"
                  className="underline"
                  target="_blank"
                >
                  builder.io
                </a>
              </li>
              <li>2. Get your API key from the Builder.io dashboard</li>
              <li>3. Add REACT_APP_BUILDER_API_KEY to your environment</li>
              <li>4. Create content in Builder.io visual editor</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <BuilderComponent
        model={model}
        content={builderContent ?? undefined}
        data={{
          // Pass your app data to Builder.io components
          user: user,
          accessToken: accessToken,
          supabase: supabase,
          onNavigate: onNavigate,
          onSignOut: onSignOut,
          // Helper functions
          handleNavigation: onNavigate,
          handleSignOut: onSignOut,
        }}
        // Custom rendering options
        options={{
          includeRefs: true,
        }}
      />
    </div>
  );
}

// Higher-order component to wrap components with Builder.io
export const withBuilder = (
  Component: React.ComponentType<any>,
  modelName: string = "page"
) => {
  return function BuilderWrappedComponent(props: any) {
    const [builderContent, setBuilderContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      builder
        .get(modelName, {
          url: window.location.pathname,
        })
        .promise()
        .then((content) => {
          setBuilderContent(content);
          setLoading(false);
        })
        .catch(() => {
          // Fallback to original component if Builder.io fails
          setLoading(false);
        });
    }, []);

    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      );
    }

    // If Builder.io content exists, render it, otherwise render original component
    if (builderContent) {
      return (
        <BuilderComponent
          model={modelName}
          content={builderContent}
          data={props}
        />
      );
    }

    return <Component {...props} />;
  };
};

export default BuilderPage;
