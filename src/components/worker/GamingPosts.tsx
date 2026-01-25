import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/gameStore';
import { PRICING, GamingPost as GamingPostType, getPS5Price } from '@/types';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { 
  Gamepad2, 
  Plus, 
  Minus, 
  DollarSign, 
  LogOut,
  PlusCircle,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface GamingPostsProps {
  onLogout: () => void;
}

const SessionTimer = ({ startTime, isActive }: { startTime: Date | null; isActive: boolean }) => {
  const { formatted } = useSessionTimer(startTime, isActive);
  
  if (!isActive) return null;
  
  return (
    <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full bg-primary-foreground/15 backdrop-blur-sm">
      <Timer className="w-3.5 h-3.5 animate-timer-pulse" />
      <span className="font-mono font-bold text-sm tracking-wide">{formatted}</span>
    </div>
  );
};

const PostCard = ({ post, onAddPoint, onRemovePoint, onCashOut }: {
  post: GamingPostType;
  onAddPoint: () => void;
  onRemovePoint: () => void;
  onCashOut: () => void;
}) => {
  const price = post.type === 'PS5' ? 80 : PRICING[post.type];
  const total = post.type === 'PS5' ? getPS5Price(post.points) : post.points * PRICING[post.type];
  const isActive = post.points > 0;

  return (
    <div
      className={cn(
        "rounded-2xl p-4 transition-all duration-300 animate-scale-up card-hover relative overflow-hidden",
        isActive
          ? "bg-gradient-primary text-primary-foreground shadow-glow-primary"
          : "bg-card text-card-foreground border border-border/50 shadow-md"
      )}
    >
      {/* Subtle football pattern overlay */}
      {!isActive && (
        <div className="absolute inset-0 barca-field-lines opacity-50 pointer-events-none" />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            post.type === 'PS5' 
              ? "bg-gold/20 border border-gold/30" 
              : isActive ? "bg-primary-foreground/15" : "bg-primary/10"
          )}>
            <Gamepad2 className={cn(
              "w-4 h-4",
              post.type === 'PS5' ? "text-gold" : isActive ? "text-primary-foreground" : "text-primary"
            )} />
          </div>
          <div>
            <span className="font-bold block leading-tight">{post.name}</span>
            {post.type === 'PS5' && (
              <span className="text-[10px] font-semibold text-gold uppercase tracking-wider">Premium</span>
            )}
          </div>
        </div>
        <span className={cn(
          "text-xs font-bold px-2.5 py-1 rounded-full",
          isActive 
            ? "bg-primary-foreground/20" 
            : "bg-gradient-gold text-gold-foreground"
        )}>
          {price} DA
        </span>
      </div>



      {/* Points Display */}
      <div className="flex items-center justify-center gap-1 min-h-[48px] mb-3">
        {post.points > 0 ? (
          <div className="flex flex-wrap gap-1 justify-center">
            {Array.from({ length: Math.min(post.points, 20) }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full animate-point-add",
                  isActive ? "bg-gold" : "bg-primary"
                )}
                style={{ animationDelay: `${i * 0.05}s` }}
              />
            ))}
            {post.points > 20 && (
              <span className="text-xs font-medium ml-1">
                +{post.points - 20}
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm font-medium">Ready to Play</span>
        )}
      </div>

      {/* Points Counter */}
      <div className="flex items-center justify-between mb-3 relative">
        <Button
          variant="ghost"
          size="iconSm"
          onClick={onRemovePoint}
          disabled={post.points === 0}
          className={cn(
            "rounded-xl",
            isActive && "hover:bg-primary-foreground/20 text-primary-foreground"
          )}
        >
          <Minus className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <span className="text-4xl font-black">{post.points}</span>
          <span className="text-sm font-medium ml-1 opacity-80">pts</span>
        </div>
        <Button
          variant="ghost"
          size="iconSm"
          onClick={onAddPoint}
          className={cn(
            "rounded-xl",
            isActive && "hover:bg-primary-foreground/20 text-primary-foreground"
          )}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Total & Cash Button */}
      {isActive && (
        <div className="space-y-2 animate-fade-up">
          <div className="text-center text-sm font-medium opacity-90">
            Total: <span className="font-black text-xl text-gold">{total} DA</span>
          </div>
          <Button
            variant="gold"
            size="full"
            onClick={onCashOut}
            className="rounded-xl font-bold"
          >
            <DollarSign className="w-5 h-5" />
            Cash Out
          </Button>
        </div>
      )}
    </div>
  );
};

