// ── Dashboard Page ────────────────────────────────────────────
let dashProjects = [];
let dashSearch = '';
let dashStatus = '';
let dashTags = [];
let dashTagFilter = null;

function userIsPro(user) {
  if (!user || !user.plan || user.plan === 'free') return false;
  if (user.plan_expires_at && new Date(user.plan_expires_at) < new Date()) return false;
  return true;
}

async function renderDashboard() {
  const user = Auth.user || {};
  const initials = (user.username||user.email||'U').slice(0,1).toUpperCase();

  document.getElementById('app').innerHTML = `
  <div class="bg-background text-on-background font-body-md min-h-screen overflow-x-hidden">
    <!-- TopNav -->
    <nav class="bg-[#111A2E]/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-slate-800 shadow-[0px_10px_20px_rgba(0,0,0,0.5)] flex justify-between items-center h-16 px-6">
      <div class="flex items-center gap-8">
        <div class="text-xl font-bold tracking-tight text-slate-50 cursor-pointer" onclick="router.go('/')">IWB</div>
        <div class="hidden md:flex gap-6 items-center h-full">
          <a onclick="router.go('/dashboard')" class="text-[#4F7CFF] border-b-2 border-[#4F7CFF] pb-1 h-16 flex items-center cursor-pointer">Dashboard</a>
          <a onclick="openTemplateGallery()" class="text-slate-400 hover:text-slate-200 h-16 flex items-center hover:bg-white/5 transition-all px-3 -mx-3 rounded-md cursor-pointer">Templates</a>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="relative hidden lg:block">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
          <input id="dash-search" type="text" placeholder="Search projects..." value="${dashSearch}"
            oninput="dashSearchHandler(this.value)"
            class="bg-[#0F1729] border border-surface-variant text-on-surface text-body-sm pl-9 pr-4 py-1.5 rounded-DEFAULT focus:outline-none focus:border-primary transition-colors w-64"/>
        </div>
        ${userIsPro(user)
          ? `<span style="background:rgba(79,124,255,.15);color:#4F7CFF;border:1px solid rgba(79,124,255,.3);padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.07em">${user.plan.toUpperCase()}</span>`
          : `<button onclick="router.go('/pricing')" class="bg-[#4F7CFF] text-white hover:shadow-[0_0_10px_rgba(79,124,255,0.5)] px-4 py-1.5 rounded-DEFAULT text-body-sm font-medium transition-all active:scale-95 flex items-center gap-1"><span class="material-symbols-outlined text-[15px]">star</span> Upgrade</button>`
        }
        <div class="h-6 w-px bg-slate-800 mx-2"></div>
        <div class="relative group">
          <div class="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center border border-outline-variant ml-2 cursor-pointer">${initials}</div>
          <div class="absolute right-0 top-10 hidden group-hover:block bg-surface-container-high border border-outline-variant rounded-xl shadow-xl p-2 min-w-[200px] z-50">
            <div class="px-3 py-2 border-b border-outline-variant mb-1">
              <div class="text-sm font-semibold text-on-surface">${user.username||'User'}</div>
              <div class="text-xs text-on-surface-variant">${user.plan||'free'} plan</div>
            </div>
            <button onclick="router.go('/pricing')" class="w-full text-left px-3 py-2 text-sm text-on-surface-variant hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">star</span> Upgrade plan
            </button>
            <button onclick="Auth.logout()" class="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">logout</span> Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
    <!-- Sidebar -->
    <aside class="bg-[#111A2E] font-['JetBrains_Mono'] text-xs uppercase tracking-widest h-screen w-64 border-r border-slate-800 fixed left-0 top-0 flex flex-col py-4 z-40 pt-20">
      <div class="px-6 mb-8 flex items-center gap-3">
        <div class="w-8 h-8 rounded-DEFAULT bg-primary-container flex items-center justify-center">
          <span class="material-symbols-outlined text-on-primary-container text-[18px]" style="font-variation-settings:'FILL' 1">architecture</span>
        </div>
        <div>
          <div class="text-slate-50 font-semibold text-sm capitalize tracking-normal flex items-center gap-2">
            ${user.username||'User'}
            ${userIsPro(user) ? `<span style="background:rgba(79,124,255,.2);color:#4F7CFF;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px;letter-spacing:.06em">${user.plan.toUpperCase()}</span>` : ''}
          </div>
          <div class="text-slate-500 text-[10px]">${user.email||''}</div>
        </div>
      </div>
      <nav class="flex-1 px-3 space-y-1">
        <a class="flex items-center gap-3 px-3 py-2.5 rounded-DEFAULT bg-[#4F7CFF]/10 text-[#4F7CFF] border-r-2 border-[#4F7CFF]">
          <span class="material-symbols-outlined text-[18px]" style="font-variation-settings:'FILL' 1">grid_view</span><span>Projects</span>
        </a>
        <a onclick="openTemplateGallery()" class="flex items-center gap-3 px-3 py-2.5 rounded-DEFAULT text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-colors cursor-pointer">
          <span class="material-symbols-outlined text-[18px]">auto_awesome</span><span>Templates</span>
        </a>
        ${buildTagSidebarSection()}
        <a onclick="router.go('/pricing')" class="flex items-center gap-3 px-3 py-2.5 rounded-DEFAULT text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-colors cursor-pointer">
          <span class="material-symbols-outlined text-[18px]">star</span><span>Upgrade</span>
        </a>
      </nav>
      <div class="mt-auto px-3 space-y-1 border-t border-slate-800/50 pt-4">
        <a onclick="Auth.logout()" class="flex items-center gap-3 px-3 py-2.5 rounded-DEFAULT text-error/60 hover:bg-error/10 hover:text-error transition-colors cursor-pointer">
          <span class="material-symbols-outlined text-[18px]">logout</span><span>Sign out</span>
        </a>
      </div>
    </aside>
    <!-- Main -->
    <main class="ml-64 pt-16 p-canvas-margin">
      <header class="flex justify-between items-center mb-8 mt-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Projects</h1>
          <p class="text-slate-400 text-sm mt-1">Manage and access your web workspaces.</p>
        </div>
        <div class="flex items-center gap-3">
          <select id="dash-status-filter" onchange="dashFilterHandler(this.value)"
            class="bg-[#0F1729] border border-outline-variant text-on-surface text-body-sm px-3 py-1.5 rounded-DEFAULT focus:outline-none focus:border-primary">
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button onclick="openNewProjectModal()"
            class="bg-[#4F7CFF] text-white px-4 py-2 rounded-DEFAULT text-sm font-medium hover:shadow-[0_0_10px_rgba(79,124,255,0.5)] transition-all active:scale-95 flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">add</span> New Project
          </button>
        </div>
      </header>
      <!-- Grid -->
      <div id="projects-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="col-span-3 text-center py-20">
          <div class="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p class="text-slate-400 mt-4 text-sm">Loading projects…</p>
        </div>
      </div>
    </main>
  </div>`;

  await loadProjects();
  await loadTags();
}

