const state = {
  health: null,
  jobs: [],
  assets: [],
  selectedAssetId: null,
  theme: localStorage.getItem('zc-theme') || 'dark'
};

const el = {
  healthStatus: document.querySelector('#healthStatus'),
  gatewayValue: document.querySelector('#gatewayValue'),
  dbValue: document.querySelector('#dbValue'),
  browserValue: document.querySelector('#browserValue'),
  workerValue: document.querySelector('#workerValue'),
  desktopValue: document.querySelector('#desktopValue'),
  queueForm: document.querySelector('#queueForm'),
  content: document.querySelector('#content'),
  voiceCode: document.querySelector('#voiceCode'),
  speed: document.querySelector('#speed'),
  incognito: document.querySelector('#incognito'),
  formMessage: document.querySelector('#formMessage'),
  queueRows: document.querySelector('#queueRows'),
  assetList: document.querySelector('#assetList'),
  assetDetail: document.querySelector('#assetDetail'),
  editAssetBin: document.querySelector('#editAssetBin'),
  refreshQueue: document.querySelector('#refreshQueue'),
  refreshAssets: document.querySelector('#refreshAssets'),
  themeToggle: document.querySelector('#themeToggle'),
  tabs: Array.from(document.querySelectorAll('.tab')),
  tabPanels: Array.from(document.querySelectorAll('.tab-panel'))
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });
  const data = await response.json();
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }
  return data;
}

function setMessage(message, tone = 'muted') {
  el.formMessage.textContent = message;
  el.formMessage.style.color = tone === 'error' ? 'var(--danger)' : 'var(--muted)';
}

function renderHealth() {
  const health = state.health;
  const ok = Boolean(health?.ok);
  el.healthStatus.classList.toggle('ok', ok && !health.degraded);
  el.healthStatus.classList.toggle('bad', !ok);
  el.healthStatus.querySelector('span:last-child').textContent = ok
    ? health.degraded ? 'Degraded' : 'Ready'
    : 'Unavailable';

  el.gatewayValue.textContent = health?.gateway || '-';
  el.dbValue.textContent = health?.db || '-';
  el.browserValue.textContent = health?.browserCdp || '-';
  el.workerValue.textContent = health?.worker || '-';
}

function renderQueue() {
  if (state.jobs.length === 0) {
    el.queueRows.innerHTML = '<tr><td colspan="4" class="empty">No jobs yet.</td></tr>';
    return;
  }

  el.queueRows.innerHTML = state.jobs.map((job) => `
    <tr>
      <td><span class="badge ${escapeHtml(job.status)}">${escapeHtml(job.status)}</span></td>
      <td>${escapeHtml(trimText(job.content, 86))}</td>
      <td>${escapeHtml(job.voice_code)}</td>
      <td>${escapeHtml(job.created_at)}</td>
    </tr>
  `).join('');
}

function renderAssets() {
  if (state.assets.length === 0) {
    el.assetList.innerHTML = '<p class="empty">No assets yet.</p>';
    el.assetDetail.innerHTML = 'Select an asset.';
    el.editAssetBin.innerHTML = 'Assets will be available here.';
    return;
  }

  if (!state.selectedAssetId || !state.assets.some((asset) => asset.id === state.selectedAssetId)) {
    state.selectedAssetId = state.assets[0].id;
  }

  el.assetList.innerHTML = state.assets.map((asset) => `
    <article class="asset compact-row ${asset.id === state.selectedAssetId ? 'selected' : ''}" data-asset-id="${escapeHtml(asset.id)}">
      <button class="play-button" type="button" title="Preview">&gt;</button>
      <div class="asset-main">
        <strong>${escapeHtml(trimText(asset.content || asset.filename, 70))}</strong>
        <span>${escapeHtml(asset.filename)}</span>
      </div>
      <span class="asset-duration">${formatDuration(asset.duration_ms)}</span>
    </article>
  `).join('');

  el.assetList.querySelectorAll('[data-asset-id]').forEach((row) => {
    row.addEventListener('click', () => {
      state.selectedAssetId = row.dataset.assetId;
      renderAssets();
    });
  });

  renderAssetDetail();
  renderEditAssetBin();
}

function renderAssetDetail() {
  const asset = state.assets.find((item) => item.id === state.selectedAssetId);
  if (!asset) {
    el.assetDetail.innerHTML = 'Select an asset.';
    return;
  }

  el.assetDetail.innerHTML = `
    <div class="detail-filename">${escapeHtml(asset.filename)}</div>
    <div class="detail-text">${escapeHtml(asset.content || '')}</div>
    <audio controls preload="none" src="/api/audio/${encodeURIComponent(asset.filename)}"></audio>
    <button class="primary" type="button" disabled>Add to Edit</button>
  `;
}

function renderEditAssetBin() {
  el.editAssetBin.innerHTML = state.assets.map((asset) => `
    <div class="asset compact-row">
      <span class="play-button" aria-hidden="true">+</span>
      <div class="asset-main">
        <strong>${escapeHtml(trimText(asset.content || asset.filename, 52))}</strong>
        <span>${formatDuration(asset.duration_ms)}</span>
      </div>
    </div>
  `).join('');
}

async function refreshHealth() {
  try {
    state.health = await api('/health');
  } catch {
    state.health = null;
  }
  renderHealth();
}

async function refreshDesktopRuntime() {
  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke || !el.desktopValue) return;

  try {
    const runtime = await invoke('gateway_runtime_status');
    el.desktopValue.textContent = runtime.degraded ? 'Degraded' : runtime.ownedByShell ? 'Managed' : 'Reused';
  } catch {
    el.desktopValue.textContent = 'Unavailable';
  }
}

async function refreshQueue() {
  const data = await api('/api/queue');
  state.jobs = data.jobs || [];
  renderQueue();
}

async function refreshAssets() {
  const data = await api('/api/assets');
  state.assets = data.assets || [];
  renderAssets();
}

async function refreshAll() {
  await refreshHealth();
  await refreshDesktopRuntime();
  await Promise.all([refreshQueue(), refreshAssets()]);
}

async function addQueue(event) {
  event.preventDefault();
  setMessage('Adding job...');

  try {
    await api('/api/queue', {
      method: 'POST',
      body: JSON.stringify({
        content: el.content.value,
        voice_code: el.voiceCode.value,
        speed: Number(el.speed.value || 1.05),
        incognito: el.incognito.checked ? 1 : 0
      })
    });
    setMessage('Job added. Fake worker will finalize it shortly.');
    await refreshQueue();
    window.setTimeout(refreshAll, 1300);
  } catch (error) {
    setMessage(error.message, 'error');
  }
}

function trimText(value, max) {
  const text = String(value || '');
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function formatDuration(ms) {
  if (!Number.isFinite(Number(ms))) return '-';
  return `${(Number(ms) / 1000).toFixed(1)}s`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setActiveTab(name) {
  el.tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === name));
  el.tabPanels.forEach((panel) => panel.classList.toggle('active', panel.id === `tab-${name}`));
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('zc-theme', theme);
  el.themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
}

el.queueForm.addEventListener('submit', addQueue);
el.refreshQueue.addEventListener('click', refreshQueue);
el.refreshAssets.addEventListener('click', refreshAssets);
el.themeToggle.addEventListener('click', () => {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
});
el.tabs.forEach((tab) => {
  tab.addEventListener('click', () => setActiveTab(tab.dataset.tab));
});

applyTheme(state.theme);
refreshAll().catch((error) => {
  setMessage(error.message, 'error');
});

window.setInterval(refreshHealth, 5000);
window.setInterval(refreshDesktopRuntime, 5000);
