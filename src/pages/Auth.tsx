import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, X } from "lucide-react";
import { z } from "zod";
import logo from "@/assets/logo.svg";
import { useTheme } from "@/components/ThemeProvider";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import type { StrengthLevel } from "@/components/PasswordStrengthIndicator";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mode, setMode] = useState<"login" | "signup">(
    (searchParams.get("mode") as "login" | "signup") || "login"
  );
  const [role, setRole] = useState<"donor" | "volunteer">("donor");
  const [loading, setLoading] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<StrengthLevel>("empty");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        if (profile?.role === "donor") {
          navigate("/donor/dashboard");
        } else {
          navigate("/volunteer/dashboard");
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = authSchema.safeParse(formData);
      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              role: role,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "You can now sign in with your credentials.",
        });
        
        // Auto login after signup
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (loginError) throw loginError;

        navigate(role === "donor" ? "/donor/dashboard" : "/volunteer/dashboard");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        // Check for admin credentials
        if (formData.email === "admin@foodie.com" && formData.password === "admin123") {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Ensure admin role exists
            await supabase.from("user_roles").upsert({
              user_id: user.id,
              role: "admin",
            }, {
              onConflict: "user_id,role",
            });
            navigate("/admin");
            return;
          }
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        navigate(profile?.role === "donor" ? "/donor/dashboard" : "/volunteer/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#ff6b35] via-[#1a1a1a] to-[#000000] dark:from-[#ff6b35] dark:via-[#1a1a1a] dark:to-[#000000] light:from-[#fef3e2] light:via-[#fef7ed] light:to-[#fef3e2]">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-[#ff6b35] via-[#ff8c42] to-transparent dark:from-[#ff6b35] dark:via-[#ff8c42] light:from-[#ffd4a3] light:via-[#ffe4c4] rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-t from-[#ff6b35] via-[#ff8c42] to-transparent dark:from-[#ff6b35] dark:via-[#ff8c42] light:from-[#ffd4a3] light:via-[#ffe4c4] rounded-full blur-[120px] opacity-40" />
        
        {/* Starfield effect - only in dark mode */}
        <div className="absolute inset-0 dark:block hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30"
              style={{
                top: `${Math.random() * 60}%`,
                left: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="w-10 h-10 rounded-full bg-white/10 dark:bg-white/10 light:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/20 light:border-black/20 flex items-center justify-center text-white dark:text-white light:text-black hover:bg-white/20 dark:hover:bg-white/20 light:hover:bg-black/20 transition-all"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-between px-6 py-12 max-w-md mx-auto">
        {/* Top Section - Logo and Brand */}
        <div className="w-full pt-8">
          <div className="flex items-center justify-center mb-12">
            <button 
              onClick={() => setShowLogoModal(true)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img src={logo} alt="FOOD 4 U" className="w-10 h-10 rounded-lg" />
              <span className="text-white dark:text-white light:text-black font-semibold text-xl">FOOD 4 U</span>
            </button>
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="px-6 py-2 rounded-full bg-white/10 dark:bg-white/10 light:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/20 light:border-black/20">
              <span className="text-white/90 dark:text-white/90 light:text-black/90 text-sm font-medium">
                {mode === "login" ? "Welcome Back" : "Join Us"}
              </span>
            </div>
          </div>
        </div>

        {/* Center Section - Form */}
        <div className="w-full flex-1 flex flex-col justify-center -mt-12">
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white/80 dark:text-white/80 light:text-black/80 text-sm">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="h-14 bg-white/10 dark:bg-white/10 light:bg-black/5 border-white/20 dark:border-white/20 light:border-black/20 text-white dark:text-white light:text-black placeholder:text-white/50 dark:placeholder:text-white/50 light:placeholder:text-black/50 rounded-xl backdrop-blur-md"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 dark:text-white/80 light:text-black/80 text-sm">I want to be a</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      onClick={() => setRole("donor")}
                      variant="outline"
                      className={`${
                        role === "donor"
                          ? "ring-2 ring-primary font-bold bg-primary/10 text-white dark:text-white light:text-black"
                          : "border-white/20 dark:border-white/20 light:border-black/20 text-white dark:text-white light:text-black"
                      } h-12`}
                    >
                      Donor
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setRole("volunteer")}
                      variant="outline"
                      className={`${
                        role === "volunteer"
                          ? "ring-2 ring-primary font-bold bg-primary/10 text-white dark:text-white light:text-black"
                          : "border-white/20 dark:border-white/20 light:border-black/20 text-white dark:text-white light:text-black"
                      } h-12`}
                    >
                      Volunteer
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80 dark:text-white/80 light:text-black/80 text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="h-14 bg-white/10 dark:bg-white/10 light:bg-black/5 border-white/20 dark:border-white/20 light:border-black/20 text-white dark:text-white light:text-black placeholder:text-white/50 dark:placeholder:text-white/50 light:placeholder:text-black/50 rounded-xl backdrop-blur-md"
                required
              />
            </div>

            {mode === "signup" ? (
              <PasswordStrengthIndicator
                value={formData.password}
                onChange={(value) => setFormData({ ...formData, password: value })}
                onStrengthChange={setPasswordStrength}
                label="Password"
                placeholder="••••••••"
                showScore={true}
                showScoreNumber={false}
                showVisibilityToggle={true}
                className="[&_label]:text-white/80 dark:[&_label]:text-white/80 light:[&_label]:text-black/80 [&_input]:h-14 [&_input]:bg-white/10 dark:[&_input]:bg-white/10 light:[&_input]:bg-black/5 [&_input]:border-white/20 dark:[&_input]:border-white/20 light:[&_input]:border-black/20 [&_input]:text-white dark:[&_input]:text-white light:[&_input]:text-black [&_input]:placeholder:text-white/50 dark:[&_input]:placeholder:text-white/50 light:[&_input]:placeholder:text-black/50 [&_input]:rounded-xl [&_input]:backdrop-blur-md [&_p]:text-white/70 dark:[&_p]:text-white/70 light:[&_p]:text-black/70"
                inputProps={{ required: true }}
              />
            ) : (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80 dark:text-white/80 light:text-black/80 text-sm">Password</Label>
                <PasswordStrengthIndicator
                  value={formData.password}
                  onChange={(value) => setFormData({ ...formData, password: value })}
                  label=""
                  placeholder="••••••••"
                  showScore={false}
                  showVisibilityToggle={true}
                  className="[&_input]:h-14 [&_input]:bg-white/10 dark:[&_input]:bg-white/10 light:[&_input]:bg-black/5 [&_input]:border-white/20 dark:[&_input]:border-white/20 light:[&_input]:border-black/20 [&_input]:text-white dark:[&_input]:text-white light:[&_input]:text-black [&_input]:placeholder:text-white/50 dark:[&_input]:placeholder:text-white/50 light:[&_input]:placeholder:text-black/50 [&_input]:rounded-xl [&_input]:backdrop-blur-md"
                  inputProps={{ required: true, id: "password" }}
                />
              </div>
            )}

            {mode === "login" && (
              <div className="flex items-center">
                <button
                  type="button"
                  className="text-sm text-white/70 dark:text-white/70 light:text-black/70 hover:text-white dark:hover:text-white light:hover:text-black transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              variant="shiny"
              className="w-full h-14 font-semibold text-base mt-6 [&::before]:bg-white dark:[&::before]:bg-black"
            >
              {loading ? "Loading..." : mode === "login" ? "Sign In" : "Sign Up"}
            </Button>
          </form>
        </div>

        {/* Bottom Section - Toggle Mode */}
        <div className="w-full pb-8">
          <p className="text-center text-sm text-white/60 dark:text-white/60 light:text-black/60">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-white dark:text-white light:text-black font-semibold hover:text-white/80 dark:hover:text-white/80 light:hover:text-black/80 transition-colors"
            >
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>

      {/* Logo Modal */}
      {showLogoModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowLogoModal(false)}
        >
          <div 
            className="relative max-w-md w-full bg-white/10 dark:bg-white/10 light:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/20 light:border-black/20 rounded-3xl p-8 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowLogoModal(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 dark:bg-white/10 light:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/20 light:border-black/20 flex items-center justify-center text-white dark:text-white light:text-black hover:bg-white/20 dark:hover:bg-white/20 light:hover:bg-black/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-3xl bg-white/20 dark:bg-white/20 light:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/30 light:border-black/30 p-6 shadow-xl">
                <img src={logo} alt="FOOD 4 U" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-white dark:text-white light:text-black leading-tight">
                In presence of our team FOOD 4 U
              </h2>
              <p className="text-xl font-semibold text-white/90 dark:text-white/90 light:text-black/90 leading-relaxed">
                Inshallah no one will sleep hungry Inshallah.
              </p>
              <div className="pt-4 border-t border-white/20 dark:border-white/20 light:border-black/20">
                <p className="text-base text-white/70 dark:text-white/70 light:text-black/70 italic">
                  - by HANZALA & FOOD 4 U
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Auth;
