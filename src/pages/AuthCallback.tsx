import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          // Check if user has a profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (profileError && profileError.code === "PGRST116") {
            // Profile doesn't exist, create one with default role
            // For Google OAuth, we default to "donor" role
            // Users can change this later or we can add a role selection screen
            const { error: createError } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                email: session.user.email || "",
                full_name: session.user.user_metadata?.full_name || 
                          session.user.user_metadata?.name || 
                          session.user.email?.split("@")[0] || "User",
                role: "donor", // Default role for Google sign-in
              });

            if (createError) {
              console.error("Error creating profile:", createError);
              // If profile creation fails, the trigger might have created it
              // Wait a bit and check again
              await new Promise(resolve => setTimeout(resolve, 1000));
              const { data: newProfile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", session.user.id)
                .single();
              
              if (newProfile) {
                navigate(newProfile.role === "donor" ? "/donor/dashboard" : "/volunteer/dashboard");
              } else {
                navigate("/donor/dashboard");
              }
            } else {
              navigate("/donor/dashboard");
            }
          } else if (profile) {
            // Redirect based on existing profile role
            if (profile.role === "donor") {
              navigate("/donor/dashboard");
            } else if (profile.role === "volunteer") {
              navigate("/volunteer/dashboard");
            } else {
              navigate("/");
            }
          } else {
            navigate("/donor/dashboard");
          }
        } else {
          navigate("/auth");
        }
      } catch (error: any) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f1e8] to-[#e8e0d3]">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

