import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Storage "blob-storage/Storage";

module {
  // Old types for migration
  type OldUserProfile = {
    name : Text;
  };

  type OldPost = {
    id : Nat;
    author : Text;
    content : Text;
    imageUrl : Text;
    timestamp : Int;
    likes : Nat;
    commentCount : Nat;
    isSponsored : Bool;
  };

  type OldCampaign = {
    id : Nat;
    title : Text;
    description : Text;
    imageUrl : Text;
    targetUrl : Text;
    budgetCents : Nat;
    status : Text;
  };

  type OldVideo = {
    id : Nat;
    author : Text;
    title : Text;
    videoUrl : Text;
    thumbnailUrl : Text;
    timestamp : Int;
    likes : Nat;
  };

  type OldCampaignStats = {
    impressions : Nat;
    clicks : Nat;
    revenueCents : Nat;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    posts : Map.Map<Nat, OldPost>;
    campaigns : Map.Map<Nat, OldCampaign>;
    videos : Map.Map<Nat, OldVideo>;
    campaignStats : Map.Map<Nat, OldCampaignStats>;
    nextPostId : Nat;
    nextCampaignId : Nat;
    nextVideoId : Nat;
  };

  // New types
  type NewUserProfile = {
    id : Principal;
    username : Text;
    displayName : Text;
    avatar : Storage.ExternalBlob;
    bio : Text;
    isAdmin : Bool;
    createdAt : Int;
  };

  type NewPost = {
    id : Nat;
    authorId : Principal;
    content : Text;
    imageUrl : Text;
    likes : [Principal];
    commentCount : Nat;
    isSponsored : Bool;
    sponsoredLabel : Text;
    createdAt : Int;
  };

  type NewVideo = {
    id : Nat;
    authorId : Principal;
    title : Text;
    thumbnailUrl : Text;
    videoUrl : Text;
    likes : [Principal];
    views : Nat;
    isSponsored : Bool;
    createdAt : Int;
  };

  type NewCampaign = {
    id : Nat;
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

  type NewProduct = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    imageUrl : Text;
    category : Text;
    stock : Nat;
    createdAt : Int;
  };

  type NewCartItem = {
    productId : Nat;
    quantity : Nat;
  };

  type NewOrderItem = {
    productId : Nat;
    quantity : Nat;
    price : Nat;
  };

  type NewOrder = {
    id : Nat;
    userId : Principal;
    items : [NewOrderItem];
    totalAmount : Nat;
    status : Text;
    createdAt : Int;
  };

  type NewActor = {
    users : Map.Map<Principal, NewUserProfile>;
    posts : Map.Map<Nat, NewPost>;
    videos : Map.Map<Nat, NewVideo>;
    campaigns : Map.Map<Nat, NewCampaign>;
    products : Map.Map<Nat, NewProduct>;
    orders : Map.Map<Nat, NewOrder>;
    carts : Map.Map<Principal, [NewCartItem]>;
    nextPostId : Nat;
    nextCampaignId : Nat;
    nextVideoId : Nat;
    nextProductId : Nat;
    nextOrderId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      users = Map.empty<Principal, NewUserProfile>();
      posts = Map.empty<Nat, NewPost>();
      videos = Map.empty<Nat, NewVideo>();
      campaigns = Map.empty<Nat, NewCampaign>();
      products = Map.empty<Nat, NewProduct>();
      orders = Map.empty<Nat, NewOrder>();
      carts = Map.empty<Principal, [NewCartItem]>();
      nextPostId = old.nextPostId;
      nextCampaignId = old.nextCampaignId;
      nextVideoId = old.nextVideoId;
      nextProductId = 1;
      nextOrderId = 1;
    };
  };
};
