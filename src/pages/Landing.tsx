import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, X } from "lucide-react";
import logo from "@/assets/logo.svg";
import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [showLogoModal, setShowLogoModal] = useState(false);

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

      {/* Top Right Buttons */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        {/* Theme Toggle */}
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
        
        {/* Skip Button */}
        <button
          onClick={() => navigate("/auth?mode=login")}
          className="text-white/80 dark:text-white/80 light:text-black/80 hover:text-white dark:hover:text-white light:hover:text-black text-sm font-medium transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-between px-6 py-12 max-w-md mx-auto">
        {/* Top Section - Logo and Badge */}
        <div className="w-full pt-8">
          <div className="flex items-center justify-between mb-16">
            <button 
              onClick={() => setShowLogoModal(true)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img src={logo} alt="FOOD 4 U" className="w-8 h-8 rounded-lg" />
              <span className="text-white dark:text-white light:text-black font-semibold text-lg">FOOD 4 U</span>
            </button>
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-12">
            <div className="px-6 py-2 rounded-full bg-white/10 dark:bg-white/10 light:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/20 light:border-black/20">
              <span className="text-white/90 dark:text-white/90 light:text-black/90 text-sm font-medium">DeFi Integration</span>
            </div>
          </div>
        </div>

        {/* Center Section - Hero Text */}
        <div className="text-center flex-1 flex flex-col justify-center -mt-20">
          <h1 className="text-5xl font-bold text-white dark:text-white light:text-black mb-6 leading-tight">
            Your Gateway to Smarter
            <br />
            Food Decisions
          </h1>
          <p className="text-white/70 dark:text-white/70 light:text-black/70 text-base max-w-xs mx-auto leading-relaxed">
            Track, trade, and thrive in Food Sharing
            <br />
            with real-time analytics
          </p>
        </div>

        {/* Bottom Section - CTA Buttons */}
        <div className="w-full space-y-4 pb-8">
          <Button
            onClick={() => navigate("/auth?mode=signup")}
            className="w-full h-14 bg-white dark:bg-white light:bg-black hover:bg-white/90 dark:hover:bg-white/90 light:hover:bg-black/90 text-black dark:text-black light:text-white font-semibold text-base rounded-xl transition-all"
          >
            Get Started
          </Button>
          <Button
            onClick={() => navigate("/auth?mode=login")}
            variant="outline"
            className="w-full h-14 bg-transparent hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-black/10 text-white dark:text-white light:text-black border-white/20 dark:border-white/20 light:border-black/20 font-semibold text-base rounded-xl transition-all"
          >
            Sign In
          </Button>
          <p className="text-center text-sm text-white/60 dark:text-white/60 light:text-black/60 pt-2">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/auth?mode=login")}
              className="text-white dark:text-white light:text-black font-semibold hover:text-white/80 dark:hover:text-white/80 light:hover:text-black/80 transition-colors"
            >
              Log in
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

export default Landing;
