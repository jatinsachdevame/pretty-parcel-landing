import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "birthday" | "wedding" | "corporate";
  image_url: string;
  items: string[];
  discount_percentage?: number;
}

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    addToCart({ ...product, image: product.image_url });
    setQuantities(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
    toast.success(`${product.name} added to cart!`, {
      description: `₹${product.price.toFixed(2)}`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Shop Our Collections</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse our carefully curated hampers for every special occasion
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center gap-3 mb-12 flex-wrap">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
            >
              All Collections
            </Button>
            <Button
              variant={selectedCategory === "birthday" ? "default" : "outline"}
              onClick={() => setSelectedCategory("birthday")}
            >
              Birthday
            </Button>
            <Button
              variant={selectedCategory === "wedding" ? "default" : "outline"}
              onClick={() => setSelectedCategory("wedding")}
            >
              Wedding
            </Button>
            <Button
              variant={selectedCategory === "corporate" ? "default" : "outline"}
              onClick={() => setSelectedCategory("corporate")}
            >
              Corporate
            </Button>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, index) => (
                <Card 
                  key={product.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="aspect-square overflow-hidden bg-secondary/30">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-2xl font-semibold">{product.name}</h3>
                      <Badge variant="secondary" className="capitalize">
                        {product.category}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{product.description}</p>
                    <div className="space-y-1 mb-4">
                      <p className="text-sm font-medium text-muted-foreground">Includes:</p>
                      <ul className="text-sm space-y-1">
                        {product.items.slice(0, 3).map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                        {product.items.length > 3 && (
                          <li className="text-muted-foreground">+ {product.items.length - 3} more items</li>
                        )}
                      </ul>
                    </div>
                    <p className="text-3xl font-bold text-primary">₹{product.price.toFixed(2)}</p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button 
                      className="w-full group relative" 
                      size="lg"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      Add to Cart
                      {quantities[product.id] > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary-foreground text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {quantities[product.id]}
                        </span>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
