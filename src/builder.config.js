// Builder.io configuration for My AI Invoices
import { builder } from '@builder.io/react';

// Register your existing components with Builder.io
import { Dashboard } from './components/Dashboard';
import { VoiceRecorder } from './components/VoiceRecorder';
import { ChatBot } from './components/ChatBot';
import { InvoicesView } from './components/InvoicesView';
import { InvoiceDashboard } from './components/InvoiceDashboard';
import { CalendarView } from './components/CalendarView';
import { SidebarNavigation } from './components/SidebarNavigation';
import { AuthPage } from './pages/AuthPage';
import { MyAIInvoicesLogo } from './components/MyAIInvoicesLogo';

// Initialize Builder with your API key (you'll get this from builder.io)
// In browser environments, we'll initialize this later in the component
const getBuilderApiKey = () => {
  // Try to get from window object (set by build process)
  if (typeof window !== 'undefined' && window.process?.env) {
    return window.process.env.REACT_APP_BUILDER_API_KEY;
  }
  // Fallback for development
  return null;
};

// Only initialize if we have an API key
const apiKey = getBuilderApiKey();
if (apiKey && apiKey !== 'YOUR_BUILDER_API_KEY') {
  builder.init(apiKey);
}

// Register Dashboard component
builder.register('component', Dashboard, {
  name: 'AI Invoices Dashboard',
  description: 'Main dashboard with invoice stats and navigation cards',
  image: 'https://cdn.builder.io/api/v1/image/assets%2F%2F%2F',
  inputs: [
    {
      name: 'user',
      type: 'object',
      helperText: 'User object with id, email, and metadata',
      defaultValue: {
        id: 'demo-user',
        email: 'demo@example.com',
        user_metadata: { name: 'Demo User' }
      }
    },
    {
      name: 'onNavigate',
      type: 'function',
      helperText: 'Function called when navigating to different views'
    },
    {
      name: 'onSignOut',
      type: 'function',
      helperText: 'Function called when user signs out'
    }
  ],
  tags: ['dashboard', 'main', 'ai-invoices']
});

// Register Sidebar Navigation
builder.register('component', SidebarNavigation, {
  name: 'AI Invoices Sidebar',
  description: 'Glassmorphism sidebar with navigation icons',
  image: 'https://cdn.builder.io/api/v1/image/assets%2F%2F%2F',
  inputs: [
    {
      name: 'currentView',
      type: 'string',
      enum: ['dashboard', 'recorder', 'chatbot', 'invoices', 'calendar'],
      defaultValue: 'dashboard',
      helperText: 'Currently active view'
    },
    {
      name: 'onNavigate',
      type: 'function',
      helperText: 'Navigation handler function'
    },
    {
      name: 'onSignOut',
      type: 'function',
      helperText: 'Sign out handler function'
    }
  ],
  tags: ['navigation', 'sidebar', 'glassmorphism']
});

// Register Voice Recorder
builder.register('component', VoiceRecorder, {
  name: 'Voice Recorder',
  description: 'Audio recording interface with AI transcription',
  image: 'https://cdn.builder.io/api/v1/image/assets%2F%2F%2F',
  inputs: [
    {
      name: 'accessToken',
      type: 'string',
      helperText: 'User access token for API calls',
      defaultValue: 'demo-token'
    },
    {
      name: 'onNavigate',
      type: 'function',
      helperText: 'Navigation handler'
    },
    {
      name: 'onSignOut',
      type: 'function',
      helperText: 'Sign out handler'
    }
  ],
  tags: ['voice', 'recording', 'ai', 'audio']
});

// Register ChatBot
builder.register('component', ChatBot, {
  name: 'AI Chatbot',
  description: 'AI chatbot for business insights and customer queries',
  image: 'https://cdn.builder.io/api/v1/image/assets%2F%2F%2F',
  inputs: [
    {
      name: 'user',
      type: 'object',
      defaultValue: {
        id: 'demo-user',
        email: 'demo@example.com',
        user_metadata: { name: 'Demo User' }
      }
    },
    {
      name: 'accessToken',
      type: 'string',
      defaultValue: 'demo-token'
    },
    {
      name: 'onNavigate',
      type: 'function'
    },
    {
      name: 'onSignOut',
      type: 'function'
    }
  ],
  tags: ['ai', 'chatbot', 'conversation', 'insights']
});

