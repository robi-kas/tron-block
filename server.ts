import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database Initialization (SQLite)
const dbPath = path.join(process.cwd(), "tron_block.db");
const db = new Database(dbPath);

function initDB() {
  try {
    // Users Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT UNIQUE NOT NULL,
        referral_id INTEGER,
        level INTEGER DEFAULT 0,
        mode TEXT DEFAULT 'test',
        balance REAL DEFAULT 0.00,
        total_rewards REAL DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seats Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS seats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        level_name TEXT NOT NULL,
        origin TEXT,
        status TEXT DEFAULT 'active',
        tx_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Earnings Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS earnings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        source_order_id INTEGER,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'completed',
        tx_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Config Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT UNIQUE NOT NULL,
        data TEXT NOT NULL,
        is_active INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Admin Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin if missing
    const adminCheck: any = db.prepare("SELECT COUNT(*) as count FROM admins").get();
    if (adminCheck.count === 0) {
      db.prepare("INSERT INTO admins (username, password, role) VALUES (?, ?, ?)")
        .run("admin", "admin123", "superadmin");
    }

    // Insert default config if missing
    const countCheck: any = db.prepare("SELECT COUNT(*) as count FROM system_config").get();
    if (countCheck.count === 0) {
      const defaultConfig = {
        version: "V2026.04.24",
        lastUpdated: new Date().toISOString(),
        activationFee: 80,
        protocolName: "BLOCK MATRIX",
        descriptions: {
          activation: "Activate a seat for 80 USDT to enter the global matrix ecosystem.",
          matrix: "Participate in the automated public matrix with spillover mechanisms.",
          differential: "Earn bonuses based on the level gap between you and your downline performance.",
          buyback: "System buyback triggers automatic seat creation for sustainability."
        },
        levels: [
          { rank: 1, name: "V1", upgradeCost: 0, reward: 500, revenue: 2000, minOrders: 4, rewardRatio: 0.25 },
          { rank: 2, name: "V2", upgradeCost: 200, reward: 1000, revenue: 11000, minOrders: 22, rewardRatio: 0.4091 },
          { rank: 3, name: "V3", upgradeCost: 500, reward: 2500, revenue: 47000, minOrders: 94, rewardRatio: 0.5319 },
          { rank: 4, name: "V4", upgradeCost: 1200, reward: 5000, revenue: 191000, minOrders: 382, rewardRatio: 0.6126 },
          { rank: 5, name: "V5", upgradeCost: 3000, reward: 10000, revenue: 767000, minOrders: 1534, rewardRatio: 0.6584 },
          { rank: 6, name: "V6", upgradeCost: 8000, reward: 20000, revenue: 3071000, minOrders: 6142, rewardRatio: 0.6828 },
          { rank: 7, name: "V7", upgradeCost: 20000, reward: 48000, revenue: 12286500, minOrders: 24573, rewardRatio: 0.6961 },
          { rank: 8, name: "V8", upgradeCost: 50000, reward: 96000, revenue: 49151000, minOrders: 98302, rewardRatio: 0.7033 },
          { rank: 9, name: "V9", upgradeCost: 120000, reward: 880000, revenue: 196606500, minOrders: 393214, rewardRatio: 0.7106 },
          { rank: 10, name: "V10", upgradeCost: 300000, reward: 8800000, revenue: 786431000, minOrders: 1572862, rewardRatio: 0.7258 }
        ],
        matrixRules: {
          spilloverEnabled: true,
          reinvestmentRatio: 0.3,
          buybackEnabled: true
        },
        differentialBonus: {
          enabled: true,
          maxDepth: 100
        }
      };
      db.prepare("INSERT INTO system_config (version, data, is_active) VALUES (?, ?, ?)")
        .run("V2026.04.24", JSON.stringify(defaultConfig), 1);
    }

    console.log("SQLite Local Database Initialized Successfully");
  } catch (err) {
    console.error("Failed to initialize SQLite:", err);
  }
}

const app = express();

