import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type {
  Campaign,
  CartItem,
  Order,
  Post,
  Product,
  RevenueStats,
  UserProfile,
  Video,
} from "../backend.d";
import { useActor } from "./useActor";

// ─────────────────────────────── POSTS ───────────────────────────────

export function useGetPosts(offset = 0n, limit = 20n) {
  const { actor, isFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ["posts", offset.toString(), limit.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPosts(offset, limit);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      content,
      imageUrl,
      isSponsored,
    }: {
      content: string;
      imageUrl: string;
      isSponsored: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createPost(content, imageUrl, isSponsored);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      comment,
    }: { postId: bigint; comment: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.addComment(postId, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// ─────────────────────────────── VIDEOS ───────────────────────────────

export function useGetVideos(offset = 0n, limit = 20n) {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos", offset.toString(), limit.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVideos(offset, limit);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      thumbnailUrl,
      videoUrl,
      isSponsored,
    }: {
      title: string;
      thumbnailUrl: string;
      videoUrl: string;
      isSponsored: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createVideo(title, thumbnailUrl, videoUrl, isSponsored);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useLikeVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (videoId: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.likeVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useIncrementViewCount() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (videoId: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.incrementViewCount(videoId);
    },
  });
}

// ─────────────────────────────── CAMPAIGNS ───────────────────────────────

export function useListCampaigns() {
  const { actor, isFetching } = useActor();
  return useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCampaigns();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCampaign() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      budget,
      imageUrl,
      targetUrl,
    }: {
      name: string;
      budget: bigint;
      imageUrl: string;
      targetUrl: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createCampaign(name, budget, imageUrl, targetUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["revenueStats"] });
    },
  });
}

export function useUpdateCampaignStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      status,
    }: { campaignId: bigint; status: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.updateCampaignStatus(campaignId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useRecordImpression() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (campaignId: bigint) => {
      if (!actor) return;
      await actor.recordImpression(campaignId);
    },
  });
}

export function useRecordClick() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (campaignId: bigint) => {
      if (!actor) return;
      await actor.recordClick(campaignId);
    },
  });
}

export function useGetRevenueStats() {
  const { actor, isFetching } = useActor();
  return useQuery<RevenueStats>({
    queryKey: ["revenueStats"],
    queryFn: async () => {
      if (!actor)
        return {
          CTR: 0,
          totalImpressions: 0n,
          totalRevenue: 0n,
          totalClicks: 0n,
        };
      return actor.getRevenueStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─────────────────────────────── SHOP ───────────────────────────────

export function useGetProducts(offset = 0n, limit = 50n) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products", offset.toString(), limit.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts(offset, limit);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
      price,
      imageUrl,
      category,
      stock,
    }: {
      name: string;
      description: string;
      price: bigint;
      imageUrl: string;
      category: string;
      stock: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createProduct(
        name,
        description,
        price,
        imageUrl,
        category,
        stock,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useGetCart() {
  const { actor, isFetching } = useActor();
  return useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error("No actor");
      await actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.removeFromCart(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.placeOrder();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useGetOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─────────────────────────────── USERS ───────────────────────────────

export function useGetCurrentUser() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCurrentUser();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      displayName,
      bio,
    }: {
      username: string;
      displayName: string;
      bio: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const avatar = ExternalBlob.fromURL(
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      );
      return actor.registerUser(username, displayName, avatar, bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useMakeAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: import("@icp-sdk/core/principal").Principal) => {
      if (!actor) throw new Error("No actor");
      await actor.makeAdmin(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}
