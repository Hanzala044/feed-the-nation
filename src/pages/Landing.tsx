import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart, Users, TrendingUp, Shield } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
        <div className="relative px-6 py-12 max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/20 mb-6">
              <Heart className="w-10 h-10 text-primary" fill="currentColor" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-coralGlow to-primary bg-clip-text text-transparent">
              Food for Everyone
            </h1>
            <p className="text-lg text-muted-foreground">
              Connecting quality leftover food with those who need it most
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 mb-12">
            <Button
              onClick={() => navigate("/auth?mode=signup")}
              className="w-full h-14 text-lg font-semibold rounded-2xl bg-primary hover:bg-primary/90 shadow-[0_8px_32px_hsla(16,100%,66%,0.25)]"
            >
              Get Started
            </Button>
            <Button
              onClick={() => navigate("/auth?mode=login")}
              variant="outline"
              className="w-full h-14 text-lg font-semibold rounded-2xl border-2 border-primary/30 hover:bg-primary/10"
            >
              Sign In
            </Button>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Serve the Nation"
              description="Help reduce food waste while feeding those in need"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Quality Assured"
              description="All donations are verified for safety and quality standards"
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Track Impact"
              description="See exactly where your donations go and who they help"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 p-6 rounded-3xl bg-card border border-border">
            <StatItem value="10K+" label="Meals Shared" />
            <StatItem value="500+" label="Donors" />
            <StatItem value="50+" label="Volunteers" />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-2xl font-bold text-primary mb-1">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

export default Landing;
