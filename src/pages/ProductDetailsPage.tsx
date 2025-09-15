
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../utils/supabase/client";
import { publicAnonKey, projectId } from "../utils/supabase/info";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Loader2, ShoppingCart, Share2, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { toast } from "sonner";
import { ProductGrid } from "../components/ProductGrid";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

export function ProductDetailsPage({ onAddToCart, isLoading }: { onAddToCart: (productId: string, quantity: number) => void; isLoading: boolean }) {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-1c0c2e2f`;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${serverUrl}/products/${id}`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await response.json();
        setProduct(data.product);
        if (data.product) {
          fetchRelatedProducts(data.product.category, data.product.id);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchRelatedProducts = async (category: string, productId: string) => {
    try {
      const response = await fetch(`${serverUrl}/products?category=${category}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch related products");
      }
      const data = await response.json();
      setRelatedProducts(data.products.filter((p: Product) => p.id !== productId).slice(0, 4));
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="p-8">
          <CardContent className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-lg">Loading product...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="p-8">
          <CardContent>
            <p className="text-lg text-destructive">Product not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link to={`/category/${product.category}`} className="hover:text-primary">{product.category}</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="overflow-hidden rounded-lg">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
              <p className="text-muted-foreground text-lg mt-2">{product.category}</p>
            </div>
            <p className="text-3xl font-semibold text-primary">${product.price.toFixed(2)}</p>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}>+</Button>
              </div>
              <Button size="lg" onClick={() => onAddToCart(product.id, quantity)} disabled={isLoading} className="flex-1 gap-2">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </Button>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t">
                <Button variant="outline" size="icon">
                    <Share2 className="w-5 h-5" />
                </Button>
                <span className="text-sm text-muted-foreground">Share this product</span>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <ProductGrid products={relatedProducts} onAddToCart={(id) => onAddToCart(id, 1)} isLoading={isLoading} />
          </div>
        )}
      </div>
    </main>
  );
}
