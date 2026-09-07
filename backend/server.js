const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 5000;

const JWT_SECRET =
  process.env.JWT_SECRET || "TaskManagement_JWT_2026_Secure_Key_9x7P2";

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// DATABASE
// ===============================

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("SQLite database connected successfully!");
  }
});

// ===============================
// CREATE TABLES
// ===============================

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT,
      image TEXT,
      stock INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'Placed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // ===============================
  // SAMPLE PRODUCTS
  // ===============================

  db.get(`SELECT COUNT(*) AS count FROM products`, (err, row) => {
    if (err) {
      console.error("Product check error:", err.message);
      return;
    }

    if (row.count === 0) {
      const products = [
        [
          "Wireless Headphones",
          "High-quality wireless headphones with clear sound.",
          2499,
          "Electronics",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
          20,
        ],
        [
          "Smart Watch",
          "Modern smartwatch with fitness tracking features.",
          3499,
          "Electronics",
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
          15,
        ],
        [
          "Bluetooth Speaker",
          "Portable speaker with powerful sound and deep bass.",
          1799,
          "Electronics",
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1",
          18,
        ],
        [
          "Wireless Mouse",
          "Ergonomic wireless mouse for work and everyday use.",
          799,
          "Electronics",
          "https://images.unsplash.com/photo-1527814050087-3793815479db",
          30,
        ],
        [
          "Mechanical Keyboard",
          "Comfortable mechanical keyboard for work and gaming.",
          2299,
          "Electronics",
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
          12,
        ],

        [
          "Running Shoes",
          "Comfortable shoes designed for everyday running.",
          1999,
          "Fashion",
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
          25,
        ],
        [
          "Backpack",
          "Stylish backpack suitable for college and travel.",
          1299,
          "Fashion",
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
          30,
        ],
        [
          "Denim Jacket",
          "Classic denim jacket suitable for casual outfits.",
          2199,
          "Fashion",
          "https://images.unsplash.com/photo-1551028719-00167b16eac5",
          14,
        ],
        [
          "Classic Sunglasses",
          "Stylish sunglasses with a modern classic design.",
          999,
          "Fashion",
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
          20,
        ],

        [
          "Coffee Mug",
          "Simple ceramic coffee mug for everyday use.",
          499,
          "Home",
          "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d",
          40,
        ],
        [
          "Desk Lamp",
          "LED desk lamp with a modern design.",
          899,
          "Home",
          "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
          18,
        ],
        [
          "Indoor Plant",
          "Beautiful indoor plant for home and office decoration.",
          699,
          "Home",
          "https://images.unsplash.com/photo-1485955900006-10f4d324d411",
          22,
        ],
        [
          "Wall Clock",
          "Minimal modern wall clock for your home.",
          799,
          "Home",
          "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c",
          16,
        ],

        [
          "Skincare Set",
          "Daily skincare essentials for a fresh routine.",
          1499,
          "Beauty",
          "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8",
          15,
        ],
        [
          "Perfume",
          "Elegant fragrance suitable for everyday occasions.",
          1899,
          "Beauty",
          "https://images.unsplash.com/photo-1541643600914-78b084683601",
          12,
        ],
        [
          "Makeup Kit",
          "Complete makeup kit for everyday styling.",
          1299,
          "Beauty",
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
          10,
        ],

        [
          "Yoga Mat",
          "Comfortable non-slip mat for yoga and workouts.",
          899,
          "Sports",
          "https://images.unsplash.com/photo-1592432678016-e910b452f9a2",
          25,
        ],
        [
          "Football",
          "Durable football suitable for training and recreation.",
          699,
          "Sports",
          "https://images.unsplash.com/photo-1579952363873-27f3bade9f55",
          20,
        ],
        [
          "Water Bottle",
          "Reusable sports water bottle for workouts and travel.",
          599,
          "Sports",
          "https://images.unsplash.com/photo-1602143407151-7111542de6e8",
          35,
        ],
        [
          "Dumbbell Set",
          "Compact dumbbell set for home workouts.",
          2499,
          "Sports",
          "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
          10,
        ],
      ];

      const statement = db.prepare(`
        INSERT INTO products
        (name, description, price, category, image, stock)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      products.forEach((product) => {
        statement.run(product);
      });

      statement.finalize(() => {
        console.log("Sample products added successfully!");
      });
    } else {
      console.log(`Products already exist: ${row.count}`);
    }
  });
});

// ===============================
// AUTHENTICATION MIDDLEWARE
// ===============================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authentication token required",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Invalid authentication token",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid or expired token",
      });
    }

    req.user = user;
    next();
  });
}

// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "ShopEase E-Commerce API is running!",
  });
});

// ===============================
// REGISTER
// ===============================

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `
      INSERT INTO users (name, email, password)
      VALUES (?, ?, ?)
      `,
      [name, email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(409).json({
              message: "Email already registered",
            });
          }

          return res.status(500).json({
            message: "Registration failed",
          });
        }

        res.status(201).json({
          message: "Registration successful",
          userId: this.lastID,
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

// ===============================
// LOGIN
// ===============================

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
        });
      }

      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      const validPassword = await bcrypt.compare(
        password,
        user.password
      );

      if (!validPassword) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    }
  );
});

// ===============================
// GET PRODUCTS
// ===============================

app.get("/api/products", (req, res) => {
  db.all(
    `SELECT * FROM products ORDER BY id DESC`,
    [],
    (err, products) => {
      if (err) {
        return res.status(500).json({
          message: "Unable to fetch products",
        });
      }

      res.json(products);
    }
  );
});

// ===============================
// GET SINGLE PRODUCT
// ===============================

app.get("/api/products/:id", (req, res) => {
  db.get(
    `SELECT * FROM products WHERE id = ?`,
    [req.params.id],
    (err, product) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
        });
      }

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.json(product);
    }
  );
});

// ===============================
// GET CART
// ===============================

app.get("/api/cart", authenticateToken, (req, res) => {
  const query = `
    SELECT
      cart.id,
      cart.quantity,
      products.id AS product_id,
      products.name,
      products.description,
      products.price,
      products.category,
      products.image,
      products.stock
    FROM cart
    JOIN products ON cart.product_id = products.id
    WHERE cart.user_id = ?
    ORDER BY cart.id DESC
  `;

  db.all(query, [req.user.id], (err, cart) => {
    if (err) {
      return res.status(500).json({
        message: "Unable to fetch cart",
      });
    }

    res.json(cart);
  });
});

// ===============================
// ADD TO CART
// ===============================

app.post("/api/cart", authenticateToken, (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({
      message: "Product ID is required",
    });
  }

  db.get(
    `SELECT * FROM products WHERE id = ?`,
    [productId],
    (err, product) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
        });
      }

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          message: "Not enough stock available",
        });
      }

      db.get(
        `
        SELECT * FROM cart
        WHERE user_id = ? AND product_id = ?
        `,
        [req.user.id, productId],
        (err, existingItem) => {
          if (err) {
            return res.status(500).json({
              message: "Database error",
            });
          }

          if (existingItem) {
            const newQuantity =
              existingItem.quantity + quantity;

            if (newQuantity > product.stock) {
              return res.status(400).json({
                message: "Not enough stock available",
              });
            }

            db.run(
              `
              UPDATE cart
              SET quantity = ?
              WHERE id = ?
              `,
              [newQuantity, existingItem.id],
              (err) => {
                if (err) {
                  return res.status(500).json({
                    message: "Unable to update cart",
                  });
                }

                res.json({
                  message: "Cart updated successfully",
                });
              }
            );
          } else {
            db.run(
              `
              INSERT INTO cart
              (user_id, product_id, quantity)
              VALUES (?, ?, ?)
              `,
              [req.user.id, productId, quantity],
              function (err) {
                if (err) {
                  return res.status(500).json({
                    message: "Unable to add to cart",
                  });
                }

                res.status(201).json({
                  message: "Product added to cart",
                  cartId: this.lastID,
                });
              }
            );
          }
        }
      );
    }
  );
});

// ===============================
// UPDATE CART
// ===============================

app.put("/api/cart/:id", authenticateToken, (req, res) => {
  const { quantity } = req.body;
  const cartId = req.params.id;

  if (!quantity || quantity < 1) {
    return res.status(400).json({
      message: "Quantity must be at least 1",
    });
  }

  db.get(
    `
    SELECT cart.*, products.stock
    FROM cart
    JOIN products ON cart.product_id = products.id
    WHERE cart.id = ? AND cart.user_id = ?
    `,
    [cartId, req.user.id],
    (err, item) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
        });
      }

      if (!item) {
        return res.status(404).json({
          message: "Cart item not found",
        });
      }

      if (quantity > item.stock) {
        return res.status(400).json({
          message: "Not enough stock available",
        });
      }

      db.run(
        `
        UPDATE cart
        SET quantity = ?
        WHERE id = ? AND user_id = ?
        `,
        [quantity, cartId, req.user.id],
        (err) => {
          if (err) {
            return res.status(500).json({
              message: "Unable to update cart",
            });
          }

          res.json({
            message: "Cart updated successfully",
          });
        }
      );
    }
  );
});

// ===============================
// REMOVE FROM CART
// ===============================

app.delete("/api/cart/:id", authenticateToken, (req, res) => {
  db.run(
    `
    DELETE FROM cart
    WHERE id = ? AND user_id = ?
    `,
    [req.params.id, req.user.id],
    function (err) {
      if (err) {
        return res.status(500).json({
          message: "Unable to remove cart item",
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          message: "Cart item not found",
        });
      }

      res.json({
        message: "Item removed from cart",
      });
    }
  );
});

// ===============================
// CHECKOUT / CREATE ORDER
// ===============================

app.post("/api/orders", authenticateToken, (req, res) => {
  const userId = req.user.id;

  const cartQuery = `
    SELECT
      cart.id,
      cart.product_id,
      cart.quantity,
      products.price,
      products.stock
    FROM cart
    JOIN products ON cart.product_id = products.id
    WHERE cart.user_id = ?
  `;

  db.all(cartQuery, [userId], (err, cartItems) => {
    if (err) {
      return res.status(500).json({
        message: "Unable to fetch cart",
      });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        return res.status(400).json({
          message: "Not enough stock available",
        });
      }
    }

    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    db.run(
      `
      INSERT INTO orders (user_id, total, status)
      VALUES (?, ?, ?)
      `,
      [userId, total, "Placed"],
      function (err) {
        if (err) {
          return res.status(500).json({
            message: "Unable to create order",
          });
        }

        const orderId = this.lastID;

        const itemStatement = db.prepare(`
          INSERT INTO order_items
          (order_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
        `);

        let completed = 0;
        let hasError = false;

        cartItems.forEach((item) => {
          itemStatement.run(
            [
              orderId,
              item.product_id,
              item.quantity,
              item.price,
            ],
            (err) => {
              if (err && !hasError) {
                hasError = true;
                itemStatement.finalize();

                return res.status(500).json({
                  message: "Unable to create order items",
                });
              }

              db.run(
                `
                UPDATE products
                SET stock = stock - ?
                WHERE id = ?
                `,
                [item.quantity, item.product_id],
                (err) => {
                  if (err && !hasError) {
                    hasError = true;
                    itemStatement.finalize();

                    return res.status(500).json({
                      message: "Unable to update stock",
                    });
                  }

                  completed++;

                  if (
                    completed === cartItems.length &&
                    !hasError
                  ) {
                    itemStatement.finalize();

                    db.run(
                      `
                      DELETE FROM cart
                      WHERE user_id = ?
                      `,
                      [userId],
                      (err) => {
                        if (err) {
                          return res.status(500).json({
                            message:
                              "Order created but cart could not be cleared",
                          });
                        }

                        res.status(201).json({
                          message:
                            "Order placed successfully",
                          orderId,
                          total,
                        });
                      }
                    );
                  }
                }
              );
            }
          );
        });
      }
    );
  });
});

// ===============================
// GET ORDERS
// ===============================

app.get("/api/orders", authenticateToken, (req, res) => {
  db.all(
    `
    SELECT *
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
    `,
    [req.user.id],
    (err, orders) => {
      if (err) {
        return res.status(500).json({
          message: "Unable to fetch orders",
        });
      }

      res.json(orders);
    }
  );
});

// ===============================
// GET SINGLE ORDER
// ===============================

app.get(
  "/api/orders/:id",
  authenticateToken,
  (req, res) => {
    db.get(
      `
      SELECT *
      FROM orders
      WHERE id = ? AND user_id = ?
      `,
      [req.params.id, req.user.id],
      (err, order) => {
        if (err) {
          return res.status(500).json({
            message: "Database error",
          });
        }

        if (!order) {
          return res.status(404).json({
            message: "Order not found",
          });
        }

        db.all(
          `
          SELECT
            order_items.*,
            products.name,
            products.image
          FROM order_items
          JOIN products
            ON order_items.product_id = products.id
          WHERE order_items.order_id = ?
          `,
          [order.id],
          (err, items) => {
            if (err) {
              return res.status(500).json({
                message: "Unable to fetch order items",
              });
            }

            res.json({
              order,
              items,
            });
          }
        );
      }
    );
  }
);

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
  console.log(
    `E-Commerce server running on http://localhost:${PORT}`
  );
});