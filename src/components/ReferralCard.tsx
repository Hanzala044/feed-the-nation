import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Gift, Copy, Share2, Users, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ReferralCardProps {
  referralCode: string;
  referralPoints: number;
  referralsCount: number;
}

export const ReferralCard = ({ referralCode, referralPoints, referralsCount }: ReferralCardProps) => {
  const { toast } = useToast();
  const [showShareDialog, setShowShareDialog] = useState(false);

  const referralLink = `${window.location.origin}/auth?mode=signup&ref=${referralCode}`;
  const shareMessage = `🎁 Join FOOD 4 U and make a difference!\n\nUse my referral code: ${referralCode}\n\nHelp feed those in need while earning rewards! 🌟\n\n${referralLink}`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    });
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join FOOD 4 U',
          text: shareMessage,
        });
      } catch (error) {
        // User cancelled share or error occurred
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback to showing share dialog
      setShowShareDialog(true);
    }
  };

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-[#ff6b35]/10 via-purple-500/10 to-transparent border-2 border-[#ff6b35]/30 dark:border-[#ff6b35]/30 backdrop-blur-sm">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Refer & Earn</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Share the love, earn rewards!</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 text-[#ff6b35]" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Points</p>
              </div>
              <p className="text-2xl font-bold text-[#ff6b35]">{referralPoints}</p>
            </div>
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Referrals</p>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{referralsCount}</p>
            </div>
          </div>

          {/* Referral Code */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Your Referral Code</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white dark:bg-slate-800 border-2 border-[#ff6b35]/30 rounded-lg px-4 py-3 font-mono text-lg font-bold text-[#ff6b35] text-center tracking-wider">
                {referralCode}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(referralCode, 'Referral code')}
                className="h-12 w-12 rounded-lg border-2 border-[#ff6b35]/30 hover:bg-[#ff6b35] hover:text-white hover:border-[#ff6b35] transition-all"
                title="Copy code"
              >
                <Copy className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => copyToClipboard(referralLink, 'Referral link')}
              variant="outline"
              className="flex-1 h-11 rounded-lg border-2 border-[#ff6b35]/30 hover:bg-[#ff6b35]/10 transition-all font-semibold text-slate-700 dark:text-slate-300"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button
              onClick={shareReferral}
              className="flex-1 h-11 rounded-lg bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/30 transition-all font-semibold"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Rewards Info */}
          <div className="bg-gradient-to-r from-purple-500/10 to-[#ff6b35]/10 rounded-lg p-3 border border-purple-500/20">
            <p className="text-xs text-slate-700 dark:text-slate-300 text-center">
              <span className="font-bold text-[#ff6b35]">Earn 50 points</span> for each friend who joins +
              <span className="font-bold text-purple-600 dark:text-purple-400"> they get 25 points</span> too!
            </p>
          </div>
        </div>
      </Card>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Referral</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {shareMessage}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  copyToClipboard(shareMessage, 'Share message');
                  setShowShareDialog(false);
                }}
                variant="outline"
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Message
              </Button>
              <Button
                onClick={() => {
                  copyToClipboard(referralLink, 'Referral link');
                  setShowShareDialog(false);
                }}
                className="flex-1 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42]"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
