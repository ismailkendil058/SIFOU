import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import {
  GamingPost,
  Worker,
  Sale,
  Charge,
  WorkerSession,
  PRICING,
  getPS5Price
} from '@/types';

interface GameStore {
  // Loading state
  isLoading: boolean;
  error: string | null;

  // Posts
  posts: GamingPost[];
  addPoint: (postId: string) => Promise<void>;
  removePoint: (postId: string) => Promise<void>;
  cashOut: (postId: string, additionalPayment?: number) => Promise<void>;
  resetPost: (postId: string) => Promise<void>;
  loadPosts: () => Promise<void>;

  // Workers
  workers: Worker[];
  addWorker: (name: string, pin: string) => Promise<void>;
  updateWorker: (id: string, updates: Partial<Worker>) => Promise<void>;
  deleteWorker: (id: string) => Promise<void>;
  validatePin: (pin: string) => Worker | null;
  loadWorkers: () => Promise<void>;

  // Active session
  activeSession: WorkerSession | null;
  startSession: (worker: Worker) => void;
  endSession: () => void;

  // Sales
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<void>;
  addAdditionalPayment: (amount: number, description?: string) => Promise<void>;
  loadSales: () => Promise<void>;

  // Charges
  charges: Charge[];
  addCharge: (charge: Omit<Charge, 'id'>) => Promise<void>;
  updateCharge: (id: string, updates: Partial<Charge>) => Promise<void>;
  deleteCharge: (id: string) => Promise<void>;
  loadCharges: () => Promise<void>;

  // Statistics helpers
  getTodayRevenue: () => number;
  getTodayCharges: () => number;
  getTodayProfit: () => number;
  getWorkerStats: (workerId: string, date?: Date) => { sales: number; revenue: number };

  // Initialize data
  initialize: () => Promise<void>;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Loading state
      isLoading: false,
      error: null,

