import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, Loader2, ArrowLeft, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorShake, setErrorShake] = useState(false);
    const navigate = useNavigate();
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if already logged in
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate("/admin");
            }
        };
        checkUser();
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorShake(false);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.session) {
                toast.success("Welcome back, Admin!");
                navigate("/admin");
            }
        } catch (error: any) {
            toast.error(error.message || "Invalid login credentials");
            setErrorShake(true);
            // Shake animation reset
            setTimeout(() => setErrorShake(false), 500);
            if (cardRef.current) {
                cardRef.current.focus();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const togglePassword = useCallback(() => {
        setShowPassword(!showPassword);
    }, [showPassword]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
            {/* FC Barcelona inspired background */}
            <div className="absolute inset-0 barca-diagonal pointer-events-none" />
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-primary opacity-10 blur-3xl rounded-full -translate-x-1/4" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-accent opacity-10 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4" />

            {/* Back to App Link */}
            <a
                href="/"
                className="absolute top-6 left-6 text-muted-foreground hover:text-primary text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:scale-105 z-20 focus-visible:ring-2 focus-visible:ring-primary ring-offset-2 ring-offset-background rounded-full p-2 -m-2"
                aria-label="Back to main app"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Games
            </a>

            {/* Logo/Header */}
            <div className="text-center mb-8 animate-fade-up relative z-10 max-w-sm">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-primary shadow-glow-primary flex items-center justify-center animate-pulse-glow">
                    <span className="text-3xl font-display text-primary-foreground drop-shadow-sm">SG</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-display tracking-widest leading-tight">
                    <span className="text-gradient-primary">SIFOU</span>
                    <span className="text-gradient-accent ml-2">ADMIN</span>
                </h1>
                <p className="text-muted-foreground mt-3 text-base font-medium opacity-90">Management Portal</p>
            </div>

            {/* Form Card */}
            <div className="w-full max-w-sm animate-in fade-in duration-700 relative z-20">
                <Card 
                    ref={cardRef}
                    className={cn(
                        "glass rounded-3xl border-2 border-primary/25 shadow-2xl shadow-glow-primary backdrop-blur-xl transition-all duration-300 hover:shadow-glow-accent focus-within:shadow-glow-accent",
                        errorShake && "animate-[shake_0.5s_ease-in-out]"
                    )}
                    tabIndex={-1}
                >
                    {/* Field lines overlay */}
                    <div className="absolute inset-0 barca-field-lines opacity-10 pointer-events-none rounded-[inherit]" />
                    
                    <CardHeader className="text-center pb-2 pt-8 relative">
                        <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-gradient-gold shadow-glow-gold flex items-center justify-center animate-scale-in">
                            <Shield className="text-gold-foreground w-7 h-7" />
                        </div>
                        <CardTitle className="text-2xl font-display tracking-wide text-foreground/95">Secure Access</CardTitle>
                        <CardDescription className="text-muted-foreground/90 text-sm">
                            Enter your administrative credentials to continue
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleLogin} className="px-6 pb-8">
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold tracking-wide text-foreground/80">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@sifou.dz"
                                        className="pl-12 h-14 rounded-2xl shadow-lg border-primary/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:shadow-glow-primary transition-all duration-300 text-lg placeholder:text-muted-foreground/60 font-medium"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        aria-describedby="email-help"
                                    />
                                </div>
                                <p id="email-help" className="text-xs text-muted-foreground/70 sr-only">Enter your admin email</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold tracking-wide text-foreground/80">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/70" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-12 pr-12 h-14 rounded-2xl shadow-lg border-primary/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:shadow-glow-primary transition-all duration-300 text-lg placeholder:text-muted-foreground/60 font-medium"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 p-0 rounded-xl hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-accent"
                                        onClick={togglePassword}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col pt-2 pb-10 px-6 gap-3">
                            <Button
                                type="submit"
                                className={cn(
                                    "w-full h-16 rounded-3xl bg-gradient-primary hover:bg-gradient-accent active:bg-gradient-accent/90 text-primary-foreground font-display font-bold text-xl shadow-2xl shadow-glow-primary hover:shadow-glow-accent active:shadow-glow-primary transition-all duration-300 touch-active focus-visible:ring-4 focus-visible:ring-primary/50",
                                    isLoading && "animate-pulse"
                                )}
                                disabled={isLoading || !email || !password}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                        <span className="font-semibold">Authenticating...</span>
                                    </>
                                ) : (
                                    "Enter Dashboard"
                                )}
                            </Button>
                            <div className="text-center space-y-1">
                                <p className="text-xs text-muted-foreground/80 font-medium tracking-wide">
                                    🔒 Strictly for authorized personnel
                                </p>
                                <p className="text-xs text-muted-foreground/70">
                                    All login attempts are logged and monitored
                                </p>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                {/* Demo credentials hint - subtle */}
                <p className="text-xs text-muted-foreground/60 text-center mt-6 max-w-sm mx-auto px-4 leading-relaxed">
                    Need help? Contact support or check demo: admin@sifou.dz
                </p>
            </div>

            {/* Loading overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-primary shadow-2xl shadow-glow-primary flex items-center justify-center animate-spin-slow">
                        <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />
                    </div>
                </div>
            )}
        </div>
    );
};

