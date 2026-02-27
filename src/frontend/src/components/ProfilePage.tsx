import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  CheckCircle,
  Crown,
  Loader2,
  LogIn,
  LogOut,
  Shield,
  ShoppingBag,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCurrentUser,
  useIsAdmin,
  useMakeAdmin,
  useRegisterUser,
} from "../hooks/useQueries";
import { getInitials } from "../utils/format";
import DashboardPage from "./DashboardPage";

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-green-500 to-teal-600",
  "from-orange-400 to-red-500",
  "from-cyan-500 to-blue-600",
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

type ProfileView = "main" | "dashboard";

interface ProfilePageProps {
  onNavigate: (tab: "feed" | "videos" | "shop" | "profile") => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { data: profile, isLoading: profileLoading } = useGetCurrentUser();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const registerUser = useRegisterUser();
  const makeAdmin = useMakeAdmin();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const [view, setView] = useState<ProfileView>("main");

  // Register form state
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [makingAdmin, setMakingAdmin] = useState(false);

  const isLoading = profileLoading || adminLoading;
  const principal = identity?.getPrincipal().toString() || "";
  const displayNameFallback =
    profile?.displayName || principal.slice(0, 16) || "Guest";
  const gradient = getGradient(displayNameFallback);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !displayName.trim()) return;
    try {
      await registerUser.mutateAsync({
        username: username.trim(),
        displayName: displayName.trim(),
        bio: bio.trim(),
      });
      toast.success("Profile created!");
    } catch {
      toast.error("Failed to create profile");
    }
  };

  const handleMakeAdmin = async () => {
    if (!identity) {
      toast.error("Please log in first");
      return;
    }
    setMakingAdmin(true);
    try {
      await makeAdmin.mutateAsync(identity.getPrincipal());
      toast.success("You are now an Admin! 🎉");
    } catch {
      toast.error("Failed to set admin role");
    } finally {
      setMakingAdmin(false);
    }
  };

  // Show dashboard inline if admin tapped dashboard
  if (view === "dashboard") {
    return (
      <div className="tab-content-enter flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-3 bg-card shadow-header sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setView("main")}
            className="text-alapon-blue text-sm font-semibold hover:underline"
          >
            ← Profile
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="font-display font-bold text-sm text-foreground">
            Ad Dashboard
          </span>
        </div>
        <DashboardPage isAdmin={isAdmin ?? false} />
      </div>
    );
  }

  return (
    <div className="tab-content-enter flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card shadow-header flex items-center justify-between px-4 py-3">
        <h1 className="font-display font-bold text-xl text-foreground">
          Profile
        </h1>
        {identity && (
          <button
            type="button"
            onClick={() => {
              clear();
              toast.success("Logged out");
            }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 space-y-6 flex flex-col items-center">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-5 w-20" />
          </div>
        ) : !identity ? (
          /* ── Not logged in ── */
          <div className="flex flex-col items-center justify-center p-8 pt-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display font-bold text-xl text-foreground mb-2">
              Welcome to Alapon
            </h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-xs leading-relaxed">
              Log in to create posts, shop, manage ads, and connect with your
              community.
            </p>
            <Button
              type="button"
              className="w-full max-w-xs bg-alapon-blue hover:bg-alapon-blue-hover text-white font-bold h-12 gap-2"
              onClick={login}
              disabled={loginStatus === "logging-in"}
            >
              {loginStatus === "logging-in" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Log In
                </>
              )}
            </Button>
          </div>
        ) : !profile ? (
          /* ── Logged in but no profile — show register form ── */
          <div className="p-5">
            <div className="bg-card rounded-xl shadow-card p-5 space-y-4">
              <div className="text-center mb-2">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-3`}
                >
                  <span className="text-white font-display font-bold text-xl">
                    {getInitials(principal.slice(0, 4) || "?")}
                  </span>
                </div>
                <h2 className="font-display font-bold text-lg text-foreground">
                  Complete Your Profile
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Set up your public identity on Alapon
                </p>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-username">Username *</Label>
                  <Input
                    id="reg-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@yourusername"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-displayname">Display Name *</Label>
                  <Input
                    id="reg-displayname"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-bio">Bio</Label>
                  <Textarea
                    id="reg-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-alapon-blue hover:bg-alapon-blue-hover text-white font-bold h-11"
                  disabled={
                    !username.trim() ||
                    !displayName.trim() ||
                    registerUser.isPending
                  }
                >
                  {registerUser.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating Profile...
                    </>
                  ) : (
                    "Create Profile"
                  )}
                </Button>
              </form>
            </div>
          </div>
        ) : (
          /* ── Logged in with profile ── */
          <>
            {/* Profile Hero */}
            <div className="bg-card border-b border-border/50 p-6 flex flex-col items-center gap-3">
              <div
                className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
              >
                <span className="text-white font-display font-black text-3xl">
                  {getInitials(profile.displayName)}
                </span>
              </div>
              <div className="text-center">
                <h2 className="font-display font-bold text-xl text-foreground">
                  {profile.displayName}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  @{profile.username}
                </p>
                {profile.bio && (
                  <p className="text-sm text-foreground mt-2 max-w-xs">
                    {profile.bio}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Badge className="bg-alapon-blue text-white border-0 gap-1">
                    <Crown className="w-3 h-3" /> Admin
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                    <CheckCircle className="w-3 h-3" /> Member
                  </Badge>
                )}
              </div>

              {/* Principal */}
              {principal && (
                <p className="text-[11px] text-muted-foreground font-mono bg-muted px-3 py-1 rounded-full max-w-xs truncate">
                  {principal.length > 30
                    ? `${principal.slice(0, 14)}...${principal.slice(-10)}`
                    : principal}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 space-y-3">
              {/* Admin Dashboard access */}
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => setView("dashboard")}
                  className="w-full bg-card rounded-lg shadow-card p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-alapon-blue-light flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5 text-alapon-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">
                      Ad Revenue Dashboard
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Manage campaigns and view revenue stats
                    </p>
                  </div>
                  <ChevronRightIcon />
                </button>
              ) : (
                /* Make Admin button */
                <div className="bg-card rounded-lg shadow-card overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/50">
                    <h3 className="font-display font-semibold text-sm text-foreground">
                      Developer Tools
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-alapon-blue-light flex items-center justify-center shrink-0 mt-0.5">
                        <Shield className="w-4 h-4 text-alapon-blue" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-foreground">
                          Become Admin
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          Unlock the Ad Revenue Dashboard and campaign
                          management tools.
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleMakeAdmin}
                          disabled={makingAdmin}
                          className="mt-3 bg-alapon-blue hover:bg-alapon-blue-hover text-white"
                        >
                          {makingAdmin ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Upgrading...
                            </>
                          ) : (
                            <>
                              <Crown className="w-4 h-4 mr-2" />
                              Make Me Admin
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Shop Orders */}
              <button
                type="button"
                onClick={() => onNavigate("shop")}
                className="w-full bg-card rounded-lg shadow-card p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 text-alapon-shop" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">
                    My Shop Orders
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    View your purchase history
                  </p>
                </div>
                <ChevronRightIcon />
              </button>
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="p-5 text-center mt-auto">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()}. Built with{" "}
            <span className="text-red-400">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-alapon-blue hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground shrink-0"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
