// ── Public Share Page ─────────────────────────────────────────
// Self-contained — nu depinde de editor.js

async function renderShare(params) {
  const token = params.token;
  document.getElementById('app').innerHTML = `
  <div class="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased">
    <header class="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-xl">
      <div class="flex items-center justify-between px-6 h-14 w-full">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary" style="font-variation-settings:'FILL' 1">architecture</span>
          <span class="font-semibold text-white text-lg">IWB</span>
        </div>
        <a href="#/auth" class="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[#4F7CFF] text-sm font-semibold">
          Open in IWB
          <span class="material-symbols-outlined text-[16px]">open_in_new</span>
        </a>
      </div>
    </header>
    <main class="flex-grow pt-14">
      <div id="share-content" class="flex items-center justify-center min-h-[60vh]">
        <div class="text-center">
          <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-slate-400 mt-4 text-sm">Loading project…</p>
        </div>
      </div>
    </main>
    <footer class="py-8 border-t border-slate-900 text-center">
      <a href="#/" class="text-slate-500 hover:text-[#4F7CFF] transition-colors text-xs uppercase tracking-widest flex items-center justify-center gap-1">
        <span class="material-symbols-outlined text-[14px]">build</span> Built with IWB
      </a>
    </footer>
  </div>`;

  const project = await projectsAPI.getShared(token);
  const el = document.getElementById('share-content');

  if (!project) {
    el.innerHTML = `
      <div class="text-center py-24 px-6">
        <span class="material-symbols-outlined text-[64px] text-slate-600 block mb-4">lock</span>
        <h2 class="text-white text-2xl font-bold mb-2">Page not available</h2>
        <p class="text-slate-400">This project is private or the share link has expired.</p>
        <a href="#/" class="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:bg-primary-fixed transition-all">
          <span class="material-symbols-outlined text-[18px]">home</span> Back to IWB
        </a>
      </div>`;
    return;
  }

  const comps = project.layout?.components || [];
  window._iwbToken = token;
  el.innerHTML = `
    <div class="bg-white min-h-screen w-full" id="share-canvas">
      ${comps.length ? comps.map(shareRenderComp).join('') : '<div style="padding:60px;text-align:center;color:#9CA3AF">No components in this project.</div>'}
    </div>`;
}

