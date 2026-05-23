const API = 'http://localhost:8000';

const Auth = {
  _access: null,
  get access() { return this._access; },
  set access(v) { this._access = v; },
  get refresh() { return localStorage.getItem('pb_rt'); },
  set refresh(v) { v ? localStorage.setItem('pb_rt', v) : localStorage.removeItem('pb_rt'); },
  get user() { try { return JSON.parse(localStorage.getItem('pb_user') || 'null'); } catch { return null; } },
  set user(v) { v ? localStorage.setItem('pb_user', JSON.stringify(v)) : localStorage.removeItem('pb_user'); },
  isLoggedIn() { return !!(this._access || this.refresh); },
  saveTokens(data) {
    this.access = data.tokens?.access || data.access || null;
    const rt = data.tokens?.refresh || data.refresh || null;
    if (rt) this.refresh = rt;
    if (data.user) this.user = data.user;
  },
  async tryRefresh() {
    if (!this.refresh) return false;
    try {
      const r = await fetch(`${API}/api/auth/token/refresh/`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ refresh: this.refresh })
      });
      if (!r.ok) { this.clear(); return false; }
      const d = await r.json();
      this.access = d.access;
      if (d.refresh) this.refresh = d.refresh;
      return true;
    } catch { this.clear(); return false; }
  },
  async logout() {
    try {
      if (this.access && this.refresh)
        await fetch(`${API}/api/auth/logout/`, {
          method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${this.access}`},
          body: JSON.stringify({ refresh: this.refresh })
        });
    } catch {}
    this.clear();
    window.router?.go('/auth');
  },
  clear() { this._access=null; this.refresh=null; this.user=null; }
};

async function apiFetch(path, opts={}) {
  if (!Auth.access && !(await Auth.tryRefresh())) { window.router?.go('/auth'); return null; }
  const isJSON = opts.body && !(opts.body instanceof FormData);
  const h = { Authorization:`Bearer ${Auth.access}`, ...(isJSON?{'Content-Type':'application/json'}:{}), ...opts.headers };
  let r = await fetch(`${API}${path}`, {...opts, headers:h});
  if (r.status === 401) {
    if (!(await Auth.tryRefresh())) { window.router?.go('/auth'); return null; }
    h.Authorization = `Bearer ${Auth.access}`;
    r = await fetch(`${API}${path}`, {...opts, headers:h});
  }
  return r;
}

async function apiJSON(path, opts={}) {
  try {
    const r = await apiFetch(path, opts);
    if (!r) return null;
    if (r.status === 204) return {ok:true};
    return r.json().catch(()=>null);
  } catch {
    return null;
  }
}

async function downloadBlob(path, filename) {
  if (!Auth.access) await Auth.tryRefresh();
  const r = await fetch(`${API}${path}`, { headers:{Authorization:`Bearer ${Auth.access}`} });
  if (!r.ok) { showToast('Download failed','error'); return; }
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
}

function parseError(d) {
  if (!d) return 'An error occurred';
  if (typeof d==='string') return d;
  if (d.detail) return String(d.detail);
  const flatten = (v) => Array.isArray(v) ? v[0] : (typeof v==='object' && v ? Object.values(v).map(flatten).join(', ') : String(v));
  return Object.entries(d).map(([f,m])=>`${f!=='non_field_errors'?f+': ':''}${flatten(m)}`).join(' · ');
}

const authAPI = {
  async login(email, password) {
    const r = await fetch(`${API}/api/auth/login/`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, password })
    });
    const data = await r.json();
    if (r.ok) Auth.saveTokens(data);
    return { ok:r.ok, data };
  },
  async register(username, email, password, password2) {
    const r = await fetch(`${API}/api/auth/register/`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ username, email, password, password2 })
    });
    const data = await r.json();
    if (r.ok) Auth.saveTokens(data);
    return { ok:r.ok, data };
  },
  getProfile: ()=> apiJSON('/api/auth/profile/'),
  updateProfile: (p)=> apiJSON('/api/auth/profile/', {method:'PATCH',body:JSON.stringify(p)}),
  changePassword: (op,np)=> apiJSON('/api/auth/change-password/',{method:'PUT',body:JSON.stringify({old_password:op,new_password:np})})
};

const projectsAPI = {
  list: (p={})=> apiJSON('/api/projects/?'+new URLSearchParams(p)),
  get: (id)=> apiJSON(`/api/projects/${id}/`),
  create: (p)=> apiJSON('/api/projects/',{method:'POST',body:JSON.stringify(p)}),
  update: (id,p)=> apiJSON(`/api/projects/${id}/`,{method:'PATCH',body:JSON.stringify(p)}),
  delete: (id)=> apiJSON(`/api/projects/${id}/`,{method:'DELETE'}),
  duplicate: (id)=> apiJSON(`/api/projects/${id}/duplicate/`,{method:'POST'}),
  togglePublic: (id)=> apiJSON(`/api/projects/${id}/toggle-public/`,{method:'POST'}),
  regenerateToken: (id)=> apiJSON(`/api/projects/${id}/regenerate-token/`,{method:'POST'}),
  getVersions: (id)=> apiJSON(`/api/projects/${id}/versions/`),
  restoreVersion: (id,vId)=> apiJSON(`/api/projects/${id}/versions/restore/`,{method:'POST',body:JSON.stringify({version_id:vId})}),
  async getShared(token) {
    const r = await fetch(`${API}/api/projects/shared/${token}/`);
    return r.ok ? r.json() : null;
  }
};

const editorAPI = {
  getLayout: (id)=> apiJSON(`/api/editor/projects/${id}/layout/`),
  saveLayout: (id,layout)=> apiJSON(`/api/editor/projects/${id}/layout/`,{method:'PUT',body:JSON.stringify({layout})}),
  upsertComponent: (id,component)=> apiJSON(`/api/editor/projects/${id}/components/`,{method:'POST',body:JSON.stringify({component})}),
  deleteComponent: (id,cid)=> apiJSON(`/api/editor/projects/${id}/components/delete/`,{method:'DELETE',body:JSON.stringify({component_id:cid})}),
  reorderComponents: (id,ids)=> apiJSON(`/api/editor/projects/${id}/components/reorder/`,{method:'POST',body:JSON.stringify({ordered_ids:ids})}),
  getDefaults: (type)=> apiJSON(`/api/editor/component-defaults/${type}/`)
};

const exportAPI = {
  getJSON: (id)=> apiJSON(`/api/export/${id}/?type=json`),
  downloadZip: (id,slug)=> downloadBlob(`/api/export/${id}/?type=zip`, `${slug||id}-export.zip`)
};

const paymentsAPI = {
  checkout: (data)=> apiJSON('/api/payments/checkout/', {method:'POST', body:JSON.stringify(data)}),
  status: ()=> apiJSON('/api/payments/status/'),
  history: ()=> apiJSON('/api/payments/history/'),
};

const tagsAPI = {
  list:   ()           => apiJSON('/api/projects/tags/'),
  create: (name, color)=> apiJSON('/api/projects/tags/', {method:'POST', body:JSON.stringify({name, color})}),
  delete: (id)         => apiJSON(`/api/projects/tags/${id}/`, {method:'DELETE'}),
};
