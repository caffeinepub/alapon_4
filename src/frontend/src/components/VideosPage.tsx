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
import { ExternalLink, Eye, Heart, Loader2, Play, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Campaign, Video } from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  useCreateVideo,
  useGetVideos,
  useIncrementViewCount,
  useLikeVideo,
  useListCampaigns,
  useRecordClick,
  useRecordImpression,
} from "../hooks/useQueries";
import { formatNumber } from "../utils/format";

// ─── Sample data ──────────────────────────────────────────────────────────
const SAMPLE_VIDEOS = [
  {
    title: "Welcome to Alapon — Your New Social Home 🏠",
    thumbnailUrl: "https://picsum.photos/seed/video1/400/225",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isSponsored: false,
  },
  {
    title: "Exploring Hidden Gems of Southeast Asia 🌏",
    thumbnailUrl: "https://picsum.photos/seed/video2/400/225",
    videoUrl: "",
    isSponsored: false,
  },
  {
    title: "How to Build a Decentralized App on ICP 💻",
    thumbnailUrl: "https://picsum.photos/seed/video3/400/225",
    videoUrl: "",
    isSponsored: false,
  },
  {
    title: "Street Food Tour: 10 Must-Try Dishes 🍜",
    thumbnailUrl: "https://picsum.photos/seed/video4/400/225",
    videoUrl: "",
    isSponsored: false,
  },
  {
    title: "Morning Yoga Flow for Beginners 🧘",
    thumbnailUrl: "https://picsum.photos/seed/video5/400/225",
    videoUrl: "",
    isSponsored: false,
  },
  {
    title: "Top 5 Productivity Hacks of 2026 ⚡",
    thumbnailUrl: "https://picsum.photos/seed/video6/400/225",
    videoUrl: "",
    isSponsored: false,
  },
];

const DUMMY_THUMBNAIL_GRADIENTS = [
  "from-blue-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-green-500 to-teal-600",
  "from-orange-400 to-amber-600",
  "from-indigo-500 to-cyan-600",
  "from-red-500 to-pink-600",
];
function getGradient(id: bigint) {
  return DUMMY_THUMBNAIL_GRADIENTS[
    Number(id) % DUMMY_THUMBNAIL_GRADIENTS.length
  ];
}

