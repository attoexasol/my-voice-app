import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, Inbox, AlertCircle, CheckCircle, Clock, Search, Building2, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { MyAIInvoicesLogo } from './MyAIInvoicesLogo';

// Get the Supabase URL from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
import { SidebarNavigation } from './SidebarNavigation';

interface EmailInboxProps {
  accessToken: string;
  onSignOut: () => void;
}

type EmailProvider = 'gmail' | 'outlook' | 'imap';

interface EmailConfig {
  provider: EmailProvider;
  email: string;
  connected_at: string;
}

interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  isQuoteRelated: boolean;
  priority: 'high' | 'medium' | 'low';
  hasAttachment: boolean;
  threadId: string;
  confidence?: number;
  detectionMethod?: string;
  matchedKeywords?: string[];
  reasoning?: string;
}

export function EmailInbox({ accessToken, onSignOut }: EmailInboxProps) {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'quotes' | 'unread'>('quotes');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [daysBack, setDaysBack] = useState<number>(30);
  const [dateRangeInfo, setDateRangeInfo] = useState<{from: string, to: string} | null>(null);
  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider>('gmail');
  const [showImapDialog, setShowImapDialog] = useState(false);
  const [imapConfig, setImapConfig] = useState({
    email: '',
    password: '',
    imapHost: '',
    imapPort: '993',
    smtpHost: '',
    smtpPort: '587',
  });

  useEffect(() => {
    checkEmailConnection();
  }, []);

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        fetchEmails(true);
      }, 120000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const checkEmailConnection = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-31b2da65/email-status`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setIsConnected(data.connected);
        if (data.connected) {
          setEmailConfig(data.config);
          fetchEmails();
        }
      }
    } catch (err) {
      console.error('Error checking email connection:', err);
    }
  };

  const connectEmail = async (provider: EmailProvider, config?: any) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-31b2da65/connect-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ provider, config })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect email');
      }
      if (data.authUrl) {
        const providerName = provider === 'gmail' ? 'Gmail' : 'Outlook';
        window.open(data.authUrl, `${provider}-auth`, 'width=600,height=700');
        toast.info(`Please authorize access to your ${providerName} account in the popup window`);
        const pollInterval = setInterval(async () => {
          await checkEmailConnection();
          if (isConnected) {
            clearInterval(pollInterval);
            toast.success(`${providerName} connected successfully!`);
          }
        }, 3000);
        setTimeout(() => clearInterval(pollInterval), 300000);
      } else if (data.success) {
        await checkEmailConnection();
        toast.success('Email connected successfully!');
        setShowImapDialog(false);
      }
    } catch (err: any) {
      console.error('Error connecting email:', err);
      setError(err.message);
      toast.error('Failed to connect email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImapConnect = () => {
    if (!imapConfig.email || !imapConfig.password || !imapConfig.imapHost) {
      toast.error('Please fill in all required fields');
      return;
    }
    connectEmail('imap', imapConfig);
  };

  const fetchEmails = async (silent = false, customDaysBack?: number) => {
    if (!silent) setIsLoading(true);
    setError('');
    try {
      const days = customDaysBack !== undefined ? customDaysBack : daysBack;
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-31b2da65/emails?daysBack=${days}&maxResults=50`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch emails');
      }
      setEmails(data.emails || []);
      setLastSync(new Date());
      if (data.dateRange) setDateRangeInfo(data.dateRange);
      const newQuoteEmails = (data.emails || []).filter((email: EmailMessage) => email.isQuoteRelated);
      if (!silent && newQuoteEmails.length > 0) {
        toast.success(`Found ${newQuoteEmails.length} quote-related email(s) from the last ${days} days`);
      } else if (!silent && data.emails?.length > 0) {
        toast.success(`Loaded ${data.emails.length} email(s) from the last ${days} days`);
      }
    } catch (err: any) {
      console.error('Error fetching emails:', err);
      if (!silent) {
        setError(err.message);
        toast.error('Failed to fetch emails');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleDateRangeChange = (days: number) => {
    setDaysBack(days);
    fetchEmails(false, days);
  };

  const disconnectEmail = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/make-server-31b2da65/disconnect-email`,
        { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      if (response.ok) {
        setIsConnected(false);
        setEmails([]);
        setEmailConfig(null);
        toast.success('Email disconnected');
      }
    } catch (err) {
      console.error('Error disconnecting email:', err);
      toast.error('Failed to disconnect email');
    }
  };

  const getProviderIcon = (provider: EmailProvider) => {
    switch (provider) {
      case 'gmail':
        return <Mail className="w-5 h-5 text-red-500" />;
      case 'outlook':
        return <Mail className="w-5 h-5 text-blue-500" />;
      case 'imap':
        return <Building2 className="w-5 h-5 text-gray-500" />;
      default:
        return <Mail className="w-5 h-5" />;
    }
  };

  const getProviderName = (provider: EmailProvider) => {
    switch (provider) {
      case 'gmail':
        return 'Gmail';
      case 'outlook':
        return 'Outlook';
      case 'imap':
        return 'Business Email';
      default:
        return 'Email';
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'quotes') return matchesSearch && email.isQuoteRelated;
    if (filterType === 'unread') return matchesSearch; // placeholder
    return matchesSearch;
  });

  const quoteEmailCount = emails.filter(e => e.isQuoteRelated).length;

  return (
    <div className="min-h-screen">
      <SidebarNavigation onSignOut={onSignOut} />
      <div className="ml-20 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <MyAIInvoicesLogo height={40} />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Email Inbox</h1>
                <p className="text-gray-600">Monitor quote inquiries from customers</p>
              </div>
            </div>
            {isConnected && (
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">{lastSync && `Last synced: ${lastSync.toLocaleTimeString()}`}</div>
                <Select value={daysBack.toString()} onValueChange={(v) => handleDateRangeChange(parseInt(v))}>
                  <SelectTrigger className="w-40 bg-white/60 backdrop-blur-sm border border-white/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="60">Last 60 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => fetchEmails()} disabled={isLoading} variant="outline" size="sm" className="bg-white/60 backdrop-blur-sm border border-white/30">
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            )}
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {!isConnected ? (
            <Card className="max-w-3xl mx-auto border-2 border-transparent bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg pointer-events-none" />
              <CardHeader className="relative z-10 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Mail className="w-10 h-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Connect Your Email</CardTitle>
                <CardDescription className="text-base mt-2">Connect your email account to automatically detect and respond to quote inquiries from customers</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-800">What you'll get:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /><span>Automatic detection of quote-related emails</span></li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /><span>Real-time notifications for new inquiries</span></li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /><span>Quick access to respond to customers</span></li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /><span>AI-powered analysis of customer questions</span></li>
                  </ul>
                </div>
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700 text-sm">We only read emails related to quotes and invoices. Your privacy is important to us.</AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={() => { setSelectedProvider('gmail'); connectEmail('gmail'); }} disabled={isLoading} className="h-auto py-6 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-red-300 flex flex-col gap-3" variant="outline">
                    <Mail className="w-8 h-8 text-red-500" />
                    <div>
                      <div className="font-semibold">Gmail</div>
                      <div className="text-xs text-gray-500">Google Workspace</div>
                    </div>
                  </Button>
                  <Button onClick={() => { setSelectedProvider('outlook'); connectEmail('outlook'); }} disabled={isLoading} className="h-auto py-6 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-blue-300 flex flex-col gap-3" variant="outline">
                    <Mail className="w-8 h-8 text-blue-500" />
                    <div>
                      <div className="font-semibold">Outlook</div>
                      <div className="text-xs text-gray-500">Microsoft 365</div>
                    </div>
                  </Button>
                  <Button onClick={() => { setSelectedProvider('imap'); setShowImapDialog(true); }} disabled={isLoading} className="h-auto py-6 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 hover:border-purple-300 flex flex-col gap-3" variant="outline">
                    <Building2 className="w-8 h-8 text-purple-500" />
                    <div>
                      <div className="font-semibold">Business Email</div>
                      <div className="text-xs text-gray-500">IMAP/SMTP</div>
                    </div>
                  </Button>
                </div>
                {isLoading && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting to {getProviderName(selectedProvider)}...
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-blue-700">Quote Inquiries</p><p className="text-3xl font-bold text-blue-900">{quoteEmailCount}</p></div><Mail className="w-10 h-10 text-blue-500" /></div></CardContent></Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-purple-700">Total Emails</p><p className="text-3xl font-bold text-purple-900">{emails.length}</p></div><Inbox className="w-10 h-10 text-purple-500" /></div></CardContent></Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-green-700">Provider</p><p className="text-lg font-bold text-green-900">{emailConfig ? getProviderName(emailConfig.provider) : 'N/A'}</p></div>{emailConfig && getProviderIcon(emailConfig.provider)}</div></CardContent></Card>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-orange-700">Status</p><p className="text-lg font-bold text-orange-900">Connected</p></div><CheckCircle className="w-10 h-10 text-orange-500" /></div></CardContent></Card>
              </div>
              <Card className="bg-white/80 backdrop-blur-sm border border-white/30"><CardContent className="pt-6"><div className="flex flex-col sm:flex-row gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search emails..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white/60 backdrop-blur-sm border border-white/30" /></div><Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)} className="w-full sm:w-auto"><TabsList className="bg-white/60 backdrop-blur-sm"><TabsTrigger value="quotes">Quote Emails</TabsTrigger><TabsTrigger value="all">All Emails</TabsTrigger></TabsList></Tabs></div>{dateRangeInfo && (<div className="mt-3 text-xs text-gray-500 flex items-center gap-2"><Clock className="w-3 h-3" />Showing emails from {new Date(dateRangeInfo.from).toLocaleDateString()} to {new Date(dateRangeInfo.to).toLocaleDateString()}</div>)}</CardContent></Card>
              {isLoading && emails.length === 0 ? (
                <Card><CardContent className="pt-6 text-center"><RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" /><p className="text-gray-600">Loading emails...</p></CardContent></Card>
              ) : filteredEmails.length === 0 ? (
                <Card><CardContent className="pt-6 text-center py-12"><Inbox className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-600 text-lg mb-2">No emails found</p><p className="text-gray-500 text-sm">{filterType === 'quotes' ? 'No quote-related emails at the moment' : 'Your inbox is empty'}</p></CardContent></Card>
              ) : (
                <ScrollArea className="h-[600px]"><div className="space-y-3">{filteredEmails.map((email) => (<Card key={email.id} className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${email.isQuoteRelated ? 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-white' : 'bg-white/80 backdrop-blur-sm border border-white/30'}`}><CardContent className="pt-6"><div className="flex items-start justify-between gap-4"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-2"><h3 className="font-semibold text-gray-900 truncate">{email.subject}</h3>{email.isQuoteRelated && (<div className="flex items-center gap-2"><Badge className="bg-blue-500 text-white shrink-0">Quote Inquiry</Badge>{email.confidence !== undefined && (<Badge variant="outline" className="shrink-0 text-xs">{email.confidence}% match</Badge>)}</div>)}{email.priority === 'high' && (<Badge variant="destructive" className="shrink-0">High Priority</Badge>)}</div><p className="text-sm text-gray-600 mb-2">From: <span className="font-medium">{email.from}</span></p><p className="text-sm text-gray-700 line-clamp-2">{email.snippet}</p><div className="flex items-center gap-4 mt-3 text-xs text-gray-500 flex-wrap"><div className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(email.date).toLocaleString()}</div>{email.hasAttachment && (<Badge variant="outline" className="text-xs">Has Attachment</Badge>)}{email.matchedKeywords && email.matchedKeywords.length > 0 && (<div className="flex items-center gap-1" title={email.matchedKeywords.join(', ')}><Badge variant="outline" className="text-xs bg-green-50">Keywords: {email.matchedKeywords.slice(0, 2).join(', ')}{email.matchedKeywords.length > 2 && ` +${email.matchedKeywords.length - 2}`}</Badge></div>)}</div>{email.reasoning && (<div className="mt-2 text-xs text-gray-600 italic bg-blue-50 p-2 rounded">💡 {email.reasoning}</div>)}</div><Button size="sm" variant="outline" className="shrink-0" onClick={() => window.open(`https://mail.google.com/mail/u/0/#inbox/${email.threadId}`, '_blank')}><ExternalLink className="w-4 h-4" /></Button></div></CardContent></Card>))}</div></ScrollArea>
              )}
              <div className="flex justify-center pt-4"><Button onClick={disconnectEmail} variant="outline" size="sm" className="text-red-600 hover:bg-red-50">Disconnect Email</Button></div>
            </div>
          )}
        </div>

        <Dialog open={showImapDialog} onOpenChange={setShowImapDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Building2 className="w-6 h-6 text-purple-500" />Connect Business Email (IMAP/SMTP)</DialogTitle>
              <DialogDescription>Enter your business email server details. These are usually provided by your email administrator or hosting provider.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label htmlFor="email">Email Address *</Label><Input id="email" type="email" placeholder="you@company.com" value={imapConfig.email} onChange={(e) => setImapConfig({ ...imapConfig, email: e.target.value })} className="bg-white/60 backdrop-blur-sm" /></div>
              <div className="space-y-2"><Label htmlFor="password">Password or App Password *</Label><Input id="password" type="password" placeholder="••••••••" value={imapConfig.password} onChange={(e) => setImapConfig({ ...imapConfig, password: e.target.value })} className="bg-white/60 backdrop-blur-sm" /><p className="text-xs text-gray-500">Use an app-specific password if your email requires it</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="imapHost">IMAP Server *</Label><Input id="imapHost" placeholder="imap.company.com" value={imapConfig.imapHost} onChange={(e) => setImapConfig({ ...imapConfig, imapHost: e.target.value })} className="bg-white/60 backdrop-blur-sm" /></div>
                <div className="space-y-2"><Label htmlFor="imapPort">IMAP Port</Label><Input id="imapPort" placeholder="993" value={imapConfig.imapPort} onChange={(e) => setImapConfig({ ...imapConfig, imapPort: e.target.value })} className="bg-white/60 backdrop-blur-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="smtpHost">SMTP Server (optional)</Label><Input id="smtpHost" placeholder="smtp.company.com" value={imapConfig.smtpHost} onChange={(e) => setImapConfig({ ...imapConfig, smtpHost: e.target.value })} className="bg-white/60 backdrop-blur-sm" /></div>
                <div className="space-y-2"><Label htmlFor="smtpPort">SMTP Port</Label><Input id="smtpPort" placeholder="587" value={imapConfig.smtpPort} onChange={(e) => setImapConfig({ ...imapConfig, smtpPort: e.target.value })} className="bg-white/60 backdrop-blur-sm" /></div>
              </div>
              <Alert className="border-blue-200 bg-blue-50"><AlertCircle className="h-4 w-4 text-blue-600" /><AlertDescription className="text-blue-700 text-sm"><strong>Common IMAP Settings:</strong><ul className="mt-2 space-y-1 text-xs"><li>• Gmail: imap.gmail.com:993 (requires App Password)</li><li>• Outlook: outlook.office365.com:993</li><li>• Yahoo: imap.mail.yahoo.com:993</li><li>• Custom: Contact your email provider</li></ul></AlertDescription></Alert>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowImapDialog(false); setImapConfig({ email: '', password: '', imapHost: '', imapPort: '993', smtpHost: '', smtpPort: '587', }); }}>Cancel</Button>
              <Button onClick={handleImapConnect} disabled={isLoading || !imapConfig.email || !imapConfig.password || !imapConfig.imapHost} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">{isLoading ? (<><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Connecting...</>) : (<><CheckCircle className="w-4 h-4 mr-2" />Connect Email</>)}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}


