// ── ORIGIN Sell Wizard ─────────────────────────────────────
// Full 6-step wizard with category-driven conditional logic

// SVG Pictograms for each zone
const ZONE_PICTOGRAMS = {
  biz: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="54" height="54">
    <circle cx="30" cy="40" r="14" stroke="#1E3A5F" stroke-width="2.5" fill="none"/>
    <circle cx="30" cy="40" r="5" fill="#1E3A5F"/>
    <rect x="26" y="22" width="8" height="6" rx="1" fill="#1E3A5F"/>
    <rect x="26" y="52" width="8" height="6" rx="1" fill="#1E3A5F"/>
    <rect x="12" y="36" width="6" height="8" rx="1" fill="#1E3A5F"/>
    <rect x="42" y="36" width="6" height="8" rx="1" fill="#1E3A5F"/>
    <path d="M54 20l4 8h-8l4-8z" fill="#C9A84C"/>
    <rect x="52.5" y="28" width="3" height="14" rx="1.5" fill="#C9A84C"/>
    <path d="M49 42l5-3v6l-5-3z" fill="#C9A84C"/>
    <path d="M59 42l-5-3v6l5-3z" fill="#C9A84C"/>
    <circle cx="54" cy="50" r="2" fill="#C9A84C"/>
    <path d="M50 56h8" stroke="#1E3A5F" stroke-width="2" stroke-linecap="round"/>
    <path d="M48 60h12" stroke="#1E3A5F" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  design: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="54" height="54">
    <path d="M20 58V28a6 6 0 016-6h28a6 6 0 016 6v30a6 6 0 01-6 6H26a6 6 0 01-6-6z" stroke="#1E3A5F" stroke-width="2.5" fill="none"/>
    <circle cx="34" cy="36" r="4" fill="#C9A84C"/>
    <circle cx="46" cy="36" r="4" fill="#1E3A5F" opacity="0.3"/>
    <rect x="28" y="46" width="24" height="12" rx="2" fill="#1E3A5F" opacity="0.12"/>
    <path d="M56 18l6 6-24 24-8 2 2-8 24-24z" stroke="#1E3A5F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M52 22l6 6" stroke="#1E3A5F" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M34 48l4-1 1 4" stroke="#C9A84C" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  component: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="54" height="54">
    <path d="M18 30l-8 10 8 10" stroke="#1E3A5F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M62 30l8 10-8 10" stroke="#1E3A5F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M46 18L34 62" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="28" y="30" width="10" height="10" rx="2" fill="#1E3A5F" opacity="0.2" stroke="#1E3A5F" stroke-width="1.5"/>
    <rect x="42" y="30" width="10" height="10" rx="2" fill="#1E3A5F" opacity="0.2" stroke="#1E3A5F" stroke-width="1.5"/>
    <rect x="28" y="44" width="10" height="10" rx="2" fill="#1E3A5F" opacity="0.2" stroke="#1E3A5F" stroke-width="1.5"/>
    <rect x="42" y="44" width="10" height="10" rx="2" fill="#C9A84C" opacity="0.25" stroke="#C9A84C" stroke-width="1.5"/>
    <circle cx="38" cy="40" r="1.5" fill="#1E3A5F"/>
    <circle cx="42" cy="44" r="1.5" fill="#1E3A5F"/>
  </svg>`,
  education: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="54" height="54">
    <path d="M14 36v18l26 12 26-12V36" stroke="#1E3A5F" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
    <path d="M40 18L10 34l30 16 30-16L40 18z" fill="#1E3A5F" opacity="0.1" stroke="#1E3A5F" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="62" y="34" width="3" height="24" rx="1.5" fill="#1E3A5F"/>
    <circle cx="63.5" cy="60" r="3" fill="#C9A84C"/>
    <circle cx="40" cy="24" r="6" fill="#C9A84C" opacity="0.2" stroke="#C9A84C" stroke-width="1.5"/>
    <path d="M40 21v6M37 24h6" stroke="#C9A84C" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`
};

