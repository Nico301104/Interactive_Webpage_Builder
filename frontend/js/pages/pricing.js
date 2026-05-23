// ── Pricing Page ───────────────────────────────────────────────
async function renderPricing() {
  const user = Auth.user || {};

  document.getElementById('app').innerHTML = `
  <div class="bg-background text-on-background font-body-md min-h-screen">
    <!-- TopNav -->
    <nav class="bg-[#111A2E]/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-slate-800 shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex justify-between items-center h-16 px-6">
      <div class="flex items-center gap-8">
        <div class="text-xl font-bold tracking-tight text-slate-50 cursor-pointer" onclick="router.go('/dashboard')">IWB</div>
        <div class="hidden md:flex gap-6 items-center h-full">
          <a onclick="router.go('/dashboard')" class="text-slate-400 hover:text-slate-200 h-16 flex items-center cursor-pointer">Dashboard</a>
          <a class="text-[#4F7CFF] border-b-2 border-[#4F7CFF] pb-1 h-16 flex items-center cursor-pointer">Pricing</a>
        </div>
      </div>
      <div class="flex items-center gap-3">
        ${_planBadgeHTML(user)}
        <div class="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center border border-outline-variant cursor-pointer" onclick="router.go('/dashboard')">
          ${(user.username||'U').slice(0,1).toUpperCase()}
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="pt-32 pb-16 text-center px-4 relative overflow-hidden">
      <div class="absolute inset-0" style="background:radial-gradient(circle at 50% -10%,rgba(79,124,255,.2) 0%,transparent 55%)"></div>
      <div class="absolute inset-0" style="background-image:radial-gradient(circle,rgba(255,255,255,0.02) 1px,transparent 1px);background-size:28px 28px"></div>
      <div class="relative z-10 max-w-3xl mx-auto">
        <span style="display:inline-block;background:rgba(79,124,255,.12);color:#4F7CFF;border:1px solid rgba(79,124,255,.3);padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:20px">Pricing</span>
        <h1 class="text-h1 font-h1 text-on-surface mb-4">Alege planul potrivit</h1>
        <p class="text-on-surface-variant text-body-lg max-w-xl mx-auto">Construiește orice tip de website. Începe gratuit, upgradează când ești gata.</p>
      </div>
    </section>

    <!-- Plans -->
    <section class="pb-24 px-4">
      <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        ${_planCard({
          name:'Free', price:'0', period:'pentru totdeauna',
          color:'#94A3B8', highlight:false,
          features:['5 proiecte','35+ componente','Export HTML/CSS/JS','Link public de sharing','Versioning (10 versiuni)'],
          cta:'Plan curent', ctaDisabled: user.plan === 'free' || !user.plan,
          plan:'free'
        }, user)}
        ${_planCard({
          name:'Pro', price:'9.99', period:'/lună',
          color:'#4F7CFF', highlight:true,
          badge:'Popular',
          features:['Proiecte nelimitate','Toate componentele','Export + Deploy','Versioning nelimitat','Domeniu personalizat (curând)','Suport prioritar','Badge PRO pe cont'],
          cta:'Alege Pro', plan:'pro'
        }, user)}
        ${_planCard({
          name:'Enterprise', price:'29.99', period:'/lună',
          color:'#a78bfa', highlight:false,
          features:['Tot ce include Pro','Colaborare în echipă (curând)','White-label export','SLA 99.9%','Manager de cont dedicat','Factură fiscală'],
          cta:'Alege Enterprise', plan:'enterprise'
        }, user)}
      </div>
    </section>

    <!-- Payment history -->
    <section id="payment-history-section" class="pb-24 px-4 max-w-3xl mx-auto" style="display:none">
      <h2 class="text-h3 font-h3 text-on-surface mb-6">Istoric plăți</h2>
      <div id="payment-history-list" class="flex flex-col gap-3"></div>
    </section>
  </div>

  <!-- Checkout Modal -->
  <div id="checkout-modal" style="display:none;position:fixed;inset:0;z-index:1000;background:rgba(5,20,36,.85);backdrop-filter:blur(8px);align-items:center;justify-content:center;padding:16px" onclick="if(event.target===this)closeCheckout()">
    <div style="background:#0d1c2d;border:1px solid #1F2A44;border-radius:16px;width:100%;max-width:460px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,.6)" onclick="event.stopPropagation()">
      <div id="checkout-inner"></div>
    </div>
  </div>
  `;

  // hide modal initially
  document.getElementById('checkout-modal').style.display = 'none';

  // load payment history if logged in
  _loadPaymentHistory();
}

