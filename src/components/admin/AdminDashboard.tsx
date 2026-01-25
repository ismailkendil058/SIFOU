import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/store/gameStore';
import { MonthlyRevenueChart, YearlyRevenueChart } from './RevenueCharts';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  TrendingUp,
  LogOut,
  DollarSign,
  Gamepad2,
  Plus,
  Trash2,
  Check,
  X
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
import { toast } from 'sonner';

type Tab = 'dashboard' | 'workers' | 'charges' | 'sales';

interface AdminDashboardProps {
  onLogout: () => void;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  variant = 'default' 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  trend?: string;
  variant?: 'default' | 'primary' | 'accent' | 'success';
}) => (
  <div className={cn(
    "rounded-2xl p-4 animate-scale-up card-hover relative overflow-hidden",
    variant === 'primary' && "bg-gradient-primary text-primary-foreground shadow-glow-primary",
    variant === 'accent' && "bg-gradient-accent text-accent-foreground shadow-glow-accent",
    variant === 'success' && "bg-success text-success-foreground shadow-md",
    variant === 'default' && "bg-card border border-border/50 shadow-md"
  )}>
    {/* Subtle pattern */}
    <div className="absolute inset-0 barca-field-lines opacity-20 pointer-events-none" />
    
    <div className="flex items-start justify-between mb-2 relative">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        variant === 'default' ? "bg-primary/10" : "bg-primary-foreground/15"
      )}>
        <Icon className={cn(
          "w-5 h-5",
          variant === 'default' && "text-primary"
        )} />
      </div>
      {trend && (
        <span className={cn(
          "text-xs font-bold px-2 py-0.5 rounded-full",
          variant === 'default' ? "bg-success/10 text-success" : "bg-primary-foreground/20"
        )}>
          {trend}
        </span>
      )}
    </div>
    <div className="space-y-1 relative">
      <p className={cn(
        "text-2xl font-black",
        variant === 'default' && "text-foreground"
      )}>{value}</p>
      <p className={cn(
        "text-xs font-semibold uppercase tracking-wider",
        variant === 'default' ? "text-muted-foreground" : "opacity-80"
      )}>{title}</p>
    </div>
  </div>
);

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { 
    workers, 
    addWorker, 
    updateWorker, 
    deleteWorker,
    sales,
    charges,
    addCharge,
    deleteCharge,
    getTodayRevenue,
    getTodayCharges,
    getTodayProfit,
    getWorkerStats
  } = useGameStore();

  const [addWorkerDialog, setAddWorkerDialog] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerPin, setNewWorkerPin] = useState('');

  const [addChargeDialog, setAddChargeDialog] = useState(false);
  const [chargeCategory, setChargeCategory] = useState<'rent' | 'electricity' | 'internet' | 'salaries' | 'maintenance' | 'other'>('other');
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeDescription, setChargeDescription] = useState('');

  const todayRevenue = getTodayRevenue();
  const todayCharges = getTodayCharges();
  const todayProfit = getTodayProfit();
  const todaySales = sales.filter(s => {
    const saleDate = new Date(s.createdAt);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });

  const handleAddWorker = () => {
    if (newWorkerName && newWorkerPin.length === 4) {
      addWorker(newWorkerName, newWorkerPin);
      toast.success(`Worker "${newWorkerName}" added successfully`);
      setNewWorkerName('');
      setNewWorkerPin('');
      setAddWorkerDialog(false);
    }
  };

  const handleAddCharge = () => {
    const amount = parseInt(chargeAmount);
    if (amount > 0) {
      addCharge({
        category: chargeCategory,
        amount,
        description: chargeDescription || chargeCategory,
        date: new Date(),
      });
      toast.success('Charge added successfully');
      setChargeAmount('');
      setChargeDescription('');
      setAddChargeDialog(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workers', label: 'Workers', icon: Users },
    { id: 'charges', label: 'Charges', icon: Receipt },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero pb-20 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 barca-diagonal pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-10 glass px-4 py-3 mb-4 border-b-2 border-accent/20">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <h1 className="text-xl font-display tracking-wider">
              <span className="text-gradient-primary">SIFOU</span>
              <span className="text-gradient-accent ml-1">ADMIN</span>
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Owner Dashboard</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-muted-foreground hover:text-accent"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Exit
          </Button>
        </div>
      </header>

      <div className="mobile-container relative">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-6 h-1 rounded-full bg-gradient-gold" />
              Today's Overview
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                title="Revenue"
                value={`${todayRevenue.toLocaleString()} DA`}
                icon={DollarSign}
                variant="primary"
              />
              <StatCard
                title="Charges"
                value={`${todayCharges.toLocaleString()} DA`}
                icon={Receipt}
                variant="accent"
              />
              <StatCard
                title="Net Profit"
                value={`${todayProfit.toLocaleString()} DA`}
                icon={TrendingUp}
                variant={todayProfit >= 0 ? 'success' : 'default'}
              />
              <StatCard
                title="Sessions"
                value={todaySales.length}
                icon={Gamepad2}
              />
            </div>

            {/* Revenue Charts */}
            <div className="space-y-4 mt-6">
              <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <span className="w-4 h-1 rounded-full bg-primary" />
                <span className="uppercase tracking-wider">Analytics</span>
              </h3>
              <MonthlyRevenueChart />
              <YearlyRevenueChart />
            </div>

            {/* Quick Stats */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                <span className="w-4 h-1 rounded-full bg-accent" />
                <span className="uppercase tracking-wider">Worker Performance</span>
              </h3>
              <div className="space-y-2">
                {workers.map((worker) => {
                  const stats = getWorkerStats(worker.id, new Date());
                  return (
                    <div 
                      key={worker.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 card-hover"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-foreground">
                            {worker.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-semibold">{worker.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-primary">{stats.revenue.toLocaleString()} DA</p>
                        <p className="text-xs text-muted-foreground">{stats.sales} sales</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Workers Tab */}
        {activeTab === 'workers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="w-6 h-1 rounded-full bg-gradient-primary" />
                Workers
              </h2>
              <Button
                variant="default"
                size="sm"
                onClick={() => setAddWorkerDialog(true)}
                className="rounded-xl"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {workers.map((worker) => (
                <div 
                  key={worker.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 card-hover"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      worker.isActive ? "bg-gradient-primary" : "bg-muted"
                    )}>
                      <span className={cn(
                        "text-lg font-bold",
                        worker.isActive ? "text-primary-foreground" : "text-muted-foreground"
                      )}>
                        {worker.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{worker.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">PIN: ••••</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => updateWorker(worker.id, { isActive: !worker.isActive })}
                      className="rounded-xl"
                    >
                      {worker.isActive ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => {
                        deleteWorker(worker.id);
                        toast.success('Worker deleted');
                      }}
                      className="rounded-xl"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charges Tab */}
        {activeTab === 'charges' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="w-6 h-1 rounded-full bg-gradient-accent" />
                Charges
              </h2>
              <Button
                variant="accent"
                size="sm"
                onClick={() => setAddChargeDialog(true)}
                className="rounded-xl"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {charges.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No charges recorded</p>
                  <p className="text-sm opacity-70">Add your first expense</p>
                </div>
              ) : (
                charges.map((charge) => (
                  <div 
                    key={charge.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 card-hover"
                  >
                    <div>
                      <p className="font-semibold capitalize">{charge.category}</p>
                      <p className="text-xs text-muted-foreground">{charge.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-accent">{charge.amount.toLocaleString()} DA</span>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => {
                          deleteCharge(charge.id);
                          toast.success('Charge deleted');
                        }}
                        className="rounded-xl"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-6 h-1 rounded-full bg-gradient-gold" />
              Today's Sales
            </h2>

            <div className="space-y-2">
              {todaySales.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No sales today</p>
                  <p className="text-sm opacity-70">Sales will appear here</p>
                </div>
              ) : (
                todaySales.map((sale) => (
                  <div 
                    key={sale.id}
                    className="p-4 rounded-xl bg-card border border-border/50 card-hover"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{sale.postName}</span>
                      <span className="font-black text-success">{sale.totalAmount.toLocaleString()} DA</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium">{sale.workerName}</span>
                      <span className="font-mono">
                        {new Date(sale.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-dark px-4 py-2 border-t border-primary/10">
        <div className="flex justify-around max-w-md mx-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-col gap-1 h-auto py-2 px-3 rounded-xl",
                activeTab === tab.id 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* Add Worker Dialog */}
      <Dialog open={addWorkerDialog} onOpenChange={setAddWorkerDialog}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl border-2 border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">Add Worker</DialogTitle>
            <DialogDescription>Create a new worker account with a 4-digit PIN</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Worker Name</label>
              <Input
                placeholder="Enter name"
                value={newWorkerName}
                onChange={(e) => setNewWorkerName(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">4-Digit PIN</label>
              <Input
                type="text"
                placeholder="0000"
                maxLength={4}
                value={newWorkerPin}
                onChange={(e) => setNewWorkerPin(e.target.value.replace(/\D/g, ''))}
                className="h-12 rounded-xl text-center text-2xl font-bold tracking-[0.5em] font-mono"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setAddWorkerDialog(false)} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={handleAddWorker}
              disabled={!newWorkerName || newWorkerPin.length !== 4}
              className="flex-1 rounded-xl font-bold"
            >
              Add Worker
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Charge Dialog */}
      <Dialog open={addChargeDialog} onOpenChange={setAddChargeDialog}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl border-2 border-accent/20">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">Add Charge</DialogTitle>
            <DialogDescription>Record a new expense</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Category</label>
              <select
                value={chargeCategory}
                onChange={(e) => setChargeCategory(e.target.value as any)}
                className="w-full h-12 rounded-xl border border-input bg-background px-4 font-medium"
              >
                <option value="rent">Rent</option>
                <option value="electricity">Electricity</option>
                <option value="internet">Internet</option>
                <option value="salaries">Salaries</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Amount (DA)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Description (Optional)</label>
              <Input
                placeholder="Enter description"
                value={chargeDescription}
                onChange={(e) => setChargeDescription(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setAddChargeDialog(false)} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button 
              variant="accent"
              onClick={handleAddCharge}
              disabled={!chargeAmount || parseInt(chargeAmount) <= 0}
              className="flex-1 rounded-xl font-bold"
            >
              Add Charge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