async function loadProjects() {
  const params = {};
  if (dashSearch) params.search = dashSearch;
  if (dashStatus) params.status = dashStatus;
  if (dashTagFilter) params.tag = dashTagFilter;
  params.ordering = '-updated_at';

  const data = await projectsAPI.list(params);
  dashProjects = data?.results || [];
  renderProjectGrid();
}

function renderProjectGrid() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  let html = '';

  // New project card
  html += `
    <div onclick="openNewProjectModal()" class="border-2 border-dashed border-[#1F2A44] rounded-xl aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:border-[#4F7CFF] hover:bg-[#4F7CFF]/5 transition-all group">
      <div class="w-12 h-12 rounded-xl bg-[#4F7CFF]/10 flex items-center justify-center mb-3 group-hover:bg-[#4F7CFF]/20 transition-colors">
        <span class="material-symbols-outlined text-[#4F7CFF] text-[28px]">add</span>
      </div>
      <span class="text-white font-semibold text-sm">New Project</span>
      <span class="text-slate-500 text-xs mt-1">Start from scratch or a template</span>
    </div>`;

  if (dashProjects.length === 0) {
    html += `<div class="col-span-2 flex flex-col items-center justify-center py-20 text-center">
      <span class="material-symbols-outlined text-slate-600 text-[64px] mb-4">folder_open</span>
      <h3 class="text-white font-semibold text-lg mb-2">No projects yet</h3>
      <p class="text-slate-400 text-sm">Create your first project to get started.</p>
    </div>`;
  } else {
    for (const p of dashProjects) {
      const updated = timeAgo(p.updated_at);
      const statusColor = { draft:'text-slate-400 bg-slate-800', published:'text-emerald-400 bg-emerald-900/40', archived:'text-amber-400 bg-amber-900/40' }[p.status] || 'text-slate-400 bg-slate-800';
      const statusLabel = p.status?.charAt(0).toUpperCase() + p.status?.slice(1) || 'Draft';
      html += `
        <div class="bg-[#111A2E] border border-[#1F2A44] rounded-xl overflow-hidden hover:border-[#2A3A58] hover:shadow-lg hover:-translate-y-0.5 transition-all group cursor-pointer" onclick="router.go('/editor/${p.id}')">
          <!-- Thumbnail -->
          <div class="h-44 bg-[#0B1220] relative overflow-hidden flex items-center justify-center">
            ${renderMiniPreview(p)}
            <span class="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${statusColor}">${statusLabel}</span>
            <!-- Hover actions -->
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
              <div class="w-full flex gap-2 p-3 justify-end" onclick="event.stopPropagation()">
                <button onclick="event.stopPropagation();router.go('/editor/${p.id}')" title="Edit" class="w-8 h-8 bg-[#4F7CFF] text-white rounded-lg flex items-center justify-center hover:brightness-110 transition-all">
                  <span class="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button onclick="event.stopPropagation();dupProject('${p.id}')" title="Duplicate" class="w-8 h-8 bg-surface-container-high border border-outline-variant text-on-surface rounded-lg flex items-center justify-center hover:bg-surface-bright transition-all">
                  <span class="material-symbols-outlined text-[16px]">content_copy</span>
                </button>
                <button onclick="event.stopPropagation();delProject('${p.id}','${escHtml(p.title)}')" title="Delete" class="w-8 h-8 bg-error/20 text-error border border-error/30 rounded-lg flex items-center justify-center hover:bg-error/30 transition-all">
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          </div>
          <!-- Card body -->
          <div class="p-4">
            <h3 class="text-white font-semibold text-sm truncate mb-1">${escHtml(p.title)}</h3>
            <p class="text-slate-500 text-xs truncate mb-3">${escHtml(p.description||'No description')}</p>
            <div class="flex items-center justify-between text-slate-500 text-xs">
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">schedule</span> ${updated}
              </span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">history</span> ${p.version_count||0} versions
              </span>
            </div>
            ${p.tags?.length ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">
              ${p.tags.map(t=>`<span style="background:${t.color}22;color:${t.color};font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px">${escHtml(t.name)}</span>`).join('')}
            </div>` : ''}
          </div>
        </div>`;
    }
  }
  grid.innerHTML = html;
}

function renderMiniPreview(p) {
  const comps = p.layout?.components || [];
  const types = comps.map(c=>c.type);
  let preview = '';
  if (types.includes('navbar')) preview += '<div style="height:24px;background:#0F1729;border-bottom:1px solid #1F2A44;width:100%"></div>';
  if (types.includes('hero')) preview += '<div style="height:60px;background:linear-gradient(135deg,#111A2E,#0B1220);width:100%"></div>';
  if (types.includes('features')) preview += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px"><div style="height:32px;background:#1c2b3c;border-radius:4px"></div><div style="height:32px;background:#1c2b3c;border-radius:4px"></div><div style="height:32px;background:#1c2b3c;border-radius:4px"></div></div>';
  if (!preview) preview = `<div style="display:flex;flex-direction:column;gap:8px;padding:16px;width:100%"><div style="height:8px;background:#1F2A44;border-radius:4px;width:60%"></div><div style="height:6px;background:#1F2A44;border-radius:4px;width:90%;opacity:.6"></div><div style="height:6px;background:#1F2A44;border-radius:4px;width:75%;opacity:.6"></div></div>`;
  return `<div style="width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden">${preview}</div>`;
}

function dashSearchHandler(v) { dashSearch=v; clearTimeout(window._dbt); window._dbt=setTimeout(loadProjects,350); }
function dashFilterHandler(v) { dashStatus=v; loadProjects(); }

async function dupProject(id) {
  const data = await projectsAPI.duplicate(id);
  if (data?.id) { showToast('Project duplicated!','success'); await loadProjects(); }
  else showToast('Failed to duplicate','error');
}

async function delProject(id, title) {
  showConfirm(`Delete project "<strong>${title}</strong>"? This cannot be undone.`, async ()=>{
    const r = await projectsAPI.delete(id);
    if (r?.ok !== false) { showToast('Project deleted','success'); await loadProjects(); }
    else showToast('Failed to delete','error');
  }, true);
}

// ── New Project Modal ─────────────────────────────────────────
function openNewProjectModal() {
  const m = document.createElement('div');
  m.id = 'new-project-modal';
  m.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center';
  m.innerHTML = `
    <div style="background:#111A2E;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:32px;width:480px;box-shadow:0 32px 80px rgba(0,0,0,0.6)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <h2 style="color:#E5E7EB;font-size:20px;font-weight:600;font-family:Inter">New Project</h2>
        <button onclick="document.getElementById('new-project-modal').remove()" style="background:none;border:none;color:#94A3B8;cursor:pointer;font-size:20px">&times;</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div>
          <label style="display:block;color:#94A3B8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;font-family:Inter">Project Name</label>
          <input id="new-project-name" type="text" placeholder="My Awesome Page" autofocus
            style="width:100%;background:#0F1729;border:1px solid #1F2A44;border-radius:8px;padding:10px 14px;color:#E5E7EB;font-size:15px;font-family:Inter;outline:none;box-sizing:border-box"
            onfocus="this.style.borderColor='#4F7CFF'"
            onblur="this.style.borderColor='#1F2A44'"/>
        </div>
        <div>
          <label style="display:block;color:#94A3B8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;font-family:Inter">Description (optional)</label>
          <textarea id="new-project-desc" placeholder="What is this project about?" rows="2"
            style="width:100%;background:#0F1729;border:1px solid #1F2A44;border-radius:8px;padding:10px 14px;color:#E5E7EB;font-size:15px;font-family:Inter;outline:none;resize:none;box-sizing:border-box"
            onfocus="this.style.borderColor='#4F7CFF'"
            onblur="this.style.borderColor='#1F2A44'"></textarea>
        </div>
        <div id="new-project-error" style="display:none;color:#EF4444;font-size:13px;font-family:Inter"></div>
        <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:8px">
          <button onclick="document.getElementById('new-project-modal').remove()"
            style="padding:10px 20px;border:1px solid #1F2A44;background:transparent;color:#E5E7EB;border-radius:8px;cursor:pointer;font-family:Inter;font-size:14px">Cancel</button>
          <button id="create-project-btn" onclick="createProject()"
            style="padding:10px 24px;background:linear-gradient(135deg,#5A84FF,#4F7CFF,#4267E8);color:white;border:none;border-radius:8px;cursor:pointer;font-family:Inter;font-size:14px;font-weight:600;box-shadow:0 0 20px rgba(79,124,255,0.3)">
            Create Project
          </button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(m);
  document.getElementById('new-project-name').focus();
  document.getElementById('new-project-name').addEventListener('keydown', e=>{ if(e.key==='Enter') createProject(); });
}

