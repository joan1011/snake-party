import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { login, signup, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success('Welcome back!');
      } else {
        await signup(username, email, password);
        toast.success('Account created successfully!');
      }
      onOpenChange(false);
      resetForm();
    } catch (err) {
      // Error is handled by the store
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    clearError();
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    clearError();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-pixel text-lg text-primary neon-text text-center">
            {mode === 'login' ? 'LOGIN' : 'SIGN UP'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm text-muted-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-input border-border focus:border-primary"
                placeholder="Enter your username"
                required
                minLength={3}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input border-border focus:border-primary"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-muted-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-input border-border focus:border-primary"
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full arcade-button text-primary-foreground font-display"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              'Login'
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={switchMode}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Login"}
          </button>
        </div>

        {mode === 'login' && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            Demo: Use any email with 6+ char password
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