// ─── Pre-roll Ad ──────────────────────────────────────────────────────────
function PreRollAd({
  campaign,
  onSkip,
}: { campaign: Campaign; onSkip: () => void }) {
  const [countdown, setCountdown] = useState(3);
  const recordImpression = useRecordImpression();
  const recordClick = useRecordClick();

  const recordImpressionMutate = recordImpression.mutate;
  useEffect(() => {
    recordImpressionMutate(campaign.id);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [campaign.id, recordImpressionMutate]);

  const handleAdClick = () => {
    recordClick.mutate(campaign.id);
    if (campaign.targetUrl)
      window.open(campaign.targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative bg-black rounded-t-xl overflow-hidden">
      {campaign.imageUrl ? (
        <img
          src={campaign.imageUrl}
          alt={campaign.name}
          className="w-full aspect-video object-cover"
        />
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center">
          <span className="text-white font-display font-bold text-lg">
            {campaign.name}
          </span>
        </div>
      )}
      {/* Ad label */}
      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded font-semibold">
        Ad
      </div>
      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="text-white font-display font-semibold text-sm truncate">
          {campaign.name}
        </p>
        <button
          type="button"
          onClick={handleAdClick}
          className="mt-1.5 flex items-center gap-1 text-white/90 text-xs hover:text-white transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Visit advertiser
        </button>
      </div>
      {/* Skip / countdown */}
      <div className="absolute top-2 right-2">
        {countdown > 0 ? (
          <div className="bg-black/70 text-white text-xs px-2.5 py-1 rounded-full font-bold">
            Skip in {countdown}s
          </div>
        ) : (
          <button
            type="button"
            onClick={onSkip}
            className="flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs px-2.5 py-1 rounded-full font-semibold transition-colors"
          >
            Skip Ad <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Video Modal ──────────────────────────────────────────────────────────
function VideoModal({
  video,
  adCampaign,
  onClose,
}: {
  video: Video;
  adCampaign: Campaign | null;
  onClose: () => void;
}) {
  const [adDone, setAdDone] = useState(adCampaign === null);
  const likeVideo = useLikeVideo();
  const gradient = getGradient(video.id);
  const [liked, setLiked] = useState(false);
  const likeCount = BigInt(video.likes.length) + (liked ? 1n : 0n);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    likeVideo.mutate(video.id);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden rounded-xl gap-0">
        {/* Ad or video */}
        {!adDone && adCampaign ? (
          <PreRollAd campaign={adCampaign} onSkip={() => setAdDone(true)} />
        ) : (
          <>
            {video.videoUrl ? (
              <div className="aspect-video bg-black">
                <iframe
                  src={video.videoUrl}
                  title={video.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                />
              </div>
            ) : video.thumbnailUrl ? (
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-foreground ml-1" />
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`aspect-video bg-gradient-to-br ${gradient} flex items-center justify-center`}
              >
                <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </div>
            )}
          </>
        )}

        {adDone && (
          <div className="p-4 space-y-3">
            <DialogHeader>
              <DialogTitle className="font-display font-bold text-foreground leading-tight">
                {video.title}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatNumber(video.views)}</span>
                </div>
                {video.isSponsored && (
                  <Badge variant="secondary" className="text-xs">
                    Sponsored
                  </Badge>
                )}
              </div>
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors px-3 py-1.5 rounded-full ${
                  liked
                    ? "bg-red-50 text-red-500"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                {formatNumber(likeCount)}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Video Modal ──────────────────────────────────────────────────────
function AddVideoModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const createVideo = useCreateVideo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await createVideo.mutateAsync({
        title: title.trim(),
        thumbnailUrl: thumbnailUrl.trim(),
        videoUrl: videoUrl.trim(),
        isSponsored: false,
      });
      toast.success("Video added!");
      onClose();
    } catch {
      toast.error("Failed to add video");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display font-bold">
            Add Video
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="video-title">Title *</Label>
            <Input
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="video-url">Video URL (YouTube embed, etc.)</Label>
            <Input
              id="video-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="thumb-url">Thumbnail URL</Label>
            <Input
              id="thumb-url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://... (optional)"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || createVideo.isPending}
              className="bg-alapon-blue hover:bg-alapon-blue-hover text-white"
            >
              {createVideo.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Video"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── VideoCard ────────────────────────────────────────────────────────────
function VideoCard({ video, onClick }: { video: Video; onClick: () => void }) {
  const gradient = getGradient(video.id);

  return (
    <button
      type="button"
      onClick={onClick}
      className="video-card bg-card rounded-lg overflow-hidden shadow-card text-left w-full"
    >
      <div className="aspect-video relative overflow-hidden">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              if (el.parentElement)
                el.parentElement.className += ` bg-gradient-to-br ${gradient}`;
            }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
            <Play className="w-4 h-4 text-white ml-0.5" />
          </div>
        </div>
        {video.isSponsored && (
          <div className="absolute top-1.5 left-1.5">
            <span className="bg-alapon-blue text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              AD
            </span>
          </div>
        )}
        <div className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
          <Eye className="w-2.5 h-2.5" />
          {formatNumber(video.views)}
        </div>
      </div>
      <div className="p-2.5">
        <p className="font-display font-semibold text-xs text-foreground line-clamp-2 leading-tight mb-1">
          {video.title}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            Alapon Video
          </span>
          <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Heart className="w-3 h-3" />
            <span>{formatNumber(BigInt(video.likes.length))}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── VideosPage ───────────────────────────────────────────────────────────
export default function VideosPage() {
  const { data: videos, isLoading, error, refetch } = useGetVideos();
  const { data: campaigns } = useListCampaigns();
  const createVideo = useCreateVideo();
  const incrementView = useIncrementViewCount();
  const { actor } = useActor();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const createVideoMutateAsync = createVideo.mutateAsync;

  // Seed videos if empty
  useEffect(() => {
    if (!videos || videos.length > 0 || !actor) return;
    const seed = async () => {
      for (const v of SAMPLE_VIDEOS) {
        try {
          await createVideoMutateAsync({
            title: v.title,
            thumbnailUrl: v.thumbnailUrl,
            videoUrl: v.videoUrl,
            isSponsored: v.isSponsored,
          });
        } catch {
          break;
        }
      }
    };
    seed();
  }, [videos, actor, createVideoMutateAsync]);

  const activeCampaigns = campaigns?.filter((c) => c.status === "active") ?? [];

  const handleVideoClick = useCallback(
    (video: Video) => {
      setSelectedVideo(video);
      incrementView.mutate(video.id);
    },
    [incrementView],
  );

  const preRollAd =
    activeCampaigns.length > 0
      ? activeCampaigns[Math.floor(Math.random() * activeCampaigns.length)]
      : null;

  return (
    <div className="tab-content-enter flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card shadow-header flex items-center justify-between px-4 py-3">
        <h1 className="font-display font-bold text-xl text-foreground">
          Videos
        </h1>
        <Button
          type="button"
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="bg-alapon-blue hover:bg-alapon-blue-hover text-white rounded-full h-8 px-3 text-xs gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              Failed to load videos
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : !videos || videos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-display font-semibold text-foreground">
              No videos yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Share the first video!
            </p>
            <Button
              type="button"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-alapon-blue hover:bg-alapon-blue-hover text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Video
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {videos.map((video) => (
              <VideoCard
                key={video.id.toString()}
                video={video}
                onClick={() => handleVideoClick(video)}
              />
            ))}
          </div>
        )}
        <div className="h-4" />
      </main>

      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          adCampaign={preRollAd}
          onClose={() => setSelectedVideo(null)}
        />
      )}
      {showAddModal && <AddVideoModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
