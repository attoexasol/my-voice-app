import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Download, Figma, Eye, Code2, Palette } from 'lucide-react';
import { DesignSystemShowcase } from './DesignSystem';
import { AllScreenMockups, SignUpMockup, DashboardMockup, VoiceRecorderMockup, InvoicesViewMockup } from './ScreenMockups';

export function FigmaExportPage() {
  const [selectedScreen, setSelectedScreen] = useState('all');

  const screens = [
    { id: 'all', name: 'All Screens', component: AllScreenMockups },
    { id: 'signup', name: 'Sign Up Flow', component: SignUpMockup },
    { id: 'dashboard', name: 'Dashboard', component: DashboardMockup },
    { id: 'recorder', name: 'Voice Recorder', component: VoiceRecorderMockup },
    { id: 'invoices', name: 'Invoices View', component: InvoicesViewMockup }
  ];

  const designTokens = {
    colors: {
      primary: '#3b82f6',
      primaryLight: '#dbeafe',
      purple: '#8b5cf6',
      purpleLight: '#f3e8ff',
      pink: '#ec4899',
      pinkLight: '#fce7f3',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      gray: '#6b7280'
    },
    gradients: [
      'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
      'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)',
      'linear-gradient(135deg, #dbeafe 0%, #f3e8ff 50%, #fce7f3 100%)'
    ],
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px'
    },
    borderRadius: {
      sm: '6px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px'
    },
    shadows: [
      '0 1px 3px rgba(0, 0, 0, 0.1)',
      '0 4px 6px rgba(0, 0, 0, 0.1)',
      '0 10px 15px rgba(0, 0, 0, 0.1)',
      '0 25px 50px rgba(0, 0, 0, 0.25)'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Figma className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                My AI Invoices - Figma Design Export
              </h1>
            </div>
            <p className="text-gray-600 text-lg">Complete design system and screen mockups for Figma import</p>
          </div>

          {/* Export Actions */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Download className="w-4 h-4 mr-2" />
              Export Design Tokens
            </Button>
            <Button variant="outline" className="bg-white/60 backdrop-blur-sm">
              <Code2 className="w-4 h-4 mr-2" />
              Copy CSS Variables
            </Button>
            <Button variant="outline" className="bg-white/60 backdrop-blur-sm">
              <Palette className="w-4 h-4 mr-2" />
              Download Color Palette
            </Button>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="screens" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="screens" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Screen Designs
              </TabsTrigger>
              <TabsTrigger value="design-system" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Design System
              </TabsTrigger>
              <TabsTrigger value="export-guide" className="flex items-center gap-2">
                <Figma className="w-4 h-4" />
                Figma Guide
              </TabsTrigger>
            </TabsList>

            {/* Screen Designs Tab */}
            <TabsContent value="screens" className="space-y-6">
              {/* Screen Selection */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle>Select Screen to Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {screens.map((screen) => (
                      <Button
                        key={screen.id}
                        variant={selectedScreen === screen.id ? "default" : "outline"}
                        onClick={() => setSelectedScreen(screen.id)}
                        className={selectedScreen === screen.id ? "bg-gradient-to-r from-blue-500 to-purple-500" : ""}
                      >
                        {screen.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Screen Preview */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">
                      Preview: {screens.find(s => s.id === selectedScreen)?.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">1440×900</Badge>
                      <Badge variant="secondary">Desktop</Badge>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-4">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      {React.createElement(screens.find(s => s.id === selectedScreen)?.component || AllScreenMockups)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Design System Tab */}
            <TabsContent value="design-system">
              <DesignSystemShowcase />
            </TabsContent>

            {/* Figma Export Guide Tab */}
            <TabsContent value="export-guide" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Design Tokens */}
                <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Design Tokens for Figma
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Color Variables</h4>
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm space-y-1">
                        {Object.entries(designTokens.colors).map(([name, value]) => (
                          <div key={name} className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded border" style={{ backgroundColor: value }}></div>
                            <span>{name}: {value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Spacing Scale</h4>
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                        {Object.entries(designTokens.spacing).map(([name, value]) => (
                          <div key={name}>{name}: {value}</div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Import Instructions */}
                <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Figma className="w-5 h-5" />
                      Figma Import Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <h4 className="font-medium">Create New Figma File</h4>
                          <p className="text-sm text-gray-600">Start with a new design file in Figma</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <h4 className="font-medium">Import Color Styles</h4>
                          <p className="text-sm text-gray-600">Create color variables using the design tokens above</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <h4 className="font-medium">Set Up Typography</h4>
                          <p className="text-sm text-gray-600">Configure text styles for headings, body, and captions</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <h4 className="font-medium">Create Components</h4>
                          <p className="text-sm text-gray-600">Build reusable components for buttons, cards, and forms</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                        <div>
                          <h4 className="font-medium">Design Screens</h4>
                          <p className="text-sm text-gray-600">Use the mockups as reference to create your screens</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Component Specifications */}
                <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Component Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Buttons</h4>
                        <div className="space-y-2 text-sm">
                          <div>Primary: Gradient blue to purple</div>
                          <div>Height: 40px (default), 48px (large)</div>
                          <div>Border radius: 8px</div>
                          <div>Padding: 16px horizontal</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Cards</h4>
                        <div className="space-y-2 text-sm">
                          <div>Background: White 80% opacity</div>
                          <div>Backdrop blur: 4px</div>
                          <div>Border: White 20% opacity</div>
                          <div>Shadow: Large elevation</div>
                          <div>Border radius: 12px</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Sidebar</h4>
                        <div className="space-y-2 text-sm">
                          <div>Width: 80px</div>
                          <div>Background: White 80% opacity</div>
                          <div>Icon size: 20px</div>
                          <div>Button size: 56x56px</div>
                          <div>Spacing: 8px between items</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}