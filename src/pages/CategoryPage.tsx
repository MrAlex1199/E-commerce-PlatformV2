import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../utils/supabase/client";
import { publicAnonKey, projectId } from "../utils/supabase/info";
import { ProductGrid } from "../components/ProductGrid";
import { Card, CardContent } from "../components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

export function CategoryPage({ onAddToCart, isLoading }: { onAddToCart: (productId: string) => void; isLoading: boolean }) {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-1c0c2e2f`;

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${serverUrl}/products?category=${category}`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products by category:", error);
        toast.error("Failed to load products for this category");
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchProductsByCategory();
    }
  }, [category]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Card className="p-8">
          <CardContent className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Loading products...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-primary mb-2">{category}</h2>
          <p className="text-muted-foreground">
            Browse all products in the {category} category
          </p>
        </div>
        <ProductGrid products={products} onAddToCart={onAddToCart} isLoading={isLoading} />
      </div>
    </main>
  );
}
