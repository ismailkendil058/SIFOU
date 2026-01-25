import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { Delete, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinEntryProps {
  onSuccess: () => void;
}

export const PinEntry = ({ onSuccess }: PinEntryProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const { validatePin, startSession } = useGameStore();

  const handleNumber = useCallback((num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        const worker = validatePin(newPin);
        if (worker) {
          setSuccess(true);
          startSession(worker);
          setTimeout(() => {
            onSuccess();
          }, 500);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 800);
        }
      }
    }
  }, [pin, validatePin, startSession, onSuccess]);

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  }, []);

  const handleClear = useCallback(() => {
    setPin('');
    setError(false);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
      {/* FC Barcelona inspired background */}
      <div className="absolute inset-0 barca-diagonal pointer-events-none" />
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-primary opacity-10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-accent opacity-10 blur-3xl rounded-full" />
      
      {/* Logo */}
      <div className="mb-8 text-center animate-fade-up relative">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-primary shadow-glow-primary flex items-center justify-center">
          <span className="text-2xl font-display text-primary-foreground">SG</span>
        </div>
        <h1 className="text-3xl font-display tracking-widest">
          <span className="text-gradient-primary">SIFOU</span>
          <span className="text-gradient-accent ml-2">GAMES</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-sm font-medium">Gaming Lounge</p>
      </div>

      {/* PIN Display */}
      <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <p className="text-center text-muted-foreground text-sm mb-4 font-medium">
          Enter your 4-digit PIN
        </p>
        <div className="flex gap-3 justify-center">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all duration-200",
                pin.length > i
                  ? success
                    ? "bg-success text-success-foreground shadow-md"
                    : error
                    ? "bg-destructive text-destructive-foreground animate-[shake_0.3s_ease-in-out]"
                    : "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border-2 border-border text-muted-foreground"
              )}
            >
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>
        {error && (
          <p className="text-destructive text-center text-sm mt-3 font-medium animate-fade-in">
            Invalid PIN. Please try again.
          </p>
        )}
        {success && (
          <p className="text-success text-center text-sm mt-3 font-medium animate-fade-in">
            Welcome! Logging in...
          </p>
        )}
      </div>

      {/* Numpad */}
      <div 
        className="grid grid-cols-3 gap-3 w-full max-w-xs animate-fade-up"
        style={{ animationDelay: '0.2s' }}
      >
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <Button
            key={num}
            variant="numpad"
            onClick={() => handleNumber(num)}
            disabled={success}
            className="aspect-square rounded-2xl"
          >
            {num}
          </Button>
        ))}
        <Button
          variant="numpad"
          onClick={handleClear}
          disabled={success}
          className="aspect-square rounded-2xl text-muted-foreground"
        >
          C
        </Button>
        <Button
          variant="numpad"
          onClick={() => handleNumber('0')}
          disabled={success}
          className="aspect-square rounded-2xl"
        >
          0
        </Button>
        <Button
          variant="numpad"
          onClick={handleDelete}
          disabled={success}
          className="aspect-square rounded-2xl text-muted-foreground"
        >
          <Delete className="w-6 h-6" />
        </Button>
      </div>

      {/* Admin Link */}
      <div className="mt-12 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <a
          href="/admin"
          className="text-muted-foreground hover:text-primary text-sm font-medium flex items-center gap-2 transition-colors"
        >
          Admin Access
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
