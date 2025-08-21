import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, ArrowLeft, Lock } from 'lucide-react';

interface AuthPageProps {
  onAuthenticated: () => void;
  onBackToWelcome: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated, onBackToWelcome }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple password check
    setTimeout(() => {
      if (password === 'shahigarage123') {
        // Store authentication in localStorage for this device
        localStorage.setItem('shahiGarageAuth', 'true');
        localStorage.setItem('shahiGarageAuthTime', Date.now().toString());
        onAuthenticated();
      } else {
        setError('Incorrect password. Please try again.');
      }
      setIsLoading(false);
    }, 1000); // Simulate loading time
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video - Blurred */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
      >
        <source src="/BMW M3 Competition - 4K Cinematic Short Video.mp4" type="video/mp4" />
        {/* Fallback background image if video fails to load */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm scale-110"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2942&q=80')`
          }}
        />
      </video>
      
      {/* Video overlay for better focus on auth form */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <Button
            variant="ghost"
            onClick={onBackToWelcome}
            className="text-white hover:bg-white/20 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Welcome
          </Button>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md">
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-600">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-white">
                Access Required
              </CardTitle>
              <CardDescription className="text-blue-100">
                Enter your password to access the Shahi Multi Car Care management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    type="password"
                    placeholder="Enter access password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-gray-300 focus:border-orange-400 h-12 text-lg"
                    required
                  />
                </div>
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-200 text-sm text-center">{error}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-lg font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Authenticating...
                    </div>
                  ) : (
                    'Access Dashboard'
                  )}
                </Button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="text-center text-sm text-blue-100 space-y-2">
                  <p className="flex items-center justify-center">
                    <Wrench className="h-4 w-4 mr-2 text-orange-400" />
                    Secure Access Portal
                  </p>
                  <p className="text-xs text-gray-300">
                    This system is protected for authorized personnel only
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-2">Shahi Multi Car Care Management System</h3>
              <p className="text-gray-300 text-sm">
                Complete automotive service and inventory management platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
