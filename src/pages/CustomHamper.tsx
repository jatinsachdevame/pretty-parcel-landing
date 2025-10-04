import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { hamperItems } from "@/data/products";
import { Plus, Minus, ShoppingCart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

interface SelectedItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const CustomHamper = () => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { addToCart } = useCart();

  const filteredItems = selectedCategory === "all" 
    ? hamperItems 
    : hamperItems.filter(item => item.category === selectedCategory);

  const addItem = (item: typeof hamperItems[0]) => {
    const existing = selectedItems.find(i => i.id === item.id);
    if (existing) {
      setSelectedItems(selectedItems.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const removeItem = (id: string) => {
    const existing = selectedItems.find(i => i.id === id);
    if (existing && existing.quantity > 1) {
      setSelectedItems(selectedItems.map(i => 
        i.id === id ? { ...i, quantity: i.quantity - 1 } : i
      ));
    } else {
      setSelectedItems(selectedItems.filter(i => i.id !== id));
    }
  };

  const getItemQuantity = (id: string) => {
    return selectedItems.find(i => i.id === id)?.quantity || 0;
  };

  const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const packagingFee = 15;
  const finalPrice = totalPrice + packagingFee;

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }
    
    // Create a custom hamper product
    const customHamper = {
      id: `custom-${Date.now()}`,
      name: "Custom Hamper",
      description: `Custom hamper with ${selectedItems.length} items`,
      price: finalPrice,
      category: "birthday" as const,
      image: "/src/assets/hero-hamper.jpg",
      items: selectedItems.map(item => `${item.name} x${item.quantity}`)
    };
    
    addToCart(customHamper);
    toast.success("Custom hamper added to cart!", {
      description: `Total: ₹${finalPrice.toFixed(2)}`
    });
    setSelectedItems([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-5xl font-bold mb-4">Create Your Custom Hamper</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Handpick each item to create the perfect personalized gift
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items Selection */}
            <div className="lg:col-span-2">
              {/* Category Filter */}
              <div className="flex gap-2 mb-6 flex-wrap">
                <Button
                  size="sm"
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                >
                  All Items
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === "beverages" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("beverages")}
                >
                  Beverages
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === "sweets" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("sweets")}
                >
                  Sweets
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === "gourmet" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("gourmet")}
                >
                  Gourmet
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === "extras" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("extras")}
                >
                  Extras
                </Button>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredItems.map((item, index) => {
                  const quantity = getItemQuantity(item.id);
                  return (
                    <Card 
                      key={item.id}
                      className="animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <Badge variant="secondary" className="capitalize text-xs mt-1">
                              {item.category}
                            </Badge>
                          </div>
                          <p className="text-xl font-bold text-primary">₹{item.price}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-4">
                          {quantity === 0 ? (
                            <Button 
                              className="w-full"
                              onClick={() => addItem(item)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Hamper
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2 w-full">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => removeItem(item.id)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <div className="flex-1 text-center font-semibold">
                                {quantity}
                              </div>
                              <Button
                                size="icon"
                                onClick={() => addItem(item)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-4">Your Hamper</h3>
                  
                  {selectedItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Start adding items to create your custom hamper
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4">
                        {selectedItems.map(item => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="flex-1">
                              {item.name} × {item.quantity}
                            </span>
                            <span className="font-semibold">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <Separator className="my-4" />
                      
                        <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Packaging & Ribbon</span>
                          <span className="font-semibold">₹{packagingFee.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-3xl font-bold text-primary">
                          ₹{finalPrice.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button 
                    className="w-full group" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={selectedItems.length === 0}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomHamper;
