// ── Pricing Page ───────────────────────────────────────────────
async function renderPricing() {
  const user = Auth.user || {};

  document.getElementById('app').innerHTML = `
  <div style="background:#030B14;color:#E8F4FD;font-family:Inter,system-ui,sans-serif;min-height:100vh">

    <!-- ── TOP NAV ──────────────────────────────────── -->
    <nav style="background:rgba(3,11,20,.9);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);position:fixed;top:0;width:100%;z-index:50;border-bottom:1px solid rgba(0,229,255,.07);box-shadow:0 10px 40px rgba(0,0,0,.5);display:flex;justify-content:space-between;align-items:center;height:64px;padding:0 28px">
      <div style="display:flex;align-items:center;gap:28px">
        <div style="display:flex;align-items:center;gap:9px;cursor:pointer" onclick="router.go('/dashboard')">
          <div style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#00C4DD,#006FE8);display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(0,229,255,.35)">
            <span class="material-symbols-outlined" style="font-size:17px;color:white;font-variation-settings:'FILL' 1">architecture</span>
          </div>
          <span style="font-size:20px;font-weight:900;letter-spacing:-.04em;color:white">IWB</span>
        </div>
        <div style="display:flex;gap:2px">
          <a onclick="router.go('/dashboard')" style="color:#4B5563;font-size:14px;font-weight:500;padding:8px 14px;border-radius:7px;cursor:pointer;transition:all .15s" onmouseover="this.style.color='#E8F4FD';this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.color='#4B5563';this.style.background=''">Dashboard</a>
          <a style="color:#00E5FF;font-size:14px;font-weight:600;padding:8px 14px;border-radius:7px;background:rgba(0,229,255,.08);border-bottom:2px solid #00E5FF">Pricing</a>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        ${_planBadgeHTML(user)}
        <div onclick="router.go('/dashboard')" style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#00C4DD,#006FE8);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:white;cursor:pointer;box-shadow:0 0 12px rgba(0,229,255,.25)">
          ${(user.username||'U').slice(0,1).toUpperCase()}
        </div>
      </div>
    </nav>

    <!-- ── HERO ─────────────────────────────────────── -->
    <section style="padding:120px 24px 72px;text-align:center;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;pointer-events:none">
        <div class="dot-grid" style="position:absolute;inset:0;opacity:.5"></div>
        <div style="position:absolute;top:-20%;left:50%;transform:translateX(-50%);width:800px;height:500px;background:radial-gradient(ellipse,rgba(0,229,255,.07),transparent 60%)"></div>
      </div>
      <div style="position:relative;z-index:10;max-width:680px;margin:0 auto">
        <div style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#00E5FF;padding:5px 16px;border:1px solid rgba(0,229,255,.18);border-radius:100px;background:rgba(0,229,255,.05);margin-bottom:20px">Pricing</div>
        <h1 style="font-size:clamp(2rem,5vw,3.6rem);font-weight:900;letter-spacing:-.04em;color:#E8F4FD;margin:0 0 16px;line-height:1.1">Alege planul potrivit</h1>
        <p style="color:#4B5563;font-size:18px;max-width:520px;margin:0 auto;line-height:1.65">Construiește orice tip de website. Începe gratuit, upgradează când ești gata.</p>
      </div>
    </section>

    <!-- ── PLANS ─────────────────────────────────────── -->
    <section style="padding:0 24px 100px">
      <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:22px;align-items:center">
        ${_planCard({
          name:'Free', price:'0', period:'pentru totdeauna',
          color:'#94A3B8', highlight:false,
          features:['5 proiecte','35+ componente','Export HTML/CSS/JS','Link public de sharing','Versioning (10 versiuni)'],
          cta:'Plan curent', ctaDisabled: user.plan === 'free' || !user.plan,
          plan:'free'
        }, user)}
        ${_planCard({
          name:'Pro', price:'9.99', period:'/lună',
          color:'#00E5FF', highlight:true,
          badge:'Popular',
          features:['Proiecte nelimitate','Toate componentele','Export + Deploy','Versioning nelimitat','Domeniu personalizat (curând)','Suport prioritar','Badge PRO pe cont'],
          cta:'Alege Pro', plan:'pro'
        }, user)}
        ${_planCard({
          name:'Enterprise', price:'29.99', period:'/lună',
          color:'#8B5CF6', highlight:false,
          features:['Tot ce include Pro','Colaborare în echipă (curând)','White-label export','SLA 99.9%','Manager de cont dedicat','Factură fiscală'],
          cta:'Alege Enterprise', plan:'enterprise'
        }, user)}
      </div>
    </section>

    <!-- ── PAYMENT HISTORY ───────────────────────────── -->
    <section id="payment-history-section" style="display:none;padding:0 24px 100px;max-width:780px;margin:0 auto">
      <h2 style="font-size:24px;font-weight:800;letter-spacing:-.03em;color:#E8F4FD;margin:0 0 24px">Istoric plăți</h2>
      <div id="payment-history-list" style="display:flex;flex-direction:column;gap:12px"></div>
    </section>
  </div>

  <!-- ── CHECKOUT MODAL ─────────────────────────────── -->
  <div id="checkout-modal" style="display:none;position:fixed;inset:0;z-index:1000;background:rgba(3,11,20,.88);backdrop-filter:blur(10px);align-items:center;justify-content:center;padding:16px" onclick="if(event.target===this)closeCheckout()">
    <div style="background:#071220;border:1px solid rgba(0,229,255,.12);border-radius:20px;width:100%;max-width:460px;overflow:hidden;box-shadow:0 50px 100px rgba(0,0,0,.8),0 0 60px rgba(0,229,255,.05)" onclick="event.stopPropagation()">
      <div id="checkout-inner"></div>
    </div>
  </div>`;

  document.getElementById('checkout-modal').style.display = 'none';
  _loadPaymentHistory();
}

