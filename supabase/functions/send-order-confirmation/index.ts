import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  items: OrderItem[];
  totalPrice: number;
  shippingAddress: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      customerName,
      customerEmail,
      orderNumber,
      items,
      totalPrice,
      shippingAddress,
    }: OrderConfirmationRequest = await req.json();

    console.log("Sending order confirmation to:", customerEmail);

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
      to: [customerEmail],
      subject: `Order Confirmation - ${orderNumber}`,
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
                <p style="margin: 10px 0 0 0;">Order #${orderNumber}</p>
              </div>
              <div class="content">
                <p>Dear ${customerName},</p>
                <p>Thank you for your order! We're excited to prepare your gift hamper(s) for you.</p>
                
                <div class="order-details">
                  <h3 style="margin-top: 0;">Shipping Address</h3>
                  <p style="margin: 0;">${shippingAddress.replace(/\n/g, "<br>")}</p>
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
                  Total: ₹${totalPrice.toFixed(2)}
                </div>

                <p style="margin-top: 30px;">We'll send you another email once your order has been shipped.</p>
                <p>If you have any questions, please don't hesitate to contact us.</p>
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

    return new Response(JSON.stringify(emailResponse), {
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
