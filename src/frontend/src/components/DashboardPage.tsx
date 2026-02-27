import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  CheckCircle,
  DollarSign,
  Eye,
  Loader2,
  Lock,
  MousePointerClick,
  Pause,
  Play,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Campaign } from "../backend.d";
import {
  useCreateCampaign,
  useGetRevenueStats,
  useListCampaigns,
  useUpdateCampaignStatus,
} from "../hooks/useQueries";
import { formatNumber } from "../utils/format";

// ─── KPI Card ─────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon,
  label,
  value,
  color,
  accentColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  accentColor: string;
}) {
  return (
    <div className="bg-card rounded-lg shadow-card overflow-hidden">
      <div className={`h-[3px] w-full ${accentColor}`} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.05em] leading-tight">
            {label}
          </p>
          <div
            className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0 ml-2`}
          >
            <Icon className="w-[15px] h-[15px] text-white" />
          </div>
        </div>
        <p className="text-[26px] font-display font-extrabold text-foreground leading-none tracking-[-0.02em]">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
        <Play className="w-3 h-3 mr-1" /> Active
      </Badge>
    );
  }
  if (status === "paused") {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
        <Pause className="w-3 h-3 mr-1" /> Paused
      </Badge>
    );
  }
  return (
    <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
      <CheckCircle className="w-3 h-3 mr-1" /> Completed
    </Badge>
  );
}

// ─── Create Campaign Modal ─────────────────────────────────────────────────
function CreateCampaignModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [budget, setBudget] = useState("");
  const createCampaign = useCreateCampaign();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const budgetCents = BigInt(
        Math.round(Number.parseFloat(budget || "0") * 100),
      );
      await createCampaign.mutateAsync({
        name: name.trim(),
        budget: budgetCents,
        imageUrl: imageUrl.trim(),
        targetUrl: targetUrl.trim(),
      });
      toast.success("Campaign created!");
      onClose();
    } catch {
      toast.error("Failed to create campaign");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display font-bold">
            Create Campaign
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="camp-name">Campaign Name *</Label>
            <Input
              id="camp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Sale 2026"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="camp-image">Ad Image URL</Label>
            <Input
              id="camp-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="camp-target">Target URL</Label>
            <Input
              id="camp-target"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="camp-budget">Budget ($)</Label>
            <Input
              id="camp-budget"
              type="number"
              min="0"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="50.00"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || createCampaign.isPending}
              className="bg-alapon-blue hover:bg-alapon-blue-hover text-white"
            >
              {createCampaign.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Campaign"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Campaign Row ──────────────────────────────────────────────────────────
function CampaignRow({ campaign }: { campaign: Campaign }) {
  const updateStatus = useUpdateCampaignStatus();

  const toggleStatus = async () => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    try {
      await updateStatus.mutateAsync({
        campaignId: campaign.id,
        status: newStatus,
      });
      toast.success(`Campaign ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const complete = async () => {
    try {
      await updateStatus.mutateAsync({
        campaignId: campaign.id,
        status: "completed",
      });
      toast.success("Campaign completed");
    } catch {
      toast.error("Failed to complete campaign");
    }
  };

  const ctr =
    campaign.impressions > 0n
      ? `${((Number(campaign.clicks) / Number(campaign.impressions)) * 100).toFixed(2)}%`
      : "0.00%";
  const budgetDisplay = `$${(Number(campaign.budget) / 100).toFixed(2)}`;
  const spentDisplay = `$${(Number(campaign.spent) / 100).toFixed(2)}`;

  return (
    <div className="bg-card rounded-lg shadow-card overflow-hidden">
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-[15px] text-foreground leading-snug truncate">
            {campaign.name}
          </p>
          <p className="text-[12px] text-muted-foreground mt-[3px]">
            Budget: {budgetDisplay} · Spent: {spentDisplay}
          </p>
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 divide-x divide-border/50">
        <div className="text-center px-2 py-3">
          <p className="font-display font-extrabold text-[15px] text-foreground leading-none">
            {formatNumber(campaign.impressions)}
          </p>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.04em] mt-[4px]">
            Views
          </p>
        </div>
        <div className="text-center px-2 py-3">
          <p className="font-display font-extrabold text-[15px] text-foreground leading-none">
            {formatNumber(campaign.clicks)}
          </p>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.04em] mt-[4px]">
            Clicks
          </p>
        </div>
        <div className="text-center px-2 py-3">
          <p className="font-display font-extrabold text-[15px] text-foreground leading-none">
            {ctr}
          </p>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.04em] mt-[4px]">
            CTR
          </p>
        </div>
        <div className="text-center px-2 py-3">
          <p className="font-display font-extrabold text-[15px] text-green-600 leading-none">
            {spentDisplay}
          </p>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.04em] mt-[4px]">
            Spent
          </p>
        </div>
      </div>

      {/* Actions */}
      {campaign.status !== "completed" && (
        <div className="flex gap-2 px-4 py-3 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 text-[13px] font-semibold h-9"
            onClick={toggleStatus}
            disabled={updateStatus.isPending}
          >
            {updateStatus.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : campaign.status === "active" ? (
              <>
                <Pause className="w-3.5 h-3.5 mr-1.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-1.5" /> Activate
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 text-[13px] font-semibold text-muted-foreground h-9"
            onClick={complete}
            disabled={updateStatus.isPending}
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Complete
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── DashboardPage ─────────────────────────────────────────────────────────
interface DashboardPageProps {
  isAdmin: boolean;
}

export default function DashboardPage({ isAdmin }: DashboardPageProps) {
  const { data: campaigns, isLoading: campaignsLoading } = useListCampaigns();
  const { data: revenueStats, isLoading: statsLoading } = useGetRevenueStats();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!isAdmin) {
    return (
      <div className="tab-content-enter flex flex-col h-full">
        <header className="sticky top-0 z-30 bg-card shadow-header px-4 py-3">
          <h1 className="font-display font-bold text-xl text-foreground">
            Ad Dashboard
          </h1>
        </header>
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-xs">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-display font-bold text-xl text-foreground mb-2">
              Admin Access Required
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Ad Revenue Dashboard is only available to admins. Go to your
              Profile tab to become an admin.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const isLoading = campaignsLoading || statsLoading;
  const totalImpressions = revenueStats?.totalImpressions ?? 0n;
  const totalClicks = revenueStats?.totalClicks ?? 0n;
  const totalRevenue = revenueStats?.totalRevenue ?? 0n;
  const ctr = revenueStats
    ? `${(revenueStats.CTR * 100).toFixed(2)}%`
    : "0.00%";
  const revenueFormatted = `$${(Number(totalRevenue) / 100).toFixed(2)}`;

  return (
    <div className="tab-content-enter flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card shadow-header flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-alapon-blue" />
          <h1 className="font-display font-bold text-xl text-foreground">
            Ad Dashboard
          </h1>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="bg-alapon-blue hover:bg-alapon-blue-hover text-white rounded-full h-8 px-3 text-xs gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          New Campaign
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-card rounded-lg shadow-card p-4 space-y-2"
              >
                <Skeleton className="w-9 h-9 rounded-lg" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <KpiCard
              icon={Eye}
              label="Impressions"
              value={formatNumber(totalImpressions)}
              color="bg-blue-500"
              accentColor="bg-blue-500"
            />
            <KpiCard
              icon={MousePointerClick}
              label="Total Clicks"
              value={formatNumber(totalClicks)}
              color="bg-purple-500"
              accentColor="bg-purple-500"
            />
            <KpiCard
              icon={TrendingUp}
              label="Overall CTR"
              value={ctr}
              color="bg-orange-500"
              accentColor="bg-orange-500"
            />
            <KpiCard
              icon={DollarSign}
              label="Total Revenue"
              value={revenueFormatted}
              color="bg-green-500"
              accentColor="bg-green-500"
            />
          </div>
        )}

        {/* Campaigns section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-base text-foreground">
              Campaigns
            </h2>
            {campaigns && (
              <span className="text-xs text-muted-foreground">
                {campaigns.length} total
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-lg shadow-card p-4 space-y-3"
                >
                  <Skeleton className="h-4 w-2/3" />
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="text-center space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : !campaigns || campaigns.length === 0 ? (
            <div className="bg-card rounded-lg shadow-card p-8 text-center">
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-display font-semibold text-foreground">
                No campaigns yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first ad campaign to start monetizing
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-alapon-blue hover:bg-alapon-blue-hover text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <CampaignRow key={campaign.id.toString()} campaign={campaign} />
              ))}
            </div>
          )}
        </div>

        <div className="h-4" />
      </main>

      {showCreateModal && (
        <CreateCampaignModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
