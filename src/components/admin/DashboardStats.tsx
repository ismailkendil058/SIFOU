
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { adminService } from '@/services/adminService';
import { format } from 'date-fns';
import { CalendarIcon, DollarSign, Wallet, TrendingUp } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const DashboardStats = () => {
    const [filter, setFilter] = useState<'day' | 'week' | 'month' | 'custom'>('day');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [stats, setStats] = useState<any>(null);
    const [workers, setWorkers] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            // For simplicity in this demo, Custom will just use a single day or simplistic range logic if needed, 
            // but let's assume 'date' is start and 'endDate' is end for Custom.
            // For others, date/endDate might be ignored by service logic or computed there.
            // But my service expects Date objects for custom.

            let sDate = date;
            let eDate = endDate;

            // If user picks "One Day", it's effectively "Today" or the selected single date. 
            // The mock service 'day' = matches TODAY.
            // Let's rely on the service logic for 'day', 'week', 'month' as "Last 24h", "Last 7d", "Last 30d".

            const data = await adminService.getStats(filter, sDate, eDate);
            setStats(data);

            const w = await adminService.getWorkers();
            setWorkers(w);
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                <div className="flex flex-wrap gap-2">
                    <Button variant={filter === 'day' ? 'default' : 'outline'} onClick={() => setFilter('day')}>Today</Button>
                    <Button variant={filter === 'week' ? 'default' : 'outline'} onClick={() => setFilter('week')}>Week</Button>
                    <Button variant={filter === 'month' ? 'default' : 'outline'} onClick={() => setFilter('month')}>Month</Button>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={filter === 'custom' ? 'default' : 'outline'} onClick={() => setFilter('custom')}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filter === 'custom' && date ? (
                                    endDate ? `${format(date, 'LLL dd')} - ${format(endDate, 'LLL dd')}` : format(date, 'LLL dd')
                                ) : "Custom"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <div className="p-2 border-b text-center font-medium">Select Start Date</div>
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                            />
                            <div className="p-2 border-y text-center font-medium">Select End Date</div>
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Total Earned</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-800">DZD {stats?.totalEarned?.toLocaleString() ?? 0}</div>
                        <p className="text-xs text-green-600 mt-1">For selected period</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-700">Expenses/Salaries</CardTitle>
                        <TrendingUp className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-800">DZD {stats?.totalExpenses?.toLocaleString() ?? 0}</div>
                        <p className="text-xs text-red-600 mt-1">Total outflow</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">Net Profit</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-800">DZD {stats?.net?.toLocaleString() ?? 0}</div>
                        <p className="text-xs text-blue-600 mt-1">Calculated earning</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Worker Performance (Revenue Generated)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={workerChartData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `DZD${value}`} />
                                <Tooltip formatter={(value: number) => [`DZD ${value}`, 'Revenue']} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="earnings" fill="#adfa1d" radius={[4, 4, 0, 0]} className="fill-primary" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
