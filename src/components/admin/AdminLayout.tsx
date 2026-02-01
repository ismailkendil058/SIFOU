
import React, { useState } from 'react';
import { LayoutDashboard, Users, Wallet, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
    children: React.ReactNode;
    activeTab: 'dashboard' | 'workers' | 'finances';
    setActiveTab: (tab: 'dashboard' | 'workers' | 'finances') => void;
}

export const AdminLayout = ({ children, activeTab, setActiveTab }: AdminLayoutProps) => {
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const NavContent = () => (
        <div className="flex flex-col h-full bg-slate-900 text-white">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    SIFOU Admin
                </h1>
            </div>

            <div className="flex-1 px-4 space-y-2">
                <Button
                    variant="ghost"
                    className={cn("w-full justify-start text-lg", activeTab === 'dashboard' ? "bg-slate-800 text-blue-400" : "hover:bg-slate-800")}
                    onClick={() => { setActiveTab('dashboard'); setIsMobileOpen(false); }}
                >
                    <LayoutDashboard className="mr-3 h-5 w-5" />
                    Dashboard
                </Button>
                <Button
                    variant="ghost"
                    className={cn("w-full justify-start text-lg", activeTab === 'workers' ? "bg-slate-800 text-blue-400" : "hover:bg-slate-800")}
                    onClick={() => { setActiveTab('workers'); setIsMobileOpen(false); }}
                >
                    <Users className="mr-3 h-5 w-5" />
                    Workers
                </Button>
                <Button
                    variant="ghost"
                    className={cn("w-full justify-start text-lg", activeTab === 'finances' ? "bg-slate-800 text-blue-400" : "hover:bg-slate-800")}
                    onClick={() => { setActiveTab('finances'); setIsMobileOpen(false); }}
                >
                    <Wallet className="mr-3 h-5 w-5" />
                    Finances
                </Button>
            </div>

            <div className="p-4 border-t border-slate-800">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800"
                    onClick={() => navigate('/')}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Exit
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0">
                <div className="fixed w-64 h-full">
                    <NavContent />
                </div>
            </div>

            {/* Mobile Sidebar */}
            <div className="md:hidden">
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 bg-white shadow-md">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r-0 w-64">
                        <NavContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 md:p-8 overflow-auto">
                <div className="max-w-7xl mx-auto space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
};
