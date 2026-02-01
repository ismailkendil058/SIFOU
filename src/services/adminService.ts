import { supabase } from '@/lib/supabase';

export interface Worker {
    id: string;
    name: string;
    password: string; // Mapped to 'pin' in DB
    is_active: boolean;
}

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string; // ISO string
    type: 'income' | 'salary' | 'expense' | 'manual';
    workerId?: string;
}

export const adminService = {
    // Workers
    getWorkers: async (): Promise<Worker[]> => {
        const { data, error } = await supabase
            .from('workers')
            .select('*')
            .order('name');

        if (error) throw error;

        return data.map(w => ({
            id: w.id,
            name: w.name,
            password: w.pin, // Map DB 'pin' to frontend 'password'
            is_active: w.is_active
        }));
    },

    addWorker: async (name: string, pin: string): Promise<Worker> => {
        const { data, error } = await supabase
            .from('workers')
            .insert({ name, pin, is_active: true })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            password: data.pin,
            is_active: data.is_active
        };
    },

    updateWorker: async (id: string, updates: Partial<Worker>): Promise<Worker> => {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.password) dbUpdates.pin = updates.password;
        if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;

        const { data, error } = await supabase
            .from('workers')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            password: data.pin,
            is_active: data.is_active
        };
    },

    deleteWorker: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('workers')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Finances
    getTransactions: async (): Promise<Transaction[]> => {
        // Fetch Sales (Income)
        const { data: salesData, error: salesError } = await supabase
            .from('sales')
            .select('*')
            .order('created_at', { ascending: false });

        if (salesError) throw salesError;

        // Fetch Charges (Expenses/Salaries)
        const { data: chargesData, error: chargesError } = await supabase
            .from('charges')
            .select('*')
            .order('date', { ascending: false });

        if (chargesError) throw chargesError;

        const salesTxs: Transaction[] = (salesData || []).map(s => ({
            id: s.id,
            amount: s.total_amount,
            description: s.post_name === 'MANUAL_DEPOSIT' ? 'Manual Deposit' : `Sale: ${s.post_name} (${s.post_type})`,
            date: s.created_at,
            type: s.post_type === 'MANUAL_DEPOSIT' ? 'manual' : 'income',
            workerId: s.worker_id
        }));

        const chargesTxs: Transaction[] = (chargesData || []).map(c => ({
            id: c.id,
            amount: c.amount,
            description: c.description || c.category,
            date: c.created_at || c.date, // prefer created_at if available, else date
            type: (c.category === 'salary' ? 'salary' : 'expense') as Transaction['type'],
        }));

        // Combine and sort
        return [...salesTxs, ...chargesTxs].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    },

    addTransaction: async (amount: number, description: string, type: Transaction['type'], workerId?: string): Promise<Transaction> => {
        if (type === 'income' || type === 'manual') {
            // Insert into sales as a manual entry
            const { data, error } = await supabase
                .from('sales')
                .insert({
                    post_name: 'MANUAL_DEPOSIT',
                    post_type: 'MANUAL_DEPOSIT',
                    total_amount: amount,
                    amount: amount,
                    points: 0,
                    additional_payment: 0,
                    worker_id: workerId || null,
                    worker_name: 'Admin'
                })
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                amount: data.total_amount,
                description: 'Manual Deposit',
                date: data.created_at,
                type: 'manual',
                workerId: data.worker_id
            };

        } else {
            // Expense or Salary -> Insert into charges
            const { data, error } = await supabase
                .from('charges')
                .insert({
                    category: type,
                    amount: amount,
                    description: description,
                    date: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                amount: data.amount,
                description: data.description,
                date: data.date,
                type: type
            };
        }
    },

    // Stats
    getStats: async (range: 'day' | 'week' | 'month' | 'custom', startDate?: Date, endDate?: Date) => {
        const transactions = await adminService.getTransactions();
        const now = new Date();
        let filtered = transactions;

        // Date Helpers
        const isSameDay = (d1: Date, d2: Date) =>
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();

        if (range === 'day') {
            filtered = transactions.filter(t => isSameDay(new Date(t.date), now));
        } else if (range === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = transactions.filter(t => new Date(t.date) >= weekAgo);
        } else if (range === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            filtered = transactions.filter(t => new Date(t.date) >= monthAgo);
        } else if (range === 'custom' && startDate && endDate) {
            filtered = transactions.filter(t => {
                const d = new Date(t.date);
                return d >= startDate && d <= endDate;
            });
        }

        const totalEarned = filtered
            .filter(t => t.type === 'income' || t.type === 'manual')
            .reduce((acc, t) => acc + t.amount, 0);

        const totalExpenses = filtered
            .filter(t => t.type === 'expense' || t.type === 'salary')
            .reduce((acc, t) => acc + t.amount, 0);

        const workerEarnings: Record<string, number> = {};
        const workers = await adminService.getWorkers();
        workers.forEach(w => workerEarnings[w.id] = 0);

        filtered.filter(t => (t.type === 'income' || t.type === 'manual') && t.workerId).forEach(t => {
            if (workerEarnings[t.workerId!] !== undefined) {
                workerEarnings[t.workerId!] += t.amount;
            } else {
                workerEarnings[t.workerId!] = t.amount;
            }
        });

        return {
            totalEarned,
            totalExpenses,
            net: totalEarned - totalExpenses,
            workerEarnings
        };
    },

    getPocketMoney: async (): Promise<number> => {
        // Fetch all sales totals
        const { data: sales, error: sErr } = await supabase.from('sales').select('total_amount');
        if (sErr) throw sErr;

        // Fetch all charges totals
        const { data: charges, error: cErr } = await supabase.from('charges').select('amount');
        if (cErr) throw cErr;

        const totalIncome = sales?.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0) || 0;
        const totalOutflow = charges?.reduce((sum, c) => sum + (Number(c.amount) || 0), 0) || 0;

        return totalIncome - totalOutflow;
    }
};
