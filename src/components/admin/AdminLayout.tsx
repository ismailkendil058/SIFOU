import React, { useState } from 'react';
import { LayoutDashboard, Users, Wallet, Menu, LogOut, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface AdminLayoutProps {
    children: React.ReactNode;
    activeTab: 'dashboard' | 'workers' | 'finances';
    setActiveTab: (tab: 'dashboard' | 'workers' | 'finances') => void;
}

export const AdminLayout = ({ children, activeTab, setActiveTab }: AdminLayoutProps) => {
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const NavContent = ({ isSheet }: { isSheet?: boolean }) => (
        <div className="flex flex-col h-full glass rounded-3xl shadow-2xl shadow-glow-primary border-primary/25 p-2">
            {/* Header */}
            <div className="p-6 pb-4 relative">
                <div className="absolute inset-0 barca-diagonal pointer-events-none rounded-[inherit] opacity-5" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 left-4 -m-2 p-2 rounded-2xl hover:bg-accent/50 focus-visible:ring-2 ring-offset-background"
                    onClick={() => setIsMobileOpen(false)}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="text-center relative z-10 animate-scale-in">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-gold shadow-glow-gold flex items-center justify-center animate-pulse-glow">
                        <Shield className="w-7 h-7 text-gold-foreground" />
                    </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-display tracking-widest leading-tight">
                        <span className="text-gradient-primary block">SIFOU</span>
                        <span className="text-gradient-accent">ADMIN</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Management Portal</p>
                </div>
            </div>

            {/* Nav Items */}
            <div className="flex-1 px-2 sm:px-4 space-y-1">
                <Button
                    variant="ghost"
                    className={cn(
                    "w-full justify-start h-12 sm:h-14 rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 hover:shadow-glow-primary hover:bg-primary/10 hover:scale-[1.02] focus-visible:shadow-glow-primary focus-visible:ring-2",
                        activeTab === 'dashboard' && "bg-gradient-primary/20 shadow-glow-primary text-primary-foreground !scale-[1.02]"
                    )}
                    onClick={() => { setActiveTab('dashboard'); setIsMobileOpen(false); }}
                >
                    <LayoutDashboard className="mr-3 h-5 w-5 shrink-0" />
                    Dashboard
                </Button>
                <Button
                    variant="ghost"
                    className={cn(
                    "w-full justify-start h-12 sm:h-14 rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 hover:shadow-glow-accent hover:bg-accent/10 hover:scale-[1.02] focus-visible:shadow-glow-accent focus-visible:ring-2",
                        activeTab === 'workers' && "bg-gradient-accent/20 shadow-glow-accent text-accent-foreground !scale-[1.02]"
                    )}
                    onClick={() => { setActiveTab('workers'); setIsMobileOpen(false); }}
                >
                    <Users className="mr-3 h-5 w-5 shrink-0" />
                    Workers
                </Button>
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start h-12 sm:h-14 rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 hover:shadow-glow-gold hover:bg-gold/10 hover:scale-[1.02] focus-visible:shadow-glow-gold focus-visible:ring-2",
                        activeTab === 'finances' && "bg-gradient-gold/20 shadow-glow-gold text-gold-foreground !scale-[1.02]"
                    )}
                    onClick={() => { setActiveTab('finances'); setIsMobileOpen(false); }}
                >
                    <Wallet className="mr-3 h-5 w-5 shrink-0" />
                    Finances
                </Button>
            </div>

            {/* Footer */}
            <div className="p-4 pt-2 border-t border-primary/20">
                <Button
                    variant="ghost"
                    className="w-full h-12 sm:h-14 rounded-2xl justify-start text-destructive font-semibold hover:bg-destructive/10 hover:shadow-glow-destructive hover:scale-[1.02] focus-visible:ring-2 transition-all duration-300 text-xs sm:text-sm"
                    onClick={async () => {
                        await supabase.auth.signOut();
                        navigate('/');
                    }}
                >
                    <LogOut className="mr-3 h-5 w-5 shrink-0" />
                    Sign Out
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-hero flex relative overflow-hidden">
            {/* Subtle background elements */}
            <div className="absolute inset-0 barca-field-lines opacity-5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-primary opacity-5 blur-3xl -translate-x-1/2 rounded-full" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-accent opacity-5 blur-3xl translate-x-1/4 -translate-y-1/4 rounded-full" />

            {/* Desktop Sidebar */}
            <div className="hidden md:block w-80 flex-shrink-0">
                <div className="sticky top-0 h-screen pt-8">
                    <NavContent />
                </div>
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="fixed md:hidden top-6 left-6 z-50 glass rounded-2xl shadow-2xl shadow-glow-primary hover:shadow-glow-accent p-3 -m-1 touch-active"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent 
                    side="left" 
                    className="glass-dark p-0 border-0 w-[90vw] max-w-sm sm:w-80 shadow-2xl shadow-glow-primary max-h-screen rounded-3xl ml-4"
                >
                    <SheetHeader className="p-0 border-b border-primary/20">
                        <NavContent isSheet />
                    </SheetHeader>
                </SheetContent>
            </Sheet>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 md:pl-6 md:pr-8 lg:p-12 overflow-auto md:pt-20">
                <div className="max-w-7xl mx-auto space-y-8 animate-fade-up">
                    {children}
                </div>
            </div>
        </div>
    );
};

