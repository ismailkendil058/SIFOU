
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminService, Transaction, Worker } from '@/services/adminService';
import { PlusCircle, Wallet, ArrowDownRight, ArrowUpRight, Banknote, Calendar, ChevronRight, User } from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const FinanceManager = () => {
    const [dailyBreakdown, setDailyBreakdown] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [pocketMoney, setPocketMoney] = useState(0);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState<any | null>(null);

    // Form State
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState<'income' | 'expense' | 'salary'>('expense');
    const [selectedWorker, setSelectedWorker] = useState<string>('');

    const fetchData = async () => {
        try {
            const breakdown = await adminService.getDailyRevenueBreakdown();
            setDailyBreakdown(breakdown);

            const txs = await adminService.getTransactions();
            // In the "Charges" tab, we only want expenses and salaries
            setTransactions(txs.filter(t => t.type === 'expense' || t.type === 'salary'));

            const money = await adminService.getPocketMoney();
            setPocketMoney(money);

            const w = await adminService.getWorkers(false);
            setWorkers(w);
        } catch (error) {
            toast.error("Failed to load financial data");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            toast.error("Please enter a valid positive amount");
            return;
        }
        if (!desc) {
            toast.error("Description is required");
            return;
        }
        if (type === 'salary' && !selectedWorker) {
            toast.error("Please select a worker for salary payment");
            return;
        }

        try {
            await adminService.addTransaction(val, desc, type, selectedWorker || undefined);
            toast.success("Transaction recorded");
            setIsDialogOpen(false);
            setAmount('');
            setDesc('');
            setType('expense');
            setSelectedWorker('');
            fetchData();
        } catch (err) {
            toast.error("Failed to add transaction");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Stats */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Wallet size={120} />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center text-slate-400 font-medium">
                            <Wallet className="mr-2 h-5 w-5" />
                            Current Balance (Pocket)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-bold tracking-tighter">
                            DZD {pocketMoney.toLocaleString()}
                        </div>
                        <p className="text-slate-400 mt-2 flex items-center">
                            <Banknote className="mr-2 h-4 w-4" />
                            Total cash available after all income & expenses
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="revenue" className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <TabsList className="bg-slate-100 p-1">
                        <TabsTrigger value="revenue" className="data-[state=active]:bg-white">
                            <Calendar className="mr-2 h-4 w-4" /> Daily Revenue
                        </TabsTrigger>
                        <TabsTrigger value="charges" className="data-[state=active]:bg-white">
                            <ArrowUpRight className="mr-2 h-4 w-4" /> Expenses & Salaries
                        </TabsTrigger>
                    </TabsList>

                    <Button onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                        <PlusCircle className="mr-2 h-4 w-4" /> New Charge
                    </Button>
                </div>

                <TabsContent value="revenue" className="mt-0">
                    <Card border-0 shadow-sm>
                        <CardHeader>
                            <CardTitle className="text-lg">Revenue History</CardTitle>
                            <CardDescription>Daily earnings grouped by worker. Click a row to see details.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="font-semibold">Date</TableHead>
                                        <TableHead className="font-semibold">Details</TableHead>
                                        <TableHead className="text-right font-semibold">Total DZD</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dailyBreakdown.map((day) => (
                                        <React.Fragment key={day.date}>
                                            <TableRow
                                                className="cursor-pointer hover:bg-slate-50 transition-colors"
                                                onClick={() => setSelectedDay(selectedDay === day.date ? null : day.date)}
                                            >
                                                <TableCell className="font-medium">
                                                    {format(new Date(day.date), 'EEEE, MMM dd, yyyy')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.keys(day.workers).slice(0, 3).map(wName => (
                                                            <span key={wName} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                                                                {wName}
                                                            </span>
                                                        ))}
                                                        {Object.keys(day.workers).length > 3 && (
                                                            <span className="text-[11px] text-muted-foreground">+{Object.keys(day.workers).length - 3} more</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-emerald-600">
                                                    {day.total.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <ChevronRight className={cn("h-4 w-4 text-slate-300 transition-transform", selectedDay === day.date && "rotate-90")} />
                                                </TableCell>
                                            </TableRow>
                                            {selectedDay === day.date && (
                                                <TableRow className="bg-slate-50/50">
                                                    <TableCell colSpan={4} className="p-4">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                            {Object.entries(day.workers).map(([name, amount]: [string, any]) => (
                                                                <div key={name} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
                                                                    <div className="flex items-center">
                                                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mr-3">
                                                                            <User size={16} />
                                                                        </div>
                                                                        <span className="font-medium text-slate-700">{name}</span>
                                                                    </div>
                                                                    <span className="font-bold text-slate-900 border-l pl-3 ml-3">
                                                                        DZD {amount.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    {dailyBreakdown.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-48 text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center opacity-50">
                                                    <Calendar size={48} className="mb-2" />
                                                    <p>No revenue records found yet.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="charges">
                    <Card border-0 shadow-sm>
                        <CardHeader>
                            <CardTitle className="text-lg">Expenses & Salary History</CardTitle>
                            <CardDescription>Tracking money leaving the pocket.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="font-semibold">Date</TableHead>
                                        <TableHead className="font-semibold">Category</TableHead>
                                        <TableHead className="font-semibold text-center">Reference</TableHead>
                                        <TableHead className="text-right font-semibold">Amount (DZD)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="text-muted-foreground w-[180px]">
                                                {format(new Date(tx.date), 'MMM dd, HH:mm')}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <BadgeType type={tx.type} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-center">
                                                    <span className="text-slate-700 font-medium">{tx.description}</span>
                                                    {tx.workerId && (
                                                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                                                            {workers.find(w => w.id === tx.workerId)?.name || 'Former Worker'}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-red-600 w-[150px]">
                                                - {tx.amount.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {transactions.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-48 text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center opacity-50">
                                                    <ArrowUpRight size={48} className="mb-2" />
                                                    <p>No charges recorded yet.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Charge</DialogTitle>
                        <DialogDescription>Record a new expense or salary payment.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label>What type of charge?</Label>
                                <Select value={type} onValueChange={(v: any) => setType(v)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="expense">General Expense</SelectItem>
                                        <SelectItem value="salary">Worker Salary</SelectItem>
                                        <SelectItem value="income">External Deposit (Inbound)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Amount (DZD)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="text-lg font-bold"
                                />
                            </div>
                        </div>

                        {type === 'salary' && (
                            <div className="space-y-2 animate-in slide-in-from-top duration-200">
                                <Label>Pay to Worker</Label>
                                <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a worker" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {workers.filter(w => w.is_active).map(w => (
                                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Description / Note</Label>
                            <Input
                                placeholder={type === 'salary' ? "e.g. Weekly salary" : "e.g. Bought more coffee"}
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className={type === 'income' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}>
                                {type === 'income' ? 'Confirm Deposit' : 'Confirm Charge'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const BadgeType = ({ type }: { type: string }) => {
    if (type === 'income' || type === 'manual') {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <ArrowDownRight className="mr-1 h-3 w-3" /> Income
            </span>
        );
    }
    if (type === 'salary') {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <Banknote className="mr-1 h-3 w-3" /> Salary
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ArrowUpRight className="mr-1 h-3 w-3" /> Expense
        </span>
    );
};
