
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminService, Worker } from '@/services/adminService';
import { UserPlus, Pencil, Trash2, KeyRound } from 'lucide-react';
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
        } catch (error) {
            toast.error("An error occurred");
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Workers</h2>
                    <p className="text-muted-foreground">Manage your team and their access keys.</p>
                </div>
                <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="mr-2 h-4 w-4" /> Add Worker
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Access Code</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {workers.map((worker) => (
                                <TableRow key={worker.id}>
                                    <TableCell className="font-medium">{worker.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-muted-foreground">
                                            <KeyRound className="mr-2 h-4 w-4" />
                                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                                {worker.password}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(worker)}>
                                            <Pencil className="h-4 w-4 text-blue-500" />
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete {worker.name} from the system.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(worker.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {workers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                        No workers found. Add one to get started.
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
                        <DialogTitle>{editingWorker ? 'Edit Worker' : 'Add New Worker'}</DialogTitle>
                        <DialogDescription>
                            Create a unique access profile for your employee.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Ahmed Benali"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">4-Digit Passcode</Label>
                            <Input
                                id="password"
                                value={formData.password}
                                onChange={(e) => {
                                    // Restrict to numbers only and max 4 chars
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    setFormData({ ...formData, password: val });
                                }}
                                placeholder="####"
                                className="font-mono text-lg tracking-widest text-center"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={formData.password.length !== 4 || !formData.name}>
                                {editingWorker ? 'Save Changes' : 'Create Worker'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
