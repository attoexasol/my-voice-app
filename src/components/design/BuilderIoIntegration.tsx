import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  ExternalLink, Code2, Palette, Upload, Settings, 
  Figma, Globe, Blocks, Download, Copy
} from 'lucide-react';

// Builder.io Integration Guide Component
export function BuilderIoIntegration() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const builderConfig = `// builder.config.js
import { builder } from '@builder.io/react';

// Initialize Builder with your API key
builder.init('YOUR_BUILDER_API_KEY');

// Register custom components
import { Dashboard } from './components/Dashboard';
import { VoiceRecorder } from './components/VoiceRecorder';
import { InvoicesView } from './components/InvoicesView';
import { SidebarNavigation } from './components/SidebarNavigation';

builder.register('component', Dashboard, {
  name: 'Dashboard',
  inputs: [
    { name: 'user', type: 'object' },
    { name: 'onNavigate', type: 'function' },
    { name: 'onSignOut', type: 'function' }
  ]
});

builder.register('component', VoiceRecorder, {
  name: 'Voice Recorder',
  inputs: [
    { name: 'accessToken', type: 'string' },
    { name: 'onNavigate', type: 'function' },
    { name: 'onSignOut', type: 'function' }
  ]
});

builder.register('component', InvoicesView, {
  name: 'Invoices View',
  inputs: [
    { name: 'accessToken', type: 'string' },
    { name: 'onNavigate', type: 'function' },
    { name: 'onSignOut', type: 'function' }
  ]
});

builder.register('component', SidebarNavigation, {
  name: 'Sidebar Navigation',
  inputs: [
    { name: 'currentView', type: 'string' },
    { name: 'onNavigate', type: 'function' },
    { name: 'onSignOut', type: 'function' }
  ]
});`;

  const appIntegration = `// App.tsx with Builder.io
import React from 'react';
import { builder, Builder, withChildren } from '@builder.io/react';
import './builder.config';

// Your existing components
import { Dashboard } from './components/Dashboard';
import { VoiceRecorder } from './components/VoiceRecorder';

function MyAIInvoicesApp() {
  const [builderContent, setBuilderContent] = useState(null);

  useEffect(() => {
    // Load Builder content
    builder.get('page', { url: window.location.pathname })
      .promise()
      .then(setBuilderContent);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {builderContent ? (
        <Builder 
          content={builderContent} 
          model="page"
          data={{
            // Pass your app data to Builder
            user: user,
            accessToken: accessToken
          }}
        />
      ) : (
        // Fallback to your existing app
        <Dashboard user={user} onNavigate={handleNavigation} />
      )}
    </div>
  );
}`;

  const designTokens = `// Design tokens for Builder.io
export const builderDesignTokens = {
  colors: {
    primary: '#3b82f6',
    primaryLight: '#dbeafe',
    purple: '#8b5cf6',
    purpleLight: '#f3e8ff',
    pink: '#ec4899',
    pinkLight: '#fce7f3',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px'
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 25px 50px rgba(0, 0, 0, 0.25)'
  }
};`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Blocks className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              My AI Invoices → Builder.io
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Complete integration guide for visual development</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="design-tokens">Themes</TabsTrigger>
            <TabsTrigger value="deployment">Deploy</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Blocks className="w-5 h-5 text-purple-500" />
                    What is Builder.io?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Builder.io is a visual development platform that lets you create and edit web pages 
                    using a drag-and-drop interface while maintaining your existing React components.
                  </p>
                  <div className="space-y-2">
                    <Badge className="bg-purple-100 text-purple-700">Visual Editor</Badge>
                    <Badge className="bg-blue-100 text-blue-700">React Integration</Badge>
                    <Badge className="bg-green-100 text-green-700">CMS Capabilities</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-500" />
                    Integration Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Register existing React components</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Import Figma designs directly</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="text-sm">Create visual page builder</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Headless CMS integration</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Start Steps */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>Quick Start Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">1</div>
                    <h4 className="font-medium mb-2">Create Account</h4>
                    <p className="text-sm text-gray-600">Sign up at builder.io and get your API key</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">2</div>
                    <h4 className="font-medium mb-2">Install SDK</h4>
                    <p className="text-sm text-gray-600">Add @builder.io/react to your project</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">3</div>
                    <h4 className="font-medium mb-2">Register Components</h4>
                    <p className="text-sm text-gray-600">Make your React components available</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">4</div>
                    <h4 className="font-medium mb-2">Build Visually</h4>
                    <p className="text-sm text-gray-600">Use the visual editor to create pages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Installation & Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">1. Install Builder.io SDK</h4>
                  <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <span>npm install @builder.io/react</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('npm install @builder.io/react')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Get Your API Key</h4>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-blue-800 text-sm mb-2">
                      Visit <a href="https://builder.io" className="underline" target="_blank">builder.io</a> and:
                    </p>
                    <ol className="text-blue-800 text-sm space-y-1">
                      <li>• Create a free account</li>
                      <li>• Go to Account Settings → API Keys</li>
                      <li>• Copy your Public API Key</li>
                      <li>• Add to your environment variables</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">3. Create Builder Configuration</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">builder.config.js</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(builderConfig)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <pre className="text-xs overflow-x-auto"><code>{builderConfig}</code></pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>App Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Modified App.tsx</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(appIntegration)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <pre className="text-xs overflow-x-auto"><code>{appIntegration}</code></pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  Your Components in Builder.io
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Available Components</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'Dashboard', description: 'Main dashboard with stats and navigation' },
                        { name: 'SidebarNavigation', description: 'Left sidebar with glassmorphism effect' },
                        { name: 'VoiceRecorder', description: 'Audio recording interface' },
                        { name: 'InvoicesView', description: 'Invoice management table' },
                        { name: 'ChatBot', description: 'AI chatbot interface' },
                        { name: 'CalendarView', description: 'Customer meetings calendar' }
                      ].map((component) => (
                        <div key={component.name} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-800">{component.name}</div>
                          <div className="text-sm text-gray-600">{component.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Usage in Builder.io</h4>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-blue-800 text-sm mb-3">Once registered, you can:</p>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Drag components from the Builder.io component panel</li>
                        <li>• Configure props through the visual interface</li>
                        <li>• Create responsive layouts with breakpoints</li>
                        <li>• Add animations and interactions</li>
                        <li>• A/B test different versions</li>
                        <li>• Schedule content changes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>Component Registration Example</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                  <pre>{`// Register your SidebarNavigation component
builder.register('component', SidebarNavigation, {
  name: 'AI Invoices Sidebar',
  description: 'Glassmorphism sidebar with navigation icons',
  image: 'https://your-domain.com/sidebar-preview.png',
  inputs: [
    {
      name: 'currentView',
      type: 'string',
      enum: ['dashboard', 'recorder', 'chatbot', 'invoices', 'calendar'],
      defaultValue: 'dashboard'
    },
    {
      name: 'onNavigate',
      type: 'function',
      helperText: 'Function called when navigation item is clicked'
    }
  ],
  // Make it show up in specific sections
  tags: ['navigation', 'sidebar', 'ai-invoices']
});`}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Design Tokens Tab */}
          <TabsContent value="design-tokens" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Design System in Builder.io
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Custom Theme Integration</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Design Tokens</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(designTokens)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <pre className="text-xs overflow-x-auto"><code>{designTokens}</code></pre>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Builder.io Theme Setup</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="font-medium text-blue-800 mb-1">Global Styles</div>
                        <div className="text-sm text-blue-700">Import your globals.css in Builder.io</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="font-medium text-purple-800 mb-1">Custom CSS</div>
                        <div className="text-sm text-purple-700">Add glassmorphism and gradient styles</div>
                      </div>
                      <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                        <div className="font-medium text-pink-800 mb-1">Component Styles</div>
                        <div className="text-sm text-pink-700">Maintain Tailwind classes in components</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Visual Editor Benefits</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Live preview of changes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Non-technical users can edit</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">A/B testing capabilities</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Responsive design tools</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Content scheduling</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deployment Tab */}
          <TabsContent value="deployment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Deployment Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-medium text-blue-800 mb-1">Static Export</div>
                      <div className="text-sm text-blue-700">Export as static HTML/CSS/JS files</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="font-medium text-green-800 mb-1">Vercel/Netlify</div>
                      <div className="text-sm text-green-700">Deploy with your existing React app</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="font-medium text-purple-800 mb-1">Builder.io Hosting</div>
                      <div className="text-sm text-purple-700">Use Builder's built-in hosting</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button 
                      className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      onClick={() => window.open('https://builder.io', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Create Builder.io Account
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('https://www.builder.io/c/docs/developers', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Read Documentation
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('https://www.builder.io/c/docs/react', '_blank')}
                    >
                      <Code2 className="w-4 h-4 mr-2" />
                      React Integration Guide
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('https://www.builder.io/c/docs/figma', '_blank')}
                    >
                      <Figma className="w-4 h-4 mr-2" />
                      Figma Plugin Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Checklist */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>Implementation Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Setup Tasks</h4>
                    <div className="space-y-2">
                      {[
                        'Create Builder.io account',
                        'Get API key from dashboard',
                        'Install @builder.io/react package',
                        'Create builder.config.js file',
                        'Register your components',
                        'Test local development'
                      ].map((task, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                          <span className="text-sm">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Content Creation</h4>
                    <div className="space-y-2">
                      {[
                        'Create page models in Builder.io',
                        'Design your first page visually',
                        'Test responsive breakpoints',
                        'Set up content preview',
                        'Configure deployment',
                        'Go live with your design!'
                      ].map((task, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                          <span className="text-sm">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}