function _planBadgeHTML(user) {
  if (!user || !user.plan || user.plan === 'free') return '';
  if (user.plan_expires_at && new Date(user.plan_expires_at) < new Date()) return '';
  const colors = { pro: '#4F7CFF', enterprise: '#a78bfa' };
  const c = colors[user.plan] || '#4F7CFF';
  return `<span style="background:rgba(${user.plan==='pro'?'79,124,255':'167,139,250'},.15);color:${c};border:1px solid ${c}40;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em">${user.plan.toUpperCase()}</span>`;
}

function _planCard({name, price, period, color, highlight, badge, features, cta, plan}, user) {
  const isCurrentPlan = user.plan === plan || (!user.plan && plan === 'free');
  const isPaid = plan !== 'free';
  const border = highlight ? `border:2px solid ${color};` : 'border:1px solid #1F2A44;';
  const shadow = highlight ? `box-shadow:0 0 40px ${color}22;` : '';

  return `
  <div style="background:#111A2E;${border}${shadow}border-radius:14px;padding:28px;display:flex;flex-direction:column;position:relative;${highlight?'transform:scale(1.03);':''}" >
    ${badge ? `<span style="position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:${color};color:white;font-size:11px;font-weight:700;padding:3px 14px;border-radius:20px;letter-spacing:.06em">${badge}</span>` : ''}
    <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${color};margin-bottom:12px">${name}</div>
    <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:6px">
      <span style="font-size:42px;font-weight:800;color:#E5E7EB;line-height:1">$${price}</span>
      <span style="color:#64748B;font-size:14px">${period}</span>
    </div>
    <div style="height:1px;background:#1F2A44;margin:20px 0"></div>
    <ul style="list-style:none;padding:0;margin:0 0 24px;display:flex;flex-direction:column;gap:10px;flex:1">
      ${features.map(f=>`<li style="display:flex;align-items:center;gap:10px;font-size:14px;color:#CBD5E1">
        <span style="color:${color};font-size:18px;flex-shrink:0">✓</span>${f}
      </li>`).join('')}
    </ul>
    ${isCurrentPlan
      ? `<button disabled style="width:100%;padding:12px;border-radius:8px;border:1px solid #1F2A44;background:transparent;color:#4F6080;font-size:14px;font-weight:600;cursor:default">Plan curent</button>`
      : isPaid
        ? `<button onclick="openCheckout('${plan}')" style="width:100%;padding:12px;border-radius:8px;border:none;background:${color};color:white;font-size:14px;font-weight:700;cursor:pointer;transition:filter .2s" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter=''">${cta}</button>`
        : `<button onclick="router.go('/dashboard')" style="width:100%;padding:12px;border-radius:8px;border:1px solid #1F2A44;background:transparent;color:#94A3B8;font-size:14px;font-weight:600;cursor:pointer">${cta}</button>`
    }
  </div>`;
}

async function _loadPaymentHistory() {
  const history = await paymentsAPI.history();
  if (!history || !history.length) return;
  const section = document.getElementById('payment-history-section');
  const list = document.getElementById('payment-history-list');
  if (!section || !list) return;
  section.style.display = 'block';
  const planColors = { pro:'#4F7CFF', enterprise:'#a78bfa' };
  list.innerHTML = history.map(p=>`
    <div style="background:#111A2E;border:1px solid #1F2A44;border-radius:10px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-weight:600;color:#E5E7EB;font-size:14px">IWB ${p.plan.charAt(0).toUpperCase()+p.plan.slice(1)}</div>
        <div style="color:#64748B;font-size:12px;margin-top:3px">•••• ${p.card_last4} · ${new Date(p.created_at).toLocaleDateString('ro-RO',{day:'2-digit',month:'long',year:'numeric'})}</div>
        <div style="color:#4F6080;font-size:11px;margin-top:2px;font-family:monospace">Ref: ${p.reference.substring(0,8).toUpperCase()}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:18px;font-weight:700;color:#E5E7EB">$${p.amount}</div>
        <span style="background:rgba(74,222,128,.1);color:#4ade80;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px">Completat</span>
      </div>
    </div>
  `).join('');
}

// ── Checkout Modal ──────────────────────────────────────────────
let _checkoutPlan = null;

function openCheckout(plan) {
  _checkoutPlan = plan;
  const planLabels = { pro: 'Pro — $9.99/lună', enterprise: 'Enterprise — $29.99/lună' };
  const planColors = { pro: '#4F7CFF', enterprise: '#a78bfa' };
  const color = planColors[plan];

  document.getElementById('checkout-inner').innerHTML = `
    <div style="background:linear-gradient(135deg,${color}22,transparent);border-bottom:1px solid #1F2A44;padding:24px 28px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:${color};margin-bottom:4px">Abonare</div>
          <div style="font-size:20px;font-weight:700;color:#E5E7EB">IWB ${plan.charAt(0).toUpperCase()+plan.slice(1)}</div>
        </div>
        <button onclick="closeCheckout()" style="background:none;border:none;color:#64748B;cursor:pointer;font-size:22px;line-height:1;padding:4px">&times;</button>
      </div>
    </div>
    <div style="padding:24px 28px">
      <form id="checkout-form" onsubmit="submitCheckout(event)">
        <div style="margin-bottom:18px">
          <label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94A3B8;margin-bottom:6px">Titular card</label>
          <input id="cc-name" type="text" placeholder="Ion Popescu" required autocomplete="cc-name"
            style="width:100%;background:#080E1A;border:1px solid #1F2A44;border-radius:8px;padding:10px 14px;color:#E5E7EB;font-size:14px;outline:none;box-sizing:border-box"
            onfocus="this.style.borderColor='${color}'" onblur="this.style.borderColor='#1F2A44'"/>
        </div>
        <div style="margin-bottom:18px">
          <label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94A3B8;margin-bottom:6px">Număr card</label>
          <div style="position:relative">
            <input id="cc-number" type="text" placeholder="1234 5678 9012 3456" required maxlength="19" autocomplete="cc-number"
              style="width:100%;background:#080E1A;border:1px solid #1F2A44;border-radius:8px;padding:10px 42px 10px 14px;color:#E5E7EB;font-size:14px;outline:none;box-sizing:border-box;font-family:JetBrains Mono,monospace;letter-spacing:.05em"
              onfocus="this.style.borderColor='${color}'" onblur="this.style.borderColor='#1F2A44'"
              oninput="formatCardNumber(this)"/>
            <span id="card-brand-icon" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:20px">💳</span>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px">
          <div>
            <label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94A3B8;margin-bottom:6px">Expiră (MM/YY)</label>
            <input id="cc-expiry" type="text" placeholder="12/27" required maxlength="5" autocomplete="cc-exp"
              style="width:100%;background:#080E1A;border:1px solid #1F2A44;border-radius:8px;padding:10px 14px;color:#E5E7EB;font-size:14px;outline:none;box-sizing:border-box;font-family:JetBrains Mono,monospace"
              onfocus="this.style.borderColor='${color}'" onblur="this.style.borderColor='#1F2A44'"
              oninput="formatExpiry(this)"/>
          </div>
          <div>
            <label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94A3B8;margin-bottom:6px">CVV</label>
            <input id="cc-cvv" type="text" placeholder="•••" required maxlength="4" autocomplete="cc-csc"
              style="width:100%;background:#080E1A;border:1px solid #1F2A44;border-radius:8px;padding:10px 14px;color:#E5E7EB;font-size:14px;outline:none;box-sizing:border-box;font-family:JetBrains Mono,monospace"
              onfocus="this.style.borderColor='${color}'" onblur="this.style.borderColor='#1F2A44'"
              oninput="this.value=this.value.replace(/\D/g,'')"/>
          </div>
        </div>

        <div id="checkout-error" style="display:none;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:10px 14px;color:#FCA5A5;font-size:13px;margin-bottom:16px"></div>

        <button id="checkout-btn" type="submit"
          style="width:100%;padding:14px;border-radius:8px;border:none;background:${color};color:white;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:filter .2s"
          onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter=''">
          <span class="material-symbols-outlined" style="font-size:18px">lock</span>
          Plătește ${ {pro:'$9.99',enterprise:'$29.99'}[plan] } în siguranță
        </button>
        <p style="text-align:center;color:#4F6080;font-size:11px;margin-top:12px;margin-bottom:0">
          🔒 Plată simulată · Niciun card real nu va fi debitat
        </p>
      </form>
    </div>
  `;
  document.getElementById('checkout-modal').style.display = 'flex';
}

function closeCheckout() {
  document.getElementById('checkout-modal').style.display = 'none';
  _checkoutPlan = null;
}

function formatCardNumber(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
  const first = v[0];
  const icon = document.getElementById('card-brand-icon');
  if (icon) icon.textContent = first === '4' ? '💳' : first === '5' ? '💳' : first === '3' ? '💳' : '💳';
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
  input.value = v;
}

async function submitCheckout(e) {
  e.preventDefault();
  const btn = document.getElementById('checkout-btn');
  const errBox = document.getElementById('checkout-error');
  errBox.style.display = 'none';

  const cardNumber = document.getElementById('cc-number').value.replace(/\s/g, '');
  const expiry = document.getElementById('cc-expiry').value;
  const cvv = document.getElementById('cc-cvv').value;
  const name = document.getElementById('cc-name').value;

  btn.disabled = true;
  btn.innerHTML = `<span style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:spin .7s linear infinite"></span> Procesare...`;

  if (!document.getElementById('checkout-modal').querySelector('style')) {
    const s = document.createElement('style');
    s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.getElementById('checkout-modal').appendChild(s);
  }

  const result = await paymentsAPI.checkout({
    plan: _checkoutPlan,
    card_number: cardNumber,
    card_expiry: expiry,
    card_cvv: cvv,
    card_name: name,
  });

  const resetBtn = () => {
    btn.disabled = false;
    btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px">lock</span> Plătește ${{pro:'$9.99',enterprise:'$29.99'}[_checkoutPlan]} în siguranță`;
  };
  const showError = (msg) => {
    errBox.textContent = msg;
    errBox.style.display = 'block';
    resetBtn();
  };

  if (!result) { showError('Eroare de rețea. Încearcă din nou.'); return; }
  if (result.plan) { _checkoutSuccess(result); return; }

  // server validation error — flatten DRF error dict
  const msg = result.detail || Object.values(result).flat().join(' ') || 'Eroare necunoscută.';
  showError(msg);
}

