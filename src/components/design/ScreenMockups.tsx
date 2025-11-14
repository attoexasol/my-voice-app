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
  Filter, Eye, Edit, Trash2, Plus, ArrowLeft, ArrowRight
} from 'lucide-react';
import { ScreenTemplate } from './DesignSystem';

// 1. Sign Up Flow Screens
export function SignUpMockup() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-xl">AI</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome to My AI Invoices
          </h1>
          <p className="text-gray-600">Let's get you set up in just a few steps</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                ${step === 1 ? 'bg-blue-500 border-blue-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}
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
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Sign In to Your Account</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <Button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3">
                <div className="w-5 h-5 bg-red-500 rounded"></div>
                Continue with Google
              </Button>
              <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center gap-3">
                <div className="w-5 h-5 bg-white rounded"></div>
                Continue with GitHub
              </Button>
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
                <Input type="email" placeholder="Enter your email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input type="password" placeholder="Enter your password" />
              </div>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 2. Dashboard Screen
export function DashboardMockup() {
  return (
    <ScreenTemplate title="My AI Invoices Dashboard">
      <div className="space-y-8">
        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl">Voice Recorder</h3>
                  <p className="text-sm text-gray-600 font-normal">Record voice memos and get AI insights</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">Voice Recording</Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">AI Analysis</Badge>
                </div>
                <p className="text-gray-600 text-sm">
                  Use voice commands to record business insights, customer feedback, or quick notes.
                </p>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  Start Recording
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl">AI Chatbot</h3>
                  <p className="text-sm text-gray-600 font-normal">Chat about customers and invoices</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">Smart Chat</Badge>
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700">Business Insights</Badge>
                </div>
                <p className="text-gray-600 text-sm">
                  Ask questions about your customers, invoices, and business data.
                </p>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Start Chatting
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoices Overview */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-500" />
                Invoice Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paid</span>
                  <Badge className="bg-green-100 text-green-700">12</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Approved</span>
                  <Badge className="bg-blue-100 text-blue-700">4</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sent</span>
                  <Badge className="bg-purple-100 text-purple-700">3</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Draft</span>
                  <Badge className="bg-amber-100 text-amber-700">1</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Preview */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-800">$45,280</span>
                  <Badge className="bg-green-100 text-green-700">+12%</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Income</span>
                    <span>$52,400</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Costs</span>
                    <span>$7,120</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Preview */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Upcoming Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-medium text-gray-800 text-sm">Client Review</p>
                  <p className="text-gray-600 text-xs">Tomorrow 2:00 PM</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="font-medium text-gray-800 text-sm">Project Planning</p>
                  <p className="text-gray-600 text-xs">Friday 10:00 AM</p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScreenTemplate>
  );
}

// 3. Voice Recorder Screen
export function VoiceRecorderMockup() {
  return (
    <ScreenTemplate title="Voice Recorder">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Recording Interface */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardContent className="pt-8">
            <div className="text-center space-y-6">
              {/* Microphone Button */}
              <div className="relative">
                <Button 
                  size="lg"
                  className="w-32 h-32 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-2xl"
                >
                  <Mic className="w-12 h-12 text-white" />
                </Button>
                <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-red-300 animate-ping"></div>
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
                    className="w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full animate-pulse"
                    style={{ 
                      height: `${Math.random() * 60 + 20}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="lg" className="rounded-full">
                  <Pause className="w-6 h-6" />
                </Button>
                <Button variant="outline" size="lg" className="rounded-full">
                  <div className="w-6 h-6 bg-red-500 rounded-sm"></div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Recordings */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
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
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="ghost" className="p-2">
                      <Play className="w-4 h-4" />
                    </Button>
                    <div>
                      <p className="font-medium text-gray-800">{recording.title}</p>
                      <p className="text-sm text-gray-600">{recording.date} • {recording.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Transcribed</Badge>
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScreenTemplate>
  );
}

// 4. Invoices View Screen
export function InvoicesViewMockup() {
  return (
    <ScreenTemplate title="Invoice Management">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input placeholder="Search invoices..." className="w-64" />
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>

        {/* Invoices Table */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
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
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="p-4 font-medium text-blue-600">{invoice.id}</td>
                      <td className="p-4 text-gray-800">{invoice.customer}</td>
                      <td className="p-4 font-medium text-gray-800">{invoice.amount}</td>
                      <td className="p-4">
                        <Badge className={
                          invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          invoice.status === 'sent' ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'
                        }>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-gray-600">{invoice.date}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing 1-4 of 20 invoices</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-500 text-white">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </ScreenTemplate>
  );
}

// Export all mockups
export function AllScreenMockups() {
  return (
    <div className="space-y-16">
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">My AI Invoices - Screen Designs</h2>
      </section>
      
      <section>
        <h3 className="text-2xl font-bold mb-4">1. Sign Up Flow</h3>
        <SignUpMockup />
      </section>
      
      <section>
        <h3 className="text-2xl font-bold mb-4">2. Dashboard</h3>
        <DashboardMockup />
      </section>
      
      <section>
        <h3 className="text-2xl font-bold mb-4">3. Voice Recorder</h3>
        <VoiceRecorderMockup />
      </section>
      
      <section>
        <h3 className="text-2xl font-bold mb-4">4. Invoices View</h3>
        <InvoicesViewMockup />
      </section>
    </div>
  );
}