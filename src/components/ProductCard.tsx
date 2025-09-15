import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  isLoading?: boolean;
}

export function ProductCard({ product, onAddToCart, isLoading }: ProductCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 flex flex-col">
      <Link to={`/product/${product.id}`} className="flex-grow">
        <CardContent className="p-0">
          <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <div className="p-4">
            <div className="mb-2">
              <h3 className="line-clamp-1">{product.name}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                {product.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Link>
      <div className="p-4 pt-0 flex items-center justify-between">
        <div className="text-primary">${product.price.toFixed(2)}</div>
        <Button 
          size="sm"
          onClick={() => onAddToCart(product.id)}
          disabled={isLoading}
          className="gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}
