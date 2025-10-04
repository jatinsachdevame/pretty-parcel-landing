import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

export const Navigation = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <Package className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-primary">The Pretty Parcel Studio</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link to="/shop">
              <Button 
                variant={isActive("/shop") ? "default" : "ghost"}
                className="font-medium"
              >
                Shop Collections
              </Button>
            </Link>
            <Link to="/custom">
              <Button 
                variant={isActive("/custom") ? "default" : "ghost"}
                className="font-medium"
              >
                Create Custom
              </Button>
            </Link>
            <Link to="/cart">
              <Button 
                variant={isActive("/cart") ? "default" : "ghost"}
                size="icon"
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
