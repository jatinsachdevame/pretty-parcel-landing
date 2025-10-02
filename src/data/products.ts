export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "birthday" | "wedding" | "corporate";
  image: string;
  items: string[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "Birthday Bliss Hamper",
    description: "A delightful collection of treats perfect for birthday celebrations",
    price: 89.99,
    category: "birthday",
    image: "/src/assets/birthday-hamper.jpg",
    items: ["Champagne", "Gourmet chocolates", "Birthday candles", "Fresh flowers", "Celebration card"]
  },
  {
    id: "2",
    name: "Birthday Luxe Box",
    description: "Premium birthday gift with luxury items",
    price: 129.99,
    category: "birthday",
    image: "/src/assets/birthday-hamper.jpg",
    items: ["Premium wine", "Artisan chocolates", "Spa products", "Designer candle", "Gift card"]
  },
  {
    id: "3",
    name: "Sweet Birthday Treat",
    description: "Perfect for those with a sweet tooth",
    price: 69.99,
    category: "birthday",
    image: "/src/assets/birthday-hamper.jpg",
    items: ["Assorted cookies", "Chocolate truffles", "Candy selection", "Birthday banner", "Balloons"]
  },
  {
    id: "4",
    name: "Elegant Wedding Hamper",
    description: "Celebrate love with this sophisticated collection",
    price: 149.99,
    category: "wedding",
    image: "/src/assets/wedding-hamper.jpg",
    items: ["Premium champagne", "Crystal glasses", "Luxury chocolates", "White roses", "Congratulations card"]
  },
  {
    id: "5",
    name: "Wedding Romance Box",
    description: "Romantic gifts for the happy couple",
    price: 119.99,
    category: "wedding",
    image: "/src/assets/wedding-hamper.jpg",
    items: ["Sparkling wine", "Gourmet treats", "Scented candles", "Photo frame", "Love notes"]
  },
  {
    id: "6",
    name: "Honeymoon Dreams",
    description: "Perfect gift for newlyweds",
    price: 179.99,
    category: "wedding",
    image: "/src/assets/wedding-hamper.jpg",
    items: ["Champagne set", "Spa products", "Luxury robes", "Aromatherapy oils", "Travel journal"]
  },
  {
    id: "7",
    name: "Corporate Excellence",
    description: "Impress your clients with this premium selection",
    price: 159.99,
    category: "corporate",
    image: "/src/assets/corporate-hamper.jpg",
    items: ["Premium coffee", "Gourmet snacks", "Business card holder", "Branded notebook", "Thank you card"]
  },
  {
    id: "8",
    name: "Executive Collection",
    description: "Sophisticated gifts for business partners",
    price: 199.99,
    category: "corporate",
    image: "/src/assets/corporate-hamper.jpg",
    items: ["Fine wine", "Artisan cheese", "Premium nuts", "Leather journal", "Pen set"]
  },
  {
    id: "9",
    name: "Team Appreciation Box",
    description: "Show your team how much you value them",
    price: 79.99,
    category: "corporate",
    image: "/src/assets/corporate-hamper.jpg",
    items: ["Coffee pods", "Tea selection", "Healthy snacks", "Motivational card", "Desk plant"]
  }
];

export const hamperItems = [
  { id: "1", name: "Premium Champagne", price: 45, category: "beverages" },
  { id: "2", name: "Artisan Chocolates", price: 25, category: "sweets" },
  { id: "3", name: "Fresh Flowers", price: 30, category: "extras" },
  { id: "4", name: "Gourmet Coffee", price: 20, category: "beverages" },
  { id: "5", name: "Luxury Candle", price: 35, category: "extras" },
  { id: "6", name: "Spa Products Set", price: 40, category: "extras" },
  { id: "7", name: "Assorted Cookies", price: 18, category: "sweets" },
  { id: "8", name: "Premium Wine", price: 50, category: "beverages" },
  { id: "9", name: "Cheese Selection", price: 28, category: "gourmet" },
  { id: "10", name: "Gourmet Nuts", price: 22, category: "gourmet" },
  { id: "11", name: "Tea Collection", price: 24, category: "beverages" },
  { id: "12", name: "Chocolate Truffles", price: 32, category: "sweets" },
];