// ── Renderer simplificat pentru share (fara dependenta de editor.js) ──────
function shareEsc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function shareRenderComp(c) {
  if (!c || !c.type) return '';
  const bg = c.backgroundColor || '';
  const tc = c.textColor || '';
  const pad = c.padding || '';

  switch(c.type) {
    case 'navbar': {
      const links = (c.links||[]).map(l=>`<a href="${shareEsc(l.href||'#')}" style="color:${tc||'#111'};margin:0 12px;text-decoration:none;font-size:15px">${shareEsc(l.label)}</a>`).join('');
      const ctas = (c.ctaButtons||[]).map(b=>`<a href="${shareEsc(b.href||'#')}" style="padding:8px 16px;background:${b.backgroundColor||'#4F7CFF'};color:${b.textColor||'#fff'};border-radius:8px;font-weight:600;text-decoration:none;font-size:14px">${shareEsc(b.label)}</a>`).join('');
      return `<nav style="display:flex;align-items:center;justify-content:space-between;padding:16px 32px;background:${bg||'#fff'};${c.sticky?'position:sticky;top:0;z-index:100;':''}box-shadow:0 1px 0 rgba(0,0,0,.08)">
        <span style="font-weight:700;font-size:1.2rem;color:${tc||'#111'}">${shareEsc(c.logo||'Brand')}</span>
        <div style="display:flex;gap:8px;align-items:center">${links}${ctas?`<div style="display:flex;gap:8px;margin-left:16px">${ctas}</div>`:''}</div>
      </nav>`;
    }
    case 'hero': {
      const btns = (c.buttons||[]).map(b=>`<a href="${shareEsc(b.href||'#')}" style="display:inline-block;padding:${{sm:'8px 16px',md:'12px 24px',lg:'16px 32px',xl:'18px 40px'}[b.size||'md']};background:${b.variant==='outline'?'transparent':b.backgroundColor||'#4F7CFF'};color:${b.variant==='outline'?b.backgroundColor||'#4F7CFF':b.textColor||'#fff'};border-radius:8px;${b.variant==='outline'?'border:2px solid '+(b.backgroundColor||'#4F7CFF')+';':''}font-weight:600;text-decoration:none;margin:0 6px">${shareEsc(b.label)}</a>`).join('');
      const align = c.layout === 'centered' ? 'center' : 'left';
      return `<section style="min-height:${c.minHeight||'500px'};padding:${pad||'80px 40px'};background:${bg||'#0f172a'};${c.backgroundImage?'background-image:url('+c.backgroundImage+');background-size:cover;background-position:center;':''}display:flex;align-items:center;justify-content:${align==='center'?'center':'flex-start'}">
        <div style="max-width:700px;text-align:${align};${align==='center'?'margin:0 auto':''}">
          ${c.eyebrow?`<span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:${c.eyebrowColor||'#4F7CFF'};background:rgba(79,124,255,.1);border-radius:999px;padding:4px 14px;display:inline-block;margin-bottom:16px">${shareEsc(c.eyebrow)}</span>`:''}
          <h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:800;line-height:1.1;color:${tc||'#fff'};margin-bottom:16px">${c.title||'Hero Title'}</h1>
          ${c.subtitle?`<p style="font-size:1.1rem;color:${c.subtitleColor||tc||'#94A3B8'};opacity:.85;line-height:1.7;margin-bottom:32px">${shareEsc(c.subtitle)}</p>`:''}
          ${btns?`<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:${align==='center'?'center':'flex-start'}">${btns}</div>`:''}
          ${c.note?`<p style="font-size:13px;opacity:.5;color:${tc||'#fff'};margin-top:14px">${shareEsc(c.note)}</p>`:''}
        </div>
      </section>`;
    }
    case 'section':
      return `<section style="padding:${pad||'64px 40px'};background:${bg||'#fff'};${c.backgroundImage?'background-image:url('+c.backgroundImage+');background-size:cover;background-position:center;':''}${c.minHeight?'min-height:'+c.minHeight+';':''}">
        ${(c.children||[]).map(shareRenderComp).join('')}
      </section>`;
    case 'container':
      return `<div style="display:flex;flex-direction:${c.direction||'row'};gap:${c.gap||'16px'};padding:${pad||'0'};flex-wrap:wrap;align-items:${c.alignItems||'stretch'};justify-content:${c.justifyContent||'flex-start'}">
        ${(c.children||[]).map(shareRenderComp).join('')}
      </div>`;
    case 'columns': {
      const cols = c.columns||[];
      const tpl = c.gridTemplate || cols.map(()=>'1fr').join(' ');
      return `<div style="display:grid;grid-template-columns:${tpl};gap:${c.gap||'24px'};padding:${pad||'0'}">
        ${cols.map(col=>`<div>${(col.children||[]).map(shareRenderComp).join('')}</div>`).join('')}
      </div>`;
    }
    case 'text': {
      const tag = ['h1','h2','h3','h4','h5','h6','p','span','div'].includes(c.tag)?c.tag:'p';
      return `<${tag} style="font-size:${c.fontSize||'16px'};font-weight:${c.fontWeight||'400'};color:${c.color||'#374151'};text-align:${c.align||'left'};padding:${pad||'8px 0'};margin:${c.margin||'0'};line-height:${c.lineHeight||'1.6'}">${c.content||''}</${tag}>`;
    }
    case 'heading':
      return `<div style="padding:${pad||'16px 0'};text-align:${c.align||'left'}">
        ${c.eyebrow?`<span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:${c.eyebrowColor||'#4F7CFF'};background:rgba(79,124,255,.1);border-radius:999px;padding:4px 12px;display:inline-block;margin-bottom:12px">${shareEsc(c.eyebrow)}</span>`:''}
        <h2 style="font-size:clamp(1.75rem,3.5vw,2.75rem);font-weight:800;line-height:1.15;color:${c.titleColor||'#111827'};margin-bottom:12px">${c.title||''}</h2>
        ${c.subtitle?`<p style="font-size:1.1rem;color:${c.subtitleColor||'#6B7280'};line-height:1.7;max-width:600px;${c.align==='center'?'margin:0 auto':''}">${shareEsc(c.subtitle)}</p>`:''}
      </div>`;
    case 'image':
      return `<div style="margin:${c.margin||'0'}">
        ${c.src?`<img src="${shareEsc(c.src)}" alt="${shareEsc(c.alt||'')}" style="width:${c.width||'100%'};border-radius:${c.borderRadius||'0'};display:block" loading="lazy">`
        :`<div style="background:#e5e7eb;border-radius:${c.borderRadius||'0'};width:${c.width||'100%'};height:200px;display:flex;align-items:center;justify-content:center;color:#9CA3AF">Image placeholder</div>`}
        ${c.caption?`<p style="text-align:center;font-size:13px;color:#9CA3AF;margin-top:8px">${shareEsc(c.caption)}</p>`:''}
      </div>`;
    case 'button':
      return `<div style="padding:8px 0"><a href="${shareEsc(c.href||'#')}" style="display:inline-block;padding:${{sm:'8px 16px',md:'12px 24px',lg:'16px 32px',xl:'18px 40px'}[c.size||'md']};background:${c.variant==='outline'?'transparent':c.backgroundColor||'#4F7CFF'};color:${c.variant==='outline'?c.backgroundColor||'#4F7CFF':c.textColor||'#fff'};border-radius:${c.borderRadius||'8px'};${c.variant==='outline'?'border:2px solid '+(c.backgroundColor||'#4F7CFF')+';':''}font-weight:600;text-decoration:none;${c.fullWidth?'display:block;text-align:center;':''}">${shareEsc(c.label||'Button')}</a></div>`;
    case 'divider':
      return `<hr style="border:none;border-top:${c.thickness||1}px ${c.style||'solid'} ${c.color||'#e5e7eb'};margin:${c.margin||'16px 0'}">`;
    case 'spacer':
      return `<div style="height:${c.height||32}px"></div>`;
    case 'richtext':
      return `<div style="padding:${pad||'0'};color:${tc||'inherit'}">${c.html||''}</div>`;
    case 'blockquote':
      return `<blockquote style="border-left:4px solid ${c.accentColor||'#4F7CFF'};padding:16px 24px;background:${bg||'rgba(79,124,255,.05)'};border-radius:0 8px 8px 0;font-size:1.1rem;font-style:italic;color:${tc||'#111827'}">
        ${shareEsc(c.text||'')}
        ${c.author?`<cite style="display:block;font-size:14px;margin-top:12px;opacity:.7;font-style:normal">— ${shareEsc(c.author)}</cite>`:''}
      </blockquote>`;
    case 'code_block':
      return `<div style="background:${c.backgroundColor||'#0f172a'};border-radius:10px;padding:24px;overflow-x:auto;position:relative">
        ${c.language?`<span style="position:absolute;top:10px;right:14px;font-size:11px;font-weight:600;text-transform:uppercase;color:rgba(255,255,255,.4);font-family:monospace">${shareEsc(c.language)}</span>`:''}
        <pre style="font-family:monospace;font-size:14px;line-height:1.6;color:${c.textColor||'#e5e7eb'};white-space:pre-wrap;margin:0">${shareEsc(c.code||'')}</pre>
      </div>`;
    case 'embed':
      return c.url ? `<div style="border-radius:${c.borderRadius||'8px'};overflow:hidden;height:${c.height||'400px'}">
        <iframe src="${shareEsc(c.url)}" width="100%" height="100%" frameborder="0" allowfullscreen style="border:none"></iframe>
      </div>` : '';
    case 'gallery':
      return `<div style="display:grid;grid-template-columns:repeat(${c.columns||3},1fr);gap:${c.gap||12}px">
        ${(c.images||[]).map(img=>img.src
          ?`<img src="${shareEsc(img.src)}" alt="${shareEsc(img.alt||'')}" style="width:100%;aspect-ratio:${c.aspectRatio||'16/9'};object-fit:cover;border-radius:8px" loading="lazy">`
          :`<div style="background:#e5e7eb;aspect-ratio:${c.aspectRatio||'16/9'};border-radius:8px"></div>`
        ).join('')}
      </div>`;
    case 'logo_strip':
      return `<section style="padding:${pad||'48px 40px'};background:${bg||'#fff'}">
        ${c.label?`<p style="text-align:center;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:#9CA3AF;margin-bottom:32px">${shareEsc(c.label)}</p>`:''}
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:40px;opacity:.6">
          ${(c.logos||[]).map(l=>l.src
            ?`<img src="${shareEsc(l.src)}" alt="${shareEsc(l.alt||l.name||'')}" style="height:32px;width:auto;object-fit:contain;filter:grayscale(1)">`
            :`<span style="font-size:18px;font-weight:700;color:#9CA3AF">${shareEsc(l.name||'')}</span>`
          ).join('')}
        </div>
      </section>`;
    case 'features':
      return `<section style="padding:${pad||'80px 40px'};background:${bg||'#f8fafc'}">
        ${c.title?`<div style="text-align:${c.align||'center'};margin-bottom:48px">
          ${c.eyebrow?`<span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:${c.eyebrowColor||'#4F7CFF'};background:rgba(79,124,255,.1);border-radius:999px;padding:4px 14px;display:inline-block;margin-bottom:12px">${shareEsc(c.eyebrow)}</span>`:''}
          <h2 style="font-size:2.5rem;font-weight:800;color:#111827;margin-bottom:12px">${shareEsc(c.title)}</h2>
          ${c.subtitle?`<p style="color:#6B7280;font-size:1.1rem">${shareEsc(c.subtitle)}</p>`:''}
        </div>`:''}
        <div style="display:grid;grid-template-columns:repeat(${Math.min(c.columns||3,4)},1fr);gap:${c.gap||'24px'}">
          ${(c.items||[]).map(item=>`<div style="padding:28px;background:${c.cardBackground||'#fff'};border-radius:12px;${c.cardBorder?'border:1px solid '+c.cardBorder:''}">
            ${item.icon?`<div style="width:52px;height:52px;background:${c.iconBackground||'rgba(79,124,255,.1)'};border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:18px;font-size:28px">${item.icon}</div>`:''}
            <h3 style="font-size:18px;font-weight:700;margin-bottom:10px;color:#111827">${shareEsc(item.title||'')}</h3>
            <p style="font-size:15px;color:#6B7280;line-height:1.7">${shareEsc(item.description||'')}</p>
            ${item.link?`<a href="${shareEsc(item.link)}" style="color:${item.linkColor||'#4F7CFF'};font-weight:600;font-size:14px;margin-top:14px;display:inline-block;text-decoration:none">${shareEsc(item.linkLabel||'Learn more →')}</a>`:''}
          </div>`).join('')}
        </div>
      </section>`;
    case 'cta':
      return `<section style="padding:${pad||'80px 40px'};background:${bg||'#0f172a'};text-align:${c.align||'center'}">
        ${c.eyebrow?`<span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:${c.eyebrowColor||'#4F7CFF'};background:rgba(79,124,255,.1);border-radius:999px;padding:4px 14px;display:inline-block;margin-bottom:16px">${shareEsc(c.eyebrow)}</span>`:''}
        <h2 style="font-size:clamp(1.75rem,3vw,2.5rem);font-weight:800;color:${tc||'#fff'};margin-bottom:16px">${shareEsc(c.title||'')}</h2>
        ${c.subtitle?`<p style="font-size:1.1rem;color:${tc||'#fff'};opacity:.8;line-height:1.7;max-width:560px;margin:0 auto 32px">${shareEsc(c.subtitle)}</p>`:''}
        <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:${c.align==='center'?'center':'flex-start'}">
          ${(c.buttons||[]).map(b=>`<a href="${shareEsc(b.href||'#')}" style="display:inline-block;padding:16px 32px;background:${b.variant==='outline'?'transparent':b.backgroundColor||'#4F7CFF'};color:${b.variant==='outline'?b.backgroundColor||'#4F7CFF':b.textColor||'#fff'};border-radius:8px;font-weight:600;text-decoration:none;${b.variant==='outline'?'border:2px solid '+(b.backgroundColor||'#4F7CFF'):''}">${shareEsc(b.label||'')}</a>`).join('')}
        </div>
      </section>`;
    case 'pricing':
      return `<section style="padding:${pad||'80px 40px'};background:${bg||'#fff'}">
        ${c.title?`<div style="text-align:center;margin-bottom:48px"><h2 style="font-size:2.5rem;font-weight:800;color:#111827">${shareEsc(c.title)}</h2>${c.subtitle?`<p style="color:#6B7280;font-size:1.1rem;margin-top:12px">${shareEsc(c.subtitle)}</p>`:''}</div>`:''}
        <div style="display:grid;grid-template-columns:repeat(${Math.min((c.plans||[]).length||3,3)},1fr);gap:24px;max-width:900px;margin:0 auto">
          ${(c.plans||[]).map(p=>`<div style="padding:32px;border-radius:16px;background:#fff;border:${p.popular?'2px solid '+(p.accentColor||'#4F7CFF'):'1px solid #e5e7eb'};position:relative">
            ${p.popular?`<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:${p.accentColor||'#4F7CFF'};color:white;padding:3px 14px;border-radius:999px;font-size:11px;font-weight:700">${shareEsc(p.popularLabel||'Popular')}</div>`:''}
            <div style="font-size:13px;font-weight:700;text-transform:uppercase;color:${p.accentColor||'#4F7CFF'};opacity:.7">${shareEsc(p.name||'')}</div>
            <div style="font-size:3rem;font-weight:800;color:#111827;margin:12px 0 4px">${shareEsc(p.currency||'$')}${shareEsc(String(p.price||'0'))}</div>
            <div style="font-size:14px;color:#9CA3AF;margin-bottom:24px">${shareEsc(p.period||'/month')}</div>
            <ul style="list-style:none;padding:0;margin:0 0 24px">
              ${(p.features||[]).map(f=>`<li style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:15px;color:${f.included===false?'#9CA3AF':'#374151'}">
                <span style="color:${f.included===false?'#9CA3AF':'#22C55E'};font-weight:700">${f.included===false?'✕':'✓'}</span>${shareEsc(f.text||'')}
              </li>`).join('')}
            </ul>
            ${p.button?`<a href="${shareEsc(p.button.href||'#')}" style="display:block;text-align:center;padding:12px;background:${p.button.variant==='outline'?'transparent':p.accentColor||'#4F7CFF'};color:${p.button.variant==='outline'?p.accentColor||'#4F7CFF':'white'};border:${p.button.variant==='outline'?'2px solid '+(p.accentColor||'#4F7CFF'):'none'};border-radius:10px;font-weight:600;text-decoration:none">${shareEsc(p.button.label||'Get started')}</a>`:''}
          </div>`).join('')}
        </div>
      </section>`;
    case 'testimonials':
      return `<section style="padding:${pad||'80px 40px'};background:${bg||'#fff'}">
        ${c.title?`<div style="text-align:center;margin-bottom:48px"><h2 style="font-size:2.5rem;font-weight:800;color:#111827">${shareEsc(c.title)}</h2></div>`:''}
        <div style="display:grid;grid-template-columns:repeat(${c.columns||3},1fr);gap:24px">
          ${(c.items||[]).map(t=>`<div style="padding:32px;background:${c.cardBackground||'#f8fafc'};border-radius:16px">
            <div style="color:#f59e0b;margin-bottom:12px">${'★'.repeat(Math.min(t.rating||5,5))}</div>
            <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin-bottom:24px">"${shareEsc(t.quote||'')}"</p>
            <div style="display:flex;align-items:center;gap:12px">
              ${t.avatar?`<img src="${shareEsc(t.avatar)}" alt="${shareEsc(t.name||'')}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`
              :`<div style="width:40px;height:40px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#6B7280">${(t.name||'?').charAt(0)}</div>`}
              <div>
                <div style="font-weight:600;font-size:15px;color:#111827">${shareEsc(t.name||'')}</div>
                <div style="font-size:13px;color:#9CA3AF">${shareEsc(t.role||'')}</div>
              </div>
            </div>
          </div>`).join('')}
        </div>
      </section>`;
    case 'faq':
      return `<section style="padding:${pad||'80px 40px'};background:${bg||'#fff'}">
        ${c.title?`<div style="text-align:center;margin-bottom:48px"><h2 style="font-size:2.5rem;font-weight:800;color:#111827">${shareEsc(c.title)}</h2></div>`:''}
        <div style="max-width:760px;margin:0 auto">
          ${(c.items||[]).map((f,i)=>`<details style="border-bottom:1px solid #e5e7eb">
            <summary style="padding:20px 0;cursor:pointer;font-size:16px;font-weight:600;color:#111827;list-style:none;display:flex;justify-content:space-between;align-items:center">
              ${shareEsc(f.question||'')} <span style="color:${c.accentColor||'#4F7CFF'};font-size:20px">+</span>
            </summary>
            <div style="padding:0 0 20px;font-size:15px;line-height:1.7;color:#6B7280">${shareEsc(f.answer||'')}</div>
          </details>`).join('')}
        </div>
      </section>`;
    case 'stats':
      return `<section style="padding:${pad||'80px 40px'};background:${bg||'#0f172a'};text-align:center">
        ${c.title?`<h2 style="font-size:2.5rem;font-weight:800;color:${tc||'#fff'};margin-bottom:48px">${shareEsc(c.title)}</h2>`:''}
        <div style="display:grid;grid-template-columns:repeat(${Math.min(c.columns||4,4)},1fr);gap:32px;max-width:900px;margin:0 auto">
          ${(c.items||[]).map(s=>`<div>
            ${s.icon?`<div style="font-size:2rem;margin-bottom:12px">${s.icon}</div>`:''}
            <div style="font-size:clamp(2rem,4vw,3.5rem);font-weight:800;color:${c.accentColor||'#4F7CFF'};line-height:1">${shareEsc(String(s.value||'0'))}</div>
            <div style="font-size:15px;color:${tc||'#fff'};opacity:.7;margin-top:8px">${shareEsc(s.label||'')}</div>
          </div>`).join('')}
        </div>
      </section>`;
    case 'team':
      return `<section style="padding:${pad||'80px 40px'};background:${bg||'#fff'}">
        ${c.title?`<div style="text-align:center;margin-bottom:48px"><h2 style="font-size:2.5rem;font-weight:800;color:#111827">${shareEsc(c.title)}</h2></div>`:''}
        <div style="display:grid;grid-template-columns:repeat(${Math.min(c.columns||4,4)},1fr);gap:28px">
          ${(c.members||[]).map(m=>`<div style="text-align:center">
            ${m.photo?`<img src="${shareEsc(m.photo)}" alt="${shareEsc(m.name||'')}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;margin-bottom:16px">`
            :`<div style="background:#e5e7eb;aspect-ratio:1;border-radius:12px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;color:#9CA3AF">${(m.name||'?').charAt(0)}</div>`}
            <div style="font-weight:700;font-size:17px;color:#111827">${shareEsc(m.name||'')}</div>
            <div style="font-size:14px;color:#6B7280;margin:4px 0 12px">${shareEsc(m.role||'')}</div>
            ${m.bio?`<p style="font-size:14px;line-height:1.6;color:#9CA3AF">${shareEsc(m.bio)}</p>`:''}
          </div>`).join('')}
        </div>
      </section>`;
    case 'cards_grid':
      return `<section style="padding:${pad||'80px 40px'};background:${bg||'#f8fafc'}">
        ${c.title?`<div style="margin-bottom:40px"><h2 style="font-size:2.5rem;font-weight:800;color:#111827">${shareEsc(c.title)}</h2></div>`:''}
        <div style="display:grid;grid-template-columns:repeat(${Math.min(c.columns||3,4)},1fr);gap:24px">
          ${(c.cards||[]).map(card=>`<div style="background:${card.backgroundColor||'#fff'};border:${card.border||'1px solid #e5e7eb'};border-radius:12px;overflow:hidden">
            ${card.image?`<img src="${shareEsc(card.image)}" alt="${shareEsc(card.imageAlt||'')}" style="width:100%;aspect-ratio:16/9;object-fit:cover">`:``}
            <div style="padding:24px">
              ${card.tag?`<span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;background:rgba(79,124,255,.1);color:#4F7CFF;border-radius:4px;padding:2px 8px;margin-bottom:12px;display:inline-block">${shareEsc(card.tag)}</span>`:''}
              <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#111827">${shareEsc(card.title||'')}</h3>
              <p style="font-size:14px;line-height:1.6;color:#6B7280;margin-bottom:20px">${shareEsc(card.text||'')}</p>
              ${card.button?`<a href="${shareEsc(card.button.href||'#')}" style="display:inline-block;padding:8px 16px;background:${card.button.backgroundColor||'#4F7CFF'};color:${card.button.textColor||'#fff'};border-radius:8px;font-size:13px;font-weight:600;text-decoration:none">${shareEsc(card.button.label||'')}</a>`:''}
            </div>
          </div>`).join('')}
        </div>
      </section>`;
    case 'footer': {
      const cols = (c.columns||[]).map(col=>`<div>
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${tc||'#e5e7eb'};opacity:.5;margin-bottom:14px">${shareEsc(col.title||'')}</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${(col.links||[]).map(l=>`<a href="${shareEsc(l.href||'#')}" style="color:${tc||'#e5e7eb'};opacity:.7;font-size:15px;text-decoration:none">${shareEsc(l.label||'')}</a>`).join('')}
        </div>
      </div>`).join('');
      return `<footer style="padding:48px 40px;background:${bg||'#0f172a'}">
        <div style="max-width:1200px;margin:0 auto">
          <div style="display:flex;gap:40px;flex-wrap:wrap;margin-bottom:40px">
            <div style="max-width:280px">
              <div style="font-size:1.2rem;font-weight:700;color:${c.logoColor||tc||'#e5e7eb'};margin-bottom:12px">${shareEsc(c.logo||'Brand')}</div>
              ${c.description?`<p style="font-size:14px;color:${tc||'#e5e7eb'};opacity:.65;line-height:1.7">${shareEsc(c.description)}</p>`:''}
            </div>
            ${cols}
          </div>
          <div style="border-top:1px solid rgba(255,255,255,.08);padding-top:24px;font-size:13px;color:${tc||'#e5e7eb'};opacity:.5">${shareEsc(c.copyright||'© 2025')}</div>
        </div>
      </footer>`;
    }
    case 'contact':
      return `<section style="padding:${pad||'80px 40px'};background:${bg||'#fff'}">
        ${c.title?`<div style="text-align:${c.align||'center'};margin-bottom:48px"><h2 style="font-size:2.5rem;font-weight:800;color:#111827">${shareEsc(c.title)}</h2></div>`:''}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:32px">
          ${(c.items||[]).map(item=>`<div style="display:flex;gap:14px;align-items:flex-start">
            <div style="font-size:1.5rem">${item.icon||'📍'}</div>
            <div>
              <strong style="display:block;margin-bottom:4px;color:#111827">${shareEsc(item.label||'')}</strong>
              <span style="font-size:15px;color:#6B7280">${shareEsc(item.value||'')}</span>
            </div>
          </div>`).join('')}
        </div>
      </section>`;
    case 'timeline':
      return `<section style="padding:${pad||'80px 40px'};background:${bg||'#fff'}">
        ${c.title?`<h2 style="font-size:2.5rem;font-weight:800;color:#111827;margin-bottom:48px">${shareEsc(c.title)}</h2>`:''}
        <div style="max-width:680px;margin:0 auto">
          ${(c.items||[]).map((item,i)=>`<div style="display:flex;gap:24px;padding-bottom:40px">
            <div style="width:42px;height:42px;border-radius:50%;background:${c.accentColor||'#4F7CFF'};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">${i+1}</div>
            <div>
              ${item.date?`<div style="font-size:13px;color:${c.accentColor||'#4F7CFF'};margin-bottom:4px">${shareEsc(item.date)}</div>`:''}
              <div style="font-weight:700;font-size:17px;color:#111827;margin-bottom:6px">${shareEsc(item.title||'')}</div>
              <div style="font-size:15px;line-height:1.6;color:#6B7280">${shareEsc(item.text||'')}</div>
            </div>
          </div>`).join('')}
        </div>
      </section>`;
    case 'banner':
      return `<div style="padding:14px 24px;background:${bg||'#4F7CFF'};color:${tc||'#fff'};display:flex;align-items:center;justify-content:center;gap:12px;font-size:14px;font-weight:500">
        ${c.icon?`<span>${c.icon}</span>`:''}
        <span>${shareEsc(c.text||'')}</span>
        ${c.link?`<a href="${shareEsc(c.link)}" style="color:${tc||'#fff'};font-weight:700;text-decoration:underline;margin-left:8px">${shareEsc(c.linkLabel||'Learn more')}</a>`:''}
      </div>`;
    case 'icon':
      return `<div style="text-align:${c.align||'left'};padding:${pad||'8px 0'}">
        <span style="width:${c.size||'48px'};height:${c.size||'48px'};background:${bg||''};border-radius:${c.borderRadius||'12px'};color:${c.color||'#4F7CFF'};display:inline-flex;align-items:center;justify-content:center;font-size:calc(${c.size||'48px'} * .55)">${c.icon||'⚡'}</span>
        ${c.text?`<div style="font-size:14px;margin-top:8px;color:${c.textColor||'#374151'}">${shareEsc(c.text)}</div>`:''}
      </div>`;
    case 'badge':
      return `<span style="display:inline-block;padding:${c.padding||'4px 12px'};background:${bg||'rgba(79,124,255,.1)'};color:${tc||'#4F7CFF'};border-radius:${c.borderRadius||'6px'};font-size:${c.fontSize||'13px'};font-weight:600">${shareEsc(c.text||'')}</span>`;
    case 'link':
      return `<a href="${shareEsc(c.href||'#')}" target="${shareEsc(c.target||'_self')}" style="color:${c.color||'#4F7CFF'};text-decoration:${c.underline!==false?'underline':'none'};font-size:${c.fontSize||'16px'}">${shareEsc(c.label||'Link')}</a>`;
    case 'social_links':
      return `<div style="display:flex;gap:${c.gap||'12px'};justify-content:${c.align||'flex-start'};padding:8px 0">
        ${(c.links||[]).map(l=>`<a href="${shareEsc(l.url||'#')}" style="width:${c.size||'40px'};height:${c.size||'40px'};border-radius:8px;background:${l.backgroundColor||'rgba(0,0,0,.08)'};color:${l.color||'#111'};display:inline-flex;align-items:center;justify-content:center;text-decoration:none;font-size:18px">${l.icon||'🔗'}</a>`).join('')}
      </div>`;
    case 'form':
      return `<div style="max-width:${c.maxWidth||'560px'};padding:${pad||'0'}">
        ${c.title?`<h3 style="font-size:1.5rem;font-weight:700;color:#111827;margin-bottom:24px">${shareEsc(c.title)}</h3>`:''}
        <form style="display:flex;flex-direction:column;gap:16px" onsubmit="iwbSubmitForm(event,this,'${shareEsc(c.id||'')}')">
          ${(c.fields||[]).map(f=>{
            const fieldName = shareEsc(f.name||f.label||'field');
            const inp = f.type==='textarea'
              ?`<textarea data-name="${fieldName}" rows="${f.rows||4}" placeholder="${shareEsc(f.placeholder||'')}" style="width:100%;padding:12px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:15px;resize:vertical;box-sizing:border-box"></textarea>`
              :f.type==='select'
              ?`<select data-name="${fieldName}" style="width:100%;padding:12px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:15px;box-sizing:border-box"><option value="">Select...</option>${(f.options||[]).map(o=>`<option value="${shareEsc(o.value||'')}">${shareEsc(o.label||'')}</option>`).join('')}</select>`
              :f.type==='checkbox'
              ?`<label style="display:flex;align-items:center;gap:10px;cursor:pointer"><input type="checkbox" data-name="${fieldName}"> ${shareEsc(f.label||'')}</label>`
              :`<input type="${shareEsc(f.type||'text')}" data-name="${fieldName}" placeholder="${shareEsc(f.placeholder||'')}" style="width:100%;padding:12px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:15px;box-sizing:border-box">`;
            return f.type==='checkbox'?`<div>${inp}</div>`:`<div><label style="display:block;font-size:14px;font-weight:500;color:#374151;margin-bottom:6px">${shareEsc(f.label||'')}</label>${inp}</div>`;
          }).join('')}
          ${c.submitButton?`<button type="submit" style="padding:12px 24px;background:${c.submitButton.backgroundColor||'#4F7CFF'};color:${c.submitButton.textColor||'#fff'};border:none;border-radius:8px;font-weight:600;font-size:15px;cursor:pointer${c.submitButton.fullWidth?';width:100%':''}">${shareEsc(c.submitButton.label||'Submit')}</button>`:''}
        </form>
      </div>`;
    case 'countdown':
      return `<section style="padding:${pad||'80px 40px'};background:${bg||'#0f172a'};text-align:center">
        ${c.title?`<h2 style="font-size:2rem;font-weight:800;color:${tc||'#fff'};margin-bottom:32px">${shareEsc(c.title)}</h2>`:''}
        <div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap" ${c.targetDate?`data-countdown="${shareEsc(c.targetDate)}"`:''}>
          ${['days','hours','minutes','seconds'].map(u=>`<div>
            <span id="cd-${c.id}-${u}" style="display:block;font-size:3rem;font-weight:800;color:${c.accentColor||'#4F7CFF'};line-height:1;min-width:80px">00</span>
            <span style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:${tc||'#fff'};opacity:.6">${u}</span>
          </div>`).join('')}
        </div>
        <script>
          (function(){
            var target = new Date("${c.targetDate||''}").getTime();
            if(!target) return;
            function tick(){
              var diff = target - Date.now();
              if(diff<=0){return;}
              var vals = {days:Math.floor(diff/86400000),hours:Math.floor((diff%86400000)/3600000),minutes:Math.floor((diff%3600000)/60000),seconds:Math.floor((diff%60000)/1000)};
              Object.entries(vals).forEach(function(e){var el=document.getElementById('cd-${c.id}-'+e[0]);if(el)el.textContent=String(e[1]).padStart(2,'0');});
              setTimeout(tick,1000);
            }tick();
          })();
        </script>`;
    case 'tabs': {
      const tabs = c.tabs||[];
      if(!tabs.length) return '';
      const tabId = `tabs-${c.id||Date.now()}`;
      return `<div style="padding:${pad||'0'}">
        <div style="display:flex;border-bottom:2px solid rgba(0,0,0,.1);gap:4px" id="${tabId}-nav">
          ${tabs.map((t,i)=>`<button onclick="(function(i){var nav=document.getElementById('${tabId}-nav');nav.querySelectorAll('button').forEach(function(b,j){b.style.borderBottom=j===i?'2px solid #4F7CFF':'2px solid transparent';b.style.color=j===i?'#4F7CFF':'#6B7280'});document.querySelectorAll('[data-panel-${tabId}]').forEach(function(p,j){p.style.display=j===i?'block':'none'})})(${i})" style="padding:12px 20px;font-size:15px;font-weight:500;border:none;background:none;cursor:pointer;border-bottom:${i===0?'2px solid #4F7CFF':'2px solid transparent'};color:${i===0?'#4F7CFF':'#6B7280'};margin-bottom:-2px">${shareEsc(t.label||'Tab '+(i+1))}</button>`).join('')}
        </div>
        <div style="padding-top:24px">
          ${tabs.map((t,i)=>`<div data-panel-${tabId} style="display:${i===0?'block':'none'}">${(t.children||[]).map(shareRenderComp).join('')}</div>`).join('')}
        </div>
      </div>`;
    }
    default:
      return `<div style="padding:20px;border:1px dashed #e5e7eb;border-radius:8px;text-align:center;color:#9CA3AF;font-size:14px">${shareEsc(c.type||'unknown')}</div>`;
  }
}

async function iwbSubmitForm(event, form, formId) {
  event.preventDefault();
  const btn = form.querySelector('[type="submit"]');
  const originalText = btn ? btn.textContent : '';
  if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }

  const data = {};
  form.querySelectorAll('[data-name]').forEach(function(el) {
    data[el.dataset.name] = el.type === 'checkbox' ? el.checked : el.value;
  });

  const token = window._iwbToken || '';
  try {
    const res = await fetch(`/api/projects/shared/${token}/forms/${formId}/submit/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      form.innerHTML = '<p style="font-size:1.1rem;font-weight:600;color:#22C55E;text-align:center">✓ Message sent successfully!</p>';
    } else {
      const err = await res.json().catch(() => ({}));
      if (btn) { btn.textContent = originalText; btn.disabled = false; }
      alert(err.detail || 'Something went wrong. Please try again.');
    }
  } catch {
    if (btn) { btn.textContent = originalText; btn.disabled = false; }
    alert('Network error. Please try again.');
  }
}
