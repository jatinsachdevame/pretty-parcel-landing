import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { products as allProducts } from "@/data/products";
import birthdayImage from "@/assets/birthday-hamper-2.jpg";

export default function BirthdayCollection() {
  const { addToCart, updateQuantity, items } = useCart();
  const products = allProducts.filter(p => p.category === "birthday");

  const handleAddToCart = (product: typeof allProducts[0]) => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleIncrement = (product: typeof allProducts[0]) => {
    const cartItem = items.find(item => item.id === product.id);
    if (cartItem) {
      updateQuantity(product.id, cartItem.quantity + 1);
    }
  };

  const handleDecrement = (product: typeof allProducts[0]) => {
    const cartItem = items.find(item => item.id === product.id);
    if (cartItem) {
      updateQuantity(product.id, cartItem.quantity - 1);
    }
  };

  const getProductQuantity = (productId: string) => {
    const cartItem = items.find(item => item.id === productId);
    return cartItem?.quantity || 0;
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
                  <Gift className="h-8 w-8 text-primary" />
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">Birthday Collection</span>
                </div>
                <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground">
                  Birthday Celebrations
                </h1>
                <p className="text-lg text-muted-foreground">
                  Make their special day unforgettable with our curated birthday hampers. From sweet treats to champagne celebrations, each hamper is designed to bring joy and create lasting memories.
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">Handpicked with love & care</span>
                </div>
              </div>
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
                <img 
                  src={birthdayImage} 
                  alt="Birthday Hampers" 
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
              <h2 className="font-heading text-4xl font-bold mb-4">Our Birthday Hampers</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose from our selection of birthday-themed hampers, each thoughtfully curated to celebrate in style.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover-scale">
                  <div className="h-64 overflow-hidden">
                    <img 
                      src={product.image} 
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
                      {getProductQuantity(product.id) === 0 ? (
                        <Button onClick={() => handleAddToCart(product)}>
                          Add to Cart
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDecrement(product)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-lg font-semibold min-w-[2rem] text-center">
                            {getProductQuantity(product.id)}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleIncrement(product)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
