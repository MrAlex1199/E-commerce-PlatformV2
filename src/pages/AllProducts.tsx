import React from "react";
import { ProductGrid } from "../components/ProductGrid";
import { Card, CardContent } from "../components/ui/card";
import { Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

interface AllProductsProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
  isLoading: boolean;
}

export function AllProducts({ products, onAddToCart, isLoading }: AllProductsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="p-8">
          <CardContent className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-lg">Loading products...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="p-8">
          <CardContent>
            <p className="text-lg text-destructive">No products found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">All Products</h1>
        <ProductGrid products={products} onAddToCart={onAddToCart} isLoading={isLoading} />
      </div>
    </main>
  );
}