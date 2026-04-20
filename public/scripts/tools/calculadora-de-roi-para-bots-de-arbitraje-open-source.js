/* HYDRA WIDGET | calculadora-de-roi-para-bots-de-arbitraje-open-source | calculator | en */
/* Generated: 2026-04-20 — REAL BUSINESS LOGIC | Tier 1 priority batch */
(function () {
  'use strict';

  const TOOL_ID   = 'calculadora-de-roi-para-bots-de-arbitraje-open-source';
  const TOOL_TYPE = 'calculator';
  const LANG      = 'en';
  const REQUIRES_API = false;

  const INPUTS = [
  {
    "id": "capital",
    "label": "Initial Capital",
    "type": "number",
    "placeholder": "10000",
    "unit": "USD"
  },
  {
    "id": "daily_profit",
    "label": "Avg Profit per Trade (%)",
    "type": "number",
    "placeholder": "0.15",
    "unit": "%"
  },
  {
    "id": "daily_trades",
    "label": "Trades per Day",
    "type": "number",
    "placeholder": "20",
    "unit": "#"
  },
  {
    "id": "operating_days",
    "label": "Operating Days",
    "type": "number",
    "placeholder": "30",
    "unit": "days"
  },
  {
    "id": "monthly_cost",
    "label": "Monthly Operating Cost",
    "type": "number",
    "placeholder": "100",
    "unit": "USD"
  }
];
  const OUTPUTS = [
  {
    "id": "gross_profit",
    "label": "Gross Profit (USD)",
    "format": "currency"
  },
  {
    "id": "op_costs",
    "label": "Operating Costs (USD)",
    "format": "currency"
  },
  {
    "id": "net_profit",
    "label": "Net Profit (USD)",
    "format": "currency"
  },
  {
    "id": "roi_pct",
    "label": "ROI (%)",
    "format": "percent"
  },
  {
    "id": "daily_avg",
    "label": "Daily Average (USD)",
    "format": "currency"
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

  /* ── calculate (REAL BUSINESS LOGIC) ─────────────────── */
  function calculate(vals) {
    const capital    = parseFloat(vals.capital);
    const profitPct  = parseFloat(vals.daily_profit) / 100;
    const trades     = parseFloat(vals.daily_trades);
    const days       = parseFloat(vals.operating_days);
    const monthlyCost= parseFloat(vals.monthly_cost);
    const grossProfit = capital * profitPct * trades * days;
    const opCosts     = monthlyCost * (days / 30);
    const netProfit   = grossProfit - opCosts;
    const roi         = (netProfit / capital) * 100;
    const dailyAvg    = netProfit / days;
    return {
      gross_profit: '$' + grossProfit.toFixed(2),
      op_costs:     '$' + opCosts.toFixed(2),
      net_profit:   (netProfit >= 0 ? '+' : '') + '$' + netProfit.toFixed(2),
      roi_pct:      roi.toFixed(2) + '%',
      daily_avg:    '$' + dailyAvg.toFixed(2),
    };
  }

  /* ── render results ──────────────────────────────────── */
  function renderResults(res) {
    return OUTPUTS.map((out) => {
      const val = res[out.id] ?? '—';
      return `<div class="hw-result-row">
        <span class="hw-result-label">${out.label}</span>
        <span class="hw-result-value hw-format-${out.format}">${val}</span>
      </div>`;
    }).join('\n');
  }

  /* ── fetch market data ───────────────────────────────── */
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
      try {
        const results = calculate({...vals, ...marketData});
        resGrid.innerHTML = renderResults(results);
        resPanel.hidden = false;
        const cta = document.getElementById('cta-primary');
        if (cta) { cta.hidden = false; cta.scrollIntoView({behavior:'smooth',block:'nearest'}); }
        if (window.gtag) gtag('event', 'tool_calculate', {tool_id: TOOL_ID, tool_type: TOOL_TYPE});
      } catch (err) {
        errBox.textContent = T.error; errBox.hidden = false;
        console.error('Calculation error:', err);
      }
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