async function createProject() {
  const name = document.getElementById('new-project-name')?.value?.trim();
  const desc = document.getElementById('new-project-desc')?.value?.trim();
  const errEl = document.getElementById('new-project-error');
  const btn = document.getElementById('create-project-btn');
  if (!name) { errEl.textContent='Project name is required'; errEl.style.display='block'; return; }
  btn.textContent='Creating…'; btn.disabled=true;
  const data = await projectsAPI.create({ title:name, description:desc||'', layout:{components:[]}, meta:{} });
  if (data?.id) {
    document.getElementById('new-project-modal')?.remove();
    showToast('Project created!','success');
    router.go(`/editor/${data.id}`);
  } else {
    errEl.textContent = parseError(data) || 'Failed to create project';
    errEl.style.display='block';
    btn.textContent='Create Project'; btn.disabled=false;
  }
}

function openTemplateGallery() { window.renderTemplateGallery?.(); }

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff<60) return 'just now';
  if (diff<3600) return Math.floor(diff/60)+'m ago';
  if (diff<86400) return Math.floor(diff/3600)+'h ago';
  return Math.floor(diff/86400)+'d ago';
}

function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ── Tag sidebar section ───────────────────────────────────────
function buildTagSidebarSection() {
  return `<div id="sidebar-tags" style="margin-top:16px;padding:0 12px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding:0 4px">
      <span style="color:#4B5563;font-size:10px;text-transform:uppercase;letter-spacing:.08em">Tags</span>
      <button onclick="openNewTagModal()" style="background:none;border:none;color:#4B5563;cursor:pointer;font-size:18px;line-height:1;padding:2px 4px" title="New tag">+</button>
    </div>
    ${dashTags.length === 0
      ? `<p style="color:#374151;font-size:11px;padding:0 4px">No tags yet</p>`
      : dashTags.map(tag=>`
          <div onclick="setTagFilter('${tag.id}')"
            style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border-radius:8px;cursor:pointer;margin-bottom:2px;background:${dashTagFilter===tag.id?'rgba(79,124,255,.1)':'transparent'}">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="width:8px;height:8px;border-radius:50%;background:${tag.color};flex-shrink:0"></span>
              <span style="color:${dashTagFilter===tag.id?'#E5E7EB':'#94A3B8'};font-size:12px">${escHtml(tag.name)}</span>
            </div>
            <button onclick="event.stopPropagation();deleteTag('${tag.id}')"
              style="background:none;border:none;color:#374151;cursor:pointer;font-size:14px;line-height:1;opacity:0;transition:opacity .15s"
              onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0">×</button>
          </div>`).join('')}
  </div>`;
}

