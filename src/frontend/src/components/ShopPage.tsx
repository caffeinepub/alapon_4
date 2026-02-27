import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  ChevronRight,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CartItem, Product } from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  useAddToCart,
  useClearCart,
  useCreateProduct,
  useGetCart,
  useGetProducts,
  usePlaceOrder,
  useRemoveFromCart,
} from "../hooks/useQueries";

// ─── Sample products ──────────────────────────────────────────────────────
const SAMPLE_PRODUCTS = [
  {
    name: "Classic Denim Jacket",
    description:
      "Premium quality denim jacket with a timeless design. Perfect for casual and semi-formal occasions.",
    price: 8999n,
    imageUrl: "https://picsum.photos/seed/denim/400/400",
    category: "Clothing",
    stock: 15n,
  },
  {
    name: "Wireless Earbuds Pro",
    description:
      "30-hour battery life, active noise cancellation, and crystal-clear audio. Your music, your way.",
    price: 12999n,
    imageUrl: "https://picsum.photos/seed/earbuds/400/400",
    category: "Electronics",
    stock: 8n,
  },
  {
    name: "Handcrafted Leather Wallet",
    description:
      "Genuine full-grain leather wallet with RFID blocking. Slim profile, 8-card slots.",
    price: 4599n,
    imageUrl: "https://picsum.photos/seed/wallet/400/400",
    category: "Accessories",
    stock: 20n,
  },
  {
    name: "Organic Coffee Blend",
    description:
      "Single-origin arabica beans, medium roast. Rich notes of chocolate and citrus. 500g.",
    price: 2499n,
    imageUrl: "https://picsum.photos/seed/coffee/400/400",
    category: "Food",
    stock: 50n,
  },
  {
    name: "Smart Fitness Watch",
    description:
      "Track steps, heart rate, sleep, and workouts. 7-day battery, water resistant to 5ATM.",
    price: 19999n,
    imageUrl: "https://picsum.photos/seed/watch/400/400",
    category: "Electronics",
    stock: 5n,
  },
  {
    name: "Linen Summer Dress",
    description:
      "Breathable linen blend, A-line cut. Available in sizes XS-XXL. Machine washable.",
    price: 5999n,
    imageUrl: "https://picsum.photos/seed/dress/400/400",
    category: "Clothing",
    stock: 12n,
  },
  {
    name: "Artisan Scented Candle Set",
    description:
      "Set of 3 hand-poured soy wax candles. Scents: Cedarwood, Lavender, Vanilla. 40hr burn each.",
    price: 3299n,
    imageUrl: "https://picsum.photos/seed/candles/400/400",
    category: "Accessories",
    stock: 25n,
  },
  {
    name: "Protein Granola Mix",
    description:
      "High-protein oat clusters with almonds, dark chocolate chips. 400g. Gluten-free.",
    price: 1899n,
    imageUrl: "https://picsum.photos/seed/granola/400/400",
    category: "Food",
    stock: 40n,
  },
];

const CATEGORIES = [
  "All",
  "Clothing",
  "Electronics",
  "Food",
  "Accessories",
  "Other",
];

function formatPrice(price: bigint): string {
  const dollars = Number(price) / 100;
  return `$${dollars.toFixed(2)}`;
}

