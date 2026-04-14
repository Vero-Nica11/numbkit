/* HYDRA WIDGET | comparador-de-slippage-en-agregadores-dex | comparator | en */
/* Generated: 2026-04-14 — DO NOT EDIT MANUALLY */
(function () {
  'use strict';

  const TOOL_ID   = 'comparador-de-slippage-en-agregadores-dex';
  const TOOL_TYPE = 'comparator';
  const LANG      = 'en';
  const REQUIRES_API = true;

  const INPUTS = [
  {
    "id": "input_asset",
    "label": "Asset / Token",
    "type": "select",
    "options": [
      "BTC",
      "ETH",
      "SOL",
      "XRP",
      "USDT",
      "BNB",
      "ONDO",
      "SUI",
      "HBAR"
    ]
  },
  {
    "id": "input_amount",
    "label": "Amount",
    "type": "number",
    "placeholder": "500",
    "unit": "USD"
  },
  {
    "id": "input_exchange",
    "label": "Exchange A vs B",
    "type": "select",
    "options": [
      "Binance vs Coinbase",
      "Binance vs Kraken",
      "Uniswap vs Curve",
      "Raydium vs Orca"
    ]
  }
];
  const OUTPUTS = [
  {
    "id": "out_spread",
    "label": "Spread (%)",
    "format": "percent"
  },
  {
    "id": "out_diff",
    "label": "Price Difference",
    "format": "currency"
  },
  {
    "id": "out_verdict",
    "label": "Best Option",
    "format": "text"
  }
];

  /* ── i18n ─────────────────────────────────────────────── */
  const T = {
    calculate: LANG === 'es' ? 'Calcular' : 'Calculate',
    reset:     LANG === 'es' ? 'Limpiar'  : 'Reset',
    results:   LANG === 'es' ? 'Resultados' : 'Results',
    loading:   LANG === 'es' ? 'Calculando…' : 'Calculating…',
    error:     LANG === 'es' ? 'Por favor completá todos los campos.' : 'Please fill in all required fields.',
    apiError:  LANG === 'es' ? 'Error al obtener datos de mercado.' : 'Could not fetch market data.',
  };

  /* ── DOM helpers ─────────────────────────────────────── */
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  /* ── render inputs ───────────────────────────────────── */
  function renderInputs() {
    return INPUTS.map(inp => {
      if (inp.type === 'number') {
        return `<label class="hw-label" for="hw-${inp.id}">
          ${inp.label}${inp.unit ? ` <span class="hw-unit">${inp.unit}</span>` : ''}
          <input class="hw-input" id="hw-${inp.id}" name="${inp.id}" type="number"
                 placeholder="${inp.placeholder || ''}" step="any" required>
        </label>`;
      }
      if (inp.type === 'range') {
        return `<label class="hw-label" for="hw-${inp.id}">
          ${inp.label} <span class="hw-range-val" id="hw-${inp.id}-val">${inp.default || 5}</span>
          <input class="hw-range" id="hw-${inp.id}" name="${inp.id}" type="range"
                 min="${inp.min || 1}" max="${inp.max || 10}" value="${inp.default || 5}"
                 oninput="document.getElementById('hw-${inp.id}-val').textContent=this.value">
        </label>`;
      }
      if (inp.type === 'select') {
        const opts = (inp.options || []).map(o => `<option value="${o}">${o}</option>`).join('');
        return `<label class="hw-label" for="hw-${inp.id}">
          ${inp.label}
          <select class="hw-select" id="hw-${inp.id}" name="${inp.id}">${opts}</select>
        </label>`;
      }
      return `<label class="hw-label" for="hw-${inp.id}">
        ${inp.label}
        <textarea class="hw-textarea" id="hw-${inp.id}" name="${inp.id}"
                  placeholder="${inp.placeholder || ''}" rows="3"></textarea>
      </label>`;
    }).join('\n');
  }

  /* ── calculate (placeholder logic — replace with real formulas) ──── */
  function calculate(vals) {
    // TODO: replace with real business logic per tool
    // Current: demonstration proportional calculation
    const nums = Object.values(vals).map(v => parseFloat(v)).filter(n => !isNaN(n));
    const base  = nums.reduce((a, b) => a + b, 0) / (nums.length || 1);
    return {
      out_primary:   (base * 0.035).toFixed(4),
      out_secondary: (base * 0.012).toFixed(2),
      out_tertiary:  LANG === 'es' ? 'Resultado calculado' : 'Calculated result',
    };
  }

  /* ── render results ──────────────────────────────────── */
  function renderResults(res) {
    return OUTPUTS.map((out, i) => {
      const val = res[Object.keys(res)[i]] ?? '—';
      return `<div class="hw-result-row">
        <span class="hw-result-label">${out.label}</span>
        <span class="hw-result-value hw-format-${out.format}">${val}</span>
      </div>`;
    }).join('\n');
  }

  /* ── fetch market data (only if REQUIRES_API) ────────── */
  async function fetchMarketData() {
    if (!REQUIRES_API) return {};
    try {
      const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd', {cache:'no-store'});
      return await r.json();
    } catch { return {}; }
  }

  /* ── mount widget ────────────────────────────────────── */
  async function mount() {
    const container = document.getElementById('hydra-widget');
    if (!container) return;

    let marketData = {};
    if (REQUIRES_API) {
      container.innerHTML = `<p class="hw-loading">${T.loading}</p>`;
      marketData = await fetchMarketData();
    }

    container.innerHTML = `
      <form class="hw-form" id="hw-form-${TOOL_ID}" novalidate>
        <div class="hw-inputs">${renderInputs()}</div>
        <div class="hw-actions">
          <button type="submit" class="hw-btn hw-btn--primary">${T.calculate}</button>
          <button type="reset"  class="hw-btn hw-btn--ghost">${T.reset}</button>
        </div>
        <div class="hw-error" id="hw-error" hidden></div>
        <div class="hw-results-panel" id="hw-results" hidden>
          <h3 class="hw-results-heading">${T.results}</h3>
          <div class="hw-results-grid" id="hw-results-grid"></div>
        </div>
      </form>`;

    const form    = document.getElementById(`hw-form-${TOOL_ID}`);
    const errBox  = document.getElementById('hw-error');
    const resPanel= document.getElementById('hw-results');
    const resGrid = document.getElementById('hw-results-grid');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      errBox.hidden = true;
      const vals = {};
      INPUTS.forEach(inp => {
        const el = document.getElementById(`hw-${inp.id}`);
        if (el) vals[inp.id] = el.value;
      });
      if (Object.values(vals).some(v => v === '' || v == null)) {
        errBox.textContent = T.error; errBox.hidden = false; return;
      }
      const results = calculate({...vals, ...marketData});
      resGrid.innerHTML = renderResults(results);
      resPanel.hidden = false;
      // reveal CTA after calculation — highest CTR moment
      const cta = document.getElementById('cta-primary');
      if (cta) { cta.hidden = false; cta.scrollIntoView({behavior:'smooth',block:'nearest'}); }
      // GA4 event
      if (window.gtag) gtag('event', 'tool_calculate', {tool_id: TOOL_ID, tool_type: TOOL_TYPE});
    });

    form.addEventListener('reset', () => {
      resPanel.hidden = true; errBox.hidden = true;
      const cta = document.getElementById('cta-primary');
      if (cta) cta.hidden = true;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();