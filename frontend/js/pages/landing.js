// ── Landing Page (from file 11) ───────────────────────────────
async function renderLanding() {
  document.getElementById('app').innerHTML = `
  <div class="bg-background text-on-background font-body-md antialiased">
    <!-- Grid dots + aurora -->
    <div class="fixed inset-0 pointer-events-none z-0">
      <div class="absolute inset-0" style="background-image:radial-gradient(circle,rgba(255,255,255,0.025) 1px,transparent 1px);background-size:24px 24px"></div>
      <div class="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-primary-container/15 rounded-full blur-[120px]"></div>
    </div>
    <!-- Navbar -->
    <nav class="fixed top-0 w-full z-50 bg-[#0B1220]/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center h-16 px-8">
      <div class="flex items-center gap-8">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[#4F7CFF]" style="font-variation-settings:'FILL' 1">architecture</span>
          <span class="text-xl font-bold tracking-tighter text-white">IWB</span>
        </div>
        <nav class="hidden md:flex gap-6 text-sm font-medium">
          <a onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})" class="text-slate-400 hover:text-white transition-colors cursor-pointer">Features</a>
          <a onclick="document.getElementById('pricing').scrollIntoView({behavior:'smooth'})" class="text-slate-400 hover:text-white transition-colors cursor-pointer">Pricing</a>
        </nav>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="router.go('/auth')" class="text-slate-400 hover:text-white transition-colors text-sm font-medium px-4 py-2">Log in</button>
        <button onclick="router.go('/auth')" class="bg-[#4F7CFF] text-white px-4 py-2 rounded-DEFAULT text-sm font-medium hover:brightness-110 shadow-[0_0_12px_rgba(79,124,255,0.3)] transition-all active:scale-95">Start free →</button>
      </div>
    </nav>
    <!-- Hero -->
    <section class="relative z-10 pt-40 pb-24 px-6 text-center max-w-4xl mx-auto">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
        <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
        IWB v2.0 is now available
      </div>
      <h1 class="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-tight tracking-tighter text-white mb-6">
        Design at the speed<br>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-tertiary">of thought.</span>
      </h1>
      <p class="text-[clamp(1rem,2vw,1.25rem)] text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        A pro-grade visual editing environment engineered for developers and designers. Build high-end web experiences with absolute technical precision.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <button onclick="router.go('/auth')" class="px-8 py-3.5 bg-primary text-on-primary rounded-DEFAULT font-semibold text-base hover:bg-primary-fixed hover:shadow-[0_0_20px_rgba(181,196,255,0.3)] transition-all active:scale-95 flex items-center gap-2">
          Start Building <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
        <a onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})" class="px-8 py-3.5 border border-outline-variant text-on-surface rounded-DEFAULT font-semibold text-base hover:bg-surface-container-high transition-all cursor-pointer">Read Documentation</a>
      </div>
    </section>
    <!-- Browser mockup -->
    <div class="relative z-10 max-w-5xl mx-auto px-6 mb-32" style="transform:perspective(1200px) rotateX(4deg)">
      <div class="bg-[#111A2E] border border-slate-800 rounded-xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7),0_0_60px_rgba(79,124,255,0.06)]">
        <div class="h-9 bg-[#0F1729] border-b border-slate-800 flex items-center px-4 gap-2">
          <div class="flex gap-1.5"><div class="w-3 h-3 rounded-full bg-red-500/50"></div><div class="w-3 h-3 rounded-full bg-yellow-500/50"></div><div class="w-3 h-3 rounded-full bg-green-500/50"></div></div>
          <div class="flex-1 flex justify-center"><div class="bg-[#1c2b3c] rounded px-6 py-1 text-xs text-slate-500 font-mono">iwb.dev/workspace</div></div>
        </div>
        <div class="h-72 bg-[#051424] flex items-stretch">
          <div class="w-48 border-r border-slate-800 p-3 flex flex-col gap-2">
            <div class="h-3 w-3/4 bg-slate-700 rounded"></div>
            <div class="h-2 w-full bg-slate-800 rounded"></div>
            <div class="h-2 w-5/6 bg-slate-800 rounded"></div>
            <div class="h-2 w-4/6 bg-slate-800 rounded"></div>
          </div>
          <div class="flex-1 flex items-center justify-center p-6">
            <div class="w-full max-w-md h-full bg-white/5 rounded border border-dashed border-primary/30 flex items-center justify-center text-slate-600 text-sm">Canvas</div>
          </div>
          <div class="w-56 border-l border-slate-800 p-3 flex flex-col gap-2">
            <div class="h-3 w-1/2 bg-slate-700 rounded"></div>
            <div class="h-8 bg-slate-800 rounded"></div>
            <div class="h-8 bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>
    </div>
    <!-- Features -->
    <section id="features" class="relative z-10 py-24 px-6 max-w-6xl mx-auto">
      <div class="text-center mb-16">
        <p class="text-primary font-label-caps text-label-caps tracking-widest uppercase mb-4">Features</p>
        <h2 class="font-h2 text-h2 text-on-surface mb-4">Engineered for control.</h2>
        <p class="text-on-surface-variant text-lg max-w-2xl mx-auto">Everything you need to build complex interfaces without compromising code quality.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${[
          {icon:'draw',title:'Visual Canvas',desc:'Manipulate layouts with precision. Drag & drop 35 component types with live preview.'},
          {icon:'code_blocks',title:'Production-Ready Output',desc:'Export semantic, structured HTML/CSS/JS. No bloat, no inline styles hell.'},
          {icon:'palette',title:'Design Tokens',desc:'Manage typography, colors, and spacing globally to maintain brand consistency.'},
        ].map(f=>`
        <div class="bg-surface-container-low border border-outline-variant/50 rounded-xl p-7 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(79,124,255,0.05)] transition-all group">
          <div class="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-5">
            <span class="material-symbols-outlined text-primary text-[24px]">${f.icon}</span>
          </div>
          <h3 class="text-on-surface font-semibold text-lg mb-2">${f.title}</h3>
          <p class="text-on-surface-variant text-sm leading-relaxed">${f.desc}</p>
        </div>`).join('')}
      </div>
    </section>
    <!-- Pricing -->
    <section id="pricing" class="relative z-10 py-24 px-6 max-w-6xl mx-auto">
      <div class="text-center mb-16">
        <p class="text-primary font-label-caps text-label-caps tracking-widest uppercase mb-4">Pricing</p>
        <h2 class="font-h2 text-h2 text-on-surface mb-4">Simple, transparent pricing.</h2>
        <p class="text-on-surface-variant text-lg max-w-2xl mx-auto">Start for free. No credit card required.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        ${[
          {name:'Free',price:'$0',period:'forever',desc:'Perfect for personal projects and exploration.',features:['3 projects','35 components','HTML export','Community support'],cta:'Get started',highlight:false},
          {name:'Pro',price:'$12',period:'/ month',desc:'For professionals who ship frequently.',features:['Unlimited projects','Priority export','Version history','Custom domain export','Email support'],cta:'Start free trial',highlight:true},
          {name:'Team',price:'$39',period:'/ month',desc:'For teams building at scale.',features:['Everything in Pro','5 team members','Shared workspaces','Advanced analytics','Dedicated support'],cta:'Contact sales',highlight:false},
        ].map(p=>`
        <div class="relative flex flex-col bg-surface-container-low border ${p.highlight?'border-primary shadow-[0_0_30px_rgba(79,124,255,0.15)]':'border-outline-variant/50'} rounded-2xl p-8 transition-all">
          ${p.highlight?'<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-xs font-semibold px-4 py-1 rounded-full">Most popular</div>':''}
          <div class="mb-6">
            <p class="text-on-surface font-semibold text-lg mb-1">${p.name}</p>
            <div class="flex items-end gap-1 mb-2">
              <span class="text-4xl font-black text-on-surface">${p.price}</span>
              <span class="text-on-surface-variant text-sm mb-1">${p.period}</span>
            </div>
            <p class="text-on-surface-variant text-sm">${p.desc}</p>
          </div>
          <ul class="flex flex-col gap-3 mb-8 flex-1">
            ${p.features.map(f=>`<li class="flex items-center gap-2 text-sm text-on-surface-variant"><span class="material-symbols-outlined text-primary text-[18px]" style="font-variation-settings:'FILL' 1">check_circle</span>${f}</li>`).join('')}
          </ul>
          <button onclick="router.go('/auth')" class="w-full py-3 rounded-DEFAULT font-semibold text-sm transition-all active:scale-95 ${p.highlight?'bg-primary text-on-primary hover:brightness-110 shadow-[0_0_12px_rgba(79,124,255,0.3)]':'border border-outline-variant text-on-surface hover:bg-surface-container-high'}">${p.cta}</button>
        </div>`).join('')}
      </div>
    </section>
    <!-- CTA -->
    <section class="relative z-10 py-24 px-6">
      <div class="max-w-3xl mx-auto bg-surface-container border border-primary/20 rounded-2xl p-16 text-center" style="background:linear-gradient(135deg,rgba(17,26,46,.8),rgba(19,29,51,.8))">
        <h2 class="font-h2 text-h2 text-on-surface mb-4">Ready to elevate your workflow?</h2>
        <p class="text-on-surface-variant mb-8">Join thousands of professional teams building faster and shipping cleaner code with IWB.</p>
        <button onclick="router.go('/auth')" class="px-8 py-3.5 bg-primary text-on-primary rounded-DEFAULT font-semibold hover:bg-primary-fixed transition-all active:scale-95">Create Free Account</button>
      </div>
    </section>
    <!-- Footer -->
    <footer class="relative z-10 border-t border-[#1F2937] py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="flex items-center gap-2"><span class="material-symbols-outlined text-[#4F7CFF]" style="font-variation-settings:'FILL' 1">architecture</span><span class="font-bold text-white">IWB</span><span class="text-slate-600 text-sm ml-2">© 2025</span></div>
    </footer>
  </div>`;
}