// ─── Product Card ──────────────────────────────────────────────────────────
function ProductCard({
  product,
  onTap,
}: { product: Product; onTap: () => void }) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="product-card bg-card rounded-xl shadow-card overflow-hidden text-left w-full"
    >
      <div className="aspect-square bg-muted overflow-hidden">
        <img
          src={
            product.imageUrl ||
            `https://picsum.photos/seed/${product.name}/400/400`
          }
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://picsum.photos/seed/${product.id}/400/400`;
          }}
        />
      </div>
      <div className="p-3">
        <p className="font-display font-semibold text-[13px] text-foreground line-clamp-2 leading-tight mb-1.5">
          {product.name}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-[14px] text-alapon-blue">
            {formatPrice(product.price)}
          </span>
          {product.stock <= 5n && product.stock > 0n && (
            <span className="text-[10px] text-orange-500 font-semibold">
              {product.stock.toString()} left
            </span>
          )}
          {product.stock === 0n && (
            <span className="text-[10px] text-red-500 font-semibold">
              Sold out
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Product Detail Modal ──────────────────────────────────────────────────
function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  isAdding,
}: {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isAdding: boolean;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden rounded-xl">
        <div className="aspect-square bg-muted overflow-hidden">
          <img
            src={
              product.imageUrl ||
              `https://picsum.photos/seed/${product.name}/400/400`
            }
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-5 space-y-4">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl text-foreground leading-tight">
              {product.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between">
            <span className="font-display font-extrabold text-2xl text-alapon-blue">
              {formatPrice(product.price)}
            </span>
            <Badge
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              <Tag className="w-3 h-3" />
              {product.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>In stock:</span>
            <span
              className={`font-semibold ${product.stock === 0n ? "text-red-500" : product.stock <= 5n ? "text-orange-500" : "text-alapon-green"}`}
            >
              {product.stock.toString()} units
            </span>
          </div>
          <Button
            type="button"
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0n || isAdding}
            className="w-full bg-alapon-blue hover:bg-alapon-blue-hover text-white font-bold h-11"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Adding...
              </>
            ) : product.stock === 0n ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Cart Item Row ─────────────────────────────────────────────────────────
function CartItemRow({
  cartItem,
  product,
  onRemove,
}: {
  cartItem: CartItem;
  product: Product | undefined;
  onRemove: (productId: bigint) => void;
}) {
  if (!product) return null;
  return (
    <div className="flex items-center gap-3 py-3">
      <img
        src={
          product.imageUrl || `https://picsum.photos/seed/${product.name}/80/80`
        }
        alt={product.name}
        className="w-14 h-14 rounded-lg object-cover bg-muted shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground line-clamp-1">
          {product.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatPrice(product.price)} × {cartItem.quantity.toString()}
        </p>
        <p className="font-bold text-sm text-alapon-blue mt-0.5">
          {formatPrice(product.price * cartItem.quantity)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(cartItem.productId)}
        className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Cart Sheet ────────────────────────────────────────────────────────────
function CartSheet({
  open,
  onClose,
  cartItems,
  products,
}: {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  products: Product[];
}) {
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const placeOrder = usePlaceOrder();
  const [orderPlaced, setOrderPlaced] = useState(false);

  const getProduct = (productId: bigint) =>
    products.find((p) => p.id === productId);
  const subtotal = cartItems.reduce((sum, item) => {
    const p = getProduct(item.productId);
    return sum + (p ? p.price * item.quantity : 0n);
  }, 0n);

  const handleCheckout = async () => {
    try {
      await placeOrder.mutateAsync();
      setOrderPlaced(true);
      toast.success("Order placed successfully! 🎉");
    } catch {
      toast.error("Failed to place order");
    }
  };

  const handleClear = async () => {
    await clearCart.mutateAsync();
    toast.success("Cart cleared");
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[85vh] flex flex-col p-0"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/50">
          <SheetTitle className="font-display font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-alapon-blue" />
            Your Cart
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </span>
          </SheetTitle>
        </SheetHeader>

        {orderPlaced ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="font-display font-bold text-xl text-foreground mb-2">
              Order Placed!
            </h3>
            <p className="text-sm text-muted-foreground">
              Your order has been confirmed. We'll process it shortly.
            </p>
            <Button
              type="button"
              className="mt-6 bg-alapon-blue hover:bg-alapon-blue-hover text-white"
              onClick={onClose}
            >
              Continue Shopping
            </Button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="font-display font-semibold text-foreground">
              Your cart is empty
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Add products to get started
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              {cartItems.map((item) => (
                <div key={item.productId.toString()}>
                  <CartItemRow
                    cartItem={item}
                    product={getProduct(item.productId)}
                    onRemove={(id) => removeFromCart.mutate(id)}
                  />
                  <Separator className="last:hidden" />
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Subtotal</span>
                <span className="font-display font-extrabold text-xl text-foreground">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <Button
                type="button"
                onClick={handleCheckout}
                disabled={placeOrder.isPending}
                className="w-full bg-alapon-blue hover:bg-alapon-blue-hover text-white font-bold h-12 text-base"
              >
                {placeOrder.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Placing Order...
                  </>
                ) : (
                  `Checkout · ${formatPrice(subtotal)}`
                )}
              </Button>
              <button
                type="button"
                onClick={handleClear}
                className="w-full text-sm text-muted-foreground hover:text-destructive transition-colors text-center"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── ShopPage ──────────────────────────────────────────────────────────────
export default function ShopPage() {
  const { data: products, isLoading, error, refetch } = useGetProducts();
  const { data: cartItems } = useGetCart();
  const createProduct = useCreateProduct();
  const addToCart = useAddToCart();
  const { actor } = useActor();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const createProductMutateAsync = createProduct.mutateAsync;

  // Seed products if empty
  useEffect(() => {
    if (!products || products.length > 0 || !actor) return;
    const seed = async () => {
      for (const p of SAMPLE_PRODUCTS) {
        try {
          await createProductMutateAsync(p);
        } catch {
          break;
        }
      }
    };
    seed();
  }, [products, actor, createProductMutateAsync]);

  const filteredProducts =
    products?.filter(
      (p) => selectedCategory === "All" || p.category === selectedCategory,
    ) ?? [];

  const cartCount =
    cartItems?.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0;

  const handleAddToCart = async (product: Product) => {
    setAddingToCart(true);
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: 1n });
      toast.success(`${product.name} added to cart!`);
      setSelectedProduct(null);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="tab-content-enter flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card shadow-header flex items-center justify-between px-4 py-3">
        <h1 className="font-display font-bold text-xl text-foreground">Shop</h1>
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
        >
          <ShoppingCart className="w-[17px] h-[17px] text-foreground" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-alapon-blue rounded-full text-white text-[10px] font-bold flex items-center justify-center">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Category filter */}
        <div className="bg-card border-b border-border/50 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-alapon-blue text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">
                Failed to load products
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
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-display font-semibold text-foreground">
                No products found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedCategory !== "All"
                  ? `No products in "${selectedCategory}"`
                  : "The shop is empty"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  onTap={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          )}
          <div className="h-4" />
        </div>
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          isAdding={addingToCart}
        />
      )}

      {/* Cart Sheet */}
      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems ?? []}
        products={products ?? []}
      />
    </div>
  );
}
