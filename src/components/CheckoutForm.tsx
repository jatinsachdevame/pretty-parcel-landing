import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface CheckoutFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CheckoutForm = ({ onSuccess, onCancel }: CheckoutFormProps) => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      setIsLoadingProfile(true);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        toast.error("Could not load profile information");
      } else if (profile) {
        setFormData({
          customerName: profile.full_name,
          customerEmail: user.email || "",
          customerPhone: profile.phone,
          shippingAddress: profile.address,
        });
      }
      setIsLoadingProfile(false);
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          shipping_address: formData.shippingAddress,
          total_price: totalPrice,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => {
        const isLikelyUuid = typeof item.id === 'string' && item.id.includes('-') && !item.id.startsWith('custom-');
        return {
          order_id: order.id,
          product_id: isLikelyUuid ? (item.id as any) : null,
          product_name: item.name,
          quantity: item.quantity,
          price_at_purchase: item.finalPrice || item.price,
        };
      });

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send confirmation email with order token
      const { error: emailError } = await supabase.functions.invoke(
        "send-order-confirmation",
        {
          body: {
            orderId: order.id,
            orderToken: order.order_token,
          },
        }
      );

      if (emailError) {
        console.error("Email error:", emailError);
        toast.warning("Order placed but email confirmation failed to send");
      }

      toast.success("Order placed successfully!", {
        description: "Check your email for confirmation",
      });

      clearCart();
      onSuccess();
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error("Failed to place order", {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2 mb-4 p-3 bg-secondary/20 rounded-lg">
            <Checkbox
              id="useProfile"
              checked={useProfileAddress}
              onCheckedChange={(checked) => setUseProfileAddress(checked as boolean)}
            />
            <Label htmlFor="useProfile" className="cursor-pointer">
              Use my saved address and contact details
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">Full Name *</Label>
            <Input
              id="customerName"
              required
              disabled={useProfileAddress}
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              placeholder="Priya Sharma"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email *</Label>
            <Input
              id="customerEmail"
              type="email"
              required
              disabled
              value={formData.customerEmail}
              onChange={(e) =>
                setFormData({ ...formData, customerEmail: e.target.value })
              }
              placeholder="priya.sharma@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">Phone Number *</Label>
            <Input
              id="customerPhone"
              type="tel"
              required
              disabled={useProfileAddress}
              value={formData.customerPhone}
              onChange={(e) =>
                setFormData({ ...formData, customerPhone: e.target.value })
              }
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingAddress">Shipping Address *</Label>
            <Textarea
              id="shippingAddress"
              required
              disabled={useProfileAddress}
              value={formData.shippingAddress}
              onChange={(e) =>
                setFormData({ ...formData, shippingAddress: e.target.value })
              }
              placeholder="123 MG Road&#10;Mumbai, Maharashtra 400001&#10;India"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
