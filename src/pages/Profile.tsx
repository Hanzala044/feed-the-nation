import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit2, Save, Star, Award, Heart } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  bio?: string;
}

interface Donation {
  id: string;
  title: string;
  status: string;
  created_at: string;
  food_type: string;
}

interface Rating {
  id: string;
  rating: number;
  feedback: string;
  created_at: string;
  rated_by: string;
}

interface Achievement {
  id: string;
  achievement_type: string;
  achievement_name: string;
  earned_at: string;
}

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ full_name: "", bio: "" });
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);
      const profileId = userId || user?.id;
      
      if (profileId) {
        await fetchProfile(profileId);
        await fetchDonations(profileId);
        await fetchRatings(profileId);
        await fetchAchievements(profileId);
      }
      setLoading(false);
    };

    initializeProfile();
  }, [userId]);

  const fetchProfile = async (id: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setProfile(data);
      setEditedProfile({ full_name: data.full_name, bio: data.bio || "" });
    }
  };

  const fetchDonations = async (id: string) => {
    const { data } = await supabase
      .from("donations")
      .select("id, title, status, created_at, food_type")
      .or(`donor_id.eq.${id},volunteer_id.eq.${id}`)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) setDonations(data);
  };

  const fetchRatings = async (id: string) => {
    const { data } = await supabase
      .from("ratings")
      .select("*")
      .eq("rated_user", id)
      .order("created_at", { ascending: false });

    if (data) setRatings(data);
  };

  const fetchAchievements = async (id: string) => {
    const { data } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", id)
      .order("earned_at", { ascending: false });

    if (data) setAchievements(data);
  };

  const handleSave = async () => {
    if (!profile) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editedProfile.full_name,
        bio: editedProfile.bio,
      })
      .eq("id", profile.id);

    if (error) {
      toast({ title: "Error updating profile", variant: "destructive" });
    } else {
      toast({ title: "Profile updated successfully" });
      setProfile({ ...profile, ...editedProfile });
      setIsEditing(false);
    }
  };

  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <p className="text-foreground/60">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <Card className="glass-card p-8 text-center">
          <p className="text-foreground/60 mb-4">Profile not found</p>
          <Button variant="glass" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const isOwnProfile = currentUser === profile.id;

  return (
    <div className="min-h-screen bg-gradient-warm p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="glass"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="glass-card p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Avatar className="w-32 h-32 border-4 border-primary/20">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {profile.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <Input
                  value={editedProfile.full_name}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, full_name: e.target.value })
                  }
                  className="mb-2 bg-white/50 border-primary/20"
                />
              ) : (
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {profile.full_name}
                </h1>
              )}

              <div className="flex gap-2 justify-center md:justify-start mb-4">
                <Badge variant="secondary" className="rounded-xl">
                  {profile.role}
                </Badge>
                <Badge variant="outline" className="rounded-xl">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {averageRating} ({ratings.length} reviews)
                </Badge>
              </div>

              {isEditing ? (
                <Textarea
                  value={editedProfile.bio}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself..."
                  className="mb-4 bg-white/50 border-primary/20"
                />
              ) : (
                <p className="text-foreground/70 mb-4">
                  {profile.bio || "No bio yet"}
                </p>
              )}

              {isOwnProfile && (
                <Button
                  variant={isEditing ? "default" : "glass"}
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Tabs defaultValue="donations" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/40 backdrop-blur-sm">
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="achievements">Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="donations" className="space-y-4">
            {donations.length > 0 ? (
              donations.map((donation) => (
                <Card
                  key={donation.id}
                  className="glass-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/donation/${donation.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-foreground">{donation.title}</h3>
                      <p className="text-sm text-foreground/60">{donation.food_type}</p>
                    </div>
                    <Badge variant="secondary" className="rounded-xl">
                      {donation.status}
                    </Badge>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="glass-card p-8 text-center">
                <Heart className="w-12 h-12 mx-auto mb-3 text-primary/40" />
                <p className="text-foreground/60">No donations yet</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ratings" className="space-y-4">
            {ratings.length > 0 ? (
              ratings.map((rating) => (
                <Card key={rating.id} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rating.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {rating.feedback && (
                    <p className="text-foreground/70">{rating.feedback}</p>
                  )}
                  <p className="text-xs text-foreground/50 mt-2">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </p>
                </Card>
              ))
            ) : (
              <Card className="glass-card p-8 text-center">
                <Star className="w-12 h-12 mx-auto mb-3 text-primary/40" />
                <p className="text-foreground/60">No ratings yet</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.length > 0 ? (
              achievements.map((achievement) => (
                <Card key={achievement.id} className="glass-card p-4 text-center">
                  <Award className="w-12 h-12 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold text-sm">{achievement.achievement_name}</h4>
                  <p className="text-xs text-foreground/60 mt-1">
                    {achievement.achievement_type}
                  </p>
                </Card>
              ))
            ) : (
              <Card className="glass-card p-8 text-center col-span-full">
                <Award className="w-12 h-12 mx-auto mb-3 text-primary/40" />
                <p className="text-foreground/60">No badges earned yet</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
