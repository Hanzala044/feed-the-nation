import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, X, ArrowLeft, Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import logo from "@/assets/logo.svg";
import { useTheme } from "@/components/ThemeProvider";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:from-slate-50 light:via-white light:to-slate-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div
          className="absolute -top-[40%] left-[10%] w-[500px] h-[500px] bg-gradient-to-br from-[#ff6b35] via-[#ff8c42] to-transparent rounded-full blur-[100px] opacity-30 animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="absolute top-[20%] right-[5%] w-[400px] h-[400px] bg-gradient-to-br from-purple-500 via-pink-500 to-transparent rounded-full blur-[100px] opacity-20 animate-pulse"
          style={{ animationDuration: '10s', animationDelay: '2s' }}
        />

        {/* Floating Particles - Dark Mode Only */}
        <div className="absolute inset-0 dark:block hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
                animation: `float ${10 + Math.random() * 20}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] dark:opacity-30 light:opacity-10" />
      </div>

      {/* Top Navigation */}
      <div className="relative z-50 px-6 py-6 flex items-center justify-between max-w-md mx-auto lg:max-w-6xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/landing")}
          className="flex items-center gap-2 text-white/80 hover:text-white dark:text-white/80 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-200/50 rounded-xl px-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="w-10 h-10 rounded-xl bg-white/5 dark:bg-white/5 light:bg-slate-200 backdrop-blur-md border border-white/10 dark:border-white/10 light:border-slate-300 flex items-center justify-center text-white dark:text-white light:text-slate-900 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-300 transition-all"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Branding (Hidden on mobile) */}
            <div className="hidden lg:flex flex-col justify-center space-y-8">
              <button
                onClick={() => setShowLogoModal(true)}
                className="flex items-center gap-3 group hover:scale-105 transition-transform duration-300"
              >
                <div className="relative">
                  <img src={logo} alt="FOOD 4 U" className="w-16 h-16 rounded-2xl shadow-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b35] to-transparent rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity blur-sm" />
                </div>
                <span className="text-white dark:text-white light:text-slate-900 font-bold text-3xl tracking-tight">
                  FOOD 4 U
                </span>
              </button>

              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-white dark:text-white light:text-slate-900">
                  Welcome Back to
                  <br />
                  <span className="bg-gradient-to-r from-[#ff6b35] via-[#ff8c42] to-purple-500 bg-clip-text text-transparent">
                    Food Sharing
                  </span>
                </h2>
                <p className="text-lg text-white/70 dark:text-white/70 light:text-slate-600 max-w-md">
                  Join thousands of donors and volunteers making a real impact in their communities.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                {[
                  "Track donations in real-time",
                  "Connect with local volunteers",
                  "Earn achievements and badges",
                  "Make a lasting impact",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/80 dark:text-white/80 light:text-slate-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div className="bg-white/5 dark:bg-white/5 light:bg-white backdrop-blur-2xl border border-white/10 dark:border-white/10 light:border-slate-200 rounded-3xl p-8 shadow-2xl">
                {/* Mobile Logo */}
                <div className="lg:hidden flex justify-center mb-8">
                  <button
                    onClick={() => setShowLogoModal(true)}
                    className="flex items-center gap-3 group hover:scale-105 transition-transform duration-300"
                  >
                    <img src={logo} alt="FOOD 4 U" className="w-12 h-12 rounded-xl shadow-lg" />
                    <span className="text-white dark:text-white light:text-slate-900 font-bold text-2xl">
                      FOOD 4 U
                    </span>
                  </button>
                </div>

                {/* Form Header */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white dark:text-white light:text-slate-900 mb-2">
                    {mode === "login" ? "Welcome Back" : "Get Started"}
                  </h1>
                  <p className="text-white/70 dark:text-white/70 light:text-slate-600">
                    {mode === "login"
                      ? "Sign in to continue your journey"
                      : "Create an account to start making a difference"}
                  </p>
                </div>

                {/* Auth Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {mode === "signup" && (
                    <>
                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-white/90 dark:text-white/90 light:text-slate-700 text-sm font-medium flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Full Name
                        </Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                          className="h-12 bg-white/10 dark:bg-white/10 light:bg-slate-50 border-white/20 dark:border-white/20 light:border-slate-300 text-white dark:text-white light:text-slate-900 placeholder:text-white/50 dark:placeholder:text-white/50 light:placeholder:text-slate-400 rounded-xl backdrop-blur-md focus:ring-2 focus:ring-[#ff6b35] transition-all"
                          required
                        />
                      </div>

                      {/* Role Selection */}
                      <div className="space-y-2">
                        <Label className="text-white/90 dark:text-white/90 light:text-slate-700 text-sm font-medium">I want to be a</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setRole("donor")}
                            className={`h-12 rounded-xl font-medium transition-all ${
                              role === "donor"
                                ? "bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white shadow-lg shadow-[#ff6b35]/30"
                                : "bg-white/5 dark:bg-white/5 light:bg-slate-100 border border-white/20 dark:border-white/20 light:border-slate-300 text-white/80 dark:text-white/80 light:text-slate-700 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-200"
                            }`}
                          >
                            Donor
                          </button>
                          <button
                            type="button"
                            onClick={() => setRole("volunteer")}
                            className={`h-12 rounded-xl font-medium transition-all ${
                              role === "volunteer"
                                ? "bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white shadow-lg shadow-[#ff6b35]/30"
                                : "bg-white/5 dark:bg-white/5 light:bg-slate-100 border border-white/20 dark:border-white/20 light:border-slate-300 text-white/80 dark:text-white/80 light:text-slate-700 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-200"
                            }`}
                          >
                            Volunteer
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90 dark:text-white/90 light:text-slate-700 text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="h-12 bg-white/10 dark:bg-white/10 light:bg-slate-50 border-white/20 dark:border-white/20 light:border-slate-300 text-white dark:text-white light:text-slate-900 placeholder:text-white/50 dark:placeholder:text-white/50 light:placeholder:text-slate-400 rounded-xl backdrop-blur-md focus:ring-2 focus:ring-[#ff6b35] transition-all"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90 dark:text-white/90 light:text-slate-700 text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    {mode === "signup" ? (
                      <PasswordStrengthIndicator
                        value={formData.password}
                        onChange={(value) => setFormData({ ...formData, password: value })}
                        label=""
                        placeholder="••••••••"
                        showScore={true}
                        showScoreNumber={false}
                        showVisibilityToggle={true}
                        className="[&_input]:h-12 [&_input]:bg-white/10 dark:[&_input]:bg-white/10 light:[&_input]:bg-slate-50 [&_input]:border-white/20 dark:[&_input]:border-white/20 light:[&_input]:border-slate-300 [&_input]:text-white dark:[&_input]:text-white light:[&_input]:text-slate-900 [&_input]:placeholder:text-white/50 dark:[&_input]:placeholder:text-white/50 light:[&_input]:placeholder:text-slate-400 [&_input]:rounded-xl [&_input]:backdrop-blur-md [&_input]:focus:ring-2 [&_input]:focus:ring-[#ff6b35] [&_p]:text-white/70 dark:[&_p]:text-white/70 light:[&_p]:text-slate-600"
                        inputProps={{ required: true, id: "password" }}
                      />
                    ) : (
                      <PasswordStrengthIndicator
                        value={formData.password}
                        onChange={(value) => setFormData({ ...formData, password: value })}
                        label=""
                        placeholder="••••••••"
                        showScore={false}
                        showVisibilityToggle={true}
                        className="[&_input]:h-12 [&_input]:bg-white/10 dark:[&_input]:bg-white/10 light:[&_input]:bg-slate-50 [&_input]:border-white/20 dark:[&_input]:border-white/20 light:[&_input]:border-slate-300 [&_input]:text-white dark:[&_input]:text-white light:[&_input]:text-slate-900 [&_input]:placeholder:text-white/50 dark:[&_input]:placeholder:text-white/50 light:[&_input]:placeholder:text-slate-400 [&_input]:rounded-xl [&_input]:backdrop-blur-md [&_input]:focus:ring-2 [&_input]:focus:ring-[#ff6b35]"
                        inputProps={{ required: true, id: "password" }}
                      />
                    )}
                  </div>

                  {mode === "login" && (
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        className="text-sm text-white/70 dark:text-white/70 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 font-semibold text-base bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/50 hover:shadow-xl hover:shadow-[#ff6b35]/60 transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      mode === "login" ? "Sign In" : "Create Account"
                    )}
                  </Button>
                </form>

                {/* Toggle Mode */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-white/60 dark:text-white/60 light:text-slate-600">
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                      onClick={() => setMode(mode === "login" ? "signup" : "login")}
                      className="text-[#ff6b35] font-semibold hover:text-[#ff8c42] transition-colors"
                    >
                      {mode === "login" ? "Sign Up" : "Sign In"}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Modal */}
      {showLogoModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowLogoModal(false)}
        >
          <div
            className="relative max-w-md w-full bg-white/10 dark:bg-white/10 light:bg-white backdrop-blur-2xl border border-white/20 dark:border-white/20 light:border-slate-300 rounded-3xl p-8 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLogoModal(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 dark:bg-white/10 light:bg-slate-200 backdrop-blur-md border border-white/20 dark:border-white/20 light:border-slate-300 flex items-center justify-center text-white dark:text-white light:text-slate-900 hover:bg-white/20 dark:hover:bg-white/20 light:hover:bg-slate-300 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] p-1 shadow-2xl">
                <div className="w-full h-full rounded-[22px] bg-white/20 dark:bg-white/20 light:bg-white backdrop-blur-md border border-white/30 dark:border-white/30 light:border-slate-200 p-6 flex items-center justify-center">
                  <img src={logo} alt="FOOD 4 U" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-white dark:text-white light:text-slate-900 leading-tight">
                In presence of our team FOOD 4 U
              </h2>
              <p className="text-xl font-semibold text-white/90 dark:text-white/90 light:text-slate-700 leading-relaxed">
                Inshallah no one will sleep hungry Inshallah.
              </p>
              <div className="pt-4 border-t border-white/20 dark:border-white/20 light:border-slate-300">
                <p className="text-base text-white/70 dark:text-white/70 light:text-slate-600 italic">
                  - by HANZALA & FOOD 4 U
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default Auth;
