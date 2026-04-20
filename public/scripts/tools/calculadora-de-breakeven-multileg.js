/* HYDRA WIDGET | calculadora-de-breakeven-multileg | calculator | en */
/* Generated: 2026-04-20 — REAL BUSINESS LOGIC | Tier 1 priority batch */
(function () {
  'use strict';

  const TOOL_ID   = 'calculadora-de-breakeven-multileg';
  const TOOL_TYPE = 'calculator';
  const LANG      = 'en';
  const REQUIRES_API = false;

  const INPUTS = [
  {
    "id": "capital",
    "label": "Capital",
    "type": "number",
    "placeholder": "10000",
    "unit": "USD"
  },
  {
    "id": "fee_per_leg",
    "label": "Fee per Leg (%)",
    "type": "number",
    "placeholder": "0.10",
    "unit": "%"
  },
  {
    "id": "num_legs",
    "label": "Number of Legs",
    "type": "number",
    "placeholder": "3",
    "unit": "#"
  },
  {
    "id": "slippage",
    "label": "Slippage per Leg (%)",
    "type": "number",
    "placeholder": "0.05",
    "unit": "%"
  },
  {
    "id": "gas_per_leg",
    "label": "Gas per Leg",
    "type": "number",
    "placeholder": "2.50",
    "unit": "USD"
  }
];
  const OUTPUTS = [
  {
    "id": "total_fees",
    "label": "Total Fee Cost (USD)",
    "format": "currency"
  },
  {
    "id": "total_slip",
    "label": "Total Slippage (USD)",
    "format": "currency"
  },
  {
    "id": "total_gas",
    "label": "Total Gas (USD)",
    "format": "currency"
  },
  {
    "id": "total_costs",
    "label": "Total Costs (USD)",
    "format": "currency"
  },
  {
    "id": "breakeven_pct",
    "label": "Breakeven Spread (%)",
    "format": "percent"
  },
  {
    "id": "min_target",
    "label": "Min Profit Target (USD)",
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
    const capital   = parseFloat(vals.capital);
    const feePct    = parseFloat(vals.fee_per_leg) / 100;
    const legs      = parseFloat(vals.num_legs);
    const slipPct   = parseFloat(vals.slippage) / 100;
    const gasPerLeg = parseFloat(vals.gas_per_leg);
    const totalFees  = capital * feePct * legs;
    const totalSlip  = capital * slipPct * legs;
    const totalGas   = gasPerLeg * legs;
    const totalCosts = totalFees + totalSlip + totalGas;
    const breakeven  = (totalCosts / capital) * 100;
    const minTarget  = totalCosts * 1.5;
    return {
      total_fees:    '$' + totalFees.toFixed(2),
      total_slip:    '$' + totalSlip.toFixed(2),
      total_gas:     '$' + totalGas.toFixed(2),
      total_costs:   '$' + totalCosts.toFixed(2),
      breakeven_pct: breakeven.toFixed(3) + '%',
      min_target:    '$' + minTarget.toFixed(2),
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
