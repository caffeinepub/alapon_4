import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

(with migration = Migration.run)
actor {
  // Authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile type and storage
  public type UserProfile = {
    id : Principal;
    username : Text;
    displayName : Text;
    avatar : Storage.ExternalBlob;
    bio : Text;
    isAdmin : Bool;
    createdAt : Int;
  };

  let users = Map.empty<Principal, UserProfile>();

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  public shared ({ caller }) func registerUser(username : Text, displayName : Text, avatar : Storage.ExternalBlob, bio : Text) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register");
    };

    let user : UserProfile = {
      id = caller;
      username;
      displayName;
      avatar;
      bio;
      isAdmin = false;
      createdAt = Time.now();
    };
    users.add(caller, user);
    user;
  };

  public query ({ caller }) func getCurrentUser() : async ?UserProfile {
    users.get(caller);
  };

  public shared ({ caller }) func makeAdmin(userId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can make other admins");
    };

    switch (users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        let updatedUser = { user with isAdmin = true };
        users.add(userId, updatedUser);
      };
    };
  };

  type PostId = Nat;
  type CampaignId = Nat;
  type VideoId = Nat;
  type ProductId = Nat;
  type OrderId = Nat;

  type Post = {
    id : PostId;
    authorId : Principal;
    content : Text;
    imageUrl : Text;
    likes : [Principal];
    commentCount : Nat;
    isSponsored : Bool;
    sponsoredLabel : Text;
    createdAt : Int;
  };

  type Video = {
    id : VideoId;
    authorId : Principal;
    title : Text;
    thumbnailUrl : Text;
    videoUrl : Text;
    likes : [Principal];
    views : Nat;
    isSponsored : Bool;
    createdAt : Int;
  };

  type Campaign = {
    id : CampaignId;
    name : Text;
    budget : Nat;
    spent : Nat;
    imageUrl : Text;
    targetUrl : Text;
    status : Text;
    impressions : Nat;
    clicks : Nat;
    createdAt : Int;
  };

  type Product = {
    id : ProductId;
    name : Text;
    description : Text;
    price : Nat;
    imageUrl : Text;
    category : Text;
    stock : Nat;
    createdAt : Int;
  };

  type CartItem = {
    productId : ProductId;
    quantity : Nat;
  };

  type OrderItem = {
    productId : ProductId;
    quantity : Nat;
    price : Nat;
  };

  type Order = {
    id : OrderId;
    userId : Principal;
    items : [OrderItem];
    totalAmount : Nat;
    status : Text;
    createdAt : Int;
  };

  type RevenueStats = {
    totalImpressions : Nat;
    totalClicks : Nat;
    totalRevenue : Nat;
    CTR : Float;
  };

  var nextPostId : PostId = 1;
  var nextCampaignId : CampaignId = 1;
  var nextVideoId : VideoId = 1;
  var nextProductId : ProductId = 1;
  var nextOrderId : OrderId = 1;

  let posts = Map.empty<PostId, Post>();
  let videos = Map.empty<VideoId, Video>();
  let campaigns = Map.empty<CampaignId, Campaign>();
  let products = Map.empty<ProductId, Product>();
  let orders = Map.empty<OrderId, Order>();
  let carts = Map.empty<Principal, [CartItem]>();

  // Post functions
  public shared ({ caller }) func createPost(content : Text, imageUrl : Text, isSponsored : Bool) : async Post {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let post : Post = {
      id = nextPostId;
      authorId = caller;
      content;
      imageUrl;
      likes = [];
      commentCount = 0;
      isSponsored;
      sponsoredLabel = "Sponsored";
      createdAt = Time.now();
    };
    posts.add(nextPostId, post);
    nextPostId += 1;
    post;
  };

  public shared ({ caller }) func likePost(postId : PostId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let alreadyLiked = post.likes.any(func(id) { id == caller });
        let updatedLikes = if (alreadyLiked) {
          post.likes.filter(func(id) { id != caller });
        } else {
          post.likes.concat([caller]);
        };
        let updatedPost = { post with likes = updatedLikes };
        posts.add(postId, updatedPost);
      };
    };
  };

  public query ({ caller }) func getPosts(offset : Nat, limit : Nat) : async [Post] {
    if (limit == 0) { return [] };

    let postsArray = posts.values().toArray();
    if (postsArray.isEmpty()) { return [] };

    let start = offset;
    let end = offset + limit;
    if (start >= postsArray.size()) { return [] };
    let actualEnd = if (end > postsArray.size()) { postsArray.size() } else { end };
    if (actualEnd <= start) { return [] };
    postsArray.sliceToArray(start, actualEnd);
  };

  public shared ({ caller }) func addComment(postId : PostId, _comment : Text) : async () {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let updatedPost = { post with commentCount = post.commentCount + 1 };
        posts.add(postId, updatedPost);
      };
    };
  };

  // Video functions
  public shared ({ caller }) func createVideo(title : Text, thumbnailUrl : Text, videoUrl : Text, isSponsored : Bool) : async Video {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create videos");
    };

    let video : Video = {
      id = nextVideoId;
      authorId = caller;
      title;
      thumbnailUrl;
      videoUrl;
      likes = [];
      views = 0;
      isSponsored;
      createdAt = Time.now();
    };
    videos.add(nextVideoId, video);
    nextVideoId += 1;
    video;
  };

  public shared ({ caller }) func likeVideo(videoId : VideoId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like videos");
    };

    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        let alreadyLiked = video.likes.any(func(id) { id == caller });
        let updatedLikes = if (alreadyLiked) {
          video.likes.filter(func(id) { id != caller });
        } else {
          video.likes.concat([caller]);
        };
        let updatedVideo = { video with likes = updatedLikes };
        videos.add(videoId, updatedVideo);
      };
    };
  };

  public shared func incrementViewCount(videoId : VideoId) : async () {
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        let updatedVideo = { video with views = video.views + 1 };
        videos.add(videoId, updatedVideo);
      };
    };
  };

  public query ({ caller }) func getVideos(offset : Nat, limit : Nat) : async [Video] {
    if (limit == 0) { return [] };

    let videosArray = videos.values().toArray();
    if (videosArray.isEmpty()) { return [] };

    let start = offset;
    let end = offset + limit;
    if (start >= videosArray.size()) { return [] };
    let actualEnd = if (end > videosArray.size()) { videosArray.size() } else { end };
    if (actualEnd <= start) { return [] };
    videosArray.sliceToArray(start, actualEnd);
  };

  // Campaign functions
  public shared ({ caller }) func createCampaign(name : Text, budget : Nat, imageUrl : Text, targetUrl : Text) : async Campaign {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can create campaigns");
    };

    let campaign : Campaign = {
      id = nextCampaignId;
      name;
      budget;
      spent = 0;
      imageUrl;
      targetUrl;
      status = "active";
      impressions = 0;
      clicks = 0;
      createdAt = Time.now();
    };
    campaigns.add(nextCampaignId, campaign);
    nextCampaignId += 1;
    campaign;
  };

  public query ({ caller }) func listCampaigns() : async [Campaign] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view campaigns");
    };
    campaigns.values().toArray();
  };

  public shared ({ caller }) func updateCampaignStatus(campaignId : CampaignId, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update campaign status");
    };

    switch (campaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?campaign) {
        let updatedCampaign = { campaign with status };
        campaigns.add(campaignId, updatedCampaign);
      };
    };
  };

  public shared func recordImpression(campaignId : CampaignId) : async () {
    switch (campaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?campaign) {
        let updatedCampaign = { campaign with impressions = campaign.impressions + 1 };
        campaigns.add(campaignId, updatedCampaign);
      };
    };
  };

  public shared func recordClick(campaignId : CampaignId) : async () {
    switch (campaigns.get(campaignId)) {
      case (null) { Runtime.trap("Campaign not found") };
      case (?campaign) {
        let updatedCampaign = { campaign with clicks = campaign.clicks + 1 };
        campaigns.add(campaignId, updatedCampaign);
      };
    };
  };

  public query ({ caller }) func getRevenueStats() : async RevenueStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view metrics");
    };

    var totalImpressions = 0;
    var totalClicks = 0;
    var totalRevenue = 0;

    for ((_, campaign) in campaigns.entries()) {
      totalImpressions += campaign.impressions;
      totalClicks += campaign.clicks;
      totalRevenue += campaign.spent;
    };

    let CTR = if (totalImpressions == 0) { 0.0 } else {
      totalClicks.toFloat() / totalImpressions.toFloat();
    };

    {
      totalImpressions;
      totalClicks;
      totalRevenue;
      CTR;
    };
  };

  // Product functions
  public shared ({ caller }) func createProduct(name : Text, description : Text, price : Nat, imageUrl : Text, category : Text, stock : Nat) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can create products");
    };

    let product : Product = {
      id = nextProductId;
      name;
      description;
      price;
      imageUrl;
      category;
      stock;
      createdAt = Time.now();
    };
    products.add(nextProductId, product);
    nextProductId += 1;
    product;
  };

  public query ({ caller }) func getProducts(offset : Nat, limit : Nat) : async [Product] {
    if (limit == 0) { return [] };

    let productsArray = products.values().toArray();
    if (productsArray.isEmpty()) { return [] };

    let start = offset;
    let end = offset + limit;
    if (start >= productsArray.size()) { return [] };
    let actualEnd = if (end > productsArray.size()) { productsArray.size() } else { end };
    if (actualEnd <= start) { return [] };
    productsArray.sliceToArray(start, actualEnd);
  };

  public query ({ caller }) func getProductById(productId : ProductId) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  // Cart functions
  public shared ({ caller }) func addToCart(productId : ProductId, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {};
    };

    let cart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };

    let newItem = { productId; quantity };
    let updatedCart = cart.concat([newItem]);
    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func removeFromCart(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };

    let updatedCart = cart.filter(func(item) { item.productId != productId });
    carts.add(caller, updatedCart);
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    carts.remove(caller);
  };

  // Order functions
  public shared ({ caller }) func placeOrder() : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?items) { items };
    };

    if (cart.size() == 0) {
      Runtime.trap("Cart is empty");
    };

    let orderItems = cart.map(func(item) { { productId = item.productId; quantity = item.quantity; price = 100 } });
    let totalAmount = cart.foldLeft(0, func(acc, item) { acc + (item.quantity * 100) });

    let order : Order = {
      id = nextOrderId;
      userId = caller;
      items = orderItems;
      totalAmount;
      status = "pending";
      createdAt = Time.now();
    };
    orders.add(nextOrderId, order);
    nextOrderId += 1;

    carts.remove(caller);

    order;
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    let result = orders.values().filter(func(order) { order.userId == caller });
    result.toArray();
  };

  public query ({ caller }) func getOrderById(orderId : OrderId) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch orders");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only access your own orders");
        };
        order;
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = { order with status };
        orders.add(orderId, updatedOrder);
      };
    };
  };
};
