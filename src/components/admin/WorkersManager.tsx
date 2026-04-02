
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { adminService, Worker } from '@/services/adminService';
import { UserPlus, Pencil, Trash2, KeyRound, Users, Shield } from 'lucide-react';
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const WorkersManager = () => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
    const [formData, setFormData] = useState({ name: '', password: '' });

    const fetchWorkers = async () => {
        const data = await adminService.getWorkers();
        setWorkers(data);
    };

    useEffect(() => {
        fetchWorkers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!/^\d{4}$/.test(formData.password)) {
            toast.error("Password must be exactly 4 numeric digits.");
            return;
        }
        if (!formData.name.trim()) {
            toast.error("Name is required.");
            return;
        }

        try {
            if (editingWorker) {
                await adminService.updateWorker(editingWorker.id, formData);
                toast.success("Worker updated successfully");
            } else {
                await adminService.addWorker(formData.name, formData.password);
                toast.success("Worker key created successfully");
            }
            setIsDialogOpen(false);
            setEditingWorker(null);
            setFormData({ name: '', password: '' });
            fetchWorkers();
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await adminService.deleteWorker(id);
            toast.success("Worker deleted");
            fetchWorkers();
        } catch (error) {
            toast.error("Could not delete worker");
        }
    };

    const openEdit = (worker: Worker) => {
        setEditingWorker(worker);
        setFormData({ name: worker.name, password: worker.password });
        setIsDialogOpen(true);
    };

    const openAdd = () => {
        setEditingWorker(null);
        setFormData({ name: '', password: '' });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-fade-up">
                <div className="space-y-2">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-widest text-gradient-primary">Team</h2>
                    <p className="text-xl text-muted-foreground font-semibold max-w-md">Manage workers and their 4-digit access codes</p>
                </div>
                <Button 
                    onClick={openAdd} 
                    className="group glass h-16 px-10 rounded-3xl shadow-2xl shadow-glow-primary hover:shadow-glow-accent bg-gradient-primary text-primary-foreground font-display font-bold text-xl transition-all duration-300 hover:scale-[1.05] self-start sm:self-auto"
                >
                    <UserPlus className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                    Add Team Member
                </Button>
            </div>

            {/* Stats Badge */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="glass rounded-3xl border-primary/20 shadow-glow-primary p-8 text-center animate-scale-in stagger-1">
                    <Users className="h-16 w-16 mx-auto mb-4 text-primary shadow-glow-primary rounded-2xl p-4 bg-gradient-primary/10" />
                    <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gradient-primary mb-2">{workers.length}</div>
                    <div className="text-xl font-semibold text-muted-foreground">Active Workers</div>
                </Card>
                <Card className="glass rounded-3xl border-accent/20 shadow-glow-accent p-8 text-center animate-scale-in stagger-2">
                    <KeyRound className="h-16 w-16 mx-auto mb-4 text-accent shadow-glow-accent rounded-2xl p-4 bg-gradient-accent/10" />
                    <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gradient-accent mb-2">{workers.filter(w => w.is_active).length}</div>
                    <div className="text-xl font-semibold text-muted-foreground">Online</div>
                </Card>
                <Card className="glass rounded-3xl border-gold/20 shadow-glow-gold p-8 text-center animate-scale-in stagger-3">
                    <Shield className="h-16 w-16 mx-auto mb-4 text-gold-foreground shadow-glow-gold rounded-2xl p-4 bg-gradient-gold/10" />
                    <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-2">{workers.length > 0 ? 'Secured' : 'Start'}</div>
                    <div className="text-xl font-semibold text-muted-foreground">PIN Protected</div>
                </Card>
            </div>

            {/* Workers Table */}
            <Card className="glass rounded-3xl border-primary/25 shadow-2xl shadow-glow-primary overflow-hidden border-0">
                <CardHeader className="pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-primary shadow-glow-primary flex items-center justify-center">
                            <Users className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-display tracking-tight text-gradient-primary">Team Roster</CardTitle>
                            <CardDescription className="text-lg">Active workers with secure access codes</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gradient-primary/5 backdrop-blur-sm hover:bg-gradient-primary/10">
                                    <TableHead className="font-display text-xl tracking-tight text-primary font-bold w-[40%]">Worker</TableHead>
                                    <TableHead className="font-display text-xl tracking-tight text-primary font-bold w-[30%]">PIN Code</TableHead>
                                    <TableHead className="font-display text-xl tracking-tight text-primary font-bold w-[30%] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {workers.map((worker, idx) => (
                                    <TableRow key={worker.id} className={cn("glass hover:bg-primary/5 hover:shadow-glow-primary border-b border-primary/10 group/row transition-all duration-300", idx % 2 === 0 && "bg-background/50")}>
                                        <TableCell className="font-semibold text-xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-accent/20 border-2 border-accent/30 flex items-center justify-center shadow-lg">
                                                    <Users className="h-6 w-6 text-accent" />
                                                </div>
                                                <div>
                                                    <div className="font-display font-bold text-2xl tracking-tight text-foreground">{worker.name}</div>
                                                    <div className="text-sm text-muted-foreground font-medium">{worker.is_active ? 'Active' : 'Inactive'}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center bg-gradient-gold/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-gold/30 shadow-inner font-mono font-bold text-2xl tracking-widest text-gold-foreground group-hover/row:bg-gradient-gold/20 transition-all">
                                                <KeyRound className="mr-3 h-8 w-8 text-gold-foreground/70" />
                                                {worker.password}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button 
                                                variant="ghost" 
                                                size="icon-lg" 
                                                className="h-14 w-14 rounded-2xl border hover:border-primary hover:shadow-glow-primary group/edit hover:bg-primary/10 transition-all"
                                                onClick={() => openEdit(worker)}
                                            >
                                                <Pencil className="h-5 w-5 text-primary group-hover/edit:scale-110" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon-lg" 
                                                        className="h-14 w-14 rounded-2xl border hover:border-destructive hover:shadow-glow-destructive group/delete hover:bg-destructive/10 transition-all"
                                                    >
                                                        <Trash2 className="h-5 w-5 text-destructive group-hover/delete:scale-110" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="glass rounded-3xl border-destructive/25 shadow-glow-destructive max-w-md">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-gradient-accent font-display text-2xl">Confirm Delete</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-lg">
                                                            This will permanently remove <span className="font-bold text-destructive">{worker.name}</span> and revoke their access.
                                                            <br />
                                                            <span className="text-sm text-muted-foreground block mt-2">This action cannot be undone.</span>
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="gap-3">
                                                        <AlertDialogCancel className="h-14 px-8 rounded-2xl font-semibold text-lg border hover:shadow-md transition-all">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction 
                                                            onClick={() => handleDelete(worker.id)} 
                                                            className="h-14 px-8 rounded-2xl bg-gradient-destructive shadow-glow-destructive text-destructive-foreground font-display font-bold text-lg hover:shadow-glow-destructive hover:scale-[1.02] transition-all flex-1"
                                                        >
                                                            Permanently Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {workers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-80 p-20 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-6 opacity-60">
                                                <Users className="h-32 w-32 text-muted-foreground rotate-12 animate-pulse-glow" />
                                                <div className="space-y-2">
                                                    <h3 className="text-4xl font-display font-bold text-muted-foreground">No team members</h3>
                                                    <p className="text-2xl text-muted-foreground/70">Add your first worker to get started</p>
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


            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass rounded-3xl border-primary/25 shadow-lg sm:shadow-2xl shadow-glow-primary max-w-[95vw] sm:max-w-lg backdrop-blur-xl p-0 max-h-[90vh]">
                    <div className="p-0">
                        <DialogHeader className="text-center py-10 px-8 relative">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-primary shadow-glow-primary flex items-center justify-center animate-pulse-glow">
                                {editingWorker ? <Pencil className="w-10 h-10 text-primary-foreground" /> : <UserPlus className="w-10 h-10 text-primary-foreground" />}
                            </div>
                            <DialogTitle className="text-4xl font-display tracking-wider text-gradient-primary mb-3">{editingWorker ? 'Edit Profile' : 'Add Team Member'}</DialogTitle>
                            <DialogDescription className="text-xl text-muted-foreground/90 font-semibold max-w-md mx-auto">
                                {editingWorker ? 'Update worker details and access code' : 'Create secure access profile with 4-digit PIN'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="px-8 pb-12 space-y-8">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-lg font-semibold tracking-wide text-foreground/90">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Ahmed Benali"
                                    className="h-20 rounded-3xl shadow-xl border-primary/30 text-2xl font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-3 focus-visible:ring-primary focus-visible:shadow-glow-primary font-display tracking-tight transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="password" className="text-lg font-semibold tracking-wide text-foreground/90 flex items-center gap-2">
                                    <KeyRound className="h-6 w-6 text-primary" />
                                    4-Digit Access Code
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={formData.password}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                            setFormData({ ...formData, password: val });
                                        }}
                                        placeholder="1234"
                                        maxLength={4}
                                    className="font-mono text-3xl sm:text-4xl tracking-[0.4em] text-center h-20 sm:h-28 rounded-3xl shadow-xl sm:shadow-2xl border-2 border-gold/50 bg-gradient-gold/5 backdrop-blur-sm focus-visible:border-primary focus-visible:shadow-glow-primary focus-visible:bg-gradient-primary/10 transition-all font-bold uppercase letter-spacing-6"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="grid grid-cols-4 gap-2 w-full max-w-xs px-4">
                                            {Array(4).fill(0).map((_, i) => (
                                                <div key={i} className={cn("h-20 w-20 rounded-2xl bg-muted/50 backdrop-blur-sm border-2 border-transparent shadow-inner transition-all group-focus-within:border-primary group-focus-within:shadow-glow-primary", formData.password.length > i && "bg-gradient-primary shadow-glow-primary scale-105")}>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground/70 text-center font-medium">
                                    {formData.password.length === 4 ? '✅ Perfect! Code is ready' : `Enter ${4 - formData.password.length} more digits`}
                                </p>
                            </div>

                            <DialogFooter className="pt-8 gap-4 !justify-between">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    className="h-16 w-full sm:w-auto px-8 rounded-3xl font-display font-semibold text-lg border-2 hover:border-muted hover:shadow-lg transition-all"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={formData.password.length !== 4 || !formData.name.trim()}
                                    className={cn(
                                        "h-16 flex-1 sm:w-auto px-12 rounded-3xl shadow-2xl font-display font-bold text-xl transition-all duration-300",
                                        formData.password.length === 4 && formData.name.trim() 
                                            ? "bg-gradient-accent shadow-glow-accent hover:shadow-glow-gold hover:bg-gradient-gold text-accent-foreground" 
                                            : "bg-muted shadow-md cursor-not-allowed"
                                    )}
                                >
                                    {editingWorker ? 'Save Changes' : 'Create Worker'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

