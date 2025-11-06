import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import Twilio from "https://esm.sh/twilio@5.3.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Twilio client
const twilioClient = Twilio(
  Deno.env.get("TWILIO_ACCOUNT_SID"),
  Deno.env.get("TWILIO_AUTH_TOKEN")
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_name: string;
  quantity: number;
  price_at_purchase: number;
}

interface OrderConfirmationRequest {
  orderId: string;
  orderToken: string;
}

// Input validation helpers
const isValidUuid = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const isValidEmail = (email: string): boolean => {
  return email.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for verification
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, orderToken }: OrderConfirmationRequest = await req.json();

    // Validate inputs
    if (!orderId || !orderToken) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing orderId or orderToken" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isValidUuid(orderId) || !isValidUuid(orderToken)) {
      console.error("Invalid UUID format");
      return new Response(
        JSON.stringify({ error: "Invalid ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify order exists and token matches
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, customer_name, customer_email, customer_phone, shipping_address, total_price, created_at, order_token")
      .eq("id", orderId)
      .eq("order_token", orderToken)
      .single();

    if (orderError || !order) {
      console.error("Order not found or token mismatch:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found or invalid token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    if (!isValidEmail(order.customer_email)) {
      console.error("Invalid email format:", order.customer_email);
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limiting (max 5 emails per order in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentSends, error: logError } = await supabase
      .from("email_send_log")
      .select("id")
      .eq("order_id", orderId)
      .gte("sent_at", oneHourAgo);

    if (logError) {
      console.error("Error checking rate limit:", logError);
    } else if (recentSends && recentSends.length >= 5) {
      console.warn("Rate limit exceeded for order:", orderId);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Max 5 emails per hour." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("product_name, quantity, price_at_purchase")
      .eq("order_id", orderId);

    if (itemsError || !items) {
      console.error("Failed to fetch order items:", itemsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch order details" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Sending order confirmation to:", order.customer_email);

    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price_at_purchase.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.quantity * item.price_at_purchase).toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    const emailResponse = await resend.emails.send({
      from: "Gift Hampers <onboarding@resend.dev>",
      to: [order.customer_email],
      subject: `Order Confirmation - ${order.id.slice(0, 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
              .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background: #f8f9fa; padding: 10px; text-align: left; font-weight: bold; }
              .total { font-size: 18px; font-weight: bold; margin-top: 20px; text-align: right; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Thank You for Your Order!</h1>
                <p style="margin: 10px 0 0 0;">Order #${order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div class="content">
                <p>Dear ${order.customer_name},</p>
                <p>Thank you for your order! We're excited to prepare your gift hamper(s) for you.</p>
                
                <div class="order-details">
                  <h3 style="margin-top: 0;">Shipping Address</h3>
                  <p style="margin: 0;">${order.shipping_address.replace(/\n/g, "<br>")}</p>
                </div>

                <h3>Order Summary</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style="text-align: center;">Quantity</th>
                      <th style="text-align: right;">Price</th>
                      <th style="text-align: right;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                <div class="total">
                  Total: ₹${order.total_price.toFixed(2)}
                </div>

                <p style="margin-top: 30px;">We'll send you another email once your order has been shipped.</p>
                <p>If you have any questions, please don't hesitate to contact us.</p>
                <p style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                  <strong>Track your order:</strong> Save your order tracking token for future reference: <code style="background: white; padding: 5px 10px; border-radius: 3px;">${orderToken}</code>
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Gift Hampers. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the email send for rate limiting
    await supabase
      .from("email_send_log")
      .insert({
        order_id: orderId,
        recipient_email: order.customer_email,
      });

    // Send WhatsApp message via Twilio
    try {
      const whatsappMessage = `Hello ${order.customer_name}! 🎁\n\nThank you for your order with Gift Hampers!\n\nOrder #${order.id.slice(0, 8).toUpperCase()}\nTotal: ₹${order.total_price.toFixed(2)}\n\nWe've received your order and will process it shortly. You'll receive an email confirmation as well.\n\nThank you for shopping with us!`;
      
      const twilioWhatsAppNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");
      
      // Format phone number for WhatsApp (must include country code)
      let customerPhone = order.customer_phone.replace(/\s/g, '');
      if (!customerPhone.startsWith('+')) {
        // Assuming Indian numbers, add +91 if not present
        if (customerPhone.startsWith('91')) {
          customerPhone = '+' + customerPhone;
        } else {
          customerPhone = '+91' + customerPhone;
        }
      }

      await twilioClient.messages.create({
        body: whatsappMessage,
        from: `whatsapp:${twilioWhatsAppNumber}`,
        to: `whatsapp:${customerPhone}`
      });

      console.log(`WhatsApp message sent successfully to ${customerPhone}`);
    } catch (whatsappError) {
      console.error("WhatsApp sending error:", whatsappError);
      // Don't throw error - email was sent successfully, WhatsApp is supplementary
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Order confirmation email sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending order confirmation:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