function _planBadgeHTML(user) {
  if (!user || !user.plan || user.plan === 'free') return '';
  if (user.plan_expires_at && new Date(user.plan_expires_at) < new Date()) return '';
  const colors = { pro:'#00E5FF', enterprise:'#8B5CF6' };
  const c = colors[user.plan] || '#00E5FF';
  return `<span style="background:${c}15;color:${c};border:1px solid ${c}35;padding:4px 12px;border-radius:100px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em">${user.plan.toUpperCase()}</span>`;
}

function _planCard({name, price, period, color, highlight, badge, features, cta, plan, ctaDisabled}, user) {
  const isCurrentPlan = user.plan === plan || (!user.plan && plan === 'free');
  const isPaid = plan !== 'free';

  return `
  <div class="card-3d" onmousemove="tilt(this,event)" onmouseleave="untilt(this)"
    style="position:relative;background:${highlight?'linear-gradient(135deg,rgba(0,229,255,.06),rgba(79,124,255,.04))':'rgba(255,255,255,.02)'};border:${highlight?'2px solid rgba(0,229,255,.28)':'1px solid rgba(255,255,255,.06)'};border-radius:20px;padding:38px;display:flex;flex-direction:column;overflow:hidden;${highlight?'box-shadow:0 0 70px rgba(0,229,255,.08),0 40px 80px rgba(0,0,0,.4);transform:scale(1.03)':''}">
    ${highlight?`<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#00E5FF,transparent)"></div>`:''}
    ${badge?`<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#00C4DD,#006FE8);color:white;font-size:11px;font-weight:700;padding:4px 18px;border-radius:100px;letter-spacing:.06em;white-space:nowrap">${badge}</div>`:''}
    <!-- Plan name -->
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${color};margin-bottom:16px">${name}</div>
    <!-- Price -->
    <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:8px">
      <span style="font-size:52px;font-weight:900;color:#E8F4FD;letter-spacing:-.04em;line-height:1">$${price}</span>
      <span style="color:#374151;font-size:15px">${period}</span>
    </div>
    <!-- Separator -->
    <div style="height:1px;background:rgba(255,255,255,.06);margin:20px 0"></div>
    <!-- Features -->
    <ul style="list-style:none;padding:0;margin:0 0 32px;display:flex;flex-direction:column;gap:12px;flex:1">
      ${features.map(f=>`<li style="display:flex;align-items:center;gap:10px;font-size:14px;color:#94A3B8">
        <span style="color:${color};font-size:15px;flex-shrink:0;text-shadow:0 0 10px ${color}50;font-weight:700">✓</span>${f}
      </li>`).join('')}
    </ul>
    <!-- CTA Button -->
    ${isCurrentPlan
      ? `<button disabled style="width:100%;padding:14px;border-radius:11px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);color:#2D3F52;font-size:14px;font-weight:600;cursor:default;font-family:Inter,sans-serif">Plan curent</button>`
      : isPaid
        ? `<button onclick="openCheckout('${plan}')"
            style="width:100%;padding:14px;border-radius:11px;border:none;background:${highlight?'linear-gradient(135deg,#00C4DD,#006FE8)':color};color:white;font-size:14px;font-weight:700;cursor:pointer;font-family:Inter,sans-serif;transition:filter .2s,transform .2s;box-shadow:${highlight?'0 0 24px rgba(0,229,255,.3)':'none'};letter-spacing:-.01em"
            onmouseover="this.style.filter='brightness(1.12)';this.style.transform='translateY(-1px)'"
            onmouseout="this.style.filter='';this.style.transform=''">${cta}</button>`
        : `<button onclick="router.go('/dashboard')"
            style="width:100%;padding:14px;border-radius:11px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#94A3B8;font-size:14px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;transition:all .2s"
            onmouseover="this.style.borderColor='rgba(255,255,255,.15)';this.style.color='#E8F4FD'"
            onmouseout="this.style.borderColor='rgba(255,255,255,.08)';this.style.color='#94A3B8'">${cta}</button>`
    }
  </div>`;
}

async function _loadPaymentHistory() {
  const history = await paymentsAPI.history();
  if (!history || !history.length) return;
  const section = document.getElementById('payment-history-section');
  const list    = document.getElementById('payment-history-list');
  if (!section || !list) return;
  section.style.display = 'block';
  const planColors = { pro:'#00E5FF', enterprise:'#8B5CF6' };
  list.innerHTML = history.map(p=>`
    <div style="background:#060F1A;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:18px 22px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-weight:700;color:#E8F4FD;font-size:14px">IWB ${p.plan.charAt(0).toUpperCase()+p.plan.slice(1)}</div>
        <div style="color:#374151;font-size:12px;margin-top:3px">•••• ${p.card_last4} · ${new Date(p.created_at).toLocaleDateString('ro-RO',{day:'2-digit',month:'long',year:'numeric'})}</div>
        <div style="color:#2D3F52;font-size:11px;margin-top:2px;font-family:JetBrains Mono,monospace">Ref: ${p.reference.substring(0,8).toUpperCase()}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:20px;font-weight:800;color:#E8F4FD;letter-spacing:-.02em">$${p.amount}</div>
        <span style="background:rgba(34,197,94,.1);color:#22C55E;font-size:11px;font-weight:600;padding:3px 10px;border-radius:100px;border:1px solid rgba(34,197,94,.2)">Completat</span>
      </div>
    </div>`).join('');
}

// ── Checkout Modal ──────────────────────────────────────────────
let _checkoutPlan = null;
let _stripe       = null;
let _cardEl       = null;

async function openCheckout(plan) {
  _checkoutPlan = plan;
  const planColors  = { pro:'#00E5FF', enterprise:'#8B5CF6' };
  const planAmounts = { pro:'$9.99',   enterprise:'$29.99' };
  const color  = planColors[plan];
  const amount = planAmounts[plan];

  document.getElementById('checkout-inner').innerHTML = `
    <div style="background:linear-gradient(135deg,${color}12,transparent);border-bottom:1px solid rgba(255,255,255,.06);padding:26px 30px;position:relative">
      <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${color}60,transparent)"></div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${color};margin-bottom:5px">Abonare · Stripe</div>
          <div style="font-size:20px;font-weight:800;color:#E8F4FD;letter-spacing:-.03em">IWB ${plan.charAt(0).toUpperCase()+plan.slice(1)}</div>
        </div>
        <button onclick="closeCheckout()" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:#64748B;cursor:pointer;font-size:20px;line-height:1;padding:4px;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;transition:all .15s" onmouseover="this.style.color='#E8F4FD'" onmouseout="this.style.color='#64748B'">&times;</button>
      </div>
    </div>
    <div style="padding:26px 30px">
      <form id="checkout-form" onsubmit="submitCheckout(event)">

        <div style="margin-bottom:18px">
          <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#374151;margin-bottom:7px;font-family:Inter,sans-serif">Titular card</label>
          <input id="cc-name" type="text" placeholder="Ion Popescu" required autocomplete="cc-name" class="input-cyber" style="font-size:14px"/>
        </div>

        <div style="margin-bottom:26px">
          <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#374151;margin-bottom:7px;font-family:Inter,sans-serif">Date card</label>
          <div id="stripe-card-el" style="background:#060F1A;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:13px 14px;transition:border-color .2s,box-shadow .2s"></div>
          <div id="stripe-card-errors" style="color:#EF4444;font-size:12px;margin-top:6px;font-family:Inter,sans-serif;min-height:18px"></div>
        </div>

        <div id="checkout-error" style="display:none;background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.25);border-radius:9px;padding:11px 14px;color:#ff6b6b;font-size:13px;margin-bottom:16px;font-family:Inter,sans-serif"></div>

        <button id="checkout-btn" type="submit" class="btn-neon"
          style="width:100%;padding:15px;border-radius:11px;border:none;color:white;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:9px;font-family:Inter,sans-serif;letter-spacing:-.01em">
          <span class="material-symbols-outlined" style="font-size:18px">lock</span>
          Plătește ${amount} în siguranță
        </button>
        <p style="text-align:center;color:#2D3F52;font-size:11px;margin-top:12px;margin-bottom:0;font-family:Inter,sans-serif">
          🔒 Securizat prin Stripe · Test mode — niciun card real nu va fi debitat
        </p>
      </form>
    </div>`;

  document.getElementById('checkout-modal').style.display = 'flex';

  // Mount Stripe Card Element
  try {
    if (!_stripe) {
      const cfg = await paymentsAPI.config();
      if (!cfg?.publishable_key) throw new Error('Stripe key missing');
      _stripe = Stripe(cfg.publishable_key);
    }
    const elements = _stripe.elements();
    _cardEl = elements.create('card', {
      hidePostalCode: true,
      style: {
        base: {
          color: '#E8F4FD',
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: '15px',
          fontSmoothing: 'antialiased',
          '::placeholder': { color: '#4B5563' },
          iconColor: '#00E5FF',
        },
        invalid: { color: '#EF4444', iconColor: '#EF4444' },
      },
    });
    _cardEl.mount('#stripe-card-el');
    _cardEl.on('change', ev => {
      const errEl = document.getElementById('stripe-card-errors');
      if (errEl) errEl.textContent = ev.error ? ev.error.message : '';
    });
    _cardEl.on('focus', () => {
      const el = document.getElementById('stripe-card-el');
      if (el) { el.style.borderColor='#00E5FF'; el.style.boxShadow='0 0 0 3px rgba(0,229,255,.08)'; }
    });
    _cardEl.on('blur', () => {
      const el = document.getElementById('stripe-card-el');
      if (el) { el.style.borderColor='rgba(255,255,255,.07)'; el.style.boxShadow='none'; }
    });
  } catch (err) {
    const errBox = document.getElementById('checkout-error');
    if (errBox) { errBox.textContent = 'Nu s-a putut încărca modulul de plată. Reîncarcă pagina.'; errBox.style.display='block'; }
  }
}

function closeCheckout() {
  if (_cardEl) { try { _cardEl.destroy(); } catch {} _cardEl = null; }
  document.getElementById('checkout-modal').style.display = 'none';
  _checkoutPlan = null;
}

async function submitCheckout(e) {
  e.preventDefault();
  if (!_stripe || !_cardEl) return;

  const btn    = document.getElementById('checkout-btn');
  const errBox = document.getElementById('checkout-error');
  errBox.style.display = 'none';

  const name = (document.getElementById('cc-name').value || '').trim();
  if (!name) { errBox.textContent='Introduceți numele titularului.'; errBox.style.display='block'; return; }

  const planAmounts = { pro:'$9.99', enterprise:'$29.99' };
  const resetBtn = () => {
    btn.disabled = false;
    btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px">lock</span> Plătește ${planAmounts[_checkoutPlan]} în siguranță`;
  };
  const showError = msg => { errBox.textContent=msg; errBox.style.display='block'; resetBtn(); };

  btn.disabled = true;
  btn.innerHTML = `<span class="iwb-spinner" style="width:18px;height:18px;border-width:2px"></span> Procesare...`;

  // 1. Create PaymentIntent on backend
  const intent = await paymentsAPI.createIntent({ plan: _checkoutPlan });
  if (!intent?.client_secret) { showError(parseError(intent) || 'Eroare la inițializarea plății.'); return; }

  // 2. Confirm with Stripe (card data never touches our server)
  const { paymentIntent, error } = await _stripe.confirmCardPayment(intent.client_secret, {
    payment_method: { card: _cardEl, billing_details: { name } }
  });

  if (error) { showError(error.message); return; }
  if (paymentIntent.status !== 'succeeded') { showError('Plata nu a putut fi confirmată. Încearcă din nou.'); return; }

  // 3. Confirm plan activation on backend
  btn.innerHTML = `<span class="iwb-spinner" style="width:18px;height:18px;border-width:2px"></span> Activare plan...`;
  const result = await paymentsAPI.confirm({ payment_intent_id: paymentIntent.id, plan: _checkoutPlan });
  if (!result?.plan) { showError(parseError(result) || 'Plata a trecut dar activarea a eșuat. Contactează suportul.'); return; }

  _checkoutSuccess(result);
}

