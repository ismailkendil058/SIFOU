
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
        <div className="space-y-8 animate-fade-up">
            {/* Hero Balance Card */}
            <Card className="glass rounded-3xl border-primary/25 shadow-2xl shadow-glow-gold relative overflow-hidden max-w-full sm:max-w-2xl lg:max-w-4xl mx-auto animate-scale-in stagger-1 group/card">
                <div className="absolute inset-0 bg-gradient-gold opacity-20" />
                <div className="absolute top-8 -right-20 w-64 h-64 bg-gradient-primary opacity-10 blur-3xl rounded-full group-hover/card:animate-pulse-glow" />
                <div className="absolute bottom-8 left-8 w-48 h-48 bg-gradient-accent opacity-10 blur-3xl rounded-full" />
                <CardHeader className="pb-0 pt-12 relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-gold shadow-2xl shadow-glow-gold flex items-center justify-center p-4 animate-float">
                            <Wallet className="w-12 h-12 text-gold-foreground drop-shadow-lg" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-display tracking-widest text-gradient-gold mb-1">Pocket Balance</CardTitle>
                            <CardDescription className="text-lg text-muted-foreground/90 font-semibold">Available cash after all transactions</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pb-12 pt-4 relative z-10">
                    <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl lg:text-8xl font-display font-bold text-foreground leading-none tracking-tight mb-6 bg-gradient-gold bg-clip-text text-transparent drop-shadow-lg">
                        DZD {pocketMoney.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground/80 text-lg">
                        <Banknote className="h-6 w-6 text-gold-foreground/70 animate-pulse-glow" />
                        <span className="font-semibold">Ready for operations</span>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center mb-8 pt-8 border-t border-primary/20">
                <h2 className="text-3xl sm:text-4xl font-display tracking-widest text-gradient-primary">Transactions</h2>
                <Button 
                    onClick={() => setIsDialogOpen(true)} 
                    className="glass h-14 px-8 rounded-3xl shadow-xl shadow-glow-primary hover:shadow-glow-accent font-display text-lg font-bold transition-all duration-300 bg-gradient-primary text-primary-foreground hover:bg-gradient-accent hover:text-accent-foreground"
                >
                    <PlusCircle className="mr-3 h-5 w-5" />
                    New Charge
                </Button>
            </div>

            <Tabs defaultValue="revenue" className="w-full">
                <TabsList className="glass rounded-3xl p-2 shadow-glow-primary bg-background/50 backdrop-blur-xl border-primary/20 mb-8 justify-start lg:justify-center">
                    <TabsTrigger value="revenue" className="h-14 px-8 rounded-2xl data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-primary font-semibold text-lg transition-all">
                        <Calendar className="mr-2 h-5 w-5" /> Daily Revenue
                    </TabsTrigger>
                    <TabsTrigger value="charges" className="h-14 px-8 rounded-2xl data-[state=active]:bg-gradient-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-glow-accent font-semibold text-lg transition-all">
                        <ArrowUpRight className="mr-2 h-5 w-5" /> Charges
                    </TabsTrigger>
                </TabsList>


                <TabsContent value="revenue" className="mt-0 animate-scale-in">
                    <Card className="glass rounded-3xl border-primary/25 shadow-2xl shadow-glow-primary hover:shadow-glow-accent transition-all">
                        <CardHeader className="pb-6">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-8 w-8 text-primary shrink-0" />
                                <div>
                                    <CardTitle className="text-2xl font-display tracking-tight text-gradient-primary">Daily Revenue History</CardTitle>
                                    <CardDescription className="text-lg">Earnings grouped by worker. Click rows for breakdown.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-primary/10 backdrop-blur-sm hover:bg-gradient-primary/20">
                                            <TableHead className="font-display text-lg tracking-tight text-primary">Date</TableHead>
                                            <TableHead className="font-display text-lg tracking-tight text-primary">Workers Active</TableHead>
                                            <TableHead className="font-display text-lg tracking-tight text-primary text-right">Total DZD</TableHead>
                                            <TableHead />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dailyBreakdown.map((day, idx) => (
                                            <React.Fragment key={day.date}>
                                                <TableRow
                                                    className={cn("glass group/table hover:bg-primary/5 hover:shadow-glow-primary cursor-pointer transition-all duration-300 border-b border-primary/10 hover:border-primary/30", idx % 2 === 0 && "bg-background/50")}
                                                    onClick={() => setSelectedDay(selectedDay === day.date ? null : day.date)}
                                                >
                                                    <TableCell className="font-semibold text-lg">
                                                        <div className="font-display tracking-tight">
                                                            {format(new Date(day.date), 'EEE, MMM dd')}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground capitalize">
                                                            {format(new Date(day.date), 'yyyy')}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.keys(day.workers).slice(0, 4).map(wName => (
                                                                <span key={wName} className="inline-flex items-center px-3 py-1.5 rounded-2xl text-sm font-semibold bg-gradient-primary/10 text-primary border border-primary/20 shadow-sm hover:shadow-glow-primary transition-all">
                                                                    {wName}
                                                                </span>
                                                            ))}
                                                            {Object.keys(day.workers).length > 4 && (
                                                                <span className="text-sm text-muted-foreground font-semibold">+{Object.keys(day.workers).length - 4}</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="text-3xl font-display font-bold text-gradient-success tracking-tight">
                                                            {day.total.toLocaleString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <ChevronRight className={cn("h-6 w-6 text-muted-foreground transition-transform group-hover/table:text-primary shrink-0", selectedDay === day.date && "rotate-90 text-primary scale-110")} />
                                                    </TableCell>
                                                </TableRow>
                                                {selectedDay === day.date && (
                                                    <TableRow className="bg-gradient-primary/5 backdrop-blur-sm">
                                                        <TableCell colSpan={4} className="p-8">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                                                {Object.entries(day.workers).map(([name, amount]: [string, number]) => (
                                                                    <Card key={name} className="glass rounded-2xl border-primary/20 shadow-glow-primary hover:shadow-glow-accent p-6 group/card hover:-translate-y-2 transition-all">
                                                                        <div className="flex items-center justify-between mb-3">
                                                                            <div className="w-12 h-12 rounded-2xl bg-gradient-accent/20 border border-accent/30 flex items-center justify-center">
                                                                                <User className="h-6 w-6 text-accent" />
                                                                            </div>
                                                                            <span className="font-bold text-2xl text-gradient-success">{amount.toLocaleString()}</span>
                                                                        </div>
                                                                        <h4 className="font-display font-bold text-lg text-foreground group-hover/card:text-accent mb-1">{name}</h4>
                                                                        <p className="text-sm text-muted-foreground">Revenue generated</p>
                                                                    </Card>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        {dailyBreakdown.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-64 p-12 text-center">
                                                    <div className="flex flex-col items-center justify-center opacity-60 space-y-4">
                                                        <Calendar className="h-24 w-24 text-muted-foreground animate-pulse-glow" />
                                                        <div>
                                                            <h3 className="text-2xl font-display font-bold text-muted-foreground">No revenue yet</h3>
                                                            <p className="text-lg text-muted-foreground/70 mt-1">Revenue records will appear here.</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>


                <TabsContent value="charges" className="animate-scale-in">
                    <Card className="glass rounded-3xl border-accent/25 shadow-2xl shadow-glow-accent hover:shadow-glow-primary">
                        <CardHeader className="pb-6">
                            <div className="flex items-center gap-3">
                                <ArrowUpRight className="h-8 w-8 text-destructive shrink-0" />
                                <div>
                                    <CardTitle className="text-2xl font-display tracking-tight text-gradient-accent">Expenses & Salaries</CardTitle>
                                    <CardDescription className="text-lg">All outgoing transactions tracked here.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-accent/10 backdrop-blur-sm hover:bg-gradient-accent/20">
                                            <TableHead className="font-display text-lg tracking-tight text-accent font-bold">Date & Time</TableHead>
                                            <TableHead className="font-display text-lg tracking-tight text-accent font-bold">Type</TableHead>
                                            <TableHead className="font-display text-lg tracking-tight text-accent font-bold text-center">Description</TableHead>
                                            <TableHead className="font-display text-lg tracking-tight text-accent font-bold text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((tx, idx) => (
                                            <TableRow key={tx.id} className={cn("glass border-b border-accent/20 hover:bg-accent/5 hover:shadow-glow-accent transition-all duration-300 group/row", idx % 2 === 0 && "bg-background/30")}>
                                                <TableCell className="font-semibold whitespace-nowrap">
                                                    <div className="text-muted-foreground text-sm">{format(new Date(tx.date), 'MMM dd')}</div>
                                                    <div className="font-display tracking-tight text-lg">{format(new Date(tx.date), 'HH:mm')}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <BadgeType type={tx.type} />
                                                </TableCell>
                                                <TableCell className="text-center group/row:hover:text-accent">
                                                    <div className="font-semibold text-lg">{tx.description}</div>
                                                    {tx.workerId && (
                                                        <div className="inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold/20 text-gold-foreground border border-gold/30">
                                                            <User className="h-3 w-3" />
                                                            {workers.find(w => w.id === tx.workerId)?.name || 'Former Worker'}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="text-3xl font-display font-bold text-destructive tracking-tight">
                                                        -{tx.amount.toLocaleString()}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">DZD</div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {transactions.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-64 p-16 text-center">
                                                    <div className="flex flex-col items-center justify-center opacity-60 space-y-4">
                                                        <ArrowUpRight className="h-24 w-24 text-muted-foreground rotate-12 animate-bounce" />
                                                        <div>
                                                            <h3 className="text-3xl font-display font-bold text-muted-foreground">No charges yet</h3>
                                                            <p className="text-xl text-muted-foreground/70 mt-2">Record your first expense or salary payment.</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>


            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass rounded-3xl border-primary/25 shadow-lg sm:shadow-2xl shadow-glow-primary sm:max-w-md max-h-[90vh] max-w-[95vw] p-0 backdrop-blur-xl animate-scale-in">
                    <div className="absolute inset-0 barca-field-lines opacity-5 rounded-[inherit]" />
                    <DialogHeader className="text-center pb-2 pt-8 relative">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-gradient-gold shadow-glow-gold flex items-center justify-center animate-pulse-glow">
                            <PlusCircle className="w-8 h-8 text-gold-foreground" />
                        </div>
                        <DialogTitle className="text-3xl font-display tracking-wider text-gradient-primary">New Transaction</DialogTitle>
                        <DialogDescription className="text-lg text-muted-foreground/90 font-medium">Record expense, salary or deposit</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold tracking-wide text-foreground/80">Transaction Type</Label>
                            <Select value={type} onValueChange={(v: any) => setType(v)}>
                                <SelectTrigger className="glass h-16 rounded-3xl shadow-lg border-primary/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:shadow-glow-primary data-[state=open]:shadow-glow-primary">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass rounded-3xl border-primary/25 shadow-2xl backdrop-blur-xl">
                                    <SelectItem value="expense" className="font-semibold hover:bg-primary/10">📦 General Expense</SelectItem>
                                    <SelectItem value="salary" className="font-semibold hover:bg-accent/10">💰 Worker Salary</SelectItem>
                                    <SelectItem value="income" className="font-semibold hover:bg-success/10">💵 External Deposit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold tracking-wide text-foreground/80">Amount (DZD)</Label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-display text-primary">DZD</span>
                                <Input
                                    type="number"
                                    placeholder="1250"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="pl-16 pr-12 h-16 rounded-3xl shadow-xl border-primary/30 focus-visible:ring-3 focus-visible:ring-primary focus-visible:shadow-glow-primary text-2xl font-display font-bold tracking-tight placeholder:text-muted-foreground/50 transition-all"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {type === 'salary' && (
                            <div className="space-y-2 animate-in slide-in-from-top-5 duration-300">
                                <Label className="text-sm font-semibold tracking-wide text-foreground/80">Select Worker</Label>
                                <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                                    <SelectTrigger className="glass h-16 rounded-3xl shadow-lg border-accent/30 focus-visible:ring-accent focus-visible:shadow-glow-accent">
                                        <SelectValue placeholder="Choose worker for salary" />
                                    </SelectTrigger>
                                    <SelectContent className="glass rounded-3xl border-accent/25 shadow-glow-accent">
                                        {workers.filter(w => w.is_active).map(w => (
                                            <SelectItem key={w.id} value={w.id} className="font-semibold hover:bg-accent/10">
                                                {w.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold tracking-wide text-foreground/80">Description</Label>
                            <Input
                                placeholder={type === 'salary' ? "Weekly salary payment" : type === 'income' ? "Cash deposit from client" : "Coffee supplies"}
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                className="h-16 rounded-3xl shadow-lg border-primary/30 focus-visible:ring-primary focus-visible:shadow-glow-primary text-lg font-semibold placeholder:text-muted-foreground/50 transition-all"
                            />
                        </div>

                        <DialogFooter className="pt-8 gap-4 !justify-between">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                className="h-16 px-8 rounded-3xl font-semibold text-lg border-muted hover:bg-muted hover:shadow-md transition-all"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className={cn(
                                    "h-16 px-10 rounded-3xl shadow-2xl shadow-glow-primary font-display font-bold text-xl flex-1 max-w-xs transition-all duration-300 touch-active",
                                    type === 'income' ? "bg-gradient-success hover:shadow-glow-success text-success-foreground" : "bg-gradient-accent hover:shadow-glow-accent text-accent-foreground"
                                )}
                                disabled={!amount || !desc || (type === 'salary' && !selectedWorker)}
                            >
                                {type === 'income' ? 'Confirm Deposit 💵' : 'Record Charge 💳'}
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
