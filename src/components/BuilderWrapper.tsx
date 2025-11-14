import React from 'react';

interface BuilderWrapperProps {
  children: React.ReactNode;
  model?: string;
  user?: any;
  accessToken?: string;
  onNavigate?: (view: string) => void;
  onSignOut?: () => void;
  fallbackToOriginal?: boolean;
}

export function BuilderWrapper({ 
  children, 
  model = 'page',
  user,
  accessToken,
  onNavigate,
  onSignOut,
  fallbackToOriginal = true
}: BuilderWrapperProps) {
  // For now, always use the original app
  // Builder.io integration can be enabled by following the setup guide
  // and installing the @builder.io/react package
  
  return <>{children}</>;
}

export default BuilderWrapper;