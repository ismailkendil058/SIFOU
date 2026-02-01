
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminService, Transaction, Worker } from '@/services/adminService';
import { PlusCircle, Wallet, ArrowDownRight, ArrowUpRight, Banknote } from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const FinanceManager = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [pocketMoney, setPocketMoney] = useState(0);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState<'income' | 'expense' | 'salary'>('expense');
    const [selectedWorker, setSelectedWorker] = useState<string>('');

    const fetchData = async () => {
        const txs = await adminService.getTransactions();
        setTransactions(txs);
        const money = await adminService.getPocketMoney();
        setPocketMoney(money);
        const w = await adminService.getWorkers();
        setWorkers(w);
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
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center text-slate-400">
                            <Wallet className="mr-2 h-5 w-5" />
                            Current Pocket Money
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-bold tracking-tighter">
                            DZD {pocketMoney.toLocaleString()}
                        </div>
                        <p className="text-slate-400 mt-2">Available cash on hand</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-between items-center mt-8">
                <h3 className="text-xl font-semibold">Recent Transactions</h3>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="text-muted-foreground w-[150px]">
                                        {format(new Date(tx.date), 'MMM dd, HH:mm')}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {tx.description}
                                        {tx.workerId && workers.find(w => w.id === tx.workerId) && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                {workers.find(w => w.id === tx.workerId)?.name}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <BadgeType type={tx.type} />
                                    </TableCell>
                                    <TableCell className={cn(
                                        "text-right font-bold w-[150px]",
                                        (tx.type === 'income' || tx.type === 'manual') ? "text-emerald-600" : "text-red-600"
                                    )}>
                                        {(tx.type === 'income' || tx.type === 'manual') ? "+" : "-"} {tx.amount.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {transactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No transactions recorded.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Transaction</DialogTitle>
                        <DialogDescription>Record a new financial entry.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Transaction Type</Label>
                                <Select value={type} onValueChange={(v: any) => setType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="expense">Expense</SelectItem>
                                        <SelectItem value="salary">Worker Salary</SelectItem>
                                        <SelectItem value="income">Deposit (Add Money)</SelectItem>
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
                                />
                            </div>
                        </div>

                        {type === 'salary' && (
                            <div className="space-y-2">
                                <Label>Select Worker</Label>
                                <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a worker" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {workers.map(w => (
                                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                placeholder={type === 'salary' ? "Salary payment for October" : "e.g. Bought supplies"}
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className={type === 'income' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}>
                                {type === 'income' ? 'Add Deposit' : 'Add Charge'}
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
