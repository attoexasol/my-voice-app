import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Mail,
  Building2,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export function EmailProviderSetup() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Email Provider Setup Guide
        </h1>
        <p className="text-gray-600">
          Choose your email provider and follow the setup instructions
        </p>
      </div>
      <Tabs defaultValue="gmail" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gmail">
            <Mail className="w-4 h-4 mr-2 text-red-500" />
            Gmail
          </TabsTrigger>
          <TabsTrigger value="outlook">
            <Mail className="w-4 h-4 mr-2 text-blue-500" />
            Outlook
          </TabsTrigger>
          <TabsTrigger value="imap">
            <Building2 className="w-4 h-4 mr-2 text-purple-500" />
            Business Email
          </TabsTrigger>
        </TabsList>
        <TabsContent value="gmail" className="space-y-4">
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-6 h-6 text-red-500" />
                Gmail Setup
              </CardTitle>
              <CardDescription>
                Connect your Gmail or Google Workspace account using OAuth 2.0
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>Quick Start:</strong> Click the Gmail button in Email
                  Inbox and authorize via Google.
                </AlertDescription>
              </Alert>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Setup Steps:</h4>
                <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                  <li>Click "Connect Gmail" in Email Inbox</li>
                  <li>Authorize in Google popup</li>
                  <li>Emails will sync automatically</li>
                </ol>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">What We Access:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Read-only access to emails</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Email metadata for quote detection</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">
                  <strong>Secure:</strong> OAuth 2.0. We never see your
                  password.
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="outlook" className="space-y-4">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-6 h-6 text-blue-500" />
                Outlook Setup
              </CardTitle>
              <CardDescription>
                Connect your Outlook or Office 365 account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>Quick Start:</strong> Click the Outlook button and
                  authorize with Microsoft.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">
                  Supported Accounts:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Outlook.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Office 365</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">
                  <strong>Secure:</strong> Microsoft Graph OAuth 2.0.
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="imap" className="space-y-4">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-purple-500" />
                Business Email Setup (IMAP)
              </CardTitle>
              <CardDescription>
                Connect any email provider that supports IMAP/SMTP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  <strong>Important:</strong> You need your IMAP/SMTP server
                  settings and an app password.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">
                  Common IMAP Settings:
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-white rounded border">
                    <div className="font-medium">Gmail</div>
                    <div className="text-xs text-gray-600">
                      imap.gmail.com:993
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <div className="font-medium">Office 365</div>
                    <div className="text-xs text-gray-600">
                      outlook.office365.com:993
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">
                  <strong>Secure:</strong> All connections use SSL/TLS.
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
