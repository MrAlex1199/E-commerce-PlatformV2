
import React from "react";
import { ProductGrid } from "../components/ProductGrid";
import { Card, CardContent } from "../components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import heroImage1 from "../assets/pic/home_pic/p1home.avif";
import heroImage2 from "../assets/pic/home_pic/p2home.avif";
import heroImage3 from "../assets/pic/home_pic/p3home.avif";
import heroImage4 from "../assets/pic/home_pic/p4home.avif";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../components/ui/carousel";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

interface HomePageProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
  loading: {
    products: boolean;
    cart: boolean;
  };
  carouselApi: any;
  setCarouselApi: React.Dispatch<any>;
}

export function HomePage({ products, onAddToCart, loading, carouselApi, setCarouselApi }: HomePageProps) {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-300 via-yellow-200 to-orange-300 min-h-[600px] md:min-h-[700px]">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/30 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-60 w-16 h-16 bg-white/20 rounded-full"></div>
          <div className="absolute bottom-32 left-20 w-24 h-24 bg-white/20 rounded-full blur-lg"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <Carousel className="w-full" setApi={setCarouselApi} opts={{ loop: true }}>
            <CarouselContent>
              {[heroImage1, heroImage2, heroImage3, heroImage4].map(
                (image, index) => (
                  <CarouselItem key={image}>
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                      {/* Content */}
                      <div className="space-y-6 text-left lg:pr-8">
                        <div className="space-y-2">
                          <p className="text-amber-700 tracking-wider text-sm md:text-base font-medium">
                            SUMMER 2025
                          </p>
                          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                            NEW COLLECTION
                          </h1>
                        </div>
                        <p className="text-gray-700 text-lg md:text-xl leading-relaxed max-w-md">
                          Discover our latest sustainable fashion collection designed for the modern conscious consumer.
                        </p>
                        <div className="pt-4">
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                            onClick={() => {
                              const productsSection =
                                document.getElementById("products-section");
                              productsSection?.scrollIntoView({
                                behavior: "smooth",
                              });
                            }}
                          >
                            SHOP NOW
                          </Button>
                        </div>
                      </div>
                      {/* Hero Image */}
                      <div className="relative lg:order-first order-last">
                        <div className="relative">
                          <ImageWithFallback
                            src={image}
                            alt={`Fashion model in denim jacket ${index + 1}`}
                            className="w-full h-auto max-w-md mx-auto lg:max-w-none lg:mx-0 object-cover rounded-2xl lg:rounded-none"
                          />
                          {/* Additional decorative circle behind image */}
                          <div className="absolute -top-8 -right-8 w-64 h-64 bg-white/20 rounded-full blur-xl -z-10"></div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                )
              )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-primary mb-2">Featured Products</h2>
            <p className="text-muted-foreground">
              Carefully selected sustainable products for conscious consumers
            </p>
          </div>

          {loading.products ? (
            <div className="flex justify-center py-12">
              <Card className="p-8">
                <CardContent className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span>Loading products...</span>
                </CardContent>
              </Card>
            </div>
          ) : (
            <ProductGrid
              products={products}
              onAddToCart={onAddToCart}
              isLoading={loading.cart}
            />
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-accent/20 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-primary mb-2">Eco-Friendly</h3>
              <p className="text-muted-foreground text-sm">
                All products are sustainably sourced and environmentally
                conscious
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-primary mb-2">Free Shipping</h3>
              <p className="text-muted-foreground text-sm">
                Free shipping on orders over $50. Fast and reliable delivery
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-primary mb-2">Secure Checkout</h3>
              <p className="text-muted-foreground text-sm">
                Your payment information is always safe and secure
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
