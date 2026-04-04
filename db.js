const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'origin.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDb() {
  const db = getDb();

  db.exec(`
    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      avatar_url TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      brand_name TEXT DEFAULT '',
      specialty TEXT DEFAULT '',
      website TEXT DEFAULT '',
      twitter TEXT DEFAULT '',
      role TEXT DEFAULT 'buyer' CHECK(role IN ('buyer','creator','admin')),
      is_verified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Categories
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      zone TEXT NOT NULL CHECK(zone IN ('dx','design','component','education')),
      icon TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    );

    -- Assets (products/listings)
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      short_description TEXT DEFAULT '',
      category_id TEXT,
      zone TEXT DEFAULT 'dx',
      price_personal INTEGER DEFAULT 0,
      price_commercial INTEGER DEFAULT 0,
      price_team INTEGER DEFAULT 0,
      thumbnail_url TEXT DEFAULT '',
      images TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      tool TEXT DEFAULT '',
      setup_guide TEXT DEFAULT '',
      requirements TEXT DEFAULT '',
      file_list TEXT DEFAULT '[]',
      changelog TEXT DEFAULT '[]',
      license_info TEXT DEFAULT '',
      version TEXT DEFAULT '1.0',
      download_url TEXT DEFAULT '',
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft','review','published','rejected','archived')),
      sales_count INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      avg_rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (creator_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    -- Cart Items
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      license_type TEXT DEFAULT 'personal' CHECK(license_type IN ('personal','commercial','team')),
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, asset_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (asset_id) REFERENCES assets(id)
    );

    -- Orders
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      total_amount INTEGER NOT NULL DEFAULT 0,
      tax_amount INTEGER NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'completed' CHECK(status IN ('pending','completed','refunded','disputed')),
      payment_method TEXT DEFAULT 'card',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Order Items
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      license_type TEXT DEFAULT 'personal',
      price INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (asset_id) REFERENCES assets(id)
    );

    -- Reviews
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      asset_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      title TEXT DEFAULT '',
      body TEXT DEFAULT '',
      is_flagged INTEGER DEFAULT 0,
      creator_reply TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (asset_id) REFERENCES assets(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Favorites
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, asset_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (asset_id) REFERENCES assets(id)
    );

    -- View History
    CREATE TABLE IF NOT EXISTS view_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      viewed_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (asset_id) REFERENCES assets(id)
    );

    -- Q&A
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      asset_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      body TEXT NOT NULL,
      creator_reply TEXT DEFAULT '',
      is_resolved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (asset_id) REFERENCES assets(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT DEFAULT '',
      is_read INTEGER DEFAULT 0,
      link TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_assets_creator ON assets(creator_id);
    CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
    CREATE INDEX IF NOT EXISTS idx_assets_zone ON assets(zone);
    CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category_id);
    CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_asset ON reviews(asset_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_history_user ON view_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  `);

  // Seed categories if empty
  const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
  if (catCount === 0) {
    const insertCat = db.prepare('INSERT INTO categories (id, name, zone, icon, sort_order) VALUES (?, ?, ?, ?, ?)');
    const cats = [
      ['cat-n8n', 'n8nワークフロー', 'dx', 'ph-flow-arrow', 1],
      ['cat-notion', 'Notionテンプレート', 'dx', 'ph-layout', 2],
      ['cat-excel', 'Excel・スプレッドシート', 'dx', 'ph-table', 3],
      ['cat-gpt', 'GPTプロンプト', 'dx', 'ph-chat-circle-dots', 4],
      ['cat-api', 'API連携ツール', 'dx', 'ph-plugs-connected', 5],
      ['cat-figma', 'Figmaテンプレート', 'design', 'ph-figma-logo', 6],
      ['cat-canva', 'Canvaテンプレート', 'design', 'ph-paint-brush', 7],
      ['cat-uikit', 'UIキット', 'design', 'ph-squares-four', 8],
      ['cat-icon', 'アイコン・イラスト', 'design', 'ph-smiley', 9],
      ['cat-react', 'Reactコンポーネント', 'component', 'ph-atom', 10],
      ['cat-vue', 'Vueコンポーネント', 'component', 'ph-code', 11],
      ['cat-web', 'Webテンプレート', 'component', 'ph-browser', 12],
      ['cat-course', 'オンライン講座', 'education', 'ph-graduation-cap', 13],
      ['cat-ebook', 'eBook・ガイド', 'education', 'ph-book-open', 14],
    ];
    const tx = db.transaction(() => { for (const c of cats) insertCat.run(...c); });
    tx();
  }

  console.log('✅ Database initialized');
  return db;
}

module.exports = { getDb, initDb, uuidv4 };