async function startServer() {
  initDB();
  const PORT = 3000;

  app.use(express.json());

  // API Request Logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API Request] ${req.method} ${req.path}`);
    }
    next();
  });

  // System Configuration (Source of Truth)
  app.get("/api/matrix/config", (req, res) => {
    try {
      const row: any = db.prepare("SELECT data FROM system_config WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1").get();
      if (row) {
        return res.json(JSON.parse(row.data));
      }
      res.status(404).json({ error: "Config not found" });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // Account Info
  app.get("/api/matrix/account/:address", (req, res) => {
    try {
      const { address } = req.params;
      const user: any = db.prepare("SELECT * FROM users WHERE address = ?").get(address);
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const seats = db.prepare("SELECT * FROM seats WHERE user_id = ? ORDER BY created_at DESC").all(user.id);
      const orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 10").all(user.id);
      
      res.json({
        user,
        seats,
        recentOrders: orders
      });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // Registration
  app.post("/api/matrix/register", (req, res) => {
    try {
      const { address, uplineId, mode = 'test' } = req.body;
      
      const configRow: any = db.prepare("SELECT data FROM system_config WHERE is_active = 1 LIMIT 1").get();
      const config = JSON.parse(configRow.data);
      const fee = config.activationFee;

      const runRegistration = db.transaction(() => {
        const result = db.prepare(
          "INSERT INTO users (address, referral_id, level, mode, balance) VALUES (?, ?, 1, ?, 0)"
        ).run(address, uplineId, mode);
        
        const userId = result.lastInsertRowid;

        db.prepare(
          "INSERT INTO seats (user_id, level_name, origin, tx_hash) VALUES (?, 'V1', 'First Purchase', ?)"
        ).run(userId, "0x" + Math.random().toString(16).slice(2, 66));

        db.prepare(
          "INSERT INTO orders (user_id, amount, type, tx_hash) VALUES (?, ?, 'activation', ?)"
        ).run(userId, fee, "0x" + Math.random().toString(16).slice(2, 66));

        return userId;
      });

      const userId = runRegistration();
      res.json({ success: true, userId });
    } catch (err) {
      res.status(500).json({ error: "Registration failed", details: err });
    }
  });

  // Simulated Deposit
  app.post("/api/matrix/deposit", (req, res) => {
    try {
      const { address, amount } = req.body;
      const user: any = db.prepare("SELECT id FROM users WHERE address = ?").get(address);
      if (!user) return res.status(404).json({ error: "User not found" });

      db.transaction(() => {
        db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(amount, user.id);
        db.prepare("INSERT INTO orders (user_id, amount, type, tx_hash) VALUES (?, ?, 'deposit', ?)")
          .run(user.id, amount, "0x" + Math.random().toString(16).slice(2, 66));
      })();

      res.json({ success: true, newBalance: amount });
    } catch (err) {
      res.status(500).json({ error: "Deposit failed" });
    }
  });

  // Buyback Logic (Automatic Reinvestment Simulation)
  app.post("/api/matrix/buyback", (req, res) => {
    try {
      const { address } = req.body;
      const user: any = db.prepare("SELECT id, total_rewards FROM users WHERE address = ?").get(address);
      if (!user) return res.status(404).json({ error: "User not found" });

      const configRow: any = db.prepare("SELECT data FROM system_config WHERE is_active = 1 LIMIT 1").get();
      const config = JSON.parse(configRow.data);
      const buybackFee = config.activationFee; // Using activation fee as buyback cost

      // Threshold: buyback happens if total_rewards > some multiple of activationFee and they don't have many seats
      const seatCount: any = db.prepare("SELECT COUNT(*) as count FROM seats WHERE user_id = ?").get(user.id);
      
      if (user.total_rewards > (seatCount.count * buybackFee) + 100) {
        db.transaction(() => {
           db.prepare("INSERT INTO seats (user_id, level_name, origin, tx_hash) VALUES (?, 'V1', 'System Buyback', ?)")
             .run(user.id, "0x" + Math.random().toString(16).slice(2, 66));
           
           db.prepare("INSERT INTO orders (user_id, amount, type, tx_hash) VALUES (?, ?, 'buyback', ?)")
             .run(user.id, buybackFee, "0x" + Math.random().toString(16).slice(2, 66));
        })();
        res.json({ success: true, message: "Buyback triggered" });
      } else {
        res.json({ success: false, message: "Threshold not met" });
      }
    } catch (err) {
      res.status(500).json({ error: "Buyback failed" });
    }
  });

  // Team Analytics
  app.get("/api/matrix/team/:address", (req, res) => {
    try {
      const { address } = req.params;
      const user: any = db.prepare("SELECT id FROM users WHERE address = ?").get(address);
      if (!user) return res.status(404).json({ error: "User not found" });
      const userId = user.id;

      const directs = db.prepare("SELECT * FROM users WHERE referral_id = ?").all(userId);
      
      const counts: any = { v1: 0, v2: 0, v3: 0, v4: 0, v5: 0, v6: 0, v7: 0, v8: 0, v9: 0, v10: 0 };
      directs.forEach((u: any) => {
        const key = `v${u.level}`;
        if (counts[key] !== undefined) counts[key]++;
      });

      const performance: any = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as totalVolume 
        FROM orders 
        WHERE user_id IN (SELECT id FROM users WHERE referral_id = ?)
      `).get(userId);

      res.json({
        directs,
        counts,
        performance: {
          teamVolume: performance.totalVolume,
          recentUpgrades: []
        }
      });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // Traceable Earnings
  app.get("/api/matrix/earnings/:address", (req, res) => {
    try {
      const { address } = req.params;
      const user: any = db.prepare("SELECT id FROM users WHERE address = ?").get(address);
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const earnings = db.prepare(`
        SELECT e.*, o.tx_hash, u.address as source_address
        FROM earnings e
        LEFT JOIN orders o ON e.source_order_id = o.id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE e.user_id = ?
        ORDER BY e.created_at DESC
      `).all(user.id);

      res.json(earnings.map((e: any) => ({
        ...e,
        metadata: e.metadata ? JSON.parse(e.metadata) : {}
      })));
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // Unified Transactions
  app.get("/api/matrix/transactions/:address", (req, res) => {
    try {
      const { address } = req.params;
      const user: any = db.prepare("SELECT id FROM users WHERE address = ?").get(address);
      if (!user) return res.status(404).json({ error: "User not found" });
      const userId = user.id;

      const orders = db.prepare(
        "SELECT id, type, amount, status, created_at as timestamp FROM orders WHERE user_id = ?"
      ).all(userId);
      const financial = orders.map((o: any) => ({ ...o, category: 'financial' }));
        
      const earnings = db.prepare(
        "SELECT id, type, amount, created_at as timestamp FROM earnings WHERE user_id = ?"
      ).all(userId);
      const income = earnings.map((e: any) => ({ ...e, category: 'income', status: 'Success' }));
        
      const all = [...financial, ...income].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      res.json(all);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/matrix/stats", (req, res) => {
    res.json({
      totalUsers: 142058 + Math.floor(Math.random() * 10),
      allTimeUSDT: 5240320,
      newUsers24h: 342,
      turnover24h: 124500,
      ruleVersion: "V2026.04.24"
    });
  });

  // Demo Account Generator (for Client Testing)
  app.post("/api/matrix/demo/create", (req, res) => {
    try {
      const { address } = req.body;
      if (!address) return res.status(400).json({ error: "Address required" });

      const runDemoGen = db.transaction(() => {
        // Delete if exists to reset
        db.prepare("DELETE FROM users WHERE address = ?").run(address);
        
        // Create V5 User
        const result = db.prepare(
          "INSERT INTO users (address, referral_id, level, mode, balance, total_rewards) VALUES (?, 100001, 5, 'demo', 5000, 12500)"
        ).run(address);
        
        const userId = result.lastInsertRowid;

        // Add some seats
        for (let i = 1; i <= 5; i++) {
          db.prepare(
            "INSERT INTO seats (user_id, level_name, origin, status) VALUES (?, ?, 'Demo Injection', 'active')"
          ).run(userId, `V${i}`);
        }

        // Add some earnings
        const types = ['upgrade', 'matrix', 'differential'];
        for (let i = 0; i < 10; i++) {
          db.prepare(
            "INSERT INTO earnings (user_id, amount, type, metadata) VALUES (?, ?, ?, ?)"
          ).run(userId, 50 + (i * 10), types[i % 3], JSON.stringify({ ratio: 0.1, source: '0xMock' }));
        }

        return userId;
      });

      const userId = runDemoGen();
      res.json({ success: true, userId, message: "Demo account V5 created" });
    } catch (err) {
      res.status(500).json({ error: "Demo creation failed", details: err });
    }
  });

  // --- Admin API Endpoints ---

  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    const admin: any = db.prepare("SELECT * FROM admins WHERE username = ? AND password = ?").get(username, password);
    if (admin) {
      res.json({ success: true, admin: { id: admin.id, username: admin.username, role: admin.role } });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  });

  app.get("/api/admin/users", (req, res) => {
    try {
      const users = db.prepare("SELECT * FROM users ORDER BY created_at DESC").all();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/config/update", (req, res) => {
    try {
      const { data, version } = req.body;
      db.transaction(() => {
        db.prepare("UPDATE system_config SET is_active = 0").run();
        db.prepare("INSERT INTO system_config (version, data, is_active) VALUES (?, ?, ?)")
          .run(version, JSON.stringify(data), 1);
      })();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update config" });
    }
  });

  app.get("/api/admin/orders", (req, res) => {
    try {
      const orders = db.prepare(`
        SELECT o.*, u.address 
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC
      `).all();
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/admin/users/update-balance", (req, res) => {
    try {
      const { userId, amount } = req.body;
      db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(amount, userId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update balance" });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

// Always start the server (attach routes and init DB)
startServer();

export default app;
