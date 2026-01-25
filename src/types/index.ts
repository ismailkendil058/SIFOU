export type ConsoleType = 'PS4' | 'PS5';

export interface GamingPost {
  id: string;
  name: string;
  type: ConsoleType;
  points: number;
  isActive: boolean;
  startTime: Date | null;
}

export interface Worker {
  id: string; // UUID from Supabase
  name: string;
  pin: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Sale {
  id: string; // UUID from Supabase
  postId: string;
  postName: string;
  postType: ConsoleType;
  workerId: string; // UUID from Supabase
  workerName: string;
  points: number;
  amount: number;
  additionalPayment: number;
  totalAmount: number;
  createdAt: Date;
}

export interface Charge {
  id: string; // UUID from Supabase
  category: 'rent' | 'electricity' | 'internet' | 'salaries' | 'maintenance' | 'other';
  amount: number;
  description: string;
  date: Date;
}

export interface DailySummary {
  date: Date;
  totalRevenue: number;
  totalCharges: number;
  netProfit: number;
  salesCount: number;
  salesByWorker: Record<string, { count: number; total: number }>;
  salesByPost: Record<string, { count: number; total: number }>;
}

export interface WorkerSession {
  workerId: string;
  workerName: string;
  startTime: Date;
}

// Pricing constants
export const PRICING = {
  PS4: 50,
  PS5: 100,
} as const;

// PS5 tiered pricing function
export const getPS5Price = (points: number): number => {
  switch (points) {
    case 1: return 80;
    case 2: return 150;
    case 3: return 230;
    case 4: return 300;
    case 5: return 380;
    case 6: return 450;
    default: return points * 100; // fallback for more than 6 points
  }
};

// Initial gaming posts
export const INITIAL_POSTS: GamingPost[] = [
  { id: 'ps4-1', name: 'PS4 – 1', type: 'PS4', points: 0, isActive: false, startTime: null },
  { id: 'ps4-2', name: 'PS4 – 2', type: 'PS4', points: 0, isActive: false, startTime: null },
  { id: 'ps4-3', name: 'PS4 – 3', type: 'PS4', points: 0, isActive: false, startTime: null },
  { id: 'ps4-4', name: 'PS4 – 4', type: 'PS4', points: 0, isActive: false, startTime: null },
  { id: 'ps4-5', name: 'PS4 – 5', type: 'PS4', points: 0, isActive: false, startTime: null },
  { id: 'ps5-1', name: 'PS5', type: 'PS5', points: 0, isActive: false, startTime: null },
];
