const express = require('express');
const path = require('path');
const multer = require('multer');
const { getDb, initDb, uuidv4 } = require('./db');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Static moved below for precedence over fallbacks

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Simple session store (in-memory for dev)
const sessions = {};
function getSession(req) {
  const sid = req.headers['x-session-id'];
  return sid ? sessions[sid] : null;
}

// Helper: hash password (simple for prototype)
function hashPw(pw) {
  return crypto.createHash('sha256').update(pw + 'origin_salt_2026').digest('hex');
}

// Helper: generate order number
function genOrderNum() {
  const d = new Date();
  const seq = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `ORG-${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${seq}`;
}

// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}

// ========== AUTH ==========
app.post('/api/auth/register', (req, res) => {
  const { email, password, display_name, username } = req.body;
  if (!email || !password || !display_name || !username) {
    return res.status(400).json({ error: '全ての項目を入力してください' });
  }
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (existing) return res.status(409).json({ error: 'このメールアドレスまたはユーザー名は既に使用されています' });

  const id = uuidv4();
  db.prepare('INSERT INTO users (id, email, password_hash, display_name, username) VALUES (?, ?, ?, ?, ?)').run(id, email, hashPw(password), display_name, username);

  const sid = uuidv4();
  sessions[sid] = { userId: id };
  const user = db.prepare('SELECT id, email, display_name, username, role, avatar_url, brand_name FROM users WHERE id = ?').get(id);
  res.json({ session_id: sid, user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || user.password_hash !== hashPw(password)) {
    return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
  }
  const sid = uuidv4();
  sessions[sid] = { userId: user.id };
  const { password_hash, ...safeUser } = user;
  res.json({ session_id: sid, user: safeUser });
});

app.get('/api/auth/me', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const db = getDb();
  const user = db.prepare('SELECT id, email, display_name, username, role, avatar_url, bio, brand_name, specialty, website, twitter, is_verified, created_at FROM users WHERE id = ?').get(session.userId);
  if (!user) return res.status(401).json({ error: 'ユーザーが見つかりません' });
  res.json(user);
});

app.put('/api/auth/profile', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const { display_name, bio, brand_name, specialty, website, twitter } = req.body;
  const db = getDb();
  db.prepare('UPDATE users SET display_name=?, bio=?, brand_name=?, specialty=?, website=?, twitter=?, updated_at=datetime("now") WHERE id=?')
    .run(display_name || '', bio || '', brand_name || '', specialty || '', website || '', twitter || '', session.userId);
  res.json({ ok: true });
});

app.post('/api/auth/logout', (req, res) => {
  const sid = req.headers['x-session-id'];
  if (sid) delete sessions[sid];
  res.json({ ok: true });
});

// ========== CATEGORIES ==========
app.get('/api/categories', (req, res) => {
  const db = getDb();
  const cats = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  res.json(cats);
});

