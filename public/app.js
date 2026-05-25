const state = {
  health: null,
  jobs: [],
  assets: []
};

const el = {
  healthStatus: document.querySelector('#healthStatus'),
  gatewayValue: document.querySelector('#gatewayValue'),
  dbValue: document.querySelector('#dbValue'),
  browserValue: document.querySelector('#browserValue'),
  workerValue: document.querySelector('#workerValue'),
  queueForm: document.querySelector('#queueForm'),
  content: document.querySelector('#content'),
  voiceCode: document.querySelector('#voiceCode'),
  speed: document.querySelector('#speed'),
  incognito: document.querySelector('#incognito'),
  formMessage: document.querySelector('#formMessage'),
  queueRows: document.querySelector('#queueRows'),
  assetList: document.querySelector('#assetList'),
  refreshQueue: document.querySelector('#refreshQueue'),
  refreshAssets: document.querySelector('#refreshAssets')
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
    return;
  }

  el.assetList.innerHTML = state.assets.map((asset) => `
    <article class="asset">
      <div class="asset-title">
        <strong>${escapeHtml(asset.filename)}</strong>
        <span>${formatDuration(asset.duration_ms)}</span>
      </div>
      <div>${escapeHtml(trimText(asset.content || '', 120))}</div>
      <audio controls preload="none" src="/api/audio/${encodeURIComponent(asset.filename)}"></audio>
    </article>
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

el.queueForm.addEventListener('submit', addQueue);
el.refreshQueue.addEventListener('click', refreshQueue);
el.refreshAssets.addEventListener('click', refreshAssets);

refreshAll().catch((error) => {
  setMessage(error.message, 'error');
});

window.setInterval(refreshHealth, 5000);