// Register Invoices View
builder.register('component', InvoicesView, {
  name: 'Invoices Management',
  description: 'Invoice listing with status tracking and management',
  image: 'https://cdn.builder.io/api/v1/image/assets%2F%2F%2F',
  inputs: [
    {
      name: 'accessToken',
      type: 'string',
      defaultValue: 'demo-token'
    },
    {
      name: 'onNavigate',
      type: 'function'
    },
    {
      name: 'onSignOut',
      type: 'function'
    },
    {
      name: 'onViewDashboard',
      type: 'function',
      helperText: 'Function to navigate to invoice dashboard'
    }
  ],
  tags: ['invoices', 'management', 'table', 'data']
});

// Register Invoice Dashboard
builder.register('component', InvoiceDashboard, {
  name: 'Invoice Analytics Dashboard',
  description: 'Charts and analytics for invoice data',
  image: 'https://cdn.builder.io/api/v1/image/assets%2F%2F%2F',
  inputs: [
    {
      name: 'accessToken',
      type: 'string',
      defaultValue: 'demo-token'
    },
    {
      name: 'onNavigate',
      type: 'function'
    },
    {
      name: 'onSignOut',
      type: 'function'
    }
  ],
  tags: ['analytics', 'charts', 'dashboard', 'invoices']
});

// Register Calendar View
builder.register('component', CalendarView, {
  name: 'Calendar & Meetings',
  description: 'Customer meetings and appointment calendar',
  image: 'https://cdn.builder.io/api/v1/image/assets%2F%2F%2F',
  inputs: [
    {
      name: 'onNavigate',
      type: 'function'
    },
    {
      name: 'onSignOut',
      type: 'function'
    }
  ],
  tags: ['calendar', 'meetings', 'appointments', 'schedule']
});

// Register Logo component
builder.register('component', MyAIInvoicesLogo, {
  name: 'My AI Invoices Logo',
  description: 'Brand logo component',
  image: 'https://cdn.builder.io/api/v1/image/assets%2F%2F%2F',
  inputs: [
    {
      name: 'height',
      type: 'number',
      defaultValue: 48,
      helperText: 'Logo height in pixels'
    },
    {
      name: 'className',
      type: 'string',
      helperText: 'Additional CSS classes'
    }
  ],
  tags: ['logo', 'brand', 'ai-invoices']
});

// Register Auth Page
builder.register('component', AuthPage, {
  name: 'Auth Page',
  description: 'Simple sign up and sign in with social auth',
  image: 'https://cdn.builder.io/api/v1/image/assets%2F%2F%2F',
  inputs: [
    {
      name: 'onComplete',
      type: 'function',
      helperText: 'Function called when sign up is complete'
    },
    {
      name: 'supabase',
      type: 'object',
      helperText: 'Supabase client instance'
    }
  ],
  tags: ['auth', 'signup', 'signin', 'social']
});

// Define custom CSS for Builder.io to maintain your design system
builder.register('insertMenu', {
  name: 'My AI Invoices Components',
  items: [
    { 
      name: 'AI Invoices Dashboard',
      component: Dashboard
    },
    { 
      name: 'Sidebar Navigation',
      component: SidebarNavigation
    },
    { 
      name: 'Voice Recorder',
      component: VoiceRecorder
    },
    { 
      name: 'AI Chatbot',
      component: ChatBot
    },
    { 
      name: 'Invoices Management',
      component: InvoicesView
    },
    { 
      name: 'Invoice Analytics',
      component: InvoiceDashboard
    },
    { 
      name: 'Calendar View',
      component: CalendarView
    }
  ]
});

export default builder;