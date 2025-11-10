import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Heart, Users, TrendingUp, Shield, MapPin, Clock, Award, Sparkles, Moon, Sun } from "lucide-react";
import logo from "@/assets/logo.svg";
import { useTheme } from "@/components/ThemeProvider";

const Landing = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 via-accent/20 to-transparent rounded-full blur-3xl animate-orb" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-accent/20 via-primary/20 to-transparent rounded-full blur-3xl animate-orb" style={{ animationDelay: '10s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-primary/10 via-accent/10 to-transparent rounded-full blur-3xl animate-pulse-glow" />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <Button
          variant="glass"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="rounded-full w-14 h-14 hover-glow"
        >
          {theme === "light" ? (
            <Moon className="w-6 h-6" />
          ) : (
            <Sun className="w-6 h-6" />
          )}
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="relative px-6 py-16 max-w-2xl mx-auto">
          {/* Logo and Brand */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center justify-center w-32 h-32 mb-8 rounded-full bg-white/10 backdrop-blur-sm shadow-glow p-4 animate-glow-pulse">
              <img src={logo} alt="FOOD 4 U" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text animate-gradient leading-tight">
              Your Gateway to Smarter
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text animate-gradient leading-tight">
              Food Decisions
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Track, trade, and thrive in Food Sharing with real-time analytics
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button
              onClick={() => navigate("/auth?mode=signup")}
              variant="gradient"
              size="lg"
              className="w-full group"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Get Started
            </Button>
            <Button
              onClick={() => navigate("/auth?mode=login")}
              variant="glass"
              size="lg"
              className="w-full"
            >
              Sign In
            </Button>
            <p className="text-center text-sm text-muted-foreground pt-2">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/auth?mode=login")}
                className="text-primary font-semibold hover:text-accent transition-colors"
              >
                Log in
              </button>
            </p>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid gap-4">
              <StepCard
                number="1"
                icon={<Heart className="w-6 h-6" />}
                title="Donate Food"
                description="Have leftover food? List it in seconds with photos and details"
              />
              <StepCard
                number="2"
                icon={<MapPin className="w-6 h-6" />}
                title="Connect Locally"
                description="Volunteers nearby receive instant notifications and can accept pickups"
              />
              <StepCard
                number="3"
                icon={<Clock className="w-6 h-6" />}
                title="Track & Deliver"
                description="Real-time tracking ensures safe delivery with photo verification"
              />
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Why Choose Us</h2>
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title="Safe & Verified"
                description="All users verified with ratings system"
              />
              <FeatureCard
                icon={<Clock className="w-6 h-6" />}
                title="Real-Time"
                description="Instant notifications & live tracking"
              />
              <FeatureCard
                icon={<Award className="w-6 h-6" />}
                title="Gamified"
                description="Earn badges & compete on leaderboards"
              />
              <FeatureCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Impact Analytics"
                description="See your environmental impact"
              />
            </div>
          </div>

          {/* Stats Section */}
          <Card className="p-8 mb-16">
            <h3 className="text-2xl font-bold text-center mb-8">Our Impact So Far</h3>
            <div className="grid grid-cols-3 gap-6">
              <StatItem value="12K+" label="Meals Shared" sublabel="5K this month" />
              <StatItem value="1,200+" label="Active Users" sublabel="Growing daily" />
              <StatItem value="150+" label="Cities" sublabel="Worldwide" />
            </div>
          </Card>

          {/* Testimonials */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">What People Say</h2>
            <div className="space-y-4">
              <TestimonialCard
                quote="This app changed how I think about food waste. So easy to donate!"
                author="Sarah M."
                role="Donor"
              />
              <TestimonialCard
                quote="Volunteering has never been easier. Love the real-time notifications!"
                author="Mike K."
                role="Volunteer"
              />
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <Card className="p-10">
              <h3 className="text-3xl font-bold mb-4 gradient-text">Ready to Make a Difference?</h3>
              <p className="text-muted-foreground mb-8 text-lg">
                Join thousands of donors and volunteers today
              </p>
              <Button
                onClick={() => navigate("/auth?mode=signup")}
                variant="gradient"
                size="lg"
                className="group"
              >
                <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Start Now
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const StepCard = ({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Card className="p-6 group">
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl shadow-glow group-hover:scale-110 transition-transform">
        {number}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-primary group-hover:text-accent transition-colors">{icon}</div>
          <h3 className="font-bold text-lg">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  </Card>
);

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Card className="p-6 text-center group">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary mb-4 group-hover:scale-110 group-hover:shadow-glow transition-all">
      {icon}
    </div>
    <h3 className="font-bold mb-2 text-base">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </Card>
);

const StatItem = ({ value, label, sublabel }: { value: string; label: string; sublabel: string }) => (
  <div className="text-center">
    <div className="text-4xl font-bold gradient-text mb-2">{value}</div>
    <div className="text-sm font-semibold mb-1">{label}</div>
    <div className="text-xs text-muted-foreground">{sublabel}</div>
  </div>
);

const TestimonialCard = ({
  quote,
  author,
  role,
}: {
  quote: string;
  author: string;
  role: string;
}) => (
  <Card className="p-6">
    <p className="text-muted-foreground italic mb-5 text-base leading-relaxed">"{quote}"</p>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
        <Users className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="font-bold text-sm">{author}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  </Card>
);

export default Landing;
