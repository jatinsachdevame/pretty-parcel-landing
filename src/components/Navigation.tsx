import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, User, LogOut, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

export const Navigation = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleLinkClick = () => {
    setOpen(false);
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <Package className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-primary hidden sm:inline">The Pretty Parcel Studio</span>
            <span className="text-xl font-bold text-primary sm:hidden">TPPS</span>
          </Link>
          
          {isMobile ? (
            <div className="flex items-center gap-2">
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
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 mt-6">
                    <Link to="/shop" onClick={handleLinkClick}>
                      <Button 
                        variant={isActive("/shop") ? "default" : "ghost"}
                        className="w-full justify-start font-medium"
                      >
                        Shop Collections
                      </Button>
                    </Link>
                  <Link to="/custom" onClick={handleLinkClick}>
                    <Button 
                      variant={isActive("/custom") ? "default" : "ghost"}
                      className="w-full justify-start font-medium"
                    >
                      Create Custom
                    </Button>
                  </Link>
                  {user ? (
                      <Button 
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          signOut();
                          handleLinkClick();
                        }}
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Logout
                      </Button>
                    ) : (
                      <Link to="/auth" onClick={handleLinkClick}>
                        <Button 
                          variant={isActive("/auth") ? "default" : "ghost"}
                          className="w-full justify-start"
                        >
                          <User className="h-5 w-5 mr-2" />
                          Login
                        </Button>
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
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
              {user ? (
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              ) : (
                <Link to="/auth">
                  <Button 
                    variant={isActive("/auth") ? "default" : "ghost"}
                    size="icon"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
