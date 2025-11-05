import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Sparkles } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import corporateImage from "@/assets/corporate-hamper-2.jpg";

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

export default function CorporateCollection() {
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
        .eq("category", "corporate")
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

  const handleAddToCart = (product: Product) => {
    addToCart({ ...product, image: product.image_url });
    setQuantities(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-8 w-8 text-primary" />
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">Corporate Collection</span>
                </div>
                <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground">
                  Corporate Gifting
                </h1>
                <p className="text-lg text-muted-foreground">
                  Impress clients and appreciate your team with our premium corporate hampers. Each selection combines sophistication with thoughtfulness, perfect for business relationships.
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">Professional & premium quality</span>
                </div>
              </div>
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
                <img 
                  src={corporateImage} 
                  alt="Corporate Hampers" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-4xl font-bold mb-4">Our Corporate Hampers</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Premium business gifts designed to leave a lasting impression on clients and colleagues.
              </p>
            </div>
            
            {loading ? (
              <div className="text-center py-12">Loading products...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover-scale">
                    <div className="h-64 overflow-hidden">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="font-heading">{product.name}</CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-semibold text-foreground">Includes:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {product.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                      <Button onClick={() => handleAddToCart(product)} className="relative">
                        Add to Cart
                        {quantities[product.id] > 0 && (
                          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
