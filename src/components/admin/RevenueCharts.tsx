import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';
import { useGameStore } from '@/store/gameStore';
import { TrendingUp, Calendar } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/50 rounded-xl px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-foreground">{payload[0].value.toLocaleString()} DA</p>
      </div>
    );
  }
  return null;
};

export const MonthlyRevenueChart = () => {
  const { sales } = useGameStore();

  const monthlyData = useMemo(() => {
    const now = new Date();
    const data = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dayRevenue = sales
        .filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return (
            saleDate.getDate() === date.getDate() &&
            saleDate.getMonth() === date.getMonth() &&
            saleDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, sale) => sum + sale.totalAmount, 0);
      
      data.push({
        day: date.getDate().toString(),
        revenue: dayRevenue,
        fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    
    return data;
  }, [sales]);

  const totalMonthlyRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-md animate-scale-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Monthly Revenue</h3>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-gradient-primary">{totalMonthlyRevenue.toLocaleString()} DA</p>
        </div>
      </div>
      
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(213, 100%, 30%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(213, 100%, 30%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'hsl(220, 10%, 45%)' }}
              interval="preserveStartEnd"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(213, 100%, 30%)"
              strokeWidth={2}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const YearlyRevenueChart = () => {
  const { sales } = useGameStore();

  const yearlyData = useMemo(() => {
    const now = new Date();
    const data = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      const monthRevenue = sales
        .filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return (
            saleDate.getMonth() === date.getMonth() &&
            saleDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, sale) => sum + sale.totalAmount, 0);
      
      data.push({
        month: monthNames[date.getMonth()],
        revenue: monthRevenue,
      });
    }
    
    return data;
  }, [sales]);

  const totalYearlyRevenue = yearlyData.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-md animate-scale-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
            <Calendar className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Yearly Revenue</h3>
            <p className="text-xs text-muted-foreground">Last 12 months</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-gradient-accent">{totalYearlyRevenue.toLocaleString()} DA</p>
        </div>
      </div>
      
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={yearlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="colorYearly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(345, 100%, 32%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(345, 100%, 32%)" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fill: 'hsl(220, 10%, 45%)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="revenue"
              fill="url(#colorYearly)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
