import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import logo from "@/assets/logo.png";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">(
    (searchParams.get("mode") as "login" | "signup") || "login"
  );
  const [role, setRole] = useState<"donor" | "volunteer">("donor");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-[hsl(35,15%,20%)] dark:bg-[hsl(30,18%,9%)] relative overflow-hidden">
      {/* Topographic Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="topo" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M10 50 Q 25 45, 50 50 T 90 50" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-primary/30"/>
              <path d="M10 30 Q 25 25, 50 30 T 90 30" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-primary/20"/>
              <path d="M10 70 Q 25 65, 50 70 T 90 70" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-primary/20"/>
              <circle cx="30" cy="50" r="1.5" fill="currentColor" className="text-primary/40"/>
              <circle cx="70" cy="50" r="1.5" fill="currentColor" className="text-primary/40"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo)" />
        </svg>
      </div>

      <div className="relative px-6 py-12 max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
            <img src={logo} alt="Field Setup Logo" className="w-full h-full object-contain rounded-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {mode === "login" ? "Sign In" : "Sign Up"}
          </h1>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 rounded-3xl p-6 shadow-glass">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white/90">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/90">I want to be a</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      onClick={() => setRole("donor")}
                      variant={role === "donor" ? "default" : "outline"}
                      className={`h-14 rounded-2xl text-base font-semibold transition-all ${
                        role === "donor" 
                          ? "bg-primary text-white shadow-glow" 
                          : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                      }`}
                    >
                      Donor
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setRole("volunteer")}
                      variant={role === "volunteer" ? "default" : "outline"}
                      className={`h-14 rounded-2xl text-base font-semibold transition-all ${
                        role === "volunteer" 
                          ? "bg-primary text-white shadow-glow" 
                          : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                      }`}
                    >
                      Volunteer
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="flex items-center">
                <button
                  type="button"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-glow"
            >
              {loading ? "Loading..." : mode === "login" ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/70">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-white font-semibold hover:underline"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
