/**
 * ORIGIN Marketplace — API Client
 * Shared across all pages for consistent auth & API access.
 */
const API = {
  _sessionId: localStorage.getItem('origin_session_id') || null,
  _user: null,

  get headers() {
    const h = { 'Content-Type': 'application/json' };
    if (this._sessionId) h['X-Session-Id'] = this._sessionId;
    return h;
  },

  get headersNoBody() {
    const h = {};
    if (this._sessionId) h['X-Session-Id'] = this._sessionId;
    return h;
  },

  setSession(sid) {
    this._sessionId = sid;
    if (sid) localStorage.setItem('origin_session_id', sid);
    else localStorage.removeItem('origin_session_id');
  },

  get isLoggedIn() { return !!this._sessionId; },

  async request(method, url, body) {
    const opts = { method, headers: body instanceof FormData ? this.headersNoBody : this.headers };
    if (body) opts.body = body instanceof FormData ? body : JSON.stringify(body);
    const res = await fetch(url, opts);
    
    let data;
    try {
      data = await res.json();
    } catch (e) {
      // If parsing fails, it's likely an HTML response (e.g. 404 or backend down)
      throw new Error(`サーバーからのレスポンスを解析できませんでした (HTTP ${res.status})。サーバーが正しく起動しているか、ポート3001を使用しているか確認してください。`);
    }

    if (!res.ok) throw new Error(data.error || 'エラーが発生しました');
    return data;
  },

  // Auth
  async register(email, password, display_name, username) {
    const data = await this.request('POST', '/api/auth/register', { email, password, display_name, username });
    this.setSession(data.session_id);
    this._user = data.user;
    return data;
  },
  async login(email, password) {
    const data = await this.request('POST', '/api/auth/login', { email, password });
    this.setSession(data.session_id);
    this._user = data.user;
    return data;
  },
  async logout() {
    try { await this.request('POST', '/api/auth/logout'); } catch(e) {}
    this.setSession(null);
    this._user = null;
    window.location.href = '/index.html';
  },
  async getMe() {
    if (!this._sessionId) return null;
    try {
      this._user = await this.request('GET', '/api/auth/me');
      return this._user;
    } catch(e) { this.setSession(null); return null; }
  },
  async updateProfile(data) { return this.request('PUT', '/api/auth/profile', data); },

  // Categories
  async getCategories() { return this.request('GET', '/api/categories'); },

  // Assets
  async getAssets(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request('GET', '/api/assets' + (qs ? '?' + qs : ''));
  },
  async getAsset(id) { return this.request('GET', '/api/assets/' + id); },
  async createAsset(formData) {
    // FormData — don't set Content-Type (browser sets multipart boundary)
    const opts = { method: 'POST', headers: this.headersNoBody, body: formData };
    const res = await fetch('/api/assets', opts);
    return res.json();
  },
  async updateAsset(id, data) { return this.request('PUT', '/api/assets/' + id, data); },

  // Cart
  async getCart() { return this.request('GET', '/api/cart'); },
  async addToCart(asset_id, license_type = 'personal') { return this.request('POST', '/api/cart', { asset_id, license_type }); },
  async updateCartItem(id, license_type) { return this.request('PUT', '/api/cart/' + id, { license_type }); },
  async removeFromCart(id) { return this.request('DELETE', '/api/cart/' + id); },

  // Orders
  async checkout() { return this.request('POST', '/api/orders'); },
  async getOrders() { return this.request('GET', '/api/orders'); },
  async getOrder(id) { return this.request('GET', '/api/orders/' + id); },

  // Library
  async getLibrary() { return this.request('GET', '/api/library'); },

  // Reviews
  async postReview(asset_id, rating, title, body) { return this.request('POST', '/api/reviews', { asset_id, rating, title, body }); },
  async getReviews(assetId) { return this.request('GET', '/api/reviews/' + assetId); },

  // Favorites
  async getFavorites() { return this.request('GET', '/api/favorites'); },
  async toggleFavorite(asset_id) { return this.request('POST', '/api/favorites', { asset_id }); },

  // History
  async getHistory() { return this.request('GET', '/api/history'); },
  async clearHistory() { return this.request('DELETE', '/api/history'); },

  // Questions
  async postQuestion(asset_id, body) { return this.request('POST', '/api/questions', { asset_id, body }); },
  async replyQuestion(id, reply) { return this.request('PUT', '/api/questions/' + id + '/reply', { reply }); },

  // Dashboard
  async getCreatorDashboard() { return this.request('GET', '/api/dashboard/creator'); },
  async getBuyerDashboard() { return this.request('GET', '/api/dashboard/buyer'); },

  // Notifications
  async getNotifications() { return this.request('GET', '/api/notifications'); },
  async markNotificationsRead() { return this.request('PUT', '/api/notifications/read'); },

  // Admin
  async getAdminStats() { return this.request('GET', '/api/admin/stats'); },
  async getAdminUsers() { return this.request('GET', '/api/admin/users'); },
  async getAdminAssets(status) { return this.request('GET', '/api/admin/assets' + (status ? '?status=' + status : '')); },
  async setAssetStatus(id, status) { return this.request('PUT', '/api/admin/assets/' + id + '/status', { status }); },
};

// ========== UI Helpers ==========
function formatPrice(yen) {
  return '¥' + Number(yen).toLocaleString('ja-JP');
}
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ja-JP') + ' ' + d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}
function initials(name) {
  return (name || '??').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// Show login modal if needed
function requireLogin(redirectUrl) {
  if (!API.isLoggedIn) {
    window.location.href = '/login.html' + (redirectUrl ? '?redirect=' + encodeURIComponent(redirectUrl) : '');
    return false;
  }
  return true;
}

// Update header UI based on auth state
async function initHeaderAuth() {
  const user = await API.getMe();
  const headerAuth = document.getElementById('header-auth');
  if (!headerAuth) return;

  if (user) {
    headerAuth.innerHTML = `
      <a class="relative p-2 text-gray-400 hover:text-atlas" href="/notifications.html"><i class="ph ph-bell text-xl"></i></a>
      <a class="relative p-2 text-gray-400 hover:text-atlas" href="/cart.html"><i class="ph ph-shopping-cart text-xl"></i></a>
      <div class="relative group">
        <div class="w-8 h-8 rounded-full bg-atlas flex items-center justify-center text-white text-xs font-bold cursor-pointer">${initials(user.display_name)}</div>
        <div class="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 hidden group-hover:block z-50">
          <a class="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50" href="/buyer-dashboard.html">マイライブラリ</a>
          <a class="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50" href="/creator-dashboard.html">クリエイター</a>
          <a class="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50" href="/settings.html">設定</a>
          <div class="border-t border-gray-100 my-1"></div>
          <button class="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50" onclick="API.logout()">ログアウト</button>
        </div>
      </div>`;
  } else {
    headerAuth.innerHTML = `
      <a class="text-sm font-bold text-gray-600 hover:text-atlas px-3 py-2" href="/login.html">ログイン</a>
      <a class="bg-atlas text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#162a45] transition-all" href="/login.html?tab=register">新規登録</a>`;
  }
}
