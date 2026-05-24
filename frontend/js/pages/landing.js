// ── Landing Page ──────────────────────────────────────────────
async function renderLanding() {
  if (Auth.isLoggedIn()) { router.go('/dashboard'); return; }

  document.getElementById('app').innerHTML = `
  <div style="background:#030B14;color:#E8F4FD;font-family:Inter,system-ui,sans-serif;min-height:100vh;overflow-x:hidden">

    <!-- ── AMBIENT BACKGROUND LAYER ──────────────────── -->
    <div style="position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden">
      <div class="cyber-grid" style="position:absolute;inset:0;opacity:.6"></div>
      <!-- Radial top glow -->
      <div style="position:absolute;top:-25%;left:50%;transform:translateX(-50%);width:900px;height:600px;background:radial-gradient(ellipse,rgba(0,229,255,.05) 0%,transparent 65%)"></div>
      <!-- Left orb -->
      <div style="position:absolute;top:10%;left:-8%;width:460px;height:460px;border-radius:50%;background:radial-gradient(circle,rgba(79,124,255,.1) 0%,transparent 70%);filter:blur(50px);animation:float-orb 7s ease-in-out infinite"></div>
      <!-- Right orb -->
      <div style="position:absolute;top:35%;right:-6%;width:380px;height:380px;border-radius:50%;background:radial-gradient(circle,rgba(0,229,255,.07) 0%,transparent 70%);filter:blur(60px);animation:float-orb 9s ease-in-out infinite 2s"></div>
      <!-- Bottom orb -->
      <div style="position:absolute;bottom:5%;left:25%;width:600px;height:350px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,.06) 0%,transparent 70%);filter:blur(70px);animation:float-orb 11s ease-in-out infinite 4s"></div>
    </div>

    <!-- ── NAV ───────────────────────────────────────── -->
    <nav style="position:fixed;top:0;width:100%;z-index:50;background:rgba(3,11,20,.88);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid rgba(0,229,255,.07);box-shadow:0 0 0 1px rgba(0,229,255,.04),0 12px 40px rgba(0,0,0,.5);display:flex;justify-content:space-between;align-items:center;height:64px;padding:0 36px">
      <div style="display:flex;align-items:center;gap:36px">
        <!-- Logo -->
        <div style="display:flex;align-items:center;gap:10px;cursor:pointer" onclick="router.go('/')">
          <div style="width:33px;height:33px;border-radius:8px;background:linear-gradient(135deg,#00C4DD,#006FE8);display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(0,229,255,.4)">
            <span class="material-symbols-outlined" style="font-size:19px;color:white;font-variation-settings:'FILL' 1">architecture</span>
          </div>
          <span style="font-size:21px;font-weight:900;letter-spacing:-.04em;color:white">IWB</span>
        </div>
        <!-- Nav links -->
        <nav style="display:flex;gap:2px">
          <a onclick="document.getElementById('features-sec').scrollIntoView({behavior:'smooth'})" style="color:#94A3B8;font-size:14px;font-weight:500;padding:7px 14px;border-radius:7px;cursor:pointer;transition:all .2s" onmouseover="this.style.background='rgba(255,255,255,.05)';this.style.color='#E8F4FD'" onmouseout="this.style.background='';this.style.color='#94A3B8'">Features</a>
          <a onclick="document.getElementById('pricing-sec').scrollIntoView({behavior:'smooth'})" style="color:#94A3B8;font-size:14px;font-weight:500;padding:7px 14px;border-radius:7px;cursor:pointer;transition:all .2s" onmouseover="this.style.background='rgba(255,255,255,.05)';this.style.color='#E8F4FD'" onmouseout="this.style.background='';this.style.color='#94A3B8'">Pricing</a>
        </nav>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <button onclick="router.go('/auth')" style="background:none;border:none;color:#94A3B8;font-size:14px;font-weight:500;padding:8px 16px;cursor:pointer;border-radius:8px;transition:all .2s" onmouseover="this.style.color='#E8F4FD';this.style.background='rgba(255,255,255,.05)'" onmouseout="this.style.color='#94A3B8';this.style.background=''">Log in</button>
        <button onclick="router.go('/auth')" class="btn-neon" style="border:none;color:white;font-size:14px;font-weight:700;padding:9px 22px;border-radius:9px;letter-spacing:-.01em">Start free →</button>
      </div>
    </nav>

    <!-- ── HERO ──────────────────────────────────────── -->
    <section style="position:relative;z-index:10;padding:168px 24px 72px;text-align:center;max-width:940px;margin:0 auto">
      <!-- Live badge -->
      <div style="display:inline-flex;align-items:center;gap:9px;padding:7px 20px;border-radius:100px;background:rgba(0,229,255,.07);border:1px solid rgba(0,229,255,.2);color:#00E5FF;font-size:13px;font-weight:600;letter-spacing:.02em;margin-bottom:36px;animation:badge-glow 3s ease-in-out infinite">
        <span class="dot-live" style="width:7px;height:7px;border-radius:50%;background:#00E5FF;box-shadow:0 0 8px #00E5FF;display:inline-block;flex-shrink:0"></span>
        IWB v2.0 — Now live
      </div>

      <!-- Headline -->
      <h1 style="font-size:clamp(3rem,7.5vw,5.8rem);font-weight:900;line-height:1.04;letter-spacing:-.04em;margin:0 0 28px">
        <span style="color:#E8F4FD;display:block">Build the future.</span>
        <span class="holo-text" style="display:block">At the speed of thought.</span>
      </h1>

      <!-- Subtitle -->
      <p style="font-size:clamp(1rem,2.2vw,1.25rem);color:#4B5563;line-height:1.75;max-width:580px;margin:0 auto 48px;font-weight:400">
        A pro-grade visual editing environment engineered for developers and designers. Drag, compose, and export pixel-perfect web interfaces with absolute technical precision.
      </p>

      <!-- CTA -->
      <div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-bottom:72px">
        <button onclick="router.go('/auth')" class="btn-neon" style="border:none;color:white;font-size:16px;font-weight:700;padding:15px 38px;border-radius:12px;display:flex;align-items:center;gap:9px;letter-spacing:-.01em">
          Start Building
          <span class="material-symbols-outlined" style="font-size:20px">arrow_forward</span>
        </button>
        <button onclick="document.getElementById('features-sec').scrollIntoView({behavior:'smooth'})" class="btn-ghost" style="font-size:16px;font-weight:600;padding:15px 38px;border-radius:12px;letter-spacing:-.01em">
          Explore Features
        </button>
      </div>

      <!-- Stats row -->
      <div style="display:flex;justify-content:center;gap:56px;flex-wrap:wrap">
        ${[['35+','Component types'],['10K+','Builders'],['99.9%','Uptime']].map(([v,l])=>`
        <div>
          <div style="font-size:30px;font-weight:900;color:#00E5FF;text-shadow:0 0 22px rgba(0,229,255,.45);letter-spacing:-.03em;line-height:1">${v}</div>
          <div style="font-size:11px;color:#374151;font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-top:4px">${l}</div>
        </div>`).join('')}
      </div>
    </section>

    <!-- ── 3D BROWSER MOCKUP ──────────────────────────── -->
    <div style="position:relative;z-index:10;max-width:1120px;margin:0 auto 130px;padding:0 24px">
      <div class="float-anim" style="border-radius:18px;overflow:hidden;border:1px solid rgba(0,229,255,.12);box-shadow:0 70px 130px rgba(0,0,0,.85),0 0 80px rgba(0,229,255,.07),inset 0 1px 0 rgba(255,255,255,.05)">
        <!-- Browser chrome -->
        <div style="height:46px;background:#060F1A;border-bottom:1px solid rgba(0,229,255,.07);display:flex;align-items:center;padding:0 18px;gap:14px">
          <div style="display:flex;gap:6px">
            <div style="width:12px;height:12px;border-radius:50%;background:rgba(239,68,68,.45)"></div>
            <div style="width:12px;height:12px;border-radius:50%;background:rgba(245,158,11,.45)"></div>
            <div style="width:12px;height:12px;border-radius:50%;background:rgba(34,197,94,.45)"></div>
          </div>
          <div style="flex:1;display:flex;justify-content:center">
            <div style="background:rgba(0,229,255,.04);border:1px solid rgba(0,229,255,.09);border-radius:7px;padding:5px 18px;font-size:12px;color:#374151;font-family:JetBrains Mono,monospace;display:flex;align-items:center;gap:7px">
              <span style="color:rgba(0,229,255,.35);font-size:13px">🔒</span> app.iwb.dev/workspace
            </div>
          </div>
          <div style="width:100px"></div>
        </div>
        <!-- App interior -->
        <div style="height:360px;background:#030B14;display:flex;overflow:hidden">
          <!-- Component panel -->
          <div style="width:200px;border-right:1px solid rgba(0,229,255,.06);padding:12px 10px;display:flex;flex-direction:column;gap:4px;background:#060F1A;flex-shrink:0">
            <div style="height:3px;width:55%;background:linear-gradient(90deg,#00E5FF,transparent);border-radius:3px;margin-bottom:10px"></div>
            ${['Layout','Content','Media','Interactive','Sections'].map((cat,i)=>`
            <div>
              <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#1F2D3D;padding:5px 6px 3px">${cat}</div>
              <div style="display:flex;gap:3px;flex-wrap:wrap;padding:0 2px 4px">
                ${Array(i===4?4:3).fill(0).map((_,j)=>`<div style="height:20px;background:rgba(0,229,255,.04);border:1px solid rgba(0,229,255,.07);border-radius:4px;width:${38+j*8}px"></div>`).join('')}
              </div>
            </div>`).join('')}
          </div>
          <!-- Canvas -->
          <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:20px;position:relative;overflow:hidden">
            <div class="cyber-grid" style="position:absolute;inset:0;opacity:.4"></div>
            <div style="width:100%;max-width:480px;position:relative">
              <!-- Navbar strip -->
              <div style="height:34px;background:rgba(6,15,26,.95);border:1px solid rgba(0,229,255,.1);border-radius:7px;margin-bottom:9px;display:flex;align-items:center;padding:0 12px;gap:8px">
                <div style="width:7px;height:7px;border-radius:2px;background:#00E5FF;opacity:.5"></div>
                <div style="height:3px;width:38px;background:rgba(0,229,255,.18);border-radius:2px"></div>
                <div style="flex:1"></div>
                <div style="height:19px;width:46px;background:rgba(0,229,255,.14);border-radius:4px"></div>
              </div>
              <!-- Hero block -->
              <div style="height:110px;background:linear-gradient(135deg,rgba(0,229,255,.04),rgba(79,124,255,.04));border:1px solid rgba(0,229,255,.12);border-radius:9px;margin-bottom:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;position:relative;overflow:hidden">
                <div style="position:absolute;top:0;left:30%;right:30%;height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.4),transparent)"></div>
                <div style="height:10px;width:58%;background:linear-gradient(90deg,rgba(0,229,255,.25),rgba(79,124,255,.25));border-radius:4px"></div>
                <div style="height:5px;width:76%;background:rgba(255,255,255,.06);border-radius:3px"></div>
                <div style="height:22px;width:88px;background:linear-gradient(135deg,#00C4DD,#006FE8);border-radius:5px;margin-top:4px;box-shadow:0 0 14px rgba(0,229,255,.35)"></div>
              </div>
              <!-- Features grid -->
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px">
                ${Array(3).fill(0).map(()=>`
                <div style="height:58px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:7px;padding:9px">
                  <div style="width:14px;height:14px;background:rgba(0,229,255,.14);border-radius:3px;margin-bottom:5px"></div>
                  <div style="height:4px;width:68%;background:rgba(255,255,255,.09);border-radius:2px;margin-bottom:3px"></div>
                  <div style="height:3px;width:88%;background:rgba(255,255,255,.04);border-radius:2px"></div>
                </div>`).join('')}
              </div>
            </div>
            <!-- Selection indicator -->
            <div style="position:absolute;top:18px;right:18px;border:1.5px solid #00E5FF;border-radius:5px;padding:3px 8px;font-size:10px;color:#00E5FF;font-family:JetBrains Mono,monospace;background:rgba(0,229,255,.06)">hero ✦</div>
          </div>
          <!-- Properties panel -->
          <div style="width:220px;border-left:1px solid rgba(0,229,255,.06);padding:14px 12px;display:flex;flex-direction:column;gap:9px;background:#060F1A;flex-shrink:0">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#1F2D3D;margin-bottom:4px">Properties</div>
            ${['Background','Typography','Padding','Border Radius','Animation'].map(label=>`
            <div>
              <div style="font-size:10px;color:#2D3F52;margin-bottom:4px;font-weight:500">${label}</div>
              <div style="height:27px;background:rgba(0,229,255,.04);border:1px solid rgba(0,229,255,.08);border-radius:5px"></div>
            </div>`).join('')}
          </div>
        </div>
      </div>
      <!-- Glow reflection -->
      <div style="position:absolute;bottom:-50px;left:50%;transform:translateX(-50%);width:55%;height:50px;background:rgba(0,229,255,.05);filter:blur(35px);border-radius:50%"></div>
    </div>

    <!-- ── FEATURES ───────────────────────────────────── -->
    <section id="features-sec" style="position:relative;z-index:10;padding:100px 24px;max-width:1200px;margin:0 auto">
      <div style="text-align:center;margin-bottom:68px">
        <div style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#00E5FF;padding:5px 16px;border:1px solid rgba(0,229,255,.18);border-radius:100px;background:rgba(0,229,255,.05);margin-bottom:18px">Platform Features</div>
        <h2 style="font-size:clamp(2rem,4vw,3.2rem);font-weight:900;letter-spacing:-.04em;color:#E8F4FD;margin:0 0 16px;line-height:1.1">Engineered for control.</h2>
        <p style="color:#4B5563;font-size:18px;max-width:540px;margin:0 auto;line-height:1.65">Everything you need to build complex interfaces without compromising code quality.</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:22px">
        ${[
          {icon:'draw',         title:'Visual Canvas',         desc:'Drag & drop 35+ component types with real-time preview and pixel-level control. Full layout management.',color:'#00E5FF'},
          {icon:'code_blocks',  title:'Production-Ready Code', desc:'Export semantic HTML/CSS/JS with zero bloat. No inline-style chaos — clean output you\'d write by hand.',color:'#4F7CFF'},
          {icon:'palette',      title:'Design Tokens',         desc:'Manage typography, color systems and spacing globally. Brand consistency across every component.',color:'#8B5CF6'},
          {icon:'history',      title:'Version History',       desc:'Every save creates a snapshot automatically. Roll back to any version instantly — never lose work.',color:'#00E5FF'},
          {icon:'share',        title:'Instant Sharing',       desc:'Generate a public preview link. Share with clients or collaborators — no account required to view.',color:'#4F7CFF'},
          {icon:'rocket_launch',title:'Template Library',      desc:'Launch projects in seconds with 6 professionally designed templates — SaaS, portfolio, blog, and more.',color:'#8B5CF6'},
        ].map(f=>`
        <div class="card-3d" onmousemove="tilt(this,event)" onmouseleave="untilt(this)"
          style="position:relative;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:34px;overflow:hidden;transition:border-color .3s,box-shadow .3s">
          <!-- Top edge glow -->
          <div style="position:absolute;top:0;left:25%;right:25%;height:1px;background:linear-gradient(90deg,transparent,${f.color}55,transparent)"></div>
          <!-- Icon -->
          <div style="width:52px;height:52px;border-radius:13px;background:${f.color}10;border:1px solid ${f.color}22;display:flex;align-items:center;justify-content:center;margin-bottom:24px;box-shadow:0 0 24px ${f.color}12">
            <span class="material-symbols-outlined" style="color:${f.color};font-size:26px">${f.icon}</span>
          </div>
          <h3 style="font-size:17px;font-weight:700;color:#E8F4FD;margin:0 0 10px;letter-spacing:-.02em">${f.title}</h3>
          <p style="color:#4B5563;font-size:14px;line-height:1.72;margin:0">${f.desc}</p>
          <!-- Corner accent -->
          <div style="position:absolute;bottom:0;right:0;width:80px;height:80px;background:radial-gradient(circle at bottom right,${f.color}07,transparent)"></div>
        </div>`).join('')}
      </div>
    </section>

    <!-- ── SEPARATOR ──────────────────────────────────── -->
    <div style="max-width:1200px;margin:0 auto 100px;padding:0 24px"><div class="sep-neon"></div></div>

    <!-- ── PRICING ────────────────────────────────────── -->
    <section id="pricing-sec" style="position:relative;z-index:10;padding:0 24px 110px;max-width:1200px;margin:0 auto">
      <div style="text-align:center;margin-bottom:68px">
        <div style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#00E5FF;padding:5px 16px;border:1px solid rgba(0,229,255,.18);border-radius:100px;background:rgba(0,229,255,.05);margin-bottom:18px">Pricing</div>
        <h2 style="font-size:clamp(2rem,4vw,3.2rem);font-weight:900;letter-spacing:-.04em;color:#E8F4FD;margin:0 0 16px;line-height:1.1">Simple, transparent pricing.</h2>
        <p style="color:#4B5563;font-size:18px;max-width:540px;margin:0 auto">Start for free. No credit card required. Upgrade whenever you're ready.</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:22px;align-items:center">
        ${[
          {name:'Free',    price:'$0',  period:'forever',   desc:'For personal projects and exploration.',     features:['3 projects','35+ components','HTML export','Public sharing','10 version history'],           cta:'Get started free', highlight:false, color:'#94A3B8'},
          {name:'Pro',     price:'$12', period:'/ month',   desc:'For professionals who ship frequently.',    features:['Unlimited projects','Priority export','Unlimited versioning','Custom domain','Email support'], cta:'Start free trial', highlight:true,  color:'#00E5FF'},
          {name:'Team',    price:'$39', period:'/ month',   desc:'For teams building at scale.',              features:['Everything in Pro','5 team members','Shared workspaces','Analytics','Dedicated support'],     cta:'Contact sales',    highlight:false, color:'#8B5CF6'},
        ].map(p=>`
        <div class="card-3d" onmousemove="tilt(this,event)" onmouseleave="untilt(this)"
          style="position:relative;background:${p.highlight?'linear-gradient(135deg,rgba(0,229,255,.06),rgba(79,124,255,.04))':'rgba(255,255,255,.02)'};border:1px solid ${p.highlight?'rgba(0,229,255,.28)':'rgba(255,255,255,.06)'};border-radius:20px;padding:38px;display:flex;flex-direction:column;overflow:hidden;${p.highlight?'box-shadow:0 0 70px rgba(0,229,255,.08),0 40px 80px rgba(0,0,0,.4);transform:scale(1.03)':''}">
          ${p.highlight?`<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#00E5FF,transparent)"></div>`:''}
          ${p.highlight?`<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#00C4DD,#006FE8);color:white;font-size:11px;font-weight:700;padding:4px 18px;border-radius:100px;letter-spacing:.06em;white-space:nowrap">Most Popular</div>`:''}
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${p.color};margin-bottom:16px">${p.name}</div>
          <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:8px">
            <span style="font-size:52px;font-weight:900;color:#E8F4FD;letter-spacing:-.04em;line-height:1">${p.price}</span>
            <span style="color:#374151;font-size:15px">${p.period}</span>
          </div>
          <p style="color:#374151;font-size:14px;margin:0 0 28px;line-height:1.55">${p.desc}</p>
          <div style="height:1px;background:rgba(255,255,255,.06);margin-bottom:24px"></div>
          <ul style="list-style:none;padding:0;margin:0 0 34px;display:flex;flex-direction:column;gap:13px;flex:1">
            ${p.features.map(f=>`<li style="display:flex;align-items:center;gap:10px;font-size:14px;color:#94A3B8">
              <span style="color:${p.color};font-size:15px;flex-shrink:0;text-shadow:0 0 10px ${p.color}55;font-weight:700">✓</span>${f}
            </li>`).join('')}
          </ul>
          <button onclick="router.go('/auth')"
            style="width:100%;padding:14px;border-radius:11px;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;font-family:Inter,sans-serif;letter-spacing:-.01em;${p.highlight?'border:none;background:linear-gradient(135deg,#00C4DD,#006FE8);color:white;box-shadow:0 0 22px rgba(0,229,255,.3)':'border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#94A3B8'}"
            onmouseover="this.style.filter='brightness(1.15)';this.style.transform='translateY(-1px)'"
            onmouseout="this.style.filter='';this.style.transform=''">${p.cta}</button>
        </div>`).join('')}
      </div>
    </section>

    <!-- ── CTA SECTION ────────────────────────────────── -->
    <section style="position:relative;z-index:10;padding:0 24px 110px">
      <div style="max-width:860px;margin:0 auto;position:relative;background:linear-gradient(135deg,rgba(0,229,255,.04),rgba(79,124,255,.05),rgba(139,92,246,.04));border:1px solid rgba(0,229,255,.14);border-radius:24px;padding:80px 56px;text-align:center;overflow:hidden">
        <div style="position:absolute;top:0;left:25%;right:25%;height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.45),transparent)"></div>
        <div style="position:absolute;top:-80px;left:-80px;width:220px;height:220px;background:radial-gradient(circle,rgba(0,229,255,.07),transparent);filter:blur(30px)"></div>
        <div style="position:absolute;bottom:-80px;right:-80px;width:220px;height:220px;background:radial-gradient(circle,rgba(139,92,246,.07),transparent);filter:blur(30px)"></div>
        <h2 style="font-size:clamp(1.8rem,4vw,2.9rem);font-weight:900;letter-spacing:-.04em;color:#E8F4FD;margin:0 0 18px;line-height:1.15;position:relative">Ready to elevate your workflow?</h2>
        <p style="color:#4B5563;font-size:17px;margin:0 0 44px;line-height:1.65;position:relative">Join thousands of professional teams building faster and shipping cleaner code with IWB.</p>
        <button onclick="router.go('/auth')" class="btn-neon" style="border:none;color:white;font-size:16px;font-weight:700;padding:16px 48px;border-radius:12px;position:relative;letter-spacing:-.01em">
          Create Free Account →
        </button>
      </div>
    </section>

    <!-- ── FOOTER ─────────────────────────────────────── -->
    <footer style="position:relative;z-index:10;border-top:1px solid rgba(255,255,255,.04);padding:40px 36px">
      <div style="max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#00C4DD,#006FE8);display:flex;align-items:center;justify-content:center">
            <span class="material-symbols-outlined" style="font-size:16px;color:white;font-variation-settings:'FILL' 1">architecture</span>
          </div>
          <span style="font-weight:800;color:#E8F4FD;font-size:16px;letter-spacing:-.02em">IWB</span>
          <span style="color:#1F2D3D;font-size:13px;margin-left:6px">© 2025</span>
        </div>
        <div style="color:#1F2D3D;font-size:12px;font-family:JetBrains Mono,monospace">
          Designed with <span style="color:#00E5FF">IWB</span> · Engineered for speed
        </div>
      </div>
    </footer>
  </div>`;
}
