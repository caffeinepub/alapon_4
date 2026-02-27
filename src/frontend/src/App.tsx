import { Toaster } from "@/components/ui/sonner";
import { Home, Play, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import FeedPage from "./components/FeedPage";
import ProfilePage from "./components/ProfilePage";
import ShopPage from "./components/ShopPage";
import VideosPage from "./components/VideosPage";

type Tab = "feed" | "videos" | "shop" | "profile";

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "feed", label: "Home", icon: Home },
  { id: "videos", label: "Videos", icon: Play },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "profile", label: "Profile", icon: User },
];

function BottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  return (
    <nav className="bottom-nav sticky bottom-0 z-40 bg-card shadow-nav">
      <div className="flex">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all relative ${
                isActive
                  ? "text-alapon-blue"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}
              >
                {label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-alapon-blue rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("feed");

  return (
    <div className="min-h-screen bg-alapon-surface flex flex-col">
      {/* Mobile-first: max-width 480px centered */}
      <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen relative bg-alapon-surface">
        {/* Page content */}
        <div className="flex-1 overflow-hidden flex flex-col pb-14">
          {activeTab === "feed" && (
            <div className="flex-1 overflow-y-auto flex flex-col">
              <FeedPage />
            </div>
          )}
          {activeTab === "videos" && (
            <div className="flex-1 overflow-y-auto flex flex-col">
              <VideosPage />
            </div>
          )}
          {activeTab === "shop" && (
            <div className="flex-1 overflow-y-auto flex flex-col">
              <ShopPage />
            </div>
          )}
          {activeTab === "profile" && (
            <div className="flex-1 overflow-y-auto flex flex-col">
              <ProfilePage onNavigate={setActiveTab} />
            </div>
          )}
        </div>

        {/* Bottom navigation */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40">
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Gray side panels on desktop */}
      <div className="fixed inset-0 -z-10 bg-alapon-surface" />

      <Toaster position="top-center" />
    </div>
  );
}
