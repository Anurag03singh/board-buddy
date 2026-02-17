import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Layers } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: "Check your email",
          description:
            "We sent you a confirmation link to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-100 noise-bg overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #18181b 1px, transparent 1px),
            linear-gradient(to bottom, #18181b 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 border border-zinc-200 rotate-45 opacity-20" />
      <div className="absolute bottom-20 right-20 w-48 h-48 border border-zinc-200 rotate-12 opacity-10" />

      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Layers className="h-10 w-10 text-zinc-900" strokeWidth={1.5} />
              <div className="absolute -inset-2 bg-zinc-900/5 blur-xl -z-10" />
            </div>
            <h1 className="font-['Inter_Tight'] text-4xl font-semibold tracking-tight text-zinc-900">
              TASKFLOW
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2 font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-subtle" />
            REAL-TIME COLLABORATION V.2.0
          </div>
        </div>

        {/* Auth Card */}
        <div className="glass p-8 relative group">
          {/* Accent Line */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-zinc-900 to-transparent opacity-50" />

          <div className="mb-8">
            <h2 className="font-['Inter_Tight'] text-2xl font-semibold tracking-tight mb-2">
              {isLogin ? "SYSTEM ACCESS" : "CREATE ACCOUNT"}
            </h2>
            <p className="text-sm text-zinc-500 font-mono">
              {isLogin
                ? "// Enter credentials to continue"
                : "// Initialize new user profile"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label
                  htmlFor="displayName"
                  className="font-mono text-xs uppercase tracking-wider text-zinc-600"
                >
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  required={!isLogin}
                  className="h-11 bg-white/50 border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 font-mono text-sm"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-mono text-xs uppercase tracking-wider text-zinc-600"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
                required
                className="h-11 bg-white/50 border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-mono text-xs uppercase tracking-wider text-zinc-600"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="h-11 bg-white/50 border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 font-mono text-sm"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-zinc-900 text-white hover:bg-zinc-800 font-mono text-xs uppercase tracking-wider transition-all duration-200 mt-6"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                  <span className="w-1 h-1 bg-white rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-1 bg-white rounded-full animate-pulse delay-150" />
                </span>
              ) : isLogin ? (
                "AUTHENTICATE"
              ) : (
                "INITIALIZE"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-200">
            <div className="text-center">
              <span className="text-sm text-zinc-500 font-mono">
                {isLogin ? "// New user?" : "// Existing user?"}
              </span>{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-mono text-zinc-900 hover:text-zinc-600 underline underline-offset-4 transition-colors"
              >
                {isLogin ? "Create account" : "Sign in"}
              </button>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 bg-emerald-500 rounded-full" />
              SECURE
            </span>
            <span className="text-zinc-300">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 bg-blue-500 rounded-full" />
              ENCRYPTED
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs font-mono text-zinc-400 tracking-wide">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
}
