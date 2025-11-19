import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, X, QrCode, ArrowRight, Heart, Users, TrendingUp } from "lucide-react";
import logo from "@/assets/logo.svg";
import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [showLogoModal, setShowLogoModal] = useState(false);

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
        <div
          className="absolute bottom-[10%] left-[50%] w-[600px] h-[600px] bg-gradient-to-t from-blue-500 via-cyan-500 to-transparent rounded-full blur-[120px] opacity-20 animate-pulse"
          style={{ animationDuration: '12s', animationDelay: '4s' }}
        />

        {/* Floating Particles - Dark Mode Only */}
        <div className="absolute inset-0 dark:block hidden">
          {[...Array(50)].map((_, i) => (
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

      {/* Navigation Bar */}
      <nav className="relative z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setShowLogoModal(true)}
            className="flex items-center gap-3 group hover:scale-105 transition-transform duration-300"
          >
            <div className="relative">
              <img src={logo} alt="FOOD 4 U" className="w-10 h-10 rounded-xl shadow-lg" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b35] to-transparent rounded-xl opacity-0 group-hover:opacity-50 transition-opacity blur-sm" />
            </div>
            <span className="text-white dark:text-white light:text-slate-900 font-bold text-xl tracking-tight">
              FOOD 4 U
            </span>
          </button>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/scan")}
              className="hidden sm:flex items-center gap-2 text-white/80 hover:text-white dark:text-white/80 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-200/50 rounded-xl px-4"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden md:inline">Scan QR</span>
            </Button>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="w-10 h-10 rounded-xl bg-white/5 dark:bg-white/5 light:bg-slate-200 backdrop-blur-md border border-white/10 dark:border-white/10 light:border-slate-300 flex items-center justify-center text-white dark:text-white light:text-slate-900 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-300 transition-all"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth?mode=login")}
              className="text-white/80 hover:text-white dark:text-white/80 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 text-sm font-medium hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-200/50 rounded-xl px-4"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#ff6b35]/20 to-purple-500/20 backdrop-blur-md border border-white/10 dark:border-white/10 light:border-slate-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6b35] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff6b35]"></span>
                </span>
                <span className="text-white/90 dark:text-white/90 light:text-slate-700 text-sm font-medium">
                  Making a Difference Together
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white dark:text-white light:text-slate-900 leading-tight">
                <span className="block">Endless</span>
                <span className="block bg-gradient-to-r from-[#ff6b35] via-[#ff8c42] to-purple-500 bg-clip-text text-transparent">
                  Impact of
                </span>
                <span className="block">Food Sharing</span>
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl text-white/70 dark:text-white/70 light:text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect donors with volunteers to reduce food waste and help those in need.
                Track donations, earn achievements, and make a real impact in your community.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-4">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white dark:text-white light:text-slate-900">10K+</div>
                  <div className="text-sm text-white/60 dark:text-white/60 light:text-slate-600">Meals Shared</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white dark:text-white light:text-slate-900">5K+</div>
                  <div className="text-sm text-white/60 dark:text-white/60 light:text-slate-600">Active Users</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-white dark:text-white light:text-slate-900">95%</div>
                  <div className="text-sm text-white/60 dark:text-white/60 light:text-slate-600">Success Rate</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                <Button
                  onClick={() => navigate("/auth?mode=signup")}
                  size="lg"
                  className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/50 hover:shadow-xl hover:shadow-[#ff6b35]/60 transition-all duration-300 rounded-xl group"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => navigate("/auth?mode=login")}
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base font-semibold bg-white/5 dark:bg-white/5 light:bg-white border-white/20 dark:border-white/20 light:border-slate-300 text-white dark:text-white light:text-slate-900 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-100 backdrop-blur-md rounded-xl transition-all duration-300"
                >
                  Sign In
                </Button>
                {/* Mobile Scan QR Button */}
                <Button
                  onClick={() => navigate("/scan")}
                  size="lg"
                  variant="outline"
                  className="sm:hidden h-14 px-8 text-base font-semibold bg-white/5 dark:bg-white/5 light:bg-white border-white/20 dark:border-white/20 light:border-slate-300 text-white dark:text-white light:text-slate-900 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-100 backdrop-blur-md rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <QrCode className="w-5 h-5" />
                  Scan QR Code
                </Button>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="relative lg:block">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                {/* Hero Image - Using placeholder, replace with actual food donation image */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b35] via-purple-500 to-blue-500">
                  {/* You can add an actual image here */}
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-4 p-8">
                      <Heart className="w-24 h-24 mx-auto text-white/80 animate-pulse" />
                      <p className="text-2xl font-bold text-white">Share Food</p>
                      <p className="text-lg text-white/80">Save Lives</p>
                    </div>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute bottom-8 left-8 right-8 z-20 space-y-3">
                  <div
                    className="bg-white/10 dark:bg-white/10 light:bg-white/90 backdrop-blur-xl border border-white/20 dark:border-white/20 light:border-slate-200 rounded-2xl p-4 shadow-xl"
                    style={{
                      animation: 'float-card 3s ease-in-out infinite',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white dark:text-white light:text-slate-900">
                          Active Community
                        </div>
                        <div className="text-xs text-white/70 dark:text-white/70 light:text-slate-600">
                          Join 5,000+ volunteers
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="bg-white/10 dark:bg-white/10 light:bg-white/90 backdrop-blur-xl border border-white/20 dark:border-white/20 light:border-slate-200 rounded-2xl p-4 shadow-xl"
                    style={{
                      animation: 'float-card 3s ease-in-out infinite 0.5s',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white dark:text-white light:text-slate-900">
                          Real-time Tracking
                        </div>
                        <div className="text-xs text-white/70 dark:text-white/70 light:text-slate-600">
                          Monitor every donation
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-[#ff6b35] to-transparent rounded-full blur-2xl opacity-50 animate-pulse" />
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gradient-to-br from-purple-500 to-transparent rounded-full blur-2xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </main>
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
        @keyframes float-card {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
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

export default Landing;