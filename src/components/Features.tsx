import { Gift, Heart, Sparkles, Truck } from "lucide-react";

const features = [
  {
    icon: Gift,
    title: "Handpicked Selection",
    description: "Every item is carefully chosen for quality and elegance"
  },
  {
    icon: Sparkles,
    title: "Beautiful Presentation",
    description: "Stunning packaging that makes every unboxing special"
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "Each hamper is crafted with care and attention to detail"
  },
  {
    icon: Truck,
    title: "Delivered with Care",
    description: "Safe and timely delivery right to your doorstep"
  }
];

export const Features = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose Us
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We believe every gift should be as special as the person receiving it
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center p-6 rounded-2xl hover:bg-secondary/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