function _checkoutSuccess(result) {
  const planColors = { pro:'#00E5FF', enterprise:'#8B5CF6' };
  const color      = planColors[result.plan] || '#00E5FF';
  const planLabel  = result.plan.charAt(0).toUpperCase() + result.plan.slice(1);
  const ref        = result.payment?.reference?.substring(0,8).toUpperCase() || '—';

  authAPI.getProfile().then(fresh => { if (fresh && fresh.id) Auth.user = fresh; });

  document.getElementById('checkout-inner').innerHTML = `
    <div style="padding:48px 36px;text-align:center">
      <div style="width:76px;height:76px;border-radius:50%;background:rgba(34,197,94,.1);border:2px solid #22C55E;display:flex;align-items:center;justify-content:center;margin:0 auto 22px;font-size:34px;box-shadow:0 0 30px rgba(34,197,94,.2)">✅</div>
      <h2 style="font-size:22px;font-weight:800;color:#E8F4FD;margin:0 0 10px;letter-spacing:-.03em">Plată confirmată!</h2>
      <p style="color:#4B5563;font-size:14px;margin:0 0 30px;line-height:1.55">Un email de confirmare a fost trimis la adresa ta.</p>

      <div style="background:#030B14;border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:18px 22px;margin-bottom:30px;text-align:left">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px">
          <span style="color:#374151;font-size:13px">Plan activat</span>
          <span style="color:${color};font-weight:700;font-size:13px;text-shadow:0 0 12px ${color}50">IWB ${planLabel}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:#374151;font-size:13px">Referință</span>
          <span style="color:#4B5563;font-size:12px;font-family:JetBrains Mono,monospace">${ref}...</span>
        </div>
      </div>

      <div style="display:flex;gap:10px">
        <button onclick="closeCheckout();renderPricing()"
          style="flex:1;padding:13px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#94A3B8;font-size:14px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;transition:all .2s"
          onmouseover="this.style.color='#E8F4FD'" onmouseout="this.style.color='#94A3B8'">Înapoi la Pricing</button>
        <button onclick="closeCheckout();router.go('/dashboard')" class="btn-neon"
          style="flex:1;padding:13px;border-radius:10px;border:none;color:white;font-size:14px;font-weight:700;cursor:pointer;font-family:Inter,sans-serif;letter-spacing:-.01em">Dashboard →</button>
      </div>
    </div>`;
}
