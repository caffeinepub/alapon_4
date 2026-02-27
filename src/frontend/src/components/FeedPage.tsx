import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Heart, MessageCircle, Plus, Search, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Campaign, Post } from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  useCreatePost,
  useGetPosts,
  useLikePost,
  useListCampaigns,
  useRecordClick,
  useRecordImpression,
} from "../hooks/useQueries";
import { formatNumber, formatRelativeTime, getInitials } from "../utils/format";

// ─── Story data ───────────────────────────────────────────────────────────
const STORIES = [
  {
    id: 1,
    name: "Your Story",
    initials: "YO",
    gradient: "from-alapon-blue to-cyan-400",
    hasStory: false,
    isYou: true,
  },
  {
    id: 2,
    name: "Alex K.",
    initials: "AK",
    gradient: "from-pink-500 to-red-400",
    hasStory: true,
    isYou: false,
  },
  {
    id: 3,
    name: "Maria J.",
    initials: "MJ",
    gradient: "from-purple-500 to-indigo-400",
    hasStory: true,
    isYou: false,
  },
  {
    id: 4,
    name: "Tom R.",
    initials: "TR",
    gradient: "from-green-400 to-teal-500",
    hasStory: true,
    isYou: false,
  },
  {
    id: 5,
    name: "Zara B.",
    initials: "ZB",
    gradient: "from-yellow-400 to-orange-400",
    hasStory: true,
    isYou: false,
  },
  {
    id: 6,
    name: "Chris D.",
    initials: "CD",
    gradient: "from-indigo-500 to-blue-400",
    hasStory: true,
    isYou: false,
  },
  {
    id: 7,
    name: "Nina S.",
    initials: "NS",
    gradient: "from-rose-500 to-pink-400",
    hasStory: true,
    isYou: false,
  },
];

// ─── Sample posts shown before backend loads ──────────────────────────────
const SAMPLE_POSTS: Omit<
  Post,
  "id" | "authorId" | "createdAt" | "likes" | "commentCount"
>[] = [
  {
    content:
      "🎉 Welcome to Alapon! Connect with friends, share moments, and discover amazing content.",
    imageUrl: "https://picsum.photos/seed/welcome/400/300",
    isSponsored: false,
    sponsoredLabel: "",
  },
  {
    content:
      "Beautiful sunrise this morning 🌅 Nature has a way of reminding us what truly matters. #MorningVibes #Nature",
    imageUrl: "https://picsum.photos/seed/sunrise/400/300",
    isSponsored: false,
    sponsoredLabel: "",
  },
  {
    content:
      "Just finished this amazing book on productivity. The key insight: focus on systems, not goals. Highly recommend! 📚",
    imageUrl: "",
    isSponsored: false,
    sponsoredLabel: "",
  },
  {
    content:
      "Team lunch was absolutely incredible today 🍜 Nothing beats good food and great company!",
    imageUrl: "https://picsum.photos/seed/lunch/400/300",
    isSponsored: false,
    sponsoredLabel: "",
  },
  {
    content:
      "Building the future of decentralized social media. The ICP ecosystem is growing fast! 💻 #Web3 #ICP",
    imageUrl: "https://picsum.photos/seed/tech/400/300",
    isSponsored: false,
    sponsoredLabel: "",
  },
];

const SAMPLE_AUTHORS = [
  "Alapon Team",
  "Sarah Johnson",
  "Marcus Wei",
  "Elena Petrov",
  "Dev Community",
];

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-red-500",
  "bg-indigo-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── PostCard ─────────────────────────────────────────────────────────────
interface PostCardProps {
  post: Post;
  authorName: string;
  onLike: (id: bigint) => void;
  userPrincipal?: string;
}

