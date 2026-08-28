import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [isLogin, setIsLogin] = useState(true);
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("ecommerce_token")
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  // ===============================
  // FETCH PRODUCTS
  // ===============================

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Products error:", error);
    }
  };

  // ===============================
  // FETCH CART
  // ===============================

  const fetchCart = async () => {
    const token = localStorage.getItem("ecommerce_token");

    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setCart(data);
      }
    } catch (error) {
      console.error("Cart error:", error);
    }
  };

  // ===============================
  // FETCH ORDERS
  // ===============================

  const fetchOrders = async () => {
    const token = localStorage.getItem("ecommerce_token");

    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setOrders(data);
      }
    } catch (error) {
      console.error("Orders error:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (loggedIn) {
      fetchCart();
      fetchOrders();
    }
  }, [loggedIn]);

  // ===============================
  // REGISTER
  // ===============================

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please login.");

        setName("");
        setEmail("");
        setPassword("");

        setIsLogin(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Unable to connect to the server.");
    }
  };

  // ===============================
  // LOGIN
  // ===============================

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("ecommerce_token", data.token);

        setLoggedIn(true);

        setLoginEmail("");
        setLoginPassword("");

        alert("Login successful!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Unable to connect to the server.");
    }
  };

  // ===============================
  // ADD TO CART
  // ===============================

  const addToCart = async (productId) => {
    if (!loggedIn) {
      alert("Please login first.");
      setIsLogin(true);
      return;
    }

    const token = localStorage.getItem("ecommerce_token");

    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Product added to cart!");
        fetchCart();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Unable to add product to cart.");
    }
  };

  // ===============================
  // UPDATE CART
  // ===============================

  const updateCart = async (cartId, quantity) => {
    if (quantity < 1) return;

    const token = localStorage.getItem("ecommerce_token");

    try {
      const response = await fetch(`${API_URL}/api/cart/${cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity,
        }),
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ===============================
  // REMOVE CART ITEM
  // ===============================

  const removeFromCart = async (cartId) => {
    const token = localStorage.getItem("ecommerce_token");

    try {
      const response = await fetch(`${API_URL}/api/cart/${cartId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ===============================
  // CHECKOUT
  // ===============================

  const checkout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const token = localStorage.getItem("ecommerce_token");

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `Order placed successfully! Order ID: ${data.orderId}`
        );

        fetchCart();
        fetchOrders();

        setShowCart(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Unable to place order.");
    }
  };

  // ===============================
  // LOGOUT
  // ===============================

  const logout = () => {
    localStorage.removeItem("ecommerce_token");

    setLoggedIn(false);
    setCart([]);
    setOrders([]);
    setShowCart(false);
    setShowOrders(false);
  };

  // ===============================
  // FILTER PRODUCTS
  // ===============================

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // ===============================
  // AUTH SCREEN
  // ===============================

  if (!loggedIn) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>ShopEase 🛒</h1>

          <p className="auth-subtitle">
            Your simple online shopping destination
          </p>

          {isLogin ? (
            <>
              <h2>Welcome Back</h2>

              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) =>
                    setLoginPassword(e.target.value)
                  }
                  required
                />

                <button type="submit">Login</button>
              </form>

              <p>
                Don't have an account?{" "}
                <button
                  className="link-button"
                  onClick={() => setIsLogin(false)}
                >
                  Register
                </button>
              </p>
            </>
          ) : (
            <>
              <h2>Create Account</h2>

              <form onSubmit={handleRegister}>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button type="submit">Register</button>
              </form>

              <p>
                Already have an account?{" "}
                <button
                  className="link-button"
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // ===============================
  // SHOP SCREEN
  // ===============================

  return (
    <div className="shop-page">
      <header className="navbar">
        <div>
          <h1>ShopEase 🛒</h1>
          <p>Everything you need, in one place.</p>
        </div>

        <div className="nav-actions">
          <button onClick={() => setShowOrders(!showOrders)}>
            📦 Orders
          </button>

          <button onClick={() => setShowCart(!showCart)}>
            🛒 Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>

          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="shop-content">
        <section className="hero-section">
          <h2>Discover Great Products</h2>
          <p>Shop our collection of quality products.</p>
        </section>

        <section className="filters">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </section>

        {showCart && (
          <section className="cart-section">
            <h2>🛒 Your Cart</h2>

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div>
                      <h3>{item.name}</h3>
                      <p>₹{item.price}</p>
                    </div>

                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          updateCart(
                            item.id,
                            item.quantity - 1
                          )
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateCart(
                            item.id,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <strong>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </strong>

                    <button
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <div className="cart-total">
                  <h3>Total: ₹{cartTotal.toFixed(2)}</h3>

                  <button onClick={checkout}>
                    Checkout
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {showOrders && (
          <section className="orders-section">
            <h2>📦 Your Orders</h2>

            {orders.length === 0 ? (
              <p>No orders yet.</p>
            ) : (
              orders.map((order) => (
                <div className="order-card" key={order.id}>
                  <h3>Order #{order.id}</h3>
                  <p>
                    Total: ₹{order.total.toFixed(2)}
                  </p>
                  <p>Status: {order.status}</p>
                  <p>
                    Date:{" "}
                    {new Date(
                      order.created_at
                    ).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </section>
        )}

        <section className="products-section">
          <div className="section-heading">
            <h2>Products</h2>
            <span>{filteredProducts.length} products</span>
          </div>

          {filteredProducts.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div className="product-card" key={product.id}>
                  <img
                    src={product.image}
                    alt={product.name}
                  />

                  <div className="product-info">
                    <span className="category">
                      {product.category}
                    </span>

                    <h3>{product.name}</h3>

                    <p>{product.description}</p>

                    <div className="product-bottom">
                      <strong>₹{product.price}</strong>

                      <span>
                        Stock: {product.stock}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        addToCart(product.id)
                      }
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;