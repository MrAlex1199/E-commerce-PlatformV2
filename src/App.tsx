import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { AdminLayout } from "./components/AdminLayout";
import { CartSidebar } from "./components/CartSidebar";
import { AuthModal } from "./components/AuthModal";
import { CheckoutModal } from "./components/CheckoutModal";
import { HomePage } from "./pages/HomePage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { AllProducts } from "./pages/AllProducts";
import { CategoryPage } from "./pages/CategoryPage";
import AdminDash from "./pages/AdminDashBoard";
import { OrdersPage } from "./pages/OrdersPage";
import { ProductsAdminPage } from "./pages/ProductsAdminPage";
import { CustomersPage } from "./pages/CustomersPage";
import AdminRoute from "./components/AdminRoute";
import { toast } from "sonner";
import { supabase } from "./utils/supabase/client";
import { projectId, publicAnonKey } from "./utils/supabase/info";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState({
    products: true,
    auth: false,
    cart: false,
    checkout: false,
  });
  const [carouselApi, setCarouselApi] = useState<any>(null);

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-1c0c2e2f`;

  useEffect(() => {
    const initialize = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          fetchCart(session.access_token);
        }

        await fetch(`${serverUrl}/init`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
        });

        await fetchProducts();
      } catch (error) {
        console.error("Error during initialization:", error);
        toast.error("Failed to initialize application");
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!carouselApi) return;

    const interval = setInterval(() => {
      if (carouselApi && typeof carouselApi.scrollNext === "function") {
        carouselApi.scrollNext();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselApi]);

  const fetchProducts = async () => {
    try {
      setLoading((prev) => ({ ...prev, products: true }));
      const response = await fetch(`${serverUrl}/products`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  };

  const fetchCart = async (accessToken: string) => {
    try {
      const response = await fetch(`${serverUrl}/cart`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart?.items || []);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading((prev) => ({ ...prev, auth: true }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user && data.session) {
        setUser(data.user);
        await fetchCart(data.session.access_token);
        setIsAuthOpen(false);
        toast.success("Signed in successfully!");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    name: string
  ) => {
    try {
      setLoading((prev) => ({ ...prev, auth: true }));

      const response = await fetch(`${serverUrl}/signup`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      await handleSignIn(email, password);
      toast.success("Account created successfully!");
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setCartItems([]);
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out");
    }
  };

  const handleAddToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      setIsAuthOpen(true);
      toast.error("Please sign in to add items to cart");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, cart: true }));

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("No valid session");

      const response = await fetch(`${serverUrl}/cart/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add item to cart");
      }

      setCartItems(data.cart?.items || []);
      toast.success("Item added to cart!");
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Failed to add item to cart");
    } finally {
      setLoading((prev) => ({ ...prev, cart: false }));
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;

    try {
      setLoading((prev) => ({ ...prev, cart: true }));

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("No valid session");

      const response = await fetch(`${serverUrl}/cart/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update cart");
      }

      setCartItems(data.cart?.items || []);
    } catch (error: any) {
      console.error("Error updating cart:", error);
      toast.error(error.message || "Failed to update cart");
    } finally {
      setLoading((prev) => ({ ...prev, cart: false }));
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!user) return;

    try {
      setLoading((prev) => ({ ...prev, cart: true }));

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("No valid session");

      const response = await fetch(`${serverUrl}/cart/remove/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove item");
      }

      setCartItems(data.cart?.items || []);
      toast.success("Item removed from cart");
    } catch (error: any) {
      console.error("Error removing item:", error);
      toast.error(error.message || "Failed to remove item");
    } finally {
      setLoading((prev) => ({ ...prev, cart: false }));
    }
  };

  const handleCheckout = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePlaceOrder = async (orderData: any) => {
    if (!user) return;

    try {
      setLoading((prev) => ({ ...prev, checkout: true }));

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("No valid session");

      const response = await fetch(`${serverUrl}/checkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      setCartItems([]);
      setIsCheckoutOpen(false);
      toast.success("Order placed successfully! 🎉");
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading((prev) => ({ ...prev, checkout: false }));
    }
  };

  const cartItemCount = cartItems.reduce(
    (sum: number, item: { quantity: number }) => sum + item.quantity,
    0
  );

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route
            path="/"
            element={
              <MainLayout
                cartItemCount={cartItemCount}
                user={user}
                onCartClick={() => setIsCartOpen(true)}
                onAuthClick={() => setIsAuthOpen(true)}
                onLogout={handleLogout}
              />
            }
          >
            <Route
              index
              element={
                <HomePage
                  products={products}
                  onAddToCart={handleAddToCart}
                  loading={{
                    products: loading.products,
                    cart: loading.cart,
                  }}
                  carouselApi={carouselApi}
                  setCarouselApi={setCarouselApi}
                />
              }
            />
            <Route
              path="product/:id"
              element={
                <ProductDetailsPage
                  onAddToCart={handleAddToCart}
                  isLoading={loading.cart}
                />
              }
            />
            <Route
              path="category/:category"
              element={
                <CategoryPage
                  onAddToCart={handleAddToCart}
                  isLoading={loading.cart}
                />
              }
            />
            <Route
              path="allproducts"
              element={
                <AllProducts
                  products={products}
                  onAddToCart={handleAddToCart}
                  isLoading={loading.cart}
                />
              }
            />
          </Route>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDash />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="products" element={<ProductsAdminPage />} />
            <Route path="customers" element={<CustomersPage />} />
          </Route>
        </Routes>

        <CartSidebar
          isOpen={isCartOpen}
          onOpenChange={setIsCartOpen}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
          isLoading={loading.cart}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onOpenChange={setIsAuthOpen}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          isLoading={loading.auth}
        />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onOpenChange={setIsCheckoutOpen}
          cartItems={cartItems}
          onPlaceOrder={handlePlaceOrder}
          isLoading={loading.checkout}
        />
      </div>
    </Router>
  );
}

export default App;