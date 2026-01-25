import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MonthlyRevenueChart, YearlyRevenueChart } from './RevenueCharts';
import { useGameStore } from '@/store/gameStore';
import { LogOut, Users, DollarSign, TrendingUp } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { workers, sales } = useGameStore();

  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalWorkers = workers.length;
    const activeWorkers = workers.filter(w => w.isActive).length;
    const todayRevenue = sales
      .filter(sale => {
        const today = new Date();
        const saleDate = new Date(sale.createdAt);
        return saleDate.toDateString() === today.toDateString();
      })
      .reduce((sum, sale) => sum + sale.totalAmount, 0);

    return {
      totalRevenue,
      totalWorkers,
      activeWorkers,
      todayRevenue
    };
  }, [workers, sales]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              <span className="text-gradient-primary">SIFOU</span>
              <span className="text-gradient-accent ml-2">ADMIN</span>
            </h1>
            <p className="text-muted-foreground text-sm">Owner Dashboard</p>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-md animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-lg font-black text-gradient-primary">
                  {stats.totalRevenue.toLocaleString()} DA
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-md animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center">
                <Users className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Workers</p>
                <p className="text-lg font-black text-gradient-accent">
                  {stats.totalWorkers}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-md animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Workers</p>
                <p className="text-lg font-black text-green-600">
                  {stats.activeWorkers}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-md animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Today's Revenue</p>
                <p className="text-lg font-black text-blue-600">
                  {stats.todayRevenue.toLocaleString()} DA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyRevenueChart />
          <YearlyRevenueChart />
        </div>

        {/* Workers List */}
        <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-md animate-scale-up">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Workers Overview
          </h3>
          <div className="space-y-3">
            {workers.map((worker) => (
              <div key={worker.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${worker.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="font-medium">{worker.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {worker.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {worker.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
