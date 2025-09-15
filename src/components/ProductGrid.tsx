import React from 'react';
import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

interface ProductGridProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
  isLoading?: boolean;
}

export function ProductGrid({ products, onAddToCart, isLoading }: ProductGridProps) {
  if (!products.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}