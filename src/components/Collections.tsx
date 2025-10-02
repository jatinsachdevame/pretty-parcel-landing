import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import birthdayImage from "@/assets/birthday-hamper.jpg";
import weddingImage from "@/assets/wedding-hamper.jpg";
import corporateImage from "@/assets/corporate-hamper.jpg";

const collections = [
  {
    title: "Birthday Celebrations",
    description: "Make their special day unforgettable",
    image: birthdayImage,
  },
  {
    title: "Wedding & Love",
    description: "Celebrate love in the most elegant way",
    image: weddingImage,
  },
  {
    title: "Corporate Gifts",
    description: "Impress clients and appreciate your team",
    image: corporateImage,
  }
];

export const Collections = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Collections
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our curated collections for every special moment
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <Card 
              key={index}
              className="overflow-hidden group cursor-pointer border-border hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-square overflow-hidden">
                <img 
                  src={collection.image} 
                  alt={collection.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-semibold mb-2">{collection.title}</h3>
                <p className="text-muted-foreground mb-4">{collection.description}</p>
                <Button variant="outline" className="w-full">
                  Explore Collection
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
