import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Heart, Users, TrendingUp, Shield, MapPin, Clock, Award, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cream/20 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-coralGlow/10" />
        
        <div className="relative px-6 py-16 max-w-2xl mx-auto">
          {/* Logo and Brand */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-glass backdrop-blur-xl border-2 border-glassBorder shadow-glass mb-6 animate-pulse">
              <img src={logo} alt="Field Setup" className="w-20 h-20 object-contain" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-coralGlow to-primary bg-clip-text text-transparent leading-tight">
              Share Food,
              <br />
              Share Love
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Join our community in reducing food waste while making a real difference in people's lives
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4 mb-16">
            <Button
              onClick={() => navigate("/auth?mode=signup")}
              className="w-full h-16 text-lg font-bold"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button
              onClick={() => navigate("/feed")}
              variant="glass"
              className="w-full h-16 text-lg font-semibold"
              size="lg"
            >
              View Available Donations
            </Button>
            <Button
              onClick={() => navigate("/auth?mode=login")}
              variant="outline"
              className="w-full h-16 text-lg font-semibold border-2"
              size="lg"
            >
              Sign In
            </Button>
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
          <Card className="p-8 bg-gradient-glass backdrop-blur-xl border-2 border-glassBorder shadow-glass mb-16">
            <h3 className="text-xl font-bold text-center mb-6">Our Impact So Far</h3>
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
            <div className="inline-block p-8 bg-gradient-card backdrop-blur-xl rounded-3xl border-2 border-glassBorder shadow-glass">
              <h3 className="text-2xl font-bold mb-3">Ready to Make a Difference?</h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of donors and volunteers today
              </p>
              <Button
                onClick={() => navigate("/auth?mode=signup")}
                size="lg"
                className="h-14 px-12 text-lg font-bold"
              >
                Start Now
              </Button>
            </div>
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
  <Card className="p-5 bg-gradient-card backdrop-blur-xl border-2 border-glassBorder shadow-soft hover:shadow-glass transition-all duration-300">
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
        {number}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-primary">{icon}</div>
          <h3 className="font-bold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
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
  <Card className="p-5 bg-gradient-card backdrop-blur-xl border-2 border-glassBorder shadow-soft hover:shadow-glass transition-all duration-300 text-center">
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 text-primary mb-3">
      {icon}
    </div>
    <h3 className="font-bold mb-2 text-sm">{title}</h3>
    <p className="text-xs text-muted-foreground">{description}</p>
  </Card>
);

const StatItem = ({ value, label, sublabel }: { value: string; label: string; sublabel: string }) => (
  <div className="text-center">
    <div className="text-3xl font-bold text-primary mb-1">{value}</div>
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
  <Card className="p-6 bg-gradient-card backdrop-blur-xl border-2 border-glassBorder shadow-soft">
    <p className="text-muted-foreground italic mb-4">"{quote}"</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
        <Users className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="font-semibold text-sm">{author}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  </Card>
);

export default Landing;
