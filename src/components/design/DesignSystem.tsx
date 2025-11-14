import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Mic, MessageCircle, FileText, Calendar, Home, LogOut, User, Mail, Lock, Upload, CheckCircle, BarChart3, TrendingUp, PieChart } from 'lucide-react';

// Design System Color Palette
export const DesignTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      900: '#4c1d95'
    },
    pink: {
      50: '#fdf2f8',
      100: '#fce7f3',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d'
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },
  gradients: {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-500',
    secondary: 'bg-gradient-to-r from-purple-500 to-pink-500',
    background: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50',
    card: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl'
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem', 
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
  },
  typography: {
    h1: 'text-4xl font-bold',
    h2: 'text-2xl font-bold', 
    h3: 'text-xl font-medium',
    body: 'text-base font-normal',
    caption: 'text-sm text-gray-600'
  }
};

// Screen Layout Templates
export function ScreenTemplate({ title, children, showSidebar = true }: {
  title: string;
  children: React.ReactNode;
  showSidebar?: boolean;
}) {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex">
      {showSidebar && <SidebarDesign />}
      <div className={`flex-1 ${showSidebar ? 'ml-20' : ''} p-6`}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
}

// Sidebar Design Component
export function SidebarDesign() {
  const navItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: Mic, label: 'Voice Recorder', active: false },
    { icon: MessageCircle, label: 'AI Chatbot', active: false },
    { icon: FileText, label: 'View Invoices', active: false },
    { icon: Calendar, label: 'Calendar', active: false }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-20 bg-white/80 backdrop-blur-sm border-r border-white/30 shadow-xl z-50 flex flex-col">
      {/* Logo */}
      <div className="p-4 flex justify-center border-b border-white/20">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">AI</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col gap-2 p-3">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Button
              key={index}
              variant={item.active ? 'default' : 'ghost'}
              size="sm"
              className={`
                w-14 h-14 p-0 flex flex-col items-center justify-center rounded-lg
                ${item.active 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                  : 'bg-white/60 text-gray-700 hover:bg-blue-500/20'
                }
                transition-all duration-200
              `}
            >
              <Icon className="w-5 h-5" />
            </Button>
          );
        })}
      </div>

      {/* Sign Out */}
      <div className="p-3 border-t border-white/20">
        <Button
          variant="ghost"
          size="sm"
          className="w-14 h-14 p-0 bg-white/60 text-gray-700 hover:bg-red-500/20 hover:text-red-600 rounded-lg transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

// Design System Components Library
export function DesignSystemShowcase() {
  return (
    <div className="p-8 space-y-12 bg-gray-50">
      <div>
        <h1 className="text-3xl font-bold mb-2">My AI Invoices Design System</h1>
        <p className="text-gray-600">Component library and design tokens</p>
      </div>

      {/* Color Palette */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Color Palette</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium mb-3">Primary Blue</h3>
            <div className="space-y-2">
              {Object.entries(DesignTokens.colors.primary).map(([shade, color]) => (
                <div key={shade} className="flex items-center gap-3">
                  <div className="w-12 h-8 rounded" style={{ backgroundColor: color }}></div>
                  <span className="text-sm font-mono">{shade}: {color}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-3">Purple</h3>
            <div className="space-y-2">
              {Object.entries(DesignTokens.colors.purple).map(([shade, color]) => (
                <div key={shade} className="flex items-center gap-3">
                  <div className="w-12 h-8 rounded" style={{ backgroundColor: color }}></div>
                  <span className="text-sm font-mono">{shade}: {color}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-3">Pink Accent</h3>
            <div className="space-y-2">
              {Object.entries(DesignTokens.colors.pink).map(([shade, color]) => (
                <div key={shade} className="flex items-center gap-3">
                  <div className="w-12 h-8 rounded" style={{ backgroundColor: color }}></div>
                  <span className="text-sm font-mono">{shade}: {color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Typography</h2>
        <div className="space-y-4">
          <div className="text-4xl font-bold">Heading 1 - Main Page Titles</div>
          <div className="text-2xl font-bold">Heading 2 - Section Titles</div>
          <div className="text-xl font-medium">Heading 3 - Card Titles</div>
          <div className="text-base font-normal">Body Text - Main content and descriptions</div>
          <div className="text-sm text-gray-600">Caption - Metadata and helper text</div>
        </div>
      </section>

      {/* Components */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Core Components</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Buttons */}
          <div>
            <h3 className="font-medium mb-4">Buttons</h3>
            <div className="space-y-3">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                Primary Button
              </Button>
              <Button variant="outline" className="bg-white/60 backdrop-blur-sm border border-white/30">
                Secondary Button
              </Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
          </div>

          {/* Cards */}
          <div>
            <h3 className="font-medium mb-4">Cards</h3>
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Glassmorphism Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Card with backdrop blur and transparency effects</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Status Badges */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Status System</h2>
        <div className="flex flex-wrap gap-3">
          <Badge className="bg-green-100 text-green-700">Paid</Badge>
          <Badge className="bg-blue-100 text-blue-700">Approved</Badge>
          <Badge className="bg-purple-100 text-purple-700">Sent</Badge>
          <Badge className="bg-amber-100 text-amber-700">Draft</Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">Voice Recording</Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">AI Analysis</Badge>
        </div>
      </section>
    </div>
  );
}