export const GamingPosts = ({ onLogout }: GamingPostsProps) => {
  const { posts, addPoint, removePoint, cashOut, activeSession, endSession, addAdditionalPayment } = useGameStore();
  const [cashOutDialog, setCashOutDialog] = useState<GamingPostType | null>(null);
  const [additionalPaymentDialog, setAdditionalPaymentDialog] = useState(false);
  const [additionalAmount, setAdditionalAmount] = useState('');

  const handleCashOut = (post: GamingPostType) => {
    setCashOutDialog(post);
  };

  const confirmCashOut = () => {
    if (cashOutDialog) {
      const total = cashOutDialog.type === 'PS5' ? getPS5Price(cashOutDialog.points) : cashOutDialog.points * PRICING[cashOutDialog.type];
      cashOut(cashOutDialog.id);
      toast.success(`Cashed out ${total} DA from ${cashOutDialog.name}`);
      setCashOutDialog(null);
    }
  };

  const handleLogout = () => {
    endSession();
    onLogout();
  };

  const handleAdditionalPayment = () => {
    const amount = parseInt(additionalAmount);
    if (amount > 0) {
      addAdditionalPayment(amount);
      toast.success(`Added ${amount} DA additional payment`);
      setAdditionalAmount('');
      setAdditionalPaymentDialog(false);
    }
  };

  const ps4Posts = posts.filter((p) => p.type === 'PS4');
  const ps5Posts = posts.filter((p) => p.type === 'PS5');

  return (
    <div className="min-h-screen bg-white pb-24 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 barca-diagonal pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-10 glass px-4 py-3 mb-4 border-b-2 border-primary/20">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <h1 className="text-xl font-display tracking-wider">
              <span className="text-gradient-primary">SIFOU</span>
              <span className="text-gradient-accent ml-1">GAMES</span>
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              {activeSession?.workerName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-accent"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Exit
          </Button>
        </div>
      </header>

      <div className="mobile-container space-y-6 relative">
        {/* PS5 Section */}
        <section>
          <h2 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
            <span className="w-6 h-1 rounded-full bg-gradient-gold" />
            <span className="uppercase tracking-wider">PS5 Premium</span>
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {ps5Posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onAddPoint={() => addPoint(post.id)}
                onRemovePoint={() => removePoint(post.id)}
                onCashOut={() => handleCashOut(post)}
              />
            ))}
          </div>
        </section>

        {/* PS4 Section */}
        <section>
          <h2 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
            <span className="w-6 h-1 rounded-full bg-gradient-primary" />
            <span className="uppercase tracking-wider">PS4 Classic</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {ps4Posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onAddPoint={() => addPoint(post.id)}
                onRemovePoint={() => removePoint(post.id)}
                onCashOut={() => handleCashOut(post)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 glass-dark p-4 border-t border-primary/10">
        <div className="max-w-md mx-auto">
          <Button
            variant="accent"
            size="full"
            onClick={() => setAdditionalPaymentDialog(true)}
            className="rounded-xl font-bold"
          >
            <PlusCircle className="w-5 h-5" />
            Additional Payment
          </Button>
        </div>
      </div>

      {/* Cash Out Dialog */}
      <Dialog open={!!cashOutDialog} onOpenChange={() => setCashOutDialog(null)}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl border-2 border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">Confirm Payment</DialogTitle>
            <DialogDescription>
              {cashOutDialog && (
                <>
                  <span className="font-bold">{cashOutDialog.name}</span> - {cashOutDialog.points} points
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-6 relative">
            <div className="absolute inset-0 barca-field-lines opacity-30 rounded-xl" />
            <span className="text-5xl font-black text-gradient-primary relative">
              {cashOutDialog && (cashOutDialog.type === 'PS5' ? getPS5Price(cashOutDialog.points) : cashOutDialog.points * PRICING[cashOutDialog.type])} DA
            </span>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setCashOutDialog(null)} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button variant="gold" onClick={confirmCashOut} className="flex-1 rounded-xl font-bold">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Additional Payment Dialog */}
      <Dialog open={additionalPaymentDialog} onOpenChange={setAdditionalPaymentDialog}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl border-2 border-accent/20">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">Additional Payment</DialogTitle>
            <DialogDescription>
              Enter amount for drinks, snacks, or other services
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              placeholder="Enter amount (DA)"
              value={additionalAmount}
              onChange={(e) => setAdditionalAmount(e.target.value)}
              className="text-center text-2xl font-bold h-14 rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setAdditionalPaymentDialog(false)} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button 
              variant="accent" 
              onClick={handleAdditionalPayment} 
              disabled={!additionalAmount || parseInt(additionalAmount) <= 0}
              className="flex-1 rounded-xl font-bold"
            >
              Add Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
