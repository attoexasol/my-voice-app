import React from 'react';

interface MyAIInvoicesLogoProps {
  className?: string;
  height?: number;
}

export const MyAIInvoicesLogo: React.FC<MyAIInvoicesLogoProps> = ({ 
  className = "", 
  height = 64 
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-baseline">
        <span 
          className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold tracking-tight"
          style={{ fontSize: height * 0.35 }}
        >
          My AI
        </span>
      </div>
      <span 
        className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent font-medium tracking-wide"
        style={{ fontSize: height * 0.22 }}
      >
        Invoices
      </span>
    </div>
  );
};