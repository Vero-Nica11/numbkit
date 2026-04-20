/* HYDRA WIDGET | calculadora-de-ahorro-jubilacion-autonomos | calculator | es */
/* Generated: 2026-04-20 — REAL BUSINESS LOGIC | Tier 1 priority batch */
(function () {
  'use strict';

  const TOOL_ID   = 'calculadora-de-ahorro-jubilacion-autonomos';
  const TOOL_TYPE = 'calculator';
  const LANG      = 'es';
  const REQUIRES_API = false;

  const INPUTS = [
  {
    "id": "current_age",
    "label": "Edad Actual",
    "type": "number",
    "placeholder": "30",
    "unit": "años"
  },
  {
    "id": "retirement_age",
    "label": "Edad de Jubilación",
    "type": "number",
    "placeholder": "65",
    "unit": "años"
  },
  {
    "id": "current_savings",
    "label": "Ahorros Actuales (USD)",
    "type": "number",
    "placeholder": "10000",
    "unit": "USD"
  },
  {
    "id": "monthly_contrib",
    "label": "Aporte Mensual (USD)",
    "type": "number",
    "placeholder": "500",
    "unit": "USD"
  },
  {
    "id": "annual_return",
    "label": "Rendimiento Anual Esperado (%)",
    "type": "number",
    "placeholder": "7",
    "unit": "%"
  }
];
  const OUTPUTS = [
  {
    "id": "total_retirement",
    "label": "Capital a la Jubilación",
    "format": "currency"
  },
  {
    "id": "total_contrib",
    "label": "Total Aportado",
    "format": "currency"
  },
  {
    "id": "total_interest",
    "label": "Intereses Generados",
    "format": "currency"
  },
  {
    "id": "monthly_income",
    "label": "Renta Mensual (regla 4%)",
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
    const age      = parseFloat(vals.current_age);
    const retAge   = parseFloat(vals.retirement_age);
    const savings  = parseFloat(vals.current_savings);
    const monthly  = parseFloat(vals.monthly_contrib);
    const annReturn= parseFloat(vals.annual_return) / 100;
    const years    = retAge - age;
    const months   = years * 12;
    const monthlyR = annReturn / 12;
    const fvCurrent = savings * Math.pow(1 + annReturn, years);
    const fvContrib = monthly * ((Math.pow(1 + monthlyR, months) - 1) / monthlyR);
    const total     = fvCurrent + fvContrib;
    const totalContrib = savings + (monthly * months);
    const interest  = total - totalContrib;
    const monthlyIncome = (total * 0.04) / 12;
    return {
      total_retirement: '$' + total.toFixed(0),
      total_contrib:    '$' + totalContrib.toFixed(0),
      total_interest:   '$' + interest.toFixed(0),
      monthly_income:   '$' + monthlyIncome.toFixed(0),
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
