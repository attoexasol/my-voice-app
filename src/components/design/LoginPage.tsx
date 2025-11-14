import React from 'react';
import { Button } = '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Mail, Lock, Chrome, Apple } from 'lucide-react';
import { MyAIInvoicesLogo } from '../MyAIInvoicesLogo';

interface LoginPageProps {
  onEmailLogin?: (email: string, password: string) => void;
  onSocialLogin?: (provider: 'google' | 'apple' | 'outlook') => void;
  onSignUpClick?: () => void;
  isLoading?: boolean;
}

export function LoginPage({ 
  onEmailLogin, 
  onSocialLogin, 
  onSignUpClick, 
  isLoading = false 
}: LoginPageProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEmailLogin?.(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-lg pointer-events-none" />
        
        <CardHeader className="relative text-center space-y-4 pb-6">
          <div className="mx-auto">
            <MyAIInvoicesLogo height={64} className="mx-auto" />
          </div>
          <div>
            <CardTitle className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <p className="text-gray-600 mt-2">Sign in to your MyAI account</p>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => onSocialLogin?.('google')}
              variant="outline"
              className="w-full bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80 transition-all duration-200"
              disabled={isLoading}
            >
              <Chrome className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>
            
            <Button
              onClick={() => onSocialLogin?.('apple')}
              variant="outline"
              className="w-full bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80 transition-all duration-200"
              disabled={isLoading}
            >
              <Apple className="w-5 h-5 mr-3" />
              Continue with Apple
            </Button>
            
            <Button
              onClick={() => onSocialLogin?.('outlook')}
              variant="outline"
              className="w-full bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80 transition-all duration-200"
              disabled={isLoading}
            >
              <Mail className="w-5 h-5 mr-3" />
              Continue with Outlook
            </Button>
          </div>

          <div className="relative">
            <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 px-3 text-sm text-gray-500">
              or
            </span>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 bg-white/60 backdrop-blur-sm border border-white/30 focus:bg-white/80 transition-all duration-200"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 bg-white/60 backdrop-blur-sm border border-white/30 focus:bg-white/80 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center pt-4 border-t border-white/30">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onSignUpClick}
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-200 underline"
                disabled={isLoading}
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Forgot Password */}
          <div className="text-center">
            <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
              Forgot your password?
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}