const CATEGORY_DATA = {
  zones: [
    { id:'biz', label:'業務自動化・DX', sub:'ワークフロー・テンプレート・自動化ツール' },
    { id:'design', label:'デザイン・クリエイティブ', sub:'UI素材・画像・動画・音声・フォント・3D' },
    { id:'component', label:'コンポーネント・モジュール', sub:'UIパーツ・コードスニペット・ユーティリティ' },
    { id:'education', label:'教育・ナレッジ', sub:'オンライン講座・動画教材・ハンズオン' }
  ],
  categories: {
    biz: [
      { id:'notion', label:'Notionテンプレート' },
      { id:'nocode', label:'ノーコード / iPaaSワークフロー' },
      { id:'spreadsheet', label:'スプレッドシート & Excel' },
      { id:'aiprompt', label:'AIプロンプト & AI設定' }
    ],
    design: [
      { id:'uidesign', label:'UIデザインアセット' },
      { id:'graphic', label:'グラフィックデザイン素材' },
      { id:'photo', label:'写真・画像素材' },
      { id:'font', label:'フォント' },
      { id:'video', label:'動画・モーション素材' },
      { id:'audio', label:'音声・BGM素材' },
      { id:'3d', label:'3Dモデル・アセット' }
    ],
    component: [
      { id:'uicomp', label:'UIコンポーネント' },
      { id:'codesnippet', label:'コードスニペット & ユーティリティ' }
    ],
    education: [
      { id:'course', label:'オンライン講座・動画教材' }
    ]
  },
  subcategories: {
    notion: ['経営・マネジメント','営業・CRM','人事・採用','プロジェクト管理','マーケティング','個人・フリーランス','統合パック'],
    nocode: ['n8n','Make (Integromat)','Zapier','Power Automate','IFTTT'],
    spreadsheet: ['Google スプレッドシート（GAS付き）','Excel / VBAマクロ','Airtable テンプレート'],
    aiprompt: ['テキスト生成AI（ChatGPT / Claude）','画像生成AI（Midjourney / SD / DALL-E）','用途別プロンプトパック','GPT APIアプリテンプレート'],
    uidesign: ['Figma','Adobe XD','Sketch','デザイントークン / スタイルガイド'],
    graphic: ['Canvaテンプレート','Illustrator / Photoshop素材','ロゴテンプレート','バナー・広告テンプレート','インフォグラフィック'],
    photo: ['ストックフォト','イラスト素材','アイコンセット','背景・壁紙','テクスチャ・パターン','Lightroomプリセット','カラーLUT'],
    font: ['日本語フォント','欧文フォント','ディスプレイフォント','手書き風フォント','Webフォント'],
    video: ['After Effects テンプレート','Premiere Pro テンプレート','DaVinci Resolve テンプレート','Lottieアニメーション','ストック動画素材','モーショングラフィックス'],
    audio: ['BGM / ロイヤリティフリー楽曲','効果音（SE）','ジングル・サウンドロゴ','ポッドキャスト用素材'],
    '3d': ['Blender','Unity','Unreal Engine','3Dプリント用（STL）','VRChat / メタバース'],
    uicomp: ['React','Vue','Svelte','Web Components','Tailwind CSSブロック','CSSアニメーション','モバイル（Flutter / RN / SwiftUI）'],
    codesnippet: ['フロントエンド','バックエンド','スクリプト・自動化','Botテンプレート','Chrome拡張機能','データベース設計','設定ファイル'],
    course: ['動画コース','ハンズオン教材','ウェビナー録画','ワークショップ教材']
  },
  bizTags: ['営業 / セールス','マーケティング','人事 / 採用','経理 / 財務','法務','カスタマーサポート','プロジェクト管理','経営企画','情報システム','総務 / 庶務']
};

// ── State ──
const state = {
  currentStep: 1,
  zone: null,
  category: null,
  subcategory: null,
  title: '',
  description: '',
  tags: [],
  languages: [],
  bizTags: [],
  thumbnailFile: null,
  screenshots: [],
  demoVideoUrl: '',
  mainFiles: [],
  externalLinks: [],
  isFree: false,
  prices: { personal: '', commercial: '', team: '', extended: '' },
  licenseToggles: { personal: true, commercial: false, team: false, extended: false },
  setupSteps: [{ title: '', description: '' },{ title: '', description: '' },{ title: '', description: '' }],
  requiredTools: [],
  requiredAccounts: [],
  faq: [],
  estimatedTime: '',
  checks: {}
};

let autoSaveTimer = null;

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  loadDraft();
  renderStep(state.currentStep);
  updateProgress();
  startAutoSave();
});

// ── Step Navigation ──
function goToStep(n) {
  if (n < 1 || n > 6) return;
  if (n > state.currentStep && !validateCurrentStep()) return;
  state.currentStep = n;
  renderStep(n);
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  saveDraft();
}

function nextStep() { goToStep(state.currentStep + 1); }
function prevStep() { goToStep(state.currentStep - 1); }

function updateProgress() {
  for (let i = 1; i <= 6; i++) {
    const circle = document.getElementById(`step-circle-${i}`);
    const line = document.getElementById(`step-line-${i}`);
    if (!circle) continue;
    circle.className = 'step-circle';
    if (i < state.currentStep) circle.classList.add('completed');
    else if (i === state.currentStep) circle.classList.add('active');
    if (line) line.className = i < state.currentStep ? 'step-line completed' : 'step-line';
  }
}

