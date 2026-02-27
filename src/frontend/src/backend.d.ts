import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Video {
    id: VideoId;
    title: string;
    thumbnailUrl: string;
    isSponsored: boolean;
    views: bigint;
    authorId: Principal;
    createdAt: bigint;
    likes: Array<Principal>;
    videoUrl: string;
}
export interface UserProfile {
    id: Principal;
    bio: string;
    username: string;
    displayName: string;
    createdAt: bigint;
    isAdmin: boolean;
    avatar: ExternalBlob;
}
export interface OrderItem {
    productId: ProductId;
    quantity: bigint;
    price: bigint;
}
export type PostId = bigint;
export interface RevenueStats {
    CTR: number;
    totalImpressions: bigint;
    totalRevenue: bigint;
    totalClicks: bigint;
}
export interface Order {
    id: OrderId;
    status: string;
    userId: Principal;
    createdAt: bigint;
    totalAmount: bigint;
    items: Array<OrderItem>;
}
export type CampaignId = bigint;
export interface Post {
    id: PostId;
    content: string;
    isSponsored: boolean;
    authorId: Principal;
    createdAt: bigint;
    likes: Array<Principal>;
    imageUrl: string;
    sponsoredLabel: string;
    commentCount: bigint;
}
export interface Campaign {
    id: CampaignId;
    status: string;
    clicks: bigint;
    name: string;
    createdAt: bigint;
    impressions: bigint;
    targetUrl: string;
    spent: bigint;
    imageUrl: string;
    budget: bigint;
}
export type VideoId = bigint;
export type ProductId = bigint;
export interface CartItem {
    productId: ProductId;
    quantity: bigint;
}
export interface Product {
    id: ProductId;
    name: string;
    createdAt: bigint;
    description: string;
    stock: bigint;
    imageUrl: string;
    category: string;
    price: bigint;
}
export type OrderId = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: PostId, _comment: string): Promise<void>;
    addToCart(productId: ProductId, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    createCampaign(name: string, budget: bigint, imageUrl: string, targetUrl: string): Promise<Campaign>;
    createPost(content: string, imageUrl: string, isSponsored: boolean): Promise<Post>;
    createProduct(name: string, description: string, price: bigint, imageUrl: string, category: string, stock: bigint): Promise<Product>;
    createVideo(title: string, thumbnailUrl: string, videoUrl: string, isSponsored: boolean): Promise<Video>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getCurrentUser(): Promise<UserProfile | null>;
    getOrderById(orderId: OrderId): Promise<Order>;
    getOrders(): Promise<Array<Order>>;
    getPosts(offset: bigint, limit: bigint): Promise<Array<Post>>;
    getProductById(productId: ProductId): Promise<Product>;
    getProducts(offset: bigint, limit: bigint): Promise<Array<Product>>;
    getRevenueStats(): Promise<RevenueStats>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideos(offset: bigint, limit: bigint): Promise<Array<Video>>;
    incrementViewCount(videoId: VideoId): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: PostId): Promise<void>;
    likeVideo(videoId: VideoId): Promise<void>;
    listCampaigns(): Promise<Array<Campaign>>;
    makeAdmin(userId: Principal): Promise<void>;
    placeOrder(): Promise<Order>;
    recordClick(campaignId: CampaignId): Promise<void>;
    recordImpression(campaignId: CampaignId): Promise<void>;
    registerUser(username: string, displayName: string, avatar: ExternalBlob, bio: string): Promise<UserProfile>;
    removeFromCart(productId: ProductId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCampaignStatus(campaignId: CampaignId, status: string): Promise<void>;
    updateOrderStatus(orderId: OrderId, status: string): Promise<void>;
}
