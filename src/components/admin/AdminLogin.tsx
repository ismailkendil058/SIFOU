import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface AdminLoginProps {
  onSuccess: () => void;
}

// Demo credentials
const ADMIN_CREDENTIALS = {
  username: 'sifou',
  password: 'sifoukos'
};

export const AdminLogin = ({ onSuccess }: AdminLoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      toast.success('Welcome back, Admin!');
      onSuccess();
    } else {
      toast.error('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center px-6 py-8">
      {/* Back Link */}
      <a
        href="/"
        className="absolute top-6 left-6 text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to POS
      </a>

      {/* Logo */}
      <div className="mb-8 text-center animate-fade-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow-primary mb-4">
          <Lock className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">
          <span className="text-gradient-primary">SIFOU</span>
          <span className="text-gradient-accent ml-2">ADMIN</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-sm font-medium">Owner Dashboard</p>
      </div>

      {/* Login Form */}
      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 animate-fade-up"
        style={{ animationDelay: '0.1s' }}
      >
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Username
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-12 rounded-xl"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl pr-12"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="iconSm"
              className="absolute right-1 top-1"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          size="full"
          className="rounded-xl mt-6"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      {/* Demo Credentials Notice */}
      <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <p className="text-xs text-muted-foreground text-center">
          <strong>Demo Credentials:</strong><br />
          Username: sifou | Password: sifoukos
        </p>
      </div>
    </div>
  );
};
