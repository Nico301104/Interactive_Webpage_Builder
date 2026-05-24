// ── Hash Router ───────────────────────────────────────────────
const router = {
  routes: {},
  currentPage: null,

  register(path, handler) { this.routes[path] = handler; return this; },

  go(path) { window.location.hash = '#' + path; },

  async handle() {
    const raw = window.location.hash.replace('#','');
    if (raw && !raw.startsWith('/')) return; // page anchor, not a route
    const hash = raw || '/';
    // match /editor/:id and /share/:token
    let handler, params = {};
    if (this.routes[hash]) {
      handler = this.routes[hash];
    } else {
      for (const [pattern, h] of Object.entries(this.routes)) {
        const re = new RegExp('^' + pattern.replace(/:([^/]+)/g, '([^/]+)') + '$');
        const m = hash.match(re);
        if (m) {
          handler = h;
          const keys = [...pattern.matchAll(/:([^/]+)/g)].map(x=>x[1]);
          keys.forEach((k,i)=>{ params[k]=m[i+1]; });
          break;
        }
      }
    }
    if (!handler) handler = this.routes['/404'] || (()=>{ document.getElementById('app').innerHTML='<div style="color:white;padding:40px">404 Not found</div>'; });

    // Auth guard
    const publicRoutes = ['/','/auth','/share/:token'];
    const isPublic = ['/','/auth'].includes(hash) || hash.startsWith('/share/');
    if (!isPublic && !Auth.isLoggedIn()) {
      const ok = await Auth.tryRefresh();
      if (!ok) { this.go('/auth'); return; }
    }

    this.currentPage = hash;
    document.getElementById('app').innerHTML = '';
    // Remove any body-level modal overlays left over from previous page
    ['export-modal','settings-modal','template-gallery-overlay',
     'new-project-from-template','json-preview-modal',
     'new-project-modal','new-tag-modal']
      .forEach(id => document.getElementById(id)?.remove());
    await handler(params);
  },

  init() {
    window.addEventListener('hashchange', ()=> this.handle());
    window.addEventListener('load', ()=> this.handle());
    return this;
  }
};
window.router = router;
