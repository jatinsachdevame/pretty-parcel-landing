import { Instagram, Facebook, Mail, Phone } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-secondary/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-primary">The Pretty Parcel Studio</h3>
            <p className="text-muted-foreground">
              Crafting beautiful moments, one hamper at a time.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Collections</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Birthday Gifts</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Wedding & Love</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Corporate Gifts</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Custom Hampers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Delivery Info</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Get in Touch</h4>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <a href="mailto:hello@prettyparcel.com" className="hover:text-primary transition-colors">
                  hello@prettyparcel.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <a href="tel:+1234567890" className="hover:text-primary transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex gap-4 mt-4">
                <a href="#" className="hover:text-primary transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 text-center text-muted-foreground">
          <p>&copy; 2025 The Pretty Parcel Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