function _checkoutSuccess(result) {
  const planColors = { pro:'#4F7CFF', enterprise:'#a78bfa' };
  const color = planColors[result.plan] || '#4F7CFF';
  const planLabel = result.plan.charAt(0).toUpperCase() + result.plan.slice(1);
  const ref = result.payment?.reference?.substring(0, 8).toUpperCase() || '—';

  // refresh user from server so plan/is_pro/plan_expires_at are accurate
  authAPI.getProfile().then(fresh => { if (fresh && fresh.id) Auth.user = fresh; });

  document.getElementById('checkout-inner').innerHTML = `
    <div style="padding:40px 32px;text-align:center">
      <div style="width:72px;height:72px;border-radius:50%;background:rgba(74,222,128,.12);border:2px solid #4ade80;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:32px">✅</div>
      <h2 style="font-size:22px;font-weight:800;color:#E5E7EB;margin:0 0 8px">Plată confirmată!</h2>
      <p style="color:#94A3B8;font-size:14px;margin:0 0 28px">Un email de confirmare a fost trimis la adresa ta.</p>

      <div style="background:#080E1A;border:1px solid #1F2A44;border-radius:10px;padding:16px 20px;margin-bottom:28px;text-align:left">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:#64748B;font-size:13px">Plan activat</span>
          <span style="color:${color};font-weight:700;font-size:13px">IWB ${planLabel}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:#64748B;font-size:13px">Referință</span>
          <span style="color:#94A3B8;font-size:12px;font-family:monospace">${ref}...</span>
        </div>
      </div>

      <div style="display:flex;gap:10px">
        <button onclick="closeCheckout();renderPricing()" style="flex:1;padding:12px;border-radius:8px;border:1px solid #1F2A44;background:transparent;color:#94A3B8;font-size:14px;font-weight:600;cursor:pointer">Înapoi la Pricing</button>
        <button onclick="closeCheckout();router.go('/dashboard')" style="flex:1;padding:12px;border-radius:8px;border:none;background:${color};color:white;font-size:14px;font-weight:700;cursor:pointer">Dashboard →</button>
      </div>
    </div>
  `;
}
