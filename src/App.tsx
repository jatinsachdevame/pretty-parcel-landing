import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import CustomHamper from "./pages/CustomHamper";
import Cart from "./pages/Cart";
import BirthdayCollection from "./pages/BirthdayCollection";
import WeddingCollection from "./pages/WeddingCollection";
import CorporateCollection from "./pages/CorporateCollection";
import Auth from "./pages/Auth";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/custom" element={<CustomHamper />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/collections/birthday" element={<BirthdayCollection />} />
            <Route path="/collections/wedding" element={<WeddingCollection />} />
            <Route path="/collections/corporate" element={<CorporateCollection />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