// ========== ASSETS ==========
app.get('/api/assets', (req, res) => {
  const db = getDb();
  const { zone, category, search, sort, min_price, max_price, min_rating, tool, license, page = 1, limit = 20 } = req.query;
  let where = ['a.status = ?'];
  let params = ['published'];

  if (zone && zone !== 'all') { where.push('a.zone = ?'); params.push(zone); }
  if (category) { where.push('a.category_id = ?'); params.push(category); }
  if (search) { where.push('(a.title LIKE ? OR a.description LIKE ? OR a.tags LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (min_price) { where.push('a.price_personal >= ?'); params.push(parseInt(min_price)); }
  if (max_price) { where.push('a.price_personal <= ?'); params.push(parseInt(max_price)); }
  if (min_rating) { where.push('a.avg_rating >= ?'); params.push(parseFloat(min_rating)); }
  if (tool) { where.push('a.tool = ?'); params.push(tool); }

  let orderBy = 'a.created_at DESC';
  if (sort === 'popular') orderBy = 'a.sales_count DESC';
  else if (sort === 'price_asc') orderBy = 'a.price_personal ASC';
  else if (sort === 'price_desc') orderBy = 'a.price_personal DESC';
  else if (sort === 'rating') orderBy = 'a.avg_rating DESC';

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const countSql = `SELECT COUNT(*) as total FROM assets a WHERE ${where.join(' AND ')}`;
  const total = db.prepare(countSql).get(...params).total;

  const sql = `SELECT a.*, u.display_name as creator_name, u.brand_name, u.avatar_url as creator_avatar, u.is_verified as creator_verified, c.name as category_name
    FROM assets a
    LEFT JOIN users u ON a.creator_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE ${where.join(' AND ')}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);
  const assets = db.prepare(sql).all(...params);

  res.json({ assets, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

app.get('/api/assets/:id', (req, res) => {
  const db = getDb();
  const asset = db.prepare(`
    SELECT a.*, u.display_name as creator_name, u.brand_name, u.avatar_url as creator_avatar, u.is_verified as creator_verified, u.bio as creator_bio, c.name as category_name
    FROM assets a
    LEFT JOIN users u ON a.creator_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.id = ?
  `).get(req.params.id);
  if (!asset) return res.status(404).json({ error: 'アセットが見つかりません' });

  // Increment view count
  db.prepare('UPDATE assets SET view_count = view_count + 1 WHERE id = ?').run(req.params.id);

  // Record view history if logged in
  const session = getSession(req);
  if (session) {
    const histId = uuidv4();
    db.prepare('INSERT INTO view_history (id, user_id, asset_id) VALUES (?, ?, ?)').run(histId, session.userId, req.params.id);
  }

  // Get reviews
  const reviews = db.prepare(`SELECT r.*, u.display_name as reviewer_name, u.avatar_url as reviewer_avatar
    FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.asset_id = ? ORDER BY r.created_at DESC LIMIT 10`).all(req.params.id);

  // Get questions
  const questions = db.prepare(`SELECT q.*, u.display_name as asker_name FROM questions q LEFT JOIN users u ON q.user_id = u.id WHERE q.asset_id = ? ORDER BY q.created_at DESC LIMIT 10`).all(req.params.id);

  // Check if favorited
  let is_favorited = false;
  if (session) {
    const fav = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND asset_id = ?').get(session.userId, req.params.id);
    is_favorited = !!fav;
  }

  res.json({ ...asset, reviews, questions, is_favorited });
});

// Create asset (listing)
app.post('/api/assets', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 5 },
  { name: 'files', maxCount: 5 }
]), (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });

  const db = getDb();
  const { title, description, short_description, category_id, zone, price_personal, price_commercial, price_team, tags, tool, setup_guide, requirements, license_info, status } = req.body;

  const id = uuidv4();
  let thumbnail_url = '';
  let imageUrls = [];
  let fileList = [];

  if (req.files && req.files.thumbnail) {
    thumbnail_url = '/uploads/' + req.files.thumbnail[0].filename;
  }
  if (req.files && req.files.images) {
    imageUrls = req.files.images.map(f => '/uploads/' + f.filename);
  }
  if (req.files && req.files.files) {
    fileList = req.files.files.map(f => ({ name: f.originalname, size: f.size, url: '/uploads/' + f.filename }));
  }

  db.prepare(`INSERT INTO assets (id, creator_id, title, description, short_description, category_id, zone, price_personal, price_commercial, price_team, thumbnail_url, images, tags, tool, setup_guide, requirements, file_list, license_info, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, session.userId, title || '', description || '', short_description || '',
    category_id || null, zone || 'dx',
    parseInt(price_personal) || 0, parseInt(price_commercial) || 0, parseInt(price_team) || 0,
    thumbnail_url, JSON.stringify(imageUrls), tags || '[]', tool || '',
    setup_guide || '', requirements || '', JSON.stringify(fileList), license_info || '',
    status || 'draft'
  );

  // Update user role to creator
  db.prepare("UPDATE users SET role = 'creator' WHERE id = ? AND role = 'buyer'").run(session.userId);

  res.json({ id, message: 'アセットが作成されました' });
});

app.put('/api/assets/:id', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const db = getDb();
  const asset = db.prepare('SELECT * FROM assets WHERE id = ? AND creator_id = ?').get(req.params.id, session.userId);
  if (!asset) return res.status(404).json({ error: 'アセットが見つかりません' });

  const fields = req.body;
  const updates = [];
  const params = [];
  for (const [k, v] of Object.entries(fields)) {
    if (['title','description','short_description','category_id','zone','price_personal','price_commercial','price_team','tags','tool','setup_guide','requirements','license_info','status','version'].includes(k)) {
      updates.push(`${k} = ?`);
      params.push(v);
    }
  }
  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);
    db.prepare(`UPDATE assets SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }
  res.json({ ok: true });
});

// ========== CART ==========
app.get('/api/cart', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const db = getDb();
  const items = db.prepare(`
    SELECT ci.*, a.title, a.thumbnail_url, a.price_personal, a.price_commercial, a.price_team,
           u.display_name as creator_name, u.brand_name
    FROM cart_items ci
    JOIN assets a ON ci.asset_id = a.id
    LEFT JOIN users u ON a.creator_id = u.id
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
  `).all(session.userId);
  res.json(items);
});

app.post('/api/cart', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const { asset_id, license_type = 'personal' } = req.body;
  if (!asset_id) return res.status(400).json({ error: 'asset_id が必要です' });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM cart_items WHERE user_id = ? AND asset_id = ?').get(session.userId, asset_id);
  if (existing) {
    db.prepare('UPDATE cart_items SET license_type = ? WHERE id = ?').run(license_type, existing.id);
    return res.json({ ok: true, message: 'ライセンスを更新しました' });
  }

  const id = uuidv4();
  db.prepare('INSERT INTO cart_items (id, user_id, asset_id, license_type) VALUES (?, ?, ?, ?)').run(id, session.userId, asset_id, license_type);
  res.json({ ok: true, id });
});

app.put('/api/cart/:id', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const { license_type } = req.body;
  const db = getDb();
  db.prepare('UPDATE cart_items SET license_type = ? WHERE id = ? AND user_id = ?').run(license_type, req.params.id, session.userId);
  res.json({ ok: true });
});

app.delete('/api/cart/:id', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const db = getDb();
  db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(req.params.id, session.userId);
  res.json({ ok: true });
});

// ========== ORDERS ==========
app.post('/api/orders', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const db = getDb();

  const cartItems = db.prepare(`
    SELECT ci.*, a.price_personal, a.price_commercial, a.price_team, a.title
    FROM cart_items ci JOIN assets a ON ci.asset_id = a.id WHERE ci.user_id = ?
  `).all(session.userId);

  if (cartItems.length === 0) return res.status(400).json({ error: 'カートが空です' });

  const orderId = uuidv4();
  const orderNumber = genOrderNum();
  let subtotal = 0;

  const insertItem = db.prepare('INSERT INTO order_items (id, order_id, asset_id, license_type, price) VALUES (?, ?, ?, ?, ?)');
  const updateSales = db.prepare('UPDATE assets SET sales_count = sales_count + 1 WHERE id = ?');

  const tx = db.transaction(() => {
    for (const item of cartItems) {
      let price = item.price_personal;
      if (item.license_type === 'commercial') price = item.price_commercial;
      if (item.license_type === 'team') price = item.price_team;
      subtotal += price;
      insertItem.run(uuidv4(), orderId, item.asset_id, item.license_type, price);
      updateSales.run(item.asset_id);
    }
    const taxAmount = Math.floor(subtotal * 0.1);
    const totalAmount = subtotal + taxAmount;
    db.prepare('INSERT INTO orders (id, order_number, user_id, total_amount, tax_amount, status) VALUES (?, ?, ?, ?, ?, ?)').run(orderId, orderNumber, session.userId, totalAmount, taxAmount, 'completed');
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(session.userId);
  });
  tx();

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  const items = db.prepare(`SELECT oi.*, a.title, a.thumbnail_url FROM order_items oi JOIN assets a ON oi.asset_id = a.id WHERE oi.order_id = ?`).all(orderId);
  res.json({ order, items });
});

app.get('/api/orders', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const db = getDb();
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(session.userId);
  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, session.userId);
  if (!order) return res.status(404).json({ error: '注文が見つかりません' });
  const items = db.prepare(`SELECT oi.*, a.title, a.thumbnail_url FROM order_items oi JOIN assets a ON oi.asset_id = a.id WHERE oi.order_id = ?`).all(order.id);
  res.json({ order, items });
});

// ========== LIBRARY (purchased assets) ==========
app.get('/api/library', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const db = getDb();
  const items = db.prepare(`
    SELECT DISTINCT a.*, oi.license_type, oi.price as purchase_price, o.created_at as purchased_at,
           u.display_name as creator_name, u.brand_name
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN assets a ON oi.asset_id = a.id
    LEFT JOIN users u ON a.creator_id = u.id
    WHERE o.user_id = ? AND o.status = 'completed'
    ORDER BY o.created_at DESC
  `).all(session.userId);
  res.json(items);
});

// ========== REVIEWS ==========
app.post('/api/reviews', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const { asset_id, rating, title, body } = req.body;
  if (!asset_id || !rating) return res.status(400).json({ error: '評価とアセットIDが必要です' });

  const db = getDb();
  const id = uuidv4();
  db.prepare('INSERT INTO reviews (id, asset_id, user_id, rating, title, body) VALUES (?, ?, ?, ?, ?, ?)').run(id, asset_id, session.userId, rating, title || '', body || '');

  // Update asset avg_rating
  const stats = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE asset_id = ?').get(asset_id);
  db.prepare('UPDATE assets SET avg_rating = ?, review_count = ? WHERE id = ?').run(Math.round(stats.avg * 10) / 10, stats.cnt, asset_id);

  res.json({ id });
});

app.get('/api/reviews/:assetId', (req, res) => {
  const db = getDb();
  const reviews = db.prepare(`SELECT r.*, u.display_name as reviewer_name, u.avatar_url as reviewer_avatar
    FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.asset_id = ? ORDER BY r.created_at DESC`).all(req.params.assetId);
  res.json(reviews);
});

// ========== FAVORITES ==========
app.get('/api/favorites', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const db = getDb();
  const items = db.prepare(`
    SELECT a.*, f.created_at as favorited_at, u.display_name as creator_name, u.brand_name
    FROM favorites f
    JOIN assets a ON f.asset_id = a.id
    LEFT JOIN users u ON a.creator_id = u.id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `).all(session.userId);
  res.json(items);
});

app.post('/api/favorites', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const { asset_id } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND asset_id = ?').get(session.userId, asset_id);
  if (existing) {
    db.prepare('DELETE FROM favorites WHERE id = ?').run(existing.id);
    return res.json({ ok: true, favorited: false });
  }
  const id = uuidv4();
  db.prepare('INSERT INTO favorites (id, user_id, asset_id) VALUES (?, ?, ?)').run(id, session.userId, asset_id);
  res.json({ ok: true, favorited: true });
});

// ========== VIEW HISTORY ==========
app.get('/api/history', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const db = getDb();
  const items = db.prepare(`
    SELECT a.*, vh.viewed_at, u.display_name as creator_name, u.brand_name
    FROM view_history vh
    JOIN assets a ON vh.asset_id = a.id
    LEFT JOIN users u ON a.creator_id = u.id
    WHERE vh.user_id = ?
    ORDER BY vh.viewed_at DESC
    LIMIT 50
  `).all(session.userId);
  res.json(items);
});

app.delete('/api/history', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const db = getDb();
  db.prepare('DELETE FROM view_history WHERE user_id = ?').run(session.userId);
  res.json({ ok: true });
});

// ========== Q&A ==========
app.post('/api/questions', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const { asset_id, body } = req.body;
  const db = getDb();
  const id = uuidv4();
  db.prepare('INSERT INTO questions (id, asset_id, user_id, body) VALUES (?, ?, ?, ?)').run(id, asset_id, session.userId, body || '');
  res.json({ id });
});

app.put('/api/questions/:id/reply', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const { reply } = req.body;
  const db = getDb();
  // Only the asset creator can reply
  const q = db.prepare(`SELECT q.*, a.creator_id FROM questions q JOIN assets a ON q.asset_id = a.id WHERE q.id = ?`).get(req.params.id);
  if (!q || q.creator_id !== session.userId) return res.status(403).json({ error: '権限がありません' });
  db.prepare('UPDATE questions SET creator_reply = ?, is_resolved = 1 WHERE id = ?').run(reply, req.params.id);
  res.json({ ok: true });
});

// ========== CREATOR DASHBOARD ==========
app.get('/api/dashboard/creator', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const db = getDb();
  const userId = session.userId;

  const assets = db.prepare('SELECT * FROM assets WHERE creator_id = ? ORDER BY created_at DESC').all(userId);
  const totalSales = db.prepare(`
    SELECT COALESCE(SUM(oi.price), 0) as revenue, COUNT(*) as count
    FROM order_items oi JOIN assets a ON oi.asset_id = a.id WHERE a.creator_id = ?
  `).get(userId);
  const avgRating = db.prepare('SELECT AVG(avg_rating) as avg FROM assets WHERE creator_id = ? AND review_count > 0').get(userId);
  const totalViews = db.prepare('SELECT COALESCE(SUM(view_count), 0) as views FROM assets WHERE creator_id = ?').get(userId);
  const pendingQA = db.prepare(`SELECT COUNT(*) as c FROM questions q JOIN assets a ON q.asset_id = a.id WHERE a.creator_id = ? AND q.creator_reply = ''`).get(userId);
  const recentActivity = db.prepare(`
    SELECT 'purchase' as type, oi.price as amount, a.title, o.created_at as date
    FROM order_items oi JOIN orders o ON oi.order_id = o.id JOIN assets a ON oi.asset_id = a.id
    WHERE a.creator_id = ? ORDER BY o.created_at DESC LIMIT 10
  `).all(userId);

  res.json({
    assets,
    revenue: totalSales.revenue,
    sales_count: totalSales.count,
    avg_rating: avgRating.avg ? Math.round(avgRating.avg * 10) / 10 : 0,
    total_views: totalViews.views,
    pending_qa: pendingQA.c,
    recent_activity: recentActivity
  });
});

// ========== BUYER DASHBOARD ==========
app.get('/api/dashboard/buyer', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const db = getDb();
  const userId = session.userId;

  const purchased = db.prepare(`SELECT COUNT(DISTINCT a.id) as c FROM order_items oi JOIN orders o ON oi.order_id = o.id JOIN assets a ON oi.asset_id = a.id WHERE o.user_id = ?`).get(userId);
  const favCount = db.prepare('SELECT COUNT(*) as c FROM favorites WHERE user_id = ?').get(userId);
  const unreviewed = db.prepare(`
    SELECT COUNT(DISTINCT oi.asset_id) as c FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    LEFT JOIN reviews r ON oi.asset_id = r.asset_id AND r.user_id = ?
    WHERE o.user_id = ? AND r.id IS NULL
  `).get(userId, userId);

  res.json({
    purchased_count: purchased.c,
    favorites_count: favCount.c,
    unreviewed_count: unreviewed.c
  });
});

// ========== NOTIFICATIONS ==========
app.get('/api/notifications', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const db = getDb();
  const notifs = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(session.userId);
  const unread = db.prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0').get(session.userId);
  res.json({ notifications: notifs, unread_count: unread.c });
});

app.put('/api/notifications/read', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const db = getDb();
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(session.userId);
  res.json({ ok: true });
});

// ========== ADMIN ==========
app.get('/api/admin/stats', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: '未ログイン' });
  const db = getDb();
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(session.userId);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: '管理者権限が必要です' });

  const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_amount),0) as v FROM orders WHERE status='completed'").get();
  const userCount = db.prepare('SELECT COUNT(*) as v FROM users').get();
  const assetCount = db.prepare('SELECT COUNT(*) as v FROM assets').get();
  const orderCount = db.prepare("SELECT COUNT(*) as v FROM orders WHERE status='completed'").get();
  const pendingReview = db.prepare("SELECT COUNT(*) as v FROM assets WHERE status='review'").get();
  const recentOrders = db.prepare(`SELECT o.*, u.display_name as buyer_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 10`).all();

  res.json({
    total_revenue: totalRevenue.v,
    user_count: userCount.v,
    asset_count: assetCount.v,
    order_count: orderCount.v,
    pending_review: pendingReview.v,
    recent_orders: recentOrders
  });
});

app.get('/api/admin/users', (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, email, display_name, username, role, is_verified, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

app.get('/api/admin/assets', (req, res) => {
  const db = getDb();
  const { status } = req.query;
  let sql = 'SELECT a.*, u.display_name as creator_name FROM assets a LEFT JOIN users u ON a.creator_id = u.id';
  if (status) { sql += ' WHERE a.status = ?'; }
  sql += ' ORDER BY a.created_at DESC';
  const assets = status ? db.prepare(sql).all(status) : db.prepare(sql).all();
  res.json(assets);
});

app.put('/api/admin/assets/:id/status', (req, res) => {
  const { status } = req.body;
  const db = getDb();
  db.prepare('UPDATE assets SET status = ?, updated_at = datetime("now") WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

// ========== START ==========
initDb();

app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`🚀 ORIGIN Marketplace running at http://localhost:${PORT}`);
});