async function loadTags() {
  const data = await tagsAPI.list();
  dashTags = Array.isArray(data) ? data : (data?.results || []);
  const tagSection = document.getElementById('sidebar-tags');
  if (tagSection) tagSection.outerHTML = buildTagSidebarSection();
}

function setTagFilter(tagId) {
  dashTagFilter = (dashTagFilter === tagId) ? null : tagId;
  loadProjects();
  loadTags();
}

async function deleteTag(id) {
  const r = await tagsAPI.delete(id);
  if (r?.ok !== false) {
    if (dashTagFilter === id) { dashTagFilter = null; loadProjects(); }
    await loadTags();
    showToast('Tag deleted', 'success');
  } else {
    showToast('Failed to delete tag', 'error');
  }
}

function openNewTagModal() {
  const COLORS = ['#4F7CFF','#22C55E','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4'];
  window._tagPickedColor = COLORS[0];
  const m = document.createElement('div');
  m.id = 'new-tag-modal';
  m.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center';
  m.innerHTML = `
    <div style="background:#111A2E;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:28px;width:380px;box-shadow:0 32px 80px rgba(0,0,0,.6)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h2 style="color:#E5E7EB;font-size:17px;font-weight:600;font-family:Inter;margin:0">New Tag</h2>
        <button onclick="document.getElementById('new-tag-modal').remove()" style="background:none;border:none;color:#94A3B8;cursor:pointer;font-size:20px">&times;</button>
      </div>
      <label style="display:block;color:#94A3B8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;font-family:Inter">Tag Name</label>
      <input id="new-tag-name" type="text" placeholder="e.g. Client Work" autofocus
        style="width:100%;background:#0F1729;border:1px solid #1F2A44;border-radius:8px;padding:9px 12px;color:#E5E7EB;font-size:14px;font-family:Inter;outline:none;box-sizing:border-box;margin-bottom:16px"
        onfocus="this.style.borderColor='#4F7CFF'" onblur="this.style.borderColor='#1F2A44'"/>
      <label style="display:block;color:#94A3B8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;font-family:Inter">Color</label>
      <div id="tag-color-swatches" style="display:flex;gap:8px;margin-bottom:20px">
        ${COLORS.map(c=>`<div onclick="window._pickTagColor('${c}')" id="swatch-${c.slice(1)}"
          style="width:24px;height:24px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${c===COLORS[0]?'#fff':'transparent'};transition:border .15s"></div>`).join('')}
      </div>
      <div id="new-tag-error" style="display:none;color:#EF4444;font-size:12px;margin-bottom:12px;font-family:Inter"></div>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button onclick="document.getElementById('new-tag-modal').remove()"
          style="padding:9px 18px;border:1px solid #1F2A44;background:transparent;color:#E5E7EB;border-radius:8px;cursor:pointer;font-family:Inter;font-size:13px">Cancel</button>
        <button id="create-tag-btn" onclick="submitNewTag()"
          style="padding:9px 20px;background:#4F7CFF;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:Inter;font-size:13px;font-weight:600">Create Tag</button>
      </div>
    </div>`;
  document.body.appendChild(m);
  window._pickTagColor = (c) => {
    window._tagPickedColor = c;
    document.querySelectorAll('[id^="swatch-"]').forEach(el => {
      el.style.borderColor = el.id === 'swatch-' + c.slice(1) ? '#fff' : 'transparent';
    });
  };
  document.getElementById('new-tag-name').addEventListener('keydown', e => { if (e.key === 'Enter') submitNewTag(); });
}

async function submitNewTag() {
  const name = document.getElementById('new-tag-name')?.value?.trim();
  const errEl = document.getElementById('new-tag-error');
  const btn = document.getElementById('create-tag-btn');
  if (!name) { errEl.textContent = 'Tag name is required'; errEl.style.display = 'block'; return; }
  btn.textContent = 'Creating…'; btn.disabled = true;
  const data = await tagsAPI.create(name, window._tagPickedColor || '#4F7CFF');
  if (data?.id) {
    document.getElementById('new-tag-modal')?.remove();
    showToast('Tag created!', 'success');
    await loadTags();
  } else {
    errEl.textContent = parseError(data) || 'Failed to create tag';
    errEl.style.display = 'block';
    btn.textContent = 'Create Tag'; btn.disabled = false;
  }
}
