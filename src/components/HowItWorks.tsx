import { Search, Package, Send } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Choose Your Collection",
    description: "Browse our curated collections or create a custom hamper"
  },
  {
    icon: Package,
    number: "02",
    title: "We Prepare with Care",
    description: "Each hamper is handcrafted with premium items and beautiful packaging"
  },
  {
    icon: Send,
    number: "03",
    title: "Delivered to Delight",
    description: "We ensure safe delivery and an unforgettable unboxing experience"
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Creating the perfect gift is simple
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="text-center animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-foreground mb-4">
                  <step.icon className="h-10 w-10" />
                </div>
                <div className="absolute -top-4 -right-4 text-6xl font-bold text-primary/10">
                  {step.number}
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
