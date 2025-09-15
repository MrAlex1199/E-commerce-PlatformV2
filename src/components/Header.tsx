import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Link } from 'react-router-dom';

interface HeaderProps {
  cartItemCount: number;
  user: any;
  onCartClick: () => void;
  onAuthClick: () => void;
  onLogout: () => void;
}

export function Header({ cartItemCount, user, onCartClick, onAuthClick, onLogout }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigationItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/allproducts' },
    { label: 'Categories', href: '#' },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-b border-amber-200 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VM</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                VF Clothes Shop
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => handleNavClick(item.href)}
                className="px-4 py-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-all duration-200 font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Cart */}
            <Button
              variant="outline"
              size="sm"
              onClick={onCartClick}
              className="relative border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white border-0"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {user.user_metadata?.name || 'User'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-amber-200">
                  <DropdownMenuItem onClick={onLogout} className="text-amber-700 hover:bg-amber-50">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={onAuthClick} 
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}

            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-gradient-to-b from-amber-50 to-yellow-50 border-amber-200">
                  <div className="flex flex-col space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-amber-700">Menu</h2>
                    </div>
                    <nav className="flex flex-col space-y-2">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={() => handleNavClick(item.href)}
                          className="text-left px-4 py-3 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-all duration-200 font-medium"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}