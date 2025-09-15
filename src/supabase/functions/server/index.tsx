import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Health check endpoint
app.get("/make-server-1c0c2e2f/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize sample products
app.post("/make-server-1c0c2e2f/init", async (c) => {
  try {
    const products = [
      {
        id: "1",
        name: "Organic Cotton T-Shirt",
        price: 29.99,
        description: "Comfortable organic cotton t-shirt in forest green",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        category: "clothing"
      },
      {
        id: "2", 
        name: "Bamboo Water Bottle",
        price: 24.99,
        description: "Eco-friendly bamboo water bottle with steel interior",
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
        category: "accessories"
      },
      {
        id: "3",
        name: "Hemp Backpack",
        price: 79.99,
        description: "Durable hemp backpack perfect for outdoor adventures",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        category: "bags"
      },
      {
        id: "4",
        name: "Recycled Yoga Mat",
        price: 49.99,
        description: "High-quality yoga mat made from recycled materials",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
        category: "fitness"
      },
      {
        id: "5",
        name: "Natural Soap Set",
        price: 19.99,
        description: "Set of 3 handmade natural soaps with essential oils",
        image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400",
        category: "personal-care"
      },
      {
        id: "6",
        name: "Wooden Phone Case",
        price: 34.99,
        description: "Handcrafted wooden phone case for iPhone and Android",
        image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400",
        category: "accessories"
      }
    ];

    for (const product of products) {
      await kv.set(`product:${product.id}`, product);
    }

    return c.json({ message: "Products initialized successfully", count: products.length });
  } catch (error) {
    console.log("Error initializing products:", error);
    return c.json({ error: "Failed to initialize products" }, 500);
  }
});

// Get all products
app.get("/make-server-1c0c2e2f/products", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    return c.json({ products });
  } catch (error) {
    console.log("Error fetching products:", error);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

// Get single product
app.get("/make-server-1c0c2e2f/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await kv.get(`product:${id}`);
    
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }
    
    return c.json({ product });
  } catch (error) {
    console.log("Error fetching product:", error);
    return c.json({ error: "Failed to fetch product" }, 500);
  }
});

// User signup
app.post("/make-server-1c0c2e2f/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log("Signup error:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user, message: "User created successfully" });
  } catch (error) {
    console.log("Error during signup:", error);
    return c.json({ error: "Failed to create user" }, 500);
  }
});

// Get user cart
app.get("/make-server-1c0c2e2f/cart", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const cart = await kv.get(`cart:${user.id}`) || { items: [] };
    return c.json({ cart });
  } catch (error) {
    console.log("Error fetching cart:", error);
    return c.json({ error: "Failed to fetch cart" }, 500);
  }
});

// Add item to cart
app.post("/make-server-1c0c2e2f/cart/add", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { productId, quantity = 1 } = await c.req.json();
    
    // Get product details
    const product = await kv.get(`product:${productId}`);
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    // Get current cart
    const cart = await kv.get(`cart:${user.id}`) || { items: [] };
    
    // Find existing item
    const existingItemIndex = cart.items.findIndex((item: any) => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        product
      });
    }

    await kv.set(`cart:${user.id}`, cart);
    return c.json({ cart, message: "Item added to cart" });
  } catch (error) {
    console.log("Error adding to cart:", error);
    return c.json({ error: "Failed to add item to cart" }, 500);
  }
});

// Remove item from cart
app.delete("/make-server-1c0c2e2f/cart/remove/:productId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const productId = c.req.param("productId");
    
    // Get current cart
    const cart = await kv.get(`cart:${user.id}`) || { items: [] };
    
    // Filter out the item
    cart.items = cart.items.filter((item: any) => item.productId !== productId);

    await kv.set(`cart:${user.id}`, cart);
    return c.json({ cart, message: "Item removed from cart" });
  } catch (error) {
    console.log("Error removing from cart:", error);
    return c.json({ error: "Failed to remove item from cart" }, 500);
  }
});

// Update cart item quantity
app.put("/make-server-1c0c2e2f/cart/update", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { productId, quantity } = await c.req.json();
    
    // Get current cart
    const cart = await kv.get(`cart:${user.id}`) || { items: [] };
    
    // Find and update item
    const itemIndex = cart.items.findIndex((item: any) => item.productId === productId);
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
    }

    await kv.set(`cart:${user.id}`, cart);
    return c.json({ cart, message: "Cart updated" });
  } catch (error) {
    console.log("Error updating cart:", error);
    return c.json({ error: "Failed to update cart" }, 500);
  }
});

// Process checkout
app.post("/make-server-1c0c2e2f/checkout", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { shippingInfo, paymentInfo } = await c.req.json();
    
    // Get current cart
    const cart = await kv.get(`cart:${user.id}`) || { items: [] };
    
    if (!cart.items.length) {
      return c.json({ error: "Cart is empty" }, 400);
    }

    // Calculate total
    const total = cart.items.reduce((sum: number, item: any) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    // Create order
    const orderId = `order_${Date.now()}_${user.id}`;
    const order = {
      id: orderId,
      userId: user.id,
      items: cart.items,
      total,
      shippingInfo,
      status: "confirmed",
      createdAt: new Date().toISOString()
    };

    await kv.set(`order:${orderId}`, order);
    
    // Clear cart
    await kv.set(`cart:${user.id}`, { items: [] });

    return c.json({ 
      order, 
      message: "Order placed successfully! Note: This is a demo - no actual payment was processed." 
    });
  } catch (error) {
    console.log("Error processing checkout:", error);
    return c.json({ error: "Failed to process checkout" }, 500);
  }
});

// Get user orders
app.get("/make-server-1c0c2e2f/orders", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const allOrders = await kv.getByPrefix("order:");
    const userOrders = allOrders.filter((order: any) => order.userId === user.id);
    
    return c.json({ orders: userOrders });
  } catch (error) {
    console.log("Error fetching orders:", error);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

Deno.serve(app.fetch);