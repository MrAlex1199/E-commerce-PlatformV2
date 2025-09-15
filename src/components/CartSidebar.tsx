import React from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Trash2, Minus, Plus } from 'lucide-react';

interface CartItem {
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

interface CartSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  isLoading?: boolean;
}

export function CartSidebar({ 
  isOpen, 
  onOpenChange, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout,
  isLoading 
}: CartSidebarProps) {
  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Shopping Cart
            {itemCount > 0 && (
              <Badge variant="secondary">{itemCount} items</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Review your selected items and proceed to checkout when ready.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex gap-3 p-3 border rounded-lg">
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    <ImageWithFallback
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm line-clamp-1">{item.product.name}</h4>
                    <p className="text-primary text-sm">${item.product.price.toFixed(2)}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        disabled={isLoading || item.quantity <= 1}
                        className="h-7 w-7 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      
                      <span className="text-sm w-8 text-center">{item.quantity}</span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        disabled={isLoading}
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.productId)}
                        disabled={isLoading}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between items-center mb-4">
              <span>Total:</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
            
            <Button 
              onClick={onCheckout}
              className="w-full"
              disabled={isLoading}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}