function PostCard({ post, authorName, onLike, userPrincipal }: PostCardProps) {
  const [localLiked, setLocalLiked] = useState(false);
  const [animating, setAnimating] = useState(false);
  const avatarColor = getAvatarColor(authorName);
  const likeCount = BigInt(post.likes.length) + (localLiked ? 1n : 0n);

  const handleLike = () => {
    if (localLiked) return;
    setAnimating(true);
    setLocalLiked(true);
    onLike(post.id);
    setTimeout(() => setAnimating(false), 400);
  };

  const isLiked =
    localLiked ||
    (userPrincipal
      ? post.likes.some((p) => p.toString() === userPrincipal)
      : false);

  return (
    <article className="bg-card rounded-lg shadow-card feed-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2.5">
        <div
          className={`w-[38px] h-[38px] rounded-full ${avatarColor} flex items-center justify-center text-white font-display font-bold text-[13px] shrink-0 shadow-xs`}
        >
          {getInitials(authorName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-[15px] text-foreground leading-snug">
            {authorName}
          </p>
          <p className="text-[12px] text-muted-foreground mt-[1px]">
            {formatRelativeTime(post.createdAt)}
          </p>
        </div>
        {post.isSponsored && <span className="sponsored-badge">Sponsored</span>}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-[15px] text-foreground leading-[1.55]">
          {post.content}
        </p>
        {post.sponsoredLabel && (
          <p className="text-[12px] text-muted-foreground mt-1 italic">
            {post.sponsoredLabel}
          </p>
        )}
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="w-full aspect-video bg-muted overflow-hidden">
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).parentElement!.style.display =
                "none";
            }}
          />
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center justify-between px-4 py-[7px]">
        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center justify-center bg-red-500 text-white rounded-full w-[18px] h-[18px]">
            <Heart className="w-2.5 h-2.5 fill-white" />
          </span>
          <span className="font-medium">{formatNumber(likeCount)}</span>
        </div>
        <div className="text-[13px] text-muted-foreground">
          {formatNumber(post.commentCount)} comments
        </div>
      </div>

      {/* Action bar */}
      <div className="flex border-t border-border/60 divide-x divide-border/60">
        <button
          type="button"
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-[7px] py-[11px] text-[13px] font-semibold transition-colors hover:bg-muted/60 active:bg-muted ${
            isLiked ? "text-red-500" : "text-muted-foreground"
          }`}
        >
          <Heart
            className={`w-[18px] h-[18px] ${animating ? "animate-like-pulse" : ""} ${isLiked ? "fill-current" : ""}`}
          />
          Like
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-[7px] py-[11px] text-[13px] font-semibold text-muted-foreground hover:bg-muted/60 active:bg-muted transition-colors"
        >
          <MessageCircle className="w-[18px] h-[18px]" />
          Comment
        </button>
        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: "Check this post on Alapon!",
                text: post.content,
              });
            } else {
              toast.success("Link copied!");
            }
          }}
          className="flex-1 flex items-center justify-center gap-[7px] py-[11px] text-[13px] font-semibold text-muted-foreground hover:bg-muted/60 active:bg-muted transition-colors"
        >
          <Share2 className="w-[18px] h-[18px]" />
          Share
        </button>
      </div>
    </article>
  );
}

// ─── AdCard ───────────────────────────────────────────────────────────────
function AdCard({
  campaign,
  onImpression,
  onClick,
}: {
  campaign: Campaign;
  onImpression: (id: bigint) => void;
  onClick: (id: bigint) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onImpression(campaign.id);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [campaign.id, onImpression]);

  const handleClick = () => {
    onClick(campaign.id);
    if (campaign.targetUrl) {
      window.open(campaign.targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article
      ref={cardRef}
      className="bg-card rounded-lg shadow-card feed-card overflow-hidden"
    >
      <div className="h-[3px] w-full bg-alapon-blue" />
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <p className="font-display font-bold text-[15px] text-foreground">
          {campaign.name}
        </p>
        <span className="sponsored-badge">Sponsored</span>
      </div>

      {campaign.imageUrl && (
        <div className="mx-4 mb-3 rounded-lg overflow-hidden aspect-video bg-muted">
          <img
            src={campaign.imageUrl}
            alt={campaign.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.parentElement!.style.background =
                "linear-gradient(135deg, #1877F2, #0099FF)";
              el.style.display = "none";
            }}
          />
        </div>
      )}

      <div className="px-4 pb-4">
        <Button
          type="button"
          onClick={handleClick}
          className="w-full bg-alapon-blue hover:bg-alapon-blue-hover text-white font-bold text-[14px] h-[40px]"
        >
          Learn More →
        </Button>
      </div>
    </article>
  );
}

// ─── CreatePostCard ───────────────────────────────────────────────────────
function CreatePostCard({ authorName }: { authorName: string }) {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const createPost = useCreatePost();
  const avatarColor = getAvatarColor(authorName || "User");

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      await createPost.mutateAsync({
        content: content.trim(),
        imageUrl: imageUrl.trim(),
        isSponsored: false,
      });
      setContent("");
      setImageUrl("");
      setIsExpanded(false);
      toast.success("Post shared!");
    } catch {
      toast.error("Failed to create post");
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-card p-3">
      <div className="flex gap-3 items-center">
        <div
          className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}
        >
          {getInitials(authorName || "User")}
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="flex-1 bg-muted rounded-full px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          What's on your mind?
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[80px] leading-relaxed"
          />
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (optional)"
            className="w-full bg-muted rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsExpanded(false);
                setContent("");
                setImageUrl("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={!content.trim() || createPost.isPending}
              className="bg-alapon-blue hover:bg-alapon-blue-hover text-white"
            >
              {createPost.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────
function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card rounded-lg shadow-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          {i !== 3 && <Skeleton className="h-40 w-full rounded-md" />}
        </div>
      ))}
    </div>
  );
}

// ─── FeedPage ─────────────────────────────────────────────────────────────
export default function FeedPage() {
  const { data: posts, isLoading, error, refetch } = useGetPosts();
  const { data: campaigns } = useListCampaigns();
  const likePost = useLikePost();
  const createPost = useCreatePost();
  const recordImpression = useRecordImpression();
  const recordClick = useRecordClick();
  const { actor } = useActor();

  const createPostMutateAsync = createPost.mutateAsync;

  // Seed posts on first load if backend is empty
  useEffect(() => {
    if (!posts || posts.length > 0 || !actor) return;
    const seed = async () => {
      for (let i = 0; i < SAMPLE_POSTS.length; i++) {
        try {
          await createPostMutateAsync({
            content: SAMPLE_POSTS[i].content,
            imageUrl: SAMPLE_POSTS[i].imageUrl,
            isSponsored: false,
          });
        } catch {
          break;
        }
      }
    };
    seed();
  }, [posts, actor, createPostMutateAsync]);

  // Interleave ads every 4th item
  const activeCampaigns = campaigns?.filter((c) => c.status === "active") ?? [];
  const feedItems: Array<
    | { type: "post"; post: Post; author: string }
    | { type: "ad"; campaign: Campaign }
  > = [];
  if (posts && posts.length > 0) {
    posts.forEach((post, idx) => {
      feedItems.push({
        type: "post",
        post,
        author: SAMPLE_AUTHORS[Number(post.id) % SAMPLE_AUTHORS.length],
      });
      if ((idx + 1) % 4 === 0 && activeCampaigns.length > 0) {
        const adIdx = Math.floor(idx / 4) % activeCampaigns.length;
        feedItems.push({ type: "ad", campaign: activeCampaigns[adIdx] });
      }
    });
  }

  const handleLike = async (postId: bigint) => {
    try {
      await likePost.mutateAsync(postId);
    } catch {
      toast.error("Failed to like post");
    }
  };

  return (
    <div className="tab-content-enter flex flex-col h-full">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-card shadow-header flex items-center justify-between px-4 py-3">
        <h1 className="font-display font-extrabold text-[26px] text-alapon-blue tracking-[-0.02em] leading-none">
          Alapon
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 active:bg-muted/90 transition-colors"
          >
            <Search className="w-[17px] h-[17px] text-foreground" />
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 active:bg-muted/90 transition-colors relative"
          >
            <Bell className="w-[17px] h-[17px] text-foreground" />
            <span className="absolute top-0.5 right-0.5 w-[15px] h-[15px] bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center leading-none">
              3
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Stories */}
        <div className="bg-card border-b border-border/50 px-4 py-3">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {STORIES.map((story, idx) => (
              <div
                key={story.id}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <div
                  className={`${story.hasStory ? (idx % 2 === 0 ? "story-ring" : "story-ring-blue") : "p-[2.5px]"} rounded-full`}
                >
                  <div
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${story.gradient} flex items-center justify-center border-2 border-card relative`}
                  >
                    {story.isYou && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-alapon-blue rounded-full flex items-center justify-center border-2 border-card">
                        <Plus className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <span className="text-white font-bold text-sm">
                      {story.initials}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-foreground font-medium text-center w-16 truncate">
                  {story.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 space-y-3">
          {/* Create Post */}
          <CreatePostCard authorName="You" />

          {/* Feed */}
          {isLoading ? (
            <FeedSkeleton />
          ) : error ? (
            <div className="bg-card rounded-lg shadow-card p-6 text-center">
              <p className="text-muted-foreground text-sm">
                Failed to load feed
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : feedItems.length === 0 ? (
            <div className="bg-card rounded-lg shadow-card p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-display font-semibold text-foreground">
                No posts yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to share something!
              </p>
            </div>
          ) : (
            feedItems.map((item, idx) =>
              item.type === "post" ? (
                <PostCard
                  key={`post-${item.post.id}-${idx}`}
                  post={item.post}
                  authorName={item.author}
                  onLike={handleLike}
                />
              ) : (
                <AdCard
                  key={`ad-${item.campaign.id}-${idx}`}
                  campaign={item.campaign}
                  onImpression={(id) => recordImpression.mutate(id)}
                  onClick={(id) => recordClick.mutate(id)}
                />
              ),
            )
          )}

          <div className="h-4" />
        </div>
      </main>
    </div>
  );
}