      // Posts
      posts: [],
      addPoint: async (postId: string) => {
        try {
          set({ isLoading: true, error: null });
          const { posts } = get();
          const postIndex = posts.findIndex(p => p.id === postId);
          if (postIndex !== -1) {
            const updatedPosts = [...posts];
            updatedPosts[postIndex] = { ...updatedPosts[postIndex], points: updatedPosts[postIndex].points + 1 };
            set({ posts: updatedPosts });
            await supabase.from('posts').update({ points: updatedPosts[postIndex].points }).eq('id', postId);
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add point' });
        } finally {
          set({ isLoading: false });
        }
      },
      removePoint: async (postId: string) => {
        try {
          set({ isLoading: true, error: null });
          const { posts } = get();
          const postIndex = posts.findIndex(p => p.id === postId);
          if (postIndex !== -1 && posts[postIndex].points > 0) {
            const updatedPosts = [...posts];
            updatedPosts[postIndex] = { ...updatedPosts[postIndex], points: updatedPosts[postIndex].points - 1 };
            set({ posts: updatedPosts });
            await supabase.from('posts').update({ points: updatedPosts[postIndex].points }).eq('id', postId);
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to remove point' });
        } finally {
          set({ isLoading: false });
        }
      },
      cashOut: async (postId: string, additionalPayment = 0) => {
        try {
          set({ isLoading: true, error: null });
          const { posts, activeSession, addSale } = get();
          const post = posts.find(p => p.id === postId);
          if (post && activeSession && post.points > 0) {
            const amount = post.type === 'PS5' ? getPS5Price(post.points) : post.points * PRICING[post.type];
            const totalAmount = amount + additionalPayment;
            await addSale({
              postId,
              postName: post.name,
              postType: post.type,
              workerId: activeSession.workerId,
              workerName: activeSession.workerName,
              points: post.points,
              amount,
              additionalPayment,
              totalAmount,
            });
            // Reset post
            const updatedPosts = posts.map(p => p.id === postId ? { ...p, points: 0, isActive: false, startTime: null } : p);
            set({ posts: updatedPosts });
            await supabase.from('posts').update({ points: 0, is_active: false, start_time: null }).eq('id', postId);
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to cash out' });
        } finally {
          set({ isLoading: false });
        }
      },
      resetPost: async (postId: string) => {
        try {
          set({ isLoading: true, error: null });
          const { posts } = get();
          const updatedPosts = posts.map(p => p.id === postId ? { ...p, points: 0, isActive: false, startTime: null } : p);
          set({ posts: updatedPosts });
          await supabase.from('posts').update({ points: 0, is_active: false, start_time: null }).eq('id', postId);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to reset post' });
        } finally {
          set({ isLoading: false });
        }
      },
      loadPosts: async () => {
        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase.from('posts').select('*');
          if (error) throw error;

          const postLayout: Record<string, { name: string, order: number }> = {
            'ps4-1': { name: 'PS4 – 3', order: 1 }, // Top Left
            'ps4-4': { name: 'PS4 – 5', order: 2 }, // Top Right
            'ps4-2': { name: 'PS4 – 2', order: 3 }, // Middle Left
            'ps4-5': { name: 'PS4 – 6', order: 4 }, // Bottom Right
            'ps4-3': { name: 'PS4 – 1', order: 5 }, // Bottom Left
            'ps5-1': { name: 'PS5', order: 0 }
          };

          const posts: GamingPost[] = (data || [])
            .map(p => ({
              id: p.id,
              name: postLayout[p.id]?.name || p.name,
              type: p.type,
              points: p.points,
              isActive: p.is_active,
              startTime: p.start_time ? new Date(p.start_time) : null,
              sortOrder: postLayout[p.id]?.order ?? 99
            }))
            .sort((a, b) => (a as any).sortOrder - (b as any).sortOrder);

          set({ posts });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load posts' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Workers
      workers: [],
      addWorker: async (name: string, pin: string) => {
        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase.from('workers').insert({ name, pin, is_active: true }).select().single();
          if (error) throw error;
          const newWorker: Worker = {
            id: data.id,
            name: data.name,
            pin: data.pin,
            isActive: data.is_active,
            createdAt: new Date(data.created_at),
          };
          const { workers } = get();
          set({ workers: [...workers, newWorker] });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add worker' });
        } finally {
          set({ isLoading: false });
        }
      },
      updateWorker: async (id: string, updates: Partial<Worker>) => {
        try {
          set({ isLoading: true, error: null });
          const updateData: any = {};
          if (updates.name) updateData.name = updates.name;
          if (updates.pin) updateData.pin = updates.pin;
          if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
          const { error } = await supabase.from('workers').update(updateData).eq('id', id);
          if (error) throw error;
          const { workers } = get();
          const updatedWorkers = workers.map(w => w.id === id ? { ...w, ...updates } : w);
          set({ workers: updatedWorkers });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update worker' });
        } finally {
          set({ isLoading: false });
        }
      },
      deleteWorker: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          const { error } = await supabase.from('workers').delete().eq('id', id);

          if (error) {
            if (error.code === '23503' || (error as any).status === 409) {
              const { error: updateError } = await supabase
                .from('workers')
                .update({ is_active: false })
                .eq('id', id);
              if (updateError) throw updateError;
            } else {
              throw error;
            }
          }

          const { workers } = get();
          set({ workers: workers.filter(w => w.id !== id) });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete worker' });
        } finally {
          set({ isLoading: false });
        }
      },
      validatePin: (pin: string) => {
        const { workers } = get();
        return workers.find(w => w.pin === pin && w.isActive) || null;
      },
      loadWorkers: async () => {
        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase.from('workers').select('*').eq('is_active', true);
          if (error) throw error;
          const workers: Worker[] = data.map(w => ({
            id: w.id,
            name: w.name,
            pin: w.pin,
            isActive: w.is_active,
            createdAt: new Date(w.created_at),
          }));
          set({ workers });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load workers' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Active session
      activeSession: null,
      startSession: (worker: Worker) => {
        const session: WorkerSession = {
          workerId: worker.id,
          workerName: worker.name,
          startTime: new Date(),
        };
        set({ activeSession: session });
      },
      endSession: () => {
        set({ activeSession: null });
      },

      // Sales
      sales: [],
      addSale: async (sale: Omit<Sale, 'id' | 'createdAt'>) => {
        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase.from('sales').insert({
            post_id: sale.postId,
            post_name: sale.postName,
            post_type: sale.postType,
            worker_id: sale.workerId,
            worker_name: sale.workerName,
            points: sale.points,
            amount: sale.amount,
            additional_payment: sale.additionalPayment,
            total_amount: sale.totalAmount,
          }).select().single();
          if (error) throw error;
          const newSale: Sale = {
            id: data.id,
            postId: data.post_id,
            postName: data.post_name,
            postType: data.post_type,
            workerId: data.worker_id,
            workerName: data.worker_name,
            points: data.points,
            amount: data.amount,
            additionalPayment: data.additional_payment,
            totalAmount: data.total_amount,
            createdAt: new Date(data.created_at),
          };
          const { sales } = get();
          set({ sales: [...sales, newSale] });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add sale' });
        } finally {
          set({ isLoading: false });
        }
      },
      addAdditionalPayment: async (amount: number, description = 'Additional payment') => {
        try {
          set({ isLoading: true, error: null });
          const { activeSession } = get();
          if (!activeSession) throw new Error('No active session');
          await get().addSale({
            postId: '',
            postName: description,
            postType: 'PS4', // dummy
            workerId: activeSession.workerId,
            workerName: activeSession.workerName,
            points: 0,
            amount: 0,
            additionalPayment: amount,
            totalAmount: amount,
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add additional payment' });
        } finally {
          set({ isLoading: false });
        }
      },
      loadSales: async () => {
        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase.from('sales').select('*');
          if (error) throw error;
          const sales: Sale[] = data.map(s => ({
            id: s.id,
            postId: s.post_id,
            postName: s.post_name,
            postType: s.post_type,
            workerId: s.worker_id,
            workerName: s.worker_name,
            points: s.points,
            amount: s.amount,
            additionalPayment: s.additional_payment,
            totalAmount: s.total_amount,
            createdAt: new Date(s.created_at),
          }));
          set({ sales });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load sales' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Charges
      charges: [],
      addCharge: async (charge: Omit<Charge, 'id'>) => {
        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase.from('charges').insert({
            category: charge.category,
            amount: charge.amount,
            description: charge.description,
            date: charge.date.toISOString(),
          }).select().single();
          if (error) throw error;
          const newCharge: Charge = {
            id: data.id,
            category: data.category,
            amount: data.amount,
            description: data.description,
            date: new Date(data.date),
          };
          const { charges } = get();
          set({ charges: [...charges, newCharge] });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add charge' });
        } finally {
          set({ isLoading: false });
        }
      },
      updateCharge: async (id: string, updates: Partial<Charge>) => {
        try {
          set({ isLoading: true, error: null });
          const updateData: any = {};
          if (updates.category) updateData.category = updates.category;
          if (updates.amount !== undefined) updateData.amount = updates.amount;
          if (updates.description) updateData.description = updates.description;
          if (updates.date) updateData.date = updates.date.toISOString();
          const { error } = await supabase.from('charges').update(updateData).eq('id', id);
          if (error) throw error;
          const { charges } = get();
          const updatedCharges = charges.map(c => c.id === id ? { ...c, ...updates } : c);
          set({ charges: updatedCharges });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update charge' });
        } finally {
          set({ isLoading: false });
        }
      },
      deleteCharge: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          const { error } = await supabase.from('charges').delete().eq('id', id);
          if (error) throw error;
          const { charges } = get();
          set({ charges: charges.filter(c => c.id !== id) });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete charge' });
        } finally {
          set({ isLoading: false });
        }
      },
      loadCharges: async () => {
        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase.from('charges').select('*');
          if (error) throw error;
          const charges: Charge[] = data.map(c => ({
            id: c.id,
            category: c.category,
            amount: c.amount,
            description: c.description,
            date: new Date(c.date),
          }));
          set({ charges });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load charges' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Statistics helpers
      getTodayRevenue: () => {
        const { sales } = get();
        return sales.filter(s => isToday(s.createdAt)).reduce((sum, s) => sum + s.totalAmount, 0);
      },
      getTodayCharges: () => {
        const { charges } = get();
        return charges.filter(c => isToday(c.date)).reduce((sum, c) => sum + c.amount, 0);
      },
      getTodayProfit: () => {
        return get().getTodayRevenue() - get().getTodayCharges();
      },
      getWorkerStats: (workerId: string, date?: Date) => {
        const { sales } = get();
        const targetDate = date || new Date();
        const workerSales = sales.filter(s => s.workerId === workerId && isToday(s.createdAt));
        return {
          sales: workerSales.length,
          revenue: workerSales.reduce((sum, s) => sum + s.totalAmount, 0),
        };
      },

      // Initialize data
      initialize: async () => {
        await Promise.all([
          get().loadPosts(),
          get().loadWorkers(),
          get().loadSales(),
          get().loadCharges(),
        ]);
      },
    }),
    {
      name: 'game-store',
      partialize: (state) => ({
        activeSession: state.activeSession,
      }),
    }
  )
);
