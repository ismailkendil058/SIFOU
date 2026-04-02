
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { adminService } from '@/services/adminService';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, DollarSign, Wallet, TrendingUp } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const DashboardStats = () => {
    const [filter, setFilter] = useState<'day' | 'week' | 'month' | 'custom'>('day');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [stats, setStats] = useState<any>(null);
    const [workers, setWorkers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            let sDate = date;
            let eDate = endDate;
            try {
                const data = await adminService.getStats(filter, sDate, eDate);
                setStats(data);
                const w = await adminService.getWorkers(false);
                setWorkers(w);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [filter, date, endDate]);

    const workerChartData = stats ? Object.entries(stats.workerEarnings).map(([id, amount]) => {
        const worker = workers.find(w => w.id === id);
        return {
            name: worker ? worker.name : 'Unknown',
            earnings: amount
        };
    }) : [];

    const StatCard = ({ title, value, desc, icon: Icon, variant }: { title: string; value: string; desc: string; icon: any; variant: 'primary' | 'accent' | 'gold' }) => (
        <Card className={cn("glass rounded-3xl border-primary/25 shadow-2xl shadow-glow-primary hover:shadow-glow-accent transition-all duration-500 group/card relative overflow-hidden animate-scale-in stagger-1")}>
            <div className="absolute inset-0 bg-gradient-to-br opacity-20" style={{ backgroundImage: variant === 'primary' ? 'var(--gradient-primary)' : variant === 'accent' ? 'var(--gradient-accent)' : 'var(--gradient-gold)' }} />
            <div className="absolute top-4 right-4 opacity-10">
                <Icon size={48} />
            </div>
            <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-foreground/90 group-hover/card:text-primary">{title}</CardTitle>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-primary shadow-glow-primary flex items-center justify-center group-hover/card:bg-gradient-accent transition-all">
                        <Icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0 pb-6 relative z-10">
                <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground group-hover/card:text-primary mb-2 leading-none tracking-tight">
                    {value}
                </div>
                <p className="text-sm text-muted-foreground/80 font-medium">{desc}</p>
            </CardContent>
        </Card>
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="h-10 w-48 bg-muted animate-shimmer rounded-2xl" />
                    <div className="flex gap-2">
                        <div className="h-10 w-20 bg-muted animate-shimmer rounded-xl" />
                        <div className="h-10 w-20 bg-muted animate-shimmer rounded-xl" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass rounded-3xl p-8 animate-shimmer">
                            <div className="space-y-4">
                                <div className="h-5 w-32 bg-muted rounded-lg" />
                                <div className="h-12 w-24 bg-muted rounded-xl" />
                                <div className="h-4 w-40 bg-muted rounded" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="glass rounded-3xl p-8 animate-shimmer">
                    <div className="h-8 w-64 bg-muted rounded-xl mb-8" />
                    <div className="h-80 bg-muted rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-border/50">
                <div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-widest text-gradient-primary mb-2">Dashboard</h2>
                    <p className="text-xl text-muted-foreground font-semibold">Key metrics overview</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button 
                        variant={filter === 'day' ? "default" : "outline"} 
                        className={cn(filter === 'day' && "bg-gradient-primary text-primary-foreground shadow-glow-primary hover:shadow-glow-accent")}
                        onClick={() => setFilter('day')}
                    >
                        Today
                    </Button>
                    <Button 
                        variant={filter === 'week' ? "default" : "outline"} 
                        className={cn(filter === 'week' && "bg-gradient-accent text-accent-foreground shadow-glow-accent")}
                        onClick={() => setFilter('week')}
                    >
                        Week
                    </Button>
                    <Button 
                        variant={filter === 'month' ? "default" : "outline"} 
                        className={cn(filter === 'month' && "bg-gradient-gold shadow-glow-gold text-gold-foreground")}
                        onClick={() => setFilter('month')}
                    >
                        Month
                    </Button>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button 
                                variant={filter === 'custom' ? "default" : "outline"} 
                                className="glass h-12 rounded-2xl shadow-md hover:shadow-glow-primary transition-all font-semibold"
                            >
                                <CalendarIcon className="mr-2 h-5 w-5" />
                                {filter === 'custom' && date ? (
                                    endDate ? `${format(date, 'LLL dd')} - ${format(endDate, 'LLL dd')}` : format(date, 'LLL dd')
                                ) : "Custom"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="glass rounded-3xl border-primary/25 shadow-2xl w-auto p-0 animate-scale-in" align="end">
                            <div className="p-4 border-b border-primary/20 text-center font-semibold text-foreground">Select Start Date</div>
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="p-4"
                            />
                            <div className="p-4 border-t border-primary/20 text-center font-semibold text-foreground">Select End Date</div>
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                className="p-4"
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <StatCard
                    title="Total Earned"
                    value={`DZD ${stats?.totalEarned?.toLocaleString() ?? 0}`}
                    desc="For selected period"
                    icon={DollarSign}
                    variant="primary"
                />
                <StatCard
                    title="Expenses & Salaries"
                    value={`DZD ${stats?.totalExpenses?.toLocaleString() ?? 0}`}
                    desc="Total outflow"
                    icon={TrendingUp}
                    variant="accent"
                />
                <StatCard
                    title="Net Profit"
                    value={`DZD ${stats?.net?.toLocaleString() ?? 0}`}
                    desc="Calculated earnings"
                    icon={Wallet}
                    variant="gold"
                />
            </div>

            <Card className="glass rounded-3xl border-primary/25 shadow-2xl shadow-glow-accent hover:shadow-glow-gold transition-all duration-500 animate-scale-in stagger-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-gold opacity-10" />
                <CardHeader className="pb-6 relative z-10">
                    <CardTitle className="text-2xl font-display tracking-tight flex items-center gap-3">
                        <Wallet className="h-8 w-8 text-gold-foreground shadow-glow-gold rounded-xl p-2 bg-gradient-gold/20" />
                        Worker Performance (Revenue Generated)
                    </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="h-[300px] sm:h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={workerChartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                                        <stop offset="100%" stopColor="hsl(var(--success))" />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={14} tickLine={false} axisLine={false} tickMargin={20} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={14} tickLine={false} axisLine={false} tickMargin={20} tickFormatter={(value: number) => `DZD ${value.toLocaleString()}`} />
                                <Tooltip 
                                    formatter={(value: number) => [`DZD ${value.toLocaleString() || 0}`, 'Revenue']} 
                                    cursor={{ fill: 'hsl(var(--muted)/0.1)', stroke: 'hsl(var(--muted))', strokeWidth: 1, radius: 8 }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '1rem', boxShadow: 'var(--shadow-lg)' }}
                                />
                                <Bar 
                                    dataKey="earnings" 
                                    fill="url(#barGradient)" 
                                    radius={[8, 8, 0, 0]} 
                                    className="hover:fill-opacity-90 transition-all cursor-pointer"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

