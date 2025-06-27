
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Scale, Wifi, WifiOff } from 'lucide-react';
import { apiService } from '@/services/apiService';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const testConnection = async () => {
    setIsTestingConnection(true);
    console.log('Testing backend connection...');
    
    try {
      const response = await apiService.testConnection();
      
      if (response.error) {
        toast.error(`Connection failed: ${response.error}`);
        console.error('Connection test failed:', response.error);
      } else {
        toast.success('Backend connection successful!');
        console.log('Connection test successful:', response);
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast.error('Connection test failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign Up validation
        if (!name.trim()) {
          toast.error('Name is required');
          setIsLoading(false);
          return;
        }
        
        if (!email.trim()) {
          toast.error('Email is required');
          setIsLoading(false);
          return;
        }
        
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters long');
          setIsLoading(false);
          return;
        }
        
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          setIsLoading(false);
          return;
        }

        console.log('Starting registration process...');
        const response = await apiService.register({ 
          name: name.trim(),
          email: email.trim(), 
          password 
        });
        
        console.log('Registration response received:', response);
        
        if (response.error) {
          toast.error(`Registration failed: ${response.error}`);
        } else {
          toast.success('Registration successful! Please sign in with your credentials.');
          setIsSignUp(false);
          setName('');
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        // Sign In validation
        if (!email.trim()) {
          toast.error('Email is required');
          setIsLoading(false);
          return;
        }
        
        if (!password) {
          toast.error('Password is required');
          setIsLoading(false);
          return;
        }

        console.log('Starting login process...');
        const response = await apiService.login({ 
          username: email.trim(), // Send email as username
          password 
        });
        
        console.log('Login response received:', response);
        
        if (response.access_token) {
          localStorage.setItem('auth_token', response.access_token);
          toast.success('Login successful!');
          onLogin();
        } else {
          toast.error(`Login failed: ${response.error || 'Invalid credentials'}`);
          setPassword('');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Connection failed. Please check backend connection.');
      setPassword('');
      if (isSignUp) setConfirmPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setName('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Scale className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Legal Letter Scribe AI
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {isSignUp ? 'Create your account' : 'Sign in to access the demand letter generator'}
          </p>
          
          {/* Connection Test Button */}
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={testConnection}
              disabled={isTestingConnection}
              className="text-xs"
            >
              {isTestingConnection ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
              ) : (
                <Wifi className="h-3 w-3 mr-2" />
              )}
              Test Backend Connection
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading 
                ? (isSignUp ? 'Creating Account...' : 'Signing in...') 
                : (isSignUp ? 'Create Account' : 'Sign In')
              }
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={switchMode}
                className="text-sm"
                disabled={isLoading}
              >
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