// ── Render Steps ──
function renderStep(n) {
  document.querySelectorAll('.wizard-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`step-${n}`);
  if (panel) { panel.classList.add('active'); }
  // Dynamic rendering for step content
  if (n === 1) renderStep1();
  else if (n === 2) renderStep2();
  else if (n === 3) renderStep3();
  else if (n === 4) renderStep4();
  else if (n === 5) renderStep5();
  else if (n === 6) renderStep6();
}

// ── STEP 1: Basic Info ──
function renderStep1() {
  const container = document.getElementById('step-1-content');
  if (!container) return;
  // Build zone cards
  let zoneHtml = '<div class="zone-grid">';
  CATEGORY_DATA.zones.forEach(z => {
    zoneHtml += `<div class="zone-card ${state.zone===z.id?'selected':''}" onclick="selectZone('${z.id}')">
      <div style="display:flex;align-items:center;justify-content:center;margin:0 auto 10px">${ZONE_PICTOGRAMS[z.id]}</div>
      <span class="zone-title">${z.label}</span>
      <span style="display:block;font-size:10px;color:#9CA3AF;font-weight:500;margin-top:4px;line-height:1.4">${z.sub}</span></div>`;
  });
  zoneHtml += '</div>';

  // Category list
  let catHtml = '';
  if (state.zone) {
    const cats = CATEGORY_DATA.categories[state.zone] || [];
    catHtml = '<div class="category-list" style="margin-top:16px">';
    cats.forEach(c => {
      catHtml += `<div class="category-item ${state.category===c.id?'selected':''}" onclick="selectCategory('${c.id}')">
        <i class="ph ph-caret-right" style="font-size:12px"></i> ${c.label}</div>`;
    });
    catHtml += '</div>';
  }

  // Subcategory chips
  let subHtml = '';
  if (state.category) {
    const subs = CATEGORY_DATA.subcategories[state.category] || [];
    subHtml = '<div style="margin-top:16px"><div class="form-label">サブカテゴリ <span class="required">*</span></div><div class="chip-grid">';
    subs.forEach(s => {
      subHtml += `<div class="chip ${state.subcategory===s?'selected':''}" onclick="selectSubcategory('${s}')">${s}</div>`;
    });
    subHtml += '</div></div>';
  }

  // Biz tags
  let bizHtml = '';
  if (state.zone === 'biz') {
    bizHtml = '<div class="form-group" style="margin-top:20px"><div class="form-label">業務カテゴリタグ</div><div class="chip-grid">';
    CATEGORY_DATA.bizTags.forEach(t => {
      bizHtml += `<div class="chip ${state.bizTags.includes(t)?'selected':''}" onclick="toggleBizTag('${t}')">${t}</div>`;
    });
    bizHtml += '</div></div>';
  }

  const titleLen = state.title.length;
  const descLen = state.description.length;
  container.innerHTML = `
    <div class="form-group">
      <label class="form-label">商品タイトル <span class="required">*</span></label>
      <input class="form-input" id="titleInput" type="text" maxlength="100" value="${escHtml(state.title)}"
        placeholder="例: 営業CRM自動化テンプレート｜Notion × n8n連携" oninput="onTitleInput(this)">
      <div class="char-counter ${titleLen>90?'warning':''} ${titleLen>100?'over':''}" id="titleCounter">${titleLen} / 100</div>
      <div class="hint-box"><div class="hint-title"><i class="ph-fill ph-lightbulb"></i> ヒント</div>
        <div class="hint-text">ツール名・用途を含めると検索されやすくなります</div></div>
    </div>
    <div class="form-group">
      <label class="form-label">ゾーン選択 <span class="required">*</span></label>
      ${zoneHtml}
    </div>
    <div id="catContainer">${catHtml}</div>
    <div id="subContainer">${subHtml}</div>
    ${bizHtml ? `<div id="bizTagContainer">${bizHtml}</div>` : ''}
    <div class="form-group" style="margin-top:24px">
      <label class="form-label">商品説明 <span class="required">*</span></label>
      <textarea class="form-input" id="descInput" maxlength="10000"
        placeholder="アセットの価値、解決する課題、主な機能を詳しく記載してください..."
        oninput="onDescInput(this)">${escHtml(state.description)}</textarea>
      <div class="char-counter" id="descCounter">${descLen} / 10,000</div>
      <div class="hint-box"><div class="hint-title"><i class="ph-fill ph-lightbulb"></i> 推奨構成</div>
        <div class="hint-text">① このアセットで何ができるか<br>② どんな課題を解決するか<br>③ 主な機能・特徴（箇条書き）<br>④ 対象ユーザー<br>⑤ 導入後の効果（定量的に）</div></div>
    </div>
    <div class="form-group">
      <label class="form-label">タグ（最大10個）</label>
      <div class="tag-input-container" onclick="document.getElementById('tagField').focus()">
        ${state.tags.map(t => `<span class="tag-badge">#${escHtml(t)} <span class="tag-remove" onclick="event.stopPropagation();removeTag('${escHtml(t)}')">&times;</span></span>`).join('')}
        <input class="tag-input-field" id="tagField" type="text" placeholder="${state.tags.length?'':'例: 営業DX, Notion, 自動化'}" onkeydown="onTagKey(event)">
      </div>
      <div class="form-hint">Enterで確定 / ×で削除</div>
    </div>
    <div class="form-group">
      <label class="form-label">対応言語</label>
      <div style="display:flex;gap:16px;flex-wrap:wrap">
        ${['日本語','English','中文','한국어'].map(l => `<label style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:500;cursor:pointer">
          <input type="checkbox" ${state.languages.includes(l)?'checked':''} onchange="toggleLang('${l}',this.checked)" style="accent-color:var(--color-atlas)"> ${l}</label>`).join('')}
      </div>
    </div>`;
}

function selectZone(id) { state.zone = id; state.category = null; state.subcategory = null; renderStep1(); }
function selectCategory(id) { state.category = id; state.subcategory = null; renderStep1(); }
function selectSubcategory(s) { state.subcategory = s; renderStep1(); }
function toggleBizTag(t) { const i = state.bizTags.indexOf(t); if (i > -1) state.bizTags.splice(i,1); else state.bizTags.push(t); renderStep1(); }
function onTitleInput(el) { state.title = el.value; const n = el.value.length; document.getElementById('titleCounter').textContent = `${n} / 100`; document.getElementById('titleCounter').className = `char-counter ${n>90?'warning':''} ${n>100?'over':''}`; }
function onDescInput(el) { state.description = el.value; const n = el.value.length; document.getElementById('descCounter').textContent = `${n.toLocaleString()} / 10,000`; }
function onTagKey(e) { if (e.key === 'Enter') { e.preventDefault(); const v = e.target.value.trim().replace(/^#/,''); if (v && state.tags.length < 10 && !state.tags.includes(v)) { state.tags.push(v); e.target.value = ''; renderStep1(); } } }
function removeTag(t) { state.tags = state.tags.filter(x => x !== t); renderStep1(); }
function toggleLang(l, checked) { if (checked && !state.languages.includes(l)) state.languages.push(l); else state.languages = state.languages.filter(x => x !== l); }

// ── STEP 2: Media ──
function renderStep2() {
  const c = document.getElementById('step-2-content');
  if (!c) return;
  c.innerHTML = `
    <div class="form-group">
      <label class="form-label">サムネイル画像 <span class="required">*</span></label>
      <div class="upload-area" id="thumbDrop" onclick="document.getElementById('thumbFile').click()"
        ondragover="event.preventDefault();this.classList.add('dragover')" ondragleave="this.classList.remove('dragover')"
        ondrop="event.preventDefault();this.classList.remove('dragover');handleThumb(event.dataTransfer.files)">
        <i class="ph ph-cloud-arrow-up upload-icon"></i>
        <p style="font-size:14px;font-weight:600;color:#4B5563;margin-bottom:4px">クリックまたはドラッグ＆ドロップ</p>
        <p style="font-size:11px;color:#9CA3AF">推奨: 1200×900px (4:3) | JPG / PNG / WEBP | 最大5MB</p>
      </div>
      <input type="file" id="thumbFile" accept="image/*" style="display:none" onchange="handleThumb(this.files)">
      <div id="thumbPreview"></div>
    </div>
    <div class="form-group">
      <label class="form-label">スクリーンショット（最大10枚）</label>
      <div class="screenshot-grid" id="ssGrid">
        ${Array.from({length:5}).map((_,i) => `<div class="screenshot-slot" onclick="document.getElementById('ssFile${i}').click()">
          <i class="ph ph-plus"></i><input type="file" id="ssFile${i}" accept="image/*" style="display:none"></div>`).join('')}
      </div>
      <div class="hint-box" style="margin-top:12px"><div class="hint-title"><i class="ph-fill ph-lightbulb"></i> ヒント</div>
        <div class="hint-text">3枚以上のスクリーンショットがある商品はコンバージョン率が約40%向上します</div></div>
    </div>
    <div class="form-group">
      <label class="form-label">デモ動画（任意）</label>
      <input class="form-input" type="url" placeholder="YouTube / Vimeo URLを貼り付け" value="${escHtml(state.demoVideoUrl)}"
        oninput="state.demoVideoUrl=this.value">
      <div class="form-hint">60〜90秒の動画が最も効果的です</div>
    </div>
    <div id="catMediaFields"></div>`;
  renderCategoryMediaFields();
}
function handleThumb(files) { if (files && files[0]) { state.thumbnailFile = files[0]; const url = URL.createObjectURL(files[0]); document.getElementById('thumbPreview').innerHTML = `<div class="upload-preview" style="margin-top:12px"><img src="${url}" alt="Thumbnail"><div class="upload-actions"><button onclick="state.thumbnailFile=null;renderStep2()"><i class="ph ph-trash"></i></button></div></div>`; document.getElementById('thumbDrop').style.display = 'none'; } }
function renderCategoryMediaFields() {
  const el = document.getElementById('catMediaFields');
  if (!el) return;
  let h = '';
  if (state.category === 'notion') {
    h = `<div class="form-group"><label class="form-label">Notionプレビュー用共有URL（強く推奨）</label>
      <input class="form-input" type="url" placeholder="https://www.notion.so/...">
      <div class="hint-box"><div class="hint-title"><i class="ph ph-info"></i> 設定ガイド</div>
      <div class="hint-text">1. ページ右上「共有」をクリック<br>2.「Web公開」をONにする<br>3. URLをコピーしてこちらに貼付<br>⚠️ 編集権限は付与しないでください</div></div></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
        <div class="form-group"><label class="form-label">含まれるページ数</label><input class="form-input" type="number" min="0" placeholder="0"></div>
        <div class="form-group"><label class="form-label">データベース数</label><input class="form-input" type="number" min="0" placeholder="0"></div>
        <div class="form-group"><label class="form-label">ビュー数</label><input class="form-input" type="number" min="0" placeholder="0"></div>
      </div>`;
  } else if (state.category === 'audio') {
    h = `<div class="form-group"><label class="form-label">試聴用サンプル音源 <span class="required">*</span></label>
      <div class="upload-area" onclick="document.getElementById('audioSample').click()"><i class="ph ph-music-notes upload-icon"></i>
        <p style="font-size:14px;font-weight:600;color:#4B5563">音源ファイルをアップロード</p>
        <p style="font-size:11px;color:#9CA3AF">MP3 / WAV / OGG | 最大30秒</p></div>
      <input type="file" id="audioSample" accept="audio/*" style="display:none"></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
        <div class="form-group"><label class="form-label">BPM</label><input class="form-input" type="number" placeholder="120"></div>
        <div class="form-group"><label class="form-label">キー（調）</label><input class="form-input" placeholder="C Major"></div>
        <div class="form-group"><label class="form-label">再生時間</label><input class="form-input" placeholder="3:24"></div>
      </div>`;
  } else if (state.category === 'aiprompt') {
    h = `<div class="form-group"><label class="form-label">Before / After サンプル <span class="required">*</span></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div><label class="form-label" style="font-size:10px">入力例（Before）</label><textarea class="form-input" rows="4" placeholder="このプロンプトに○○を入れると..."></textarea></div>
        <div><label class="form-label" style="font-size:10px">出力例（After）</label><textarea class="form-input" rows="4" placeholder="このような結果が得られます..."></textarea></div>
      </div></div>`;
  }
  el.innerHTML = h;
}

// ── STEP 3: File Upload ──
function renderStep3() {
  const c = document.getElementById('step-3-content');
  if (!c) return;
  c.innerHTML = `
    <div class="form-group">
      <label class="form-label">メインファイルアップロード <span class="required">*</span></label>
      <div class="upload-area" style="padding:48px 24px" onclick="document.getElementById('mainFileInput').click()"
        ondragover="event.preventDefault();this.classList.add('dragover')" ondragleave="this.classList.remove('dragover')">
        <i class="ph ph-file-arrow-up upload-icon" style="font-size:42px"></i>
        <p style="font-size:15px;font-weight:700;color:#374151;margin-bottom:4px">ファイルをドラッグ＆ドロップ</p>
        <p style="font-size:12px;color:#9CA3AF;margin-bottom:12px">またはクリックしてファイルを選択</p>
        <p style="font-size:11px;color:#C0C5CC">最大500MB / ZIP: 1GBまで</p>
      </div>
      <input type="file" id="mainFileInput" multiple style="display:none">
      <div id="fileList" style="margin-top:12px"></div>
    </div>
    <div class="form-group">
      <label class="form-label">外部リンク設定</label>
      <input class="form-input" type="url" placeholder="購入者に提供するリンクURLを入力" id="extLinkInput">
      <div class="form-hint">Notion / Google Sheets / Figma / Canva等のリンク納品用</div>
    </div>
    <div class="form-group">
      <label class="form-label">補足ファイル（最大5ファイル）</label>
      <div class="upload-area" style="padding:24px" onclick="document.getElementById('suppFileInput').click()">
        <i class="ph ph-file-plus upload-icon" style="font-size:28px"></i>
        <p style="font-size:13px;font-weight:600;color:#6B7280">セットアップガイド・補足資料</p>
        <p style="font-size:11px;color:#9CA3AF">PDF / MD / TXT / DOCX | 各50MB</p>
      </div>
      <input type="file" id="suppFileInput" multiple style="display:none">
    </div>`;
}

// ── STEP 4: Pricing ──
function renderStep4() {
  const c = document.getElementById('step-4-content');
  if (!c) return;
  const feeRate = 0.20, payRate = 0.036;
  function sim(p) { const price = parseInt(p)||0; const fee = Math.floor(price*feeRate); const pay = Math.floor(price*payRate); return { fee, pay, net: price - fee - pay }; }
  const ps = sim(state.prices.personal);
  c.innerHTML = `
    <div class="form-group">
      <label class="form-label">無料 / 有料</label>
      <div style="display:flex;gap:16px;margin-bottom:20px">
        <label style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;cursor:pointer">
          <input type="radio" name="pricetype" ${!state.isFree?'checked':''} onchange="state.isFree=false;renderStep4()" style="accent-color:var(--color-atlas)"> 有料</label>
        <label style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;cursor:pointer">
          <input type="radio" name="pricetype" ${state.isFree?'checked':''} onchange="state.isFree=true;renderStep4()" style="accent-color:var(--color-atlas)"> 無料</label>
      </div>
    </div>
    ${!state.isFree ? `
    <div class="license-card active" style="margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div><span style="font-size:14px;font-weight:700">個人利用ライセンス</span><span style="font-size:10px;color:#9CA3AF;margin-left:8px">必須</span></div>
        <span style="font-size:10px;font-weight:700;color:#10B981;background:rgba(16,185,129,0.08);padding:2px 8px;border-radius:4px">ON</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <label class="form-label">価格（税込）</label>
          <div style="position:relative"><span style="position:absolute;left:14px;top:12px;font-size:14px;font-weight:700;color:#6B7280">¥</span>
          <input class="form-input" type="number" style="padding-left:28px" min="100" max="1000000" step="100"
            value="${state.prices.personal}" placeholder="1,980" oninput="state.prices.personal=this.value;renderStep4()"></div>
        </div>
        <div style="background:#F9FAFB;border-radius:8px;padding:12px">
          <div class="fee-row"><span style="color:#6B7280">販売価格</span><span>¥${(parseInt(state.prices.personal)||0).toLocaleString()}</span></div>
          <div class="fee-row"><span style="color:#6B7280">手数料 (20%)</span><span>-¥${ps.fee.toLocaleString()}</span></div>
          <div class="fee-row"><span style="color:#6B7280">決済 (3.6%)</span><span>-¥${ps.pay.toLocaleString()}</span></div>
          <div class="fee-row total"><span style="color:var(--color-atlas)">あなたの収益</span><span style="color:var(--color-atlas)">¥${ps.net.toLocaleString()}</span></div>
        </div>
      </div>
    </div>
    ${['commercial','team','extended'].map((k,i) => {
      const labels = ['商用利用ライセンス','チーム / 企業ライセンス','拡張（再販）ライセンス'];
      const on = state.licenseToggles[k];
      return `<div class="license-card ${on?'active':''}" style="margin-bottom:12px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:14px;font-weight:700">${labels[i]}</span>
          <div class="toggle-switch ${on?'on':''}" onclick="state.licenseToggles['${k}']=!state.licenseToggles['${k}'];renderStep4()"></div>
        </div>
        ${on ? `<div style="margin-top:14px"><label class="form-label">価格（税込）</label>
          <div style="position:relative"><span style="position:absolute;left:14px;top:12px;font-size:14px;font-weight:700;color:#6B7280">¥</span>
          <input class="form-input" type="number" style="padding-left:28px" min="100" max="1000000" step="100"
            value="${state.prices[k]}" placeholder="4,980" oninput="state.prices['${k}']=this.value"></div></div>` : ''}
      </div>`;
    }).join('')}` : '<div class="hint-box"><div class="hint-text">無料アセットはダウンロード数を獲得しやすく、認知度向上に効果的です</div></div>'}`;
}

// ── STEP 5: Setup & Requirements ──
function renderStep5() {
  const c = document.getElementById('step-5-content');
  if (!c) return;
  let stepsHtml = state.setupSteps.map((s,i) => `
    <div class="setup-step-card"><div class="setup-step-num">${i+1}</div>
      <div style="flex:1"><input class="form-input" placeholder="ステップタイトル" value="${escHtml(s.title)}"
        oninput="state.setupSteps[${i}].title=this.value" style="margin-bottom:8px;padding:8px 12px;font-size:13px">
        <textarea class="form-input" placeholder="具体的な操作手順を記載..." rows="2" style="font-size:13px;min-height:60px"
          oninput="state.setupSteps[${i}].description=this.value">${escHtml(s.description)}</textarea></div>
      <button onclick="removeSetupStep(${i})" style="color:#D1D5DB;background:none;border:none;cursor:pointer;font-size:16px;align-self:flex-start"><i class="ph ph-x"></i></button>
    </div>`).join('');

  let faqHtml = state.faq.map((f,i) => `
    <div class="faq-item"><input class="form-input" placeholder="質問" value="${escHtml(f.q)}" oninput="state.faq[${i}].q=this.value" style="margin-bottom:8px;font-size:13px;padding:8px 12px">
      <textarea class="form-input" placeholder="回答" rows="2" style="font-size:13px;min-height:50px" oninput="state.faq[${i}].a=this.value">${escHtml(f.a)}</textarea>
      <button onclick="state.faq.splice(${i},1);renderStep5()" style="margin-top:6px;font-size:11px;color:#EF4444;background:none;border:none;cursor:pointer;font-weight:600">削除</button></div>`).join('');

  c.innerHTML = `
    <div class="form-group"><label class="form-label">導入手順（ステップバイステップ）</label>
      <div id="setupStepsList">${stepsHtml}</div>
      <button onclick="addSetupStep()" style="margin-top:8px;font-size:12px;font-weight:700;color:var(--color-atlas);background:none;border:1.5px dashed var(--color-atlas);border-radius:8px;padding:10px 20px;cursor:pointer;width:100%">+ ステップを追加</button>
    </div>
    <div class="form-group"><label class="form-label">想定導入時間</label>
      <select class="form-input" onchange="state.estimatedTime=this.value">
        <option value="">選択してください</option>
        ${['5分以内','10分','15分','30分','1時間','2時間以上'].map(t => `<option ${state.estimatedTime===t?'selected':''}>${t}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label class="form-label">FAQ（よくある質問）</label>
      <div id="faqList">${faqHtml}</div>
      <button onclick="state.faq.push({q:'',a:''});renderStep5()" style="margin-top:8px;font-size:12px;font-weight:700;color:var(--color-atlas);background:none;border:1.5px dashed var(--color-atlas);border-radius:8px;padding:10px 20px;cursor:pointer;width:100%">+ FAQを追加</button>
    </div>`;
}
function addSetupStep() { state.setupSteps.push({ title:'', description:'' }); renderStep5(); }
function removeSetupStep(i) { if (state.setupSteps.length > 1) { state.setupSteps.splice(i,1); renderStep5(); } }

// ── STEP 6: Confirm ──
function renderStep6() {
  const c = document.getElementById('step-6-content');
  if (!c) return;
  const zone = CATEGORY_DATA.zones.find(z=>z.id===state.zone);
  const cat = state.zone ? (CATEGORY_DATA.categories[state.zone]||[]).find(c=>c.id===state.category) : null;
  c.innerHTML = `
    <div class="summary-section"><h4><i class="ph ph-file-text"></i> 基本情報 <span class="edit-link" onclick="goToStep(1)">編集</span></h4>
      <div class="summary-row"><span>タイトル</span><span style="font-weight:600">${escHtml(state.title)||'未入力'}</span></div>
      <div class="summary-row"><span>カテゴリ</span><span>${zone?zone.label:'-'} / ${cat?cat.label:'-'} / ${state.subcategory||'-'}</span></div>
      <div class="summary-row"><span>タグ</span><span>${state.tags.map(t=>'#'+t).join(', ')||'未設定'}</span></div>
    </div>
    <div class="summary-section"><h4><i class="ph ph-images"></i> メディア <span class="edit-link" onclick="goToStep(2)">編集</span></h4>
      <div class="summary-row"><span>サムネイル</span><span>${state.thumbnailFile?'✅ 設定済み':'❌ 未設定'}</span></div>
      <div class="summary-row"><span>デモ動画</span><span>${state.demoVideoUrl?'✅ 設定済み':'− 未設定'}</span></div>
    </div>
    <div class="summary-section"><h4><i class="ph ph-currency-circle-dollar"></i> 価格 <span class="edit-link" onclick="goToStep(4)">編集</span></h4>
      <div class="summary-row"><span>価格タイプ</span><span>${state.isFree?'無料':'有料'}</span></div>
      ${!state.isFree && state.prices.personal ? `<div class="summary-row"><span>個人利用</span><span>¥${parseInt(state.prices.personal).toLocaleString()}</span></div>` : ''}
    </div>
    <div style="margin-top:24px;padding:20px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px">
      <div style="font-size:13px;font-weight:700;margin-bottom:12px;color:#92400E">✅ 出品ガイドライン準拠チェック</div>
      <div class="check-item"><input type="checkbox" onchange="state.checks.own=this.checked"><span style="font-size:13px">この商品は私が作成したもの、または正当な権利を持つものです</span></div>
      <div class="check-item"><input type="checkbox" onchange="state.checks.noInfringe=this.checked"><span style="font-size:13px">他者の著作権・知的財産権を侵害していません</span></div>
      <div class="check-item"><input type="checkbox" onchange="state.checks.guidelines=this.checked"><span style="font-size:13px">出品ガイドラインを確認し、遵守しています</span></div>
      <div class="check-item"><input type="checkbox" onchange="state.checks.noFalse=this.checked"><span style="font-size:13px">商品説明に虚偽の記載はありません</span></div>
      <div class="check-item"><input type="checkbox" onchange="state.checks.terms=this.checked"><span style="font-size:13px">利用規約に同意します</span></div>
    </div>
    <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap">
      <button class="btn-atlas" style="padding:16px 40px;border-radius:12px;font-size:16px;font-weight:800;border:none;cursor:pointer;flex:1" onclick="submitListing()">
        🚀 公開申請する</button>
      <button style="padding:16px 32px;border-radius:12px;font-size:14px;font-weight:700;border:1.5px solid #E5E7EB;background:white;cursor:pointer;color:#6B7280" onclick="saveDraft();showAutosave('下書きを保存しました')">
        💾 下書き保存</button>
    </div>`;
}

async function submitListing() {
  const allChecked = state.checks.own && state.checks.noInfringe && state.checks.guidelines && state.checks.noFalse && state.checks.terms;
  if (!allChecked) { alert('すべてのチェック項目に同意してください'); return; }
  if (!state.title || !state.zone || !state.category) { alert('基本情報を入力してください'); return; }
  
  try {
      const formData = new FormData();
      formData.append('title', state.title);
      formData.append('description', state.description);
      formData.append('short_description', state.description.substring(0, 150));
      formData.append('zone_id', state.zone);
      formData.append('category_id', state.category);
      formData.append('price_personal', state.isFree ? 0 : (state.prices.personal || 0));
      formData.append('price_commercial', state.isFree ? 0 : (state.prices.commercial || 0));
      formData.append('price_team', state.isFree ? 0 : (state.prices.team || 0));
      formData.append('tags', JSON.stringify(state.tags));
      let setupGuideText = '';
      state.setupSteps.forEach((s, idx) => {
          if(s.title || s.description) setupGuideText += `${idx+1}. ${s.title}\n${s.description}\n\n`;
      });
      formData.append('setup_guide', setupGuideText);
      formData.append('requirements', `推定時間: ${state.estimatedTime}`);

      if (state.thumbnailFile) {
          formData.append('thumbnail', state.thumbnailFile);
      }
      const extLinkInput = document.getElementById('extLinkInput');
      if (extLinkInput && extLinkInput.value) {
          formData.append('demo_url', extLinkInput.value); // Just use demo_url for external links temporarily
      }
      
      const mainFileInput = document.getElementById('mainFileInput');
      if(mainFileInput && mainFileInput.files && mainFileInput.files.length > 0) {
          for(let i=0; i<mainFileInput.files.length; i++) {
              formData.append('files', mainFileInput.files[i]);
          }
      }

      await API.createAsset(formData);

      // Show success
      document.getElementById('step-6-content').innerHTML = `
        <div style="text-align:center;padding:60px 20px">
          <div style="font-size:60px;margin-bottom:20px">🎉</div>
          <h2 style="font-family:var(--font-display);font-size:36px;font-weight:700;margin-bottom:12px">出品申請が完了しました！</h2>
          <p style="font-size:15px;color:#6B7280;margin-bottom:8px">審査は通常24時間以内に完了します</p>
          <p style="font-size:13px;color:#9CA3AF;margin-bottom:32px">審査結果はメール＆通知でお知らせします</p>
          <div style="display:inline-block;padding:8px 20px;background:rgba(245,158,11,0.1);color:#D97706;font-size:13px;font-weight:700;border-radius:8px;margin-bottom:32px">🟡 ステータス: 審査中</div>
          <div style="display:flex;gap:12px;justify-content:center">
            <a href="index.html" class="btn-atlas" style="padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none">ホームに戻る</a>
            <a href="sell.html" style="padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;border:1.5px solid #E5E7EB;text-decoration:none;color:#374151">別のアセットを出品する</a>
          </div>
        </div>`;
      localStorage.removeItem('origin_sell_draft');
  } catch(e) {
      alert('出品エラー: ' + e.message);
  }
}

// ── Validation ──
function validateCurrentStep() {
  if (state.currentStep === 1) {
    if (!state.title || state.title.length < 10) { alert('タイトルは10文字以上で入力してください'); return false; }
    if (!state.zone) { alert('ゾーンを選択してください'); return false; }
    if (!state.category) { alert('カテゴリを選択してください'); return false; }
    if (!state.subcategory) { alert('サブカテゴリを選択してください'); return false; }
    if (!state.description || state.description.length < 100) { alert('商品説明は100文字以上で入力してください'); return false; }
  }
  return true;
}

// ── Auto-save / Draft ──
function saveDraft() {
  try { localStorage.setItem('origin_sell_draft', JSON.stringify(state)); } catch(e) {}
  showAutosave();
}
function loadDraft() {
  try {
    const d = localStorage.getItem('origin_sell_draft');
    if (d) { Object.assign(state, JSON.parse(d)); state.thumbnailFile = null; }
  } catch(e) {}
}
function startAutoSave() { autoSaveTimer = setInterval(() => saveDraft(), 30000); }
function showAutosave(msg) {
  const el = document.getElementById('autosaveIndicator');
  if (!el) return;
  el.textContent = msg || `✅ ${new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})} に自動保存`;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 2500);
}

// ── Utility ──
function escHtml(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
