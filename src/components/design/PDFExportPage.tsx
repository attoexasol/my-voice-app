import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { 
  Mic, MessageCircle, FileText, Calendar, Home, LogOut, 
  User, Mail, Lock, Upload, CheckCircle, BarChart3, 
  TrendingUp, PieChart, Play, Pause, Send, Search,
  Filter, Eye, Edit, Trash2, Plus, ArrowLeft, ArrowRight,
  Printer
} from 'lucide-react';

// PDF-optimized styles for print
const pdfStyles = {
  page: "min-h-screen bg-white p-8 break-after-page",
  title: "text-3xl font-bold text-gray-900 mb-6 text-center",
  subtitle: "text-xl font-medium text-gray-700 mb-4",
  description: "text-gray-600 mb-8 text-center max-w-2xl mx-auto"
};

// Simplified Sidebar for PDF
function PDFSidebar() {
  const navItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: Mic, label: 'Voice Recorder', active: false },
    { icon: MessageCircle, label: 'AI Chatbot', active: false },
    { icon: FileText, label: 'View Invoices', active: false },
    { icon: Calendar, label: 'Calendar', active: false }
  ];

  return (
    <div className="w-20 bg-gray-100 border-r border-gray-200 flex flex-col print:shadow-none">
      {/* Logo */}
      <div className="p-4 flex justify-center border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">AI</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col gap-2 p-3">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`
                w-14 h-14 p-0 flex flex-col items-center justify-center rounded-lg border-2
                ${item.active 
                  ? 'bg-blue-500 border-blue-500 text-white' 
                  : 'bg-white border-gray-200 text-gray-700'
                }
              `}
            >
              <Icon className="w-5 h-5" />
            </div>
          );
        })}
      </div>

      {/* Sign Out */}
      <div className="p-3 border-t border-gray-200">
        <div className="w-14 h-14 p-0 bg-white border-2 border-gray-200 text-gray-700 rounded-lg flex items-center justify-center">
          <LogOut className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// Page 1: Sign Up Flow
function SignUpFlowPDF() {
  return (
    <div className={pdfStyles.page}>
      <h1 className={pdfStyles.title}>My AI Invoices - Sign Up Flow</h1>
      <p className={pdfStyles.description}>
        Multi-step onboarding process with social authentication and file uploads
      </p>
      
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2
                ${step === 1 ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300 text-gray-400'}
              `}>
                {step === 1 ? <CheckCircle className="w-5 h-5" /> : <span>{step}</span>}
              </div>
              {index < 3 && (
                <div className={`w-12 h-1 mx-2 ${step === 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Sign Up Card */}
        <Card className="border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl">Sign In to Your Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="w-full p-3 border-2 border-gray-300 rounded-lg text-center bg-white">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded"></div>
                  Continue with Google
                </div>
              </div>
              <div className="w-full p-3 border-2 border-gray-900 rounded-lg text-center bg-gray-900 text-white">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 bg-white rounded"></div>
                  Continue with GitHub
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with email</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                  Enter your email
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                  Enter your password
                </div>
              </div>
              <div className="w-full p-3 bg-blue-500 text-white text-center rounded-lg font-medium">
                Sign In
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Information */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Step 2: Upload Customer List</h4>
              <p className="text-sm text-gray-600">CSV file with customer information</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Step 3: Upload Previous Invoices</h4>
              <p className="text-sm text-gray-600">CSV file with invoice history</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Page 2: Dashboard
function DashboardPDF() {
  return (
    <div className={pdfStyles.page}>
      <h1 className={pdfStyles.title}>Dashboard - Main Navigation Hub</h1>
      <p className={pdfStyles.description}>
        Central hub with quick access to voice recording, AI chatbot, and invoice management
      </p>
      
      <div className="flex">
        <PDFSidebar />
        <div className="flex-1 pl-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">My AI Invoices Dashboard</h2>
            <p className="text-gray-600">Welcome back!</p>
          </div>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border border-gray-200 shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl">Voice Recorder</h3>
                    <p className="text-sm text-gray-600 font-normal">Record voice memos and get AI insights</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-100 text-blue-700 border border-blue-200">Voice Recording</Badge>
                    <Badge className="bg-purple-100 text-purple-700 border border-purple-200">AI Analysis</Badge>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Use voice commands to record business insights, customer feedback, or quick notes.
                  </p>
                  <div className="w-full p-3 bg-blue-500 text-white text-center rounded-lg font-medium">
                    Start Recording
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-lg">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl">AI Chatbot</h3>
                    <p className="text-sm text-gray-600 font-normal">Chat about customers and invoices</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-purple-100 text-purple-700 border border-purple-200">Smart Chat</Badge>
                    <Badge className="bg-pink-100 text-pink-700 border border-pink-200">Business Insights</Badge>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Ask questions about your customers, invoices, and business data.
                  </p>
                  <div className="w-full p-3 bg-purple-500 text-white text-center rounded-lg font-medium">
                    Start Chatting
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Features */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-green-500" />
                  Invoice Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Paid</span>
                    <Badge className="bg-green-100 text-green-700 border border-green-200">12</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Approved</span>
                    <Badge className="bg-blue-100 text-blue-700 border border-blue-200">4</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sent</span>
                    <Badge className="bg-purple-100 text-purple-700 border border-purple-200">3</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Draft</span>
                    <Badge className="bg-amber-100 text-amber-700 border border-amber-200">1</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-800">$45,280</span>
                    <Badge className="bg-green-100 text-green-700 border border-green-200">+12%</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Income</span>
                      <span>$52,400</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Costs</span>
                      <span>$7,120</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Upcoming Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="font-medium text-gray-800 text-sm">Client Review</p>
                    <p className="text-gray-600 text-xs">Tomorrow 2:00 PM</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                    <p className="font-medium text-gray-800 text-sm">Project Planning</p>
                    <p className="text-gray-600 text-xs">Friday 10:00 AM</p>
                  </div>
                  <div className="w-full p-2 border border-gray-300 rounded-lg text-center text-sm">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    View Calendar
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Page 3: Voice Recorder
function VoiceRecorderPDF() {
  return (
    <div className={pdfStyles.page}>
      <h1 className={pdfStyles.title}>Voice Recorder Interface</h1>
      <p className={pdfStyles.description}>
        Audio recording interface with real-time visualization and AI transcription
      </p>
      
      <div className="flex">
        <PDFSidebar />
        <div className="flex-1 pl-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Recording Interface */}
            <Card className="border border-gray-200 shadow-lg">
              <CardContent className="pt-8">
                <div className="text-center space-y-6">
                  {/* Microphone Button */}
                  <div className="relative mx-auto w-32 h-32">
                    <div className="w-32 h-32 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                      <Mic className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-red-300"></div>
                  </div>

                  {/* Status */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Recording...</h3>
                    <p className="text-gray-600">Duration: 00:45</p>
                  </div>

                  {/* Waveform Visualization */}
                  <div className="flex items-center justify-center gap-1 h-16">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div 
                        key={i}
                        className="w-2 bg-blue-500 rounded-full"
                        style={{ height: `${Math.random() * 60 + 20}px` }}
                      />
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center">
                      <Pause className="w-6 h-6" />
                    </div>
                    <div className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-red-500 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Recordings */}
            <Card className="border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Recordings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Client Meeting Notes", duration: "2:34", date: "Today, 3:45 PM" },
                    { title: "Project Ideas", duration: "1:12", date: "Yesterday, 10:30 AM" },
                    { title: "Customer Feedback", duration: "4:56", date: "Oct 2, 2:15 PM" }
                  ].map((recording, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                          <Play className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{recording.title}</p>
                          <p className="text-sm text-gray-600">{recording.date} • {recording.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700 border border-green-200">Transcribed</Badge>
                        <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Page 4: Invoices View
function InvoicesViewPDF() {
  return (
    <div className={pdfStyles.page}>
      <h1 className={pdfStyles.title}>Invoice Management System</h1>
      <p className={pdfStyles.description}>
        Comprehensive invoice tracking with status management and search functionality
      </p>
      
      <div className="flex">
        <PDFSidebar />
        <div className="flex-1 pl-8">
          {/* Header with Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-64 p-2 border border-gray-300 rounded-lg bg-gray-50">
                Search invoices...
              </div>
              <div className="p-2 border border-gray-300 rounded-lg bg-white flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </div>
            </div>
            <div className="p-2 bg-blue-500 text-white rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Invoice
            </div>
          </div>

          {/* Invoices Table */}
          <Card className="border border-gray-200 shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left p-4 font-medium text-gray-700">Invoice #</th>
                      <th className="text-left p-4 font-medium text-gray-700">Customer</th>
                      <th className="text-left p-4 font-medium text-gray-700">Amount</th>
                      <th className="text-left p-4 font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 font-medium text-gray-700">Date</th>
                      <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "INV-001", customer: "Acme Corporation", amount: "$2,500.00", status: "paid", date: "Sep 15, 2024" },
                      { id: "INV-002", customer: "Tech Solutions Ltd", amount: "$1,800.00", status: "approved", date: "Sep 20, 2024" },
                      { id: "INV-003", customer: "Global Industries", amount: "$3,200.00", status: "sent", date: "Sep 25, 2024" },
                      { id: "INV-004", customer: "StartupXYZ", amount: "$950.00", status: "draft", date: "Oct 1, 2024" }
                    ].map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-100">
                        <td className="p-4 font-medium text-blue-600">{invoice.id}</td>
                        <td className="p-4 text-gray-800">{invoice.customer}</td>
                        <td className="p-4 font-medium text-gray-800">{invoice.amount}</td>
                        <td className="p-4">
                          <Badge className={
                            `border ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
                              invoice.status === 'approved' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                              invoice.status === 'sent' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                              'bg-amber-100 text-amber-700 border-amber-200'
                            }`
                          }>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-gray-600">{invoice.date}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                              <Eye className="w-4 h-4" />
                            </div>
                            <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                              <Edit className="w-4 h-4" />
                            </div>
                            <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                              <Trash2 className="w-4 h-4" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">Showing 1-4 of 20 invoices</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-blue-500 text-white rounded flex items-center justify-center font-medium">1</div>
              <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">2</div>
              <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">3</div>
              <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Page 5: Design System Overview
function DesignSystemPDF() {
  return (
    <div className={pdfStyles.page}>
      <h1 className={pdfStyles.title}>My AI Invoices - Design System</h1>
      <p className={pdfStyles.description}>
        Complete design tokens, color palette, and component specifications
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Color Palette */}
        <div>
          <h2 className="text-xl font-bold mb-4">Color Palette</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Primary Colors</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto mb-2"></div>
                  <div className="text-xs font-mono">#3b82f6</div>
                  <div className="text-xs">Blue</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-lg mx-auto mb-2"></div>
                  <div className="text-xs font-mono">#8b5cf6</div>
                  <div className="text-xs">Purple</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-pink-500 rounded-lg mx-auto mb-2"></div>
                  <div className="text-xs font-mono">#ec4899</div>
                  <div className="text-xs">Pink</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Status Colors</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-1"></div>
                  <div className="text-xs">Success</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-500 rounded-lg mx-auto mb-1"></div>
                  <div className="text-xs">Warning</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-500 rounded-lg mx-auto mb-1"></div>
                  <div className="text-xs">Error</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-500 rounded-lg mx-auto mb-1"></div>
                  <div className="text-xs">Neutral</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div>
          <h2 className="text-xl font-bold mb-4">Typography Scale</h2>
          <div className="space-y-3">
            <div>
              <div className="text-3xl font-bold">Heading 1</div>
              <div className="text-sm text-gray-600">32px • Bold • Page titles</div>
            </div>
            <div>
              <div className="text-2xl font-bold">Heading 2</div>
              <div className="text-sm text-gray-600">24px • Bold • Section titles</div>
            </div>
            <div>
              <div className="text-xl font-medium">Heading 3</div>
              <div className="text-sm text-gray-600">20px • Medium • Card titles</div>
            </div>
            <div>
              <div className="text-base font-normal">Body Text</div>
              <div className="text-sm text-gray-600">16px • Normal • Content</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Caption Text</div>
              <div className="text-sm text-gray-600">14px • Normal • Metadata</div>
            </div>
          </div>
        </div>

        {/* Component Specifications */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Component Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-3">Buttons</h3>
              <div className="space-y-2">
                <div className="w-full p-3 bg-blue-500 text-white text-center rounded-lg">Primary Button</div>
                <div className="w-full p-3 border-2 border-gray-300 text-center rounded-lg">Secondary Button</div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Height: 40px (default), 48px (large)</div>
                  <div>Border radius: 8px</div>
                  <div>Padding: 16px horizontal</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Cards</h3>
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm">Sample card content with border and shadow</p>
                </CardContent>
              </Card>
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                <div>Background: White with subtle shadow</div>
                <div>Border: Gray 200</div>
                <div>Border radius: 12px</div>
                <div>Padding: 16px</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Status Badges</h3>
              <div className="space-y-2">
                <Badge className="bg-green-100 text-green-700 border border-green-200">Paid</Badge>
                <Badge className="bg-blue-100 text-blue-700 border border-blue-200">Approved</Badge>
                <Badge className="bg-purple-100 text-purple-700 border border-purple-200">Sent</Badge>
                <Badge className="bg-amber-100 text-amber-700 border border-amber-200">Draft</Badge>
              </div>
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                <div>Border radius: 6px</div>
                <div>Padding: 4px 8px</div>
                <div>Font weight: Medium</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main PDF Export Component
export function PDFExportPage() {
  return (
    <div className="print:m-0 print:p-0">
      {/* Print Instructions - Hidden when printing */}
      <div className="print:hidden bg-blue-50 p-6 border-b border-blue-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Printer className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-blue-900">PDF Export Ready</h1>
          </div>
          <p className="text-blue-700 mb-4">
            Your My AI Invoices UI designs are ready for PDF export. Use your browser's print function to save as PDF.
          </p>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">How to Export:</h3>
            <ol className="text-left text-blue-800 space-y-1">
              <li>1. Press <kbd className="bg-blue-100 px-2 py-1 rounded">Ctrl+P</kbd> (or <kbd className="bg-blue-100 px-2 py-1 rounded">Cmd+P</kbd> on Mac)</li>
              <li>2. Choose "Save as PDF" as destination</li>
              <li>3. Set margins to "None" for best results</li>
              <li>4. Enable "Background graphics" for full design</li>
              <li>5. Click "Save" to download your PDF</li>
            </ol>
          </div>
        </div>
      </div>

      {/* PDF Pages */}
      <SignUpFlowPDF />
      <DashboardPDF />
      <VoiceRecorderPDF />
      <InvoicesViewPDF />
      <DesignSystemPDF />
    </div>
  );
}