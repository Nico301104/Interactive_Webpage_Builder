// ── Dashboard Page ────────────────────────────────────────────
let dashProjects = [];
let dashSearch   = '';
let dashStatus   = '';
let dashTags     = [];
let dashTagFilter = null;

function userIsPro(user) {
  if (!user || !user.plan || user.plan === 'free') return false;
  if (user.plan_expires_at && new Date(user.plan_expires_at) < new Date()) return false;
  return true;
}

async function renderDashboard() {
  const user     = Auth.user || {};
  const initials = (user.username || user.email || 'U').slice(0,1).toUpperCase();

  document.getElementById('app').innerHTML = `
  <div style="background:#030B14;color:#E8F4FD;font-family:Inter,system-ui,sans-serif;min-height:100vh;overflow-x:hidden">

    <!-- ── TOP NAV ──────────────────────────────────── -->
    <nav style="background:rgba(3,11,20,.9);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);position:fixed;top:0;width:100%;z-index:50;border-bottom:1px solid rgba(0,229,255,.07);box-shadow:0 0 0 1px rgba(0,229,255,.03),0 10px 40px rgba(0,0,0,.5);display:flex;justify-content:space-between;align-items:center;height:64px;padding:0 24px">
      <div style="display:flex;align-items:center;gap:28px">
        <div style="display:flex;align-items:center;gap:9px;cursor:pointer" onclick="router.go('/')">
          <div style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#00C4DD,#006FE8);display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(0,229,255,.35)">
            <span class="material-symbols-outlined" style="font-size:17px;color:white;font-variation-settings:'FILL' 1">architecture</span>
          </div>
          <span style="font-size:20px;font-weight:900;letter-spacing:-.04em;color:white">IWB</span>
        </div>
        <div style="display:flex;gap:2px;align-items:center">
          <a onclick="router.go('/dashboard')" style="color:#00E5FF;font-size:14px;font-weight:600;padding:8px 14px;border-radius:7px;cursor:pointer;background:rgba(0,229,255,.08);border-bottom:2px solid #00E5FF">Dashboard</a>
          <a onclick="openTemplateGallery()" style="color:#4B5563;font-size:14px;font-weight:500;padding:8px 14px;border-radius:7px;cursor:pointer;transition:all .15s" onmouseover="this.style.color='#E8F4FD';this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.color='#4B5563';this.style.background=''">Templates</a>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <!-- Search -->
        <div style="position:relative;display:none" class="lg:block">
          <span class="material-symbols-outlined" style="position:absolute;left:11px;top:50%;transform:translateY(-50%);color:#2D3F52;font-size:17px">search</span>
          <input id="dash-search" type="text" placeholder="Search projects…" value="${dashSearch}" oninput="dashSearchHandler(this.value)"
            class="input-cyber" style="padding-left:36px;padding-right:14px;padding-top:8px;padding-bottom:8px;font-size:14px;width:240px;border-radius:9px"/>
        </div>
        <!-- Plan badge / upgrade -->
        ${userIsPro(user)
          ? `<span style="background:rgba(0,229,255,.1);color:#00E5FF;border:1px solid rgba(0,229,255,.25);padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.07em">${user.plan.toUpperCase()}</span>`
          : `<button onclick="router.go('/pricing')" class="btn-neon" style="border:none;color:white;padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;font-family:Inter,sans-serif"><span class="material-symbols-outlined" style="font-size:15px">star</span> Upgrade</button>`
        }
        <div style="width:1px;height:24px;background:rgba(255,255,255,.06)"></div>
        <!-- Avatar + dropdown -->
        <div style="position:relative" id="avatar-wrap">
          <div onclick="toggleAvatarMenu()" style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#00C4DD,#006FE8);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;font-weight:700;color:white;box-shadow:0 0 14px rgba(0,229,255,.25)">${initials}</div>
          <div id="avatar-menu" style="display:none;position:absolute;right:0;top:44px;background:#071220;border:1px solid rgba(0,229,255,.1);border-radius:14px;box-shadow:0 24px 64px rgba(0,0,0,.7);padding:8px;min-width:210px;z-index:100">
            <div style="padding:10px 14px 12px;border-bottom:1px solid rgba(255,255,255,.05);margin-bottom:4px">
              <div style="font-size:14px;font-weight:700;color:#E8F4FD">${user.username||'User'}</div>
              <div style="font-size:12px;color:#374151;margin-top:2px">${user.plan||'free'} plan</div>
            </div>
            <button onclick="router.go('/pricing')" style="width:100%;text-align:left;padding:9px 14px;font-size:13px;color:#94A3B8;background:none;border:none;cursor:pointer;border-radius:8px;display:flex;align-items:center;gap:9px;font-family:Inter,sans-serif;transition:all .15s" onmouseover="this.style.background='rgba(255,255,255,.04)';this.style.color='#E8F4FD'" onmouseout="this.style.background='';this.style.color='#94A3B8'">
              <span class="material-symbols-outlined" style="font-size:17px">star</span> Upgrade plan
            </button>
            <button onclick="Auth.logout()" style="width:100%;text-align:left;padding:9px 14px;font-size:13px;color:#ff6b6b;background:none;border:none;cursor:pointer;border-radius:8px;display:flex;align-items:center;gap:9px;font-family:Inter,sans-serif;transition:all .15s" onmouseover="this.style.background='rgba(255,107,107,.08)'" onmouseout="this.style.background=''">
              <span class="material-symbols-outlined" style="font-size:17px">logout</span> Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- ── SIDEBAR ───────────────────────────────────── -->
    <aside style="background:#060F1A;border-right:1px solid rgba(0,229,255,.07);position:fixed;left:0;top:0;width:256px;height:100vh;display:flex;flex-direction:column;padding:80px 12px 16px;z-index:40">
      <!-- User info -->
      <div style="padding:0 8px 20px;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,.04)">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#00C4DD,#006FE8);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:white;flex-shrink:0;box-shadow:0 0 12px rgba(0,229,255,.25)">${initials}</div>
          <div style="min-width:0">
            <div style="font-size:13px;font-weight:700;color:#E8F4FD;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px">
              ${user.username||'User'}
              ${userIsPro(user)?`<span style="background:rgba(0,229,255,.1);color:#00E5FF;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px;letter-spacing:.06em">${user.plan.toUpperCase()}</span>`:''}
            </div>
            <div style="font-size:11px;color:#2D3F52;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${user.email||''}</div>
          </div>
        </div>
      </div>

      <!-- Nav items -->
      <nav style="flex:1;display:flex;flex-direction:column;gap:2px">
        <a class="sidebar-item sidebar-active" style="display:flex;align-items:center;gap:10px;padding:9px 12px;font-size:13px;font-weight:600;cursor:pointer;letter-spacing:.01em;border-left:2px solid #00E5FF !important">
          <span class="material-symbols-outlined" style="font-size:18px;color:#00E5FF;font-variation-settings:'FILL' 1">grid_view</span>
          <span>Projects</span>
        </a>
        <a onclick="openTemplateGallery()" class="sidebar-item" style="display:flex;align-items:center;gap:10px;padding:9px 12px;font-size:13px;font-weight:500;color:#4B5563;cursor:pointer;border-left:2px solid transparent">
          <span class="material-symbols-outlined" style="font-size:18px">auto_awesome</span>
          <span>Templates</span>
        </a>
        ${buildTagSidebarSection()}
        <a onclick="router.go('/pricing')" class="sidebar-item" style="display:flex;align-items:center;gap:10px;padding:9px 12px;font-size:13px;font-weight:500;color:#4B5563;cursor:pointer;border-left:2px solid transparent">
          <span class="material-symbols-outlined" style="font-size:18px">star</span>
          <span>Upgrade</span>
        </a>
      </nav>

      <!-- Sign out -->
      <div style="border-top:1px solid rgba(255,255,255,.04);padding-top:12px;margin-top:8px">
        <a onclick="Auth.logout()" class="sidebar-item" style="display:flex;align-items:center;gap:10px;padding:9px 12px;font-size:13px;font-weight:500;color:rgba(255,107,107,.5);cursor:pointer;border-left:2px solid transparent;border-radius:8px" onmouseover="this.style.color='#ff6b6b';this.style.background='rgba(255,107,107,.07)'" onmouseout="this.style.color='rgba(255,107,107,.5)';this.style.background=''">
          <span class="material-symbols-outlined" style="font-size:18px">logout</span>
          <span>Sign out</span>
        </a>
      </div>
    </aside>

    <!-- ── MAIN CONTENT ──────────────────────────────── -->
    <main style="margin-left:256px;padding-top:64px">
      <div style="padding:32px">
        <!-- Header row -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;flex-wrap:wrap;gap:16px">
          <div>
            <h1 style="font-size:26px;font-weight:900;color:#E8F4FD;margin:0 0 4px;letter-spacing:-.03em">Projects</h1>
            <p style="color:#374151;font-size:14px;margin:0">Manage and access your web workspaces.</p>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <select id="dash-status-filter" onchange="dashFilterHandler(this.value)"
              style="background:#060F1A;border:1px solid rgba(255,255,255,.07);color:#94A3B8;font-size:13px;padding:9px 14px;border-radius:9px;outline:none;font-family:Inter,sans-serif;cursor:pointer">
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <button onclick="openNewProjectModal()" class="btn-neon"
              style="border:none;color:white;padding:9px 20px;border-radius:9px;font-size:14px;font-weight:600;display:flex;align-items:center;gap:7px;font-family:Inter,sans-serif;letter-spacing:-.01em">
              <span class="material-symbols-outlined" style="font-size:18px">add</span> New Project
            </button>
          </div>
        </div>

        <!-- Mobile search -->
        <div style="position:relative;margin-bottom:20px;display:block" class="lg:hidden">
          <span class="material-symbols-outlined" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#2D3F52;font-size:17px">search</span>
          <input id="dash-search-mobile" type="text" placeholder="Search projects…" value="${dashSearch}" oninput="dashSearchHandler(this.value)"
            class="input-cyber" style="padding-left:38px;font-size:14px;width:100%;border-radius:9px"/>
        </div>

        <!-- Projects grid -->
        <div id="projects-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px">
          <div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 0;gap:16px">
            <div class="iwb-spinner"></div>
            <p style="color:#374151;font-size:14px;margin:0">Loading projects…</p>
          </div>
        </div>
      </div>
    </main>
  </div>`;

  // Close avatar menu when clicking outside
  document.addEventListener('click', function onOutsideClick(e) {
    const wrap = document.getElementById('avatar-wrap');
    if (wrap && !wrap.contains(e.target)) {
      const menu = document.getElementById('avatar-menu');
      if (menu) menu.style.display = 'none';
    }
  });

  await loadProjects();
  await loadTags();
}

function toggleAvatarMenu() {
  const menu = document.getElementById('avatar-menu');
  if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

async function loadProjects() {
  const params = {};
  if (dashSearch)   params.search  = dashSearch;
  if (dashStatus)   params.status  = dashStatus;
  if (dashTagFilter) params.tag    = dashTagFilter;
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
    <div onclick="openNewProjectModal()" class="card-3d" onmousemove="tilt(this,event)" onmouseleave="untilt(this)"
      style="border:2px dashed rgba(0,229,255,.15);border-radius:16px;aspect-ratio:4/3;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all .3s ease;background:rgba(0,229,255,.02)"
      onmouseover="this.style.borderColor='rgba(0,229,255,.4)';this.style.background='rgba(0,229,255,.05)'"
      onmouseout="this.style.borderColor='rgba(0,229,255,.15)';this.style.background='rgba(0,229,255,.02)'">
      <div style="width:52px;height:52px;border-radius:14px;background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.15);display:flex;align-items:center;justify-content:center;margin-bottom:12px;box-shadow:0 0 20px rgba(0,229,255,.1)">
        <span class="material-symbols-outlined" style="color:#00E5FF;font-size:28px">add</span>
      </div>
      <span style="color:#E8F4FD;font-weight:700;font-size:14px">New Project</span>
      <span style="color:#374151;font-size:12px;margin-top:4px">Start from scratch or a template</span>
    </div>`;

  if (dashProjects.length === 0) {
    html += `
      <div style="grid-column:2/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 0;text-align:center">
        <span class="material-symbols-outlined" style="color:#1F2D3D;font-size:64px;margin-bottom:16px">folder_open</span>
        <h3 style="color:#E8F4FD;font-weight:700;font-size:18px;margin:0 0 8px">No projects yet</h3>
        <p style="color:#374151;font-size:14px;margin:0">Create your first project to get started.</p>
      </div>`;
  } else {
    for (const p of dashProjects) {
      const updated = timeAgo(p.updated_at);
      const statusStyles = {
        draft:     { color:'#94A3B8', bg:'rgba(148,163,184,.1)',  border:'rgba(148,163,184,.2)' },
        published: { color:'#22C55E', bg:'rgba(34,197,94,.1)',    border:'rgba(34,197,94,.2)'  },
        archived:  { color:'#F59E0B', bg:'rgba(245,158,11,.1)',   border:'rgba(245,158,11,.2)' },
      }[p.status] || { color:'#94A3B8', bg:'rgba(148,163,184,.1)', border:'rgba(148,163,184,.2)' };
      const statusLabel = (p.status||'draft').charAt(0).toUpperCase() + (p.status||'draft').slice(1);

      html += `
        <div class="card-3d" onmousemove="tilt(this,event)" onmouseleave="untilt(this)"
          style="background:#060F1A;border:1px solid rgba(255,255,255,.06);border-radius:16px;overflow:hidden;cursor:pointer;transition:border-color .3s,box-shadow .3s"
          onclick="router.go('/editor/${p.id}')"
          onmouseover="this.style.borderColor='rgba(0,229,255,.2)';this.style.boxShadow='0 20px 60px rgba(0,0,0,.5),0 0 30px rgba(0,229,255,.04)'"
          onmouseout="this.style.borderColor='rgba(255,255,255,.06)';this.style.boxShadow=''">
          <!-- Thumbnail -->
          <div style="height:168px;background:#030B14;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center">
            ${renderMiniPreview(p)}
            <!-- Status badge -->
            <span style="position:absolute;top:12px;right:12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;padding:3px 10px;border-radius:100px;background:${statusStyles.bg};color:${statusStyles.color};border:1px solid ${statusStyles.border}">${statusLabel}</span>
            <!-- Hover actions -->
            <div style="position:absolute;inset:0;background:rgba(3,11,20,.75);opacity:0;transition:opacity .2s;display:flex;align-items:flex-end" class="hover-actions" onclick="event.stopPropagation()"
              onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0">
              <div style="width:100%;display:flex;gap:8px;padding:12px;justify-content:flex-end">
                <button onclick="event.stopPropagation();router.go('/editor/${p.id}')" title="Edit"
                  style="width:34px;height:34px;background:linear-gradient(135deg,#00C4DD,#006FE8);border:none;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(0,229,255,.3)">
                  <span class="material-symbols-outlined" style="font-size:16px;color:white">edit</span>
                </button>
                <button onclick="event.stopPropagation();dupProject('${p.id}')" title="Duplicate"
                  style="width:34px;height:34px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center">
                  <span class="material-symbols-outlined" style="font-size:16px;color:#94A3B8">content_copy</span>
                </button>
                <button onclick="event.stopPropagation();delProject('${p.id}','${escHtml(p.title)}')" title="Delete"
                  style="width:34px;height:34px;background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.25);border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center">
                  <span class="material-symbols-outlined" style="font-size:16px;color:#ff6b6b">delete</span>
                </button>
              </div>
            </div>
          </div>
          <!-- Card body -->
          <div style="padding:16px">
            <h3 style="color:#E8F4FD;font-weight:700;font-size:14px;margin:0 0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(p.title)}</h3>
            <p style="color:#374151;font-size:12px;margin:0 0 12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(p.description||'No description')}</p>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="display:flex;align-items:center;gap:5px;color:#2D3F52;font-size:12px">
                <span class="material-symbols-outlined" style="font-size:14px">schedule</span> ${updated}
              </span>
              <span style="display:flex;align-items:center;gap:5px;color:#2D3F52;font-size:12px">
                <span class="material-symbols-outlined" style="font-size:14px">history</span> ${p.version_count||0}v
              </span>
            </div>
            ${p.tags?.length ? `<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:10px">
              ${p.tags.map(t=>`<span style="background:${t.color}18;color:${t.color};font-size:10px;font-weight:600;padding:2px 8px;border-radius:100px;border:1px solid ${t.color}30">${escHtml(t.name)}</span>`).join('')}
            </div>` : ''}
          </div>
        </div>`;
    }
  }

  grid.innerHTML = html;

  // Re-attach hover actions visibility with JS (works even though we set opacity via mouse events)
  grid.querySelectorAll('.hover-actions').forEach(el => {
    const card = el.closest('[onmouseover]');
    if (!card) return;
    card.addEventListener('mouseenter', () => { el.style.opacity = '1'; });
    card.addEventListener('mouseleave', () => { el.style.opacity = '0'; });
  });
}

function renderMiniPreview(p) {
  const comps = p.layout?.components || [];
  const types = comps.map(c => c.type);
  let preview = '';
  if (types.includes('navbar'))   preview += '<div style="height:22px;background:#060F1A;border-bottom:1px solid rgba(0,229,255,.08);width:100%"></div>';
  if (types.includes('hero'))     preview += '<div style="height:56px;background:linear-gradient(135deg,rgba(0,229,255,.05),rgba(79,124,255,.05));width:100%;border-top:1px solid rgba(0,229,255,.06)"></div>';
  if (types.includes('features')) preview += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:8px"><div style="height:28px;background:rgba(0,229,255,.04);border:1px solid rgba(0,229,255,.07);border-radius:4px"></div><div style="height:28px;background:rgba(0,229,255,.04);border:1px solid rgba(0,229,255,.07);border-radius:4px"></div><div style="height:28px;background:rgba(0,229,255,.04);border:1px solid rgba(0,229,255,.07);border-radius:4px"></div></div>';
  if (!preview) preview = `<div style="display:flex;flex-direction:column;gap:7px;padding:18px;width:100%"><div style="height:7px;background:rgba(0,229,255,.07);border-radius:4px;width:55%"></div><div style="height:5px;background:rgba(255,255,255,.04);border-radius:4px;width:85%"></div><div style="height:5px;background:rgba(255,255,255,.04);border-radius:4px;width:70%"></div></div>`;
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
    if (r?.ok === true) { showToast('Project deleted','success'); await loadProjects(); }
    else showToast('Failed to delete','error');
  }, true);
}

// ── New Project Modal ─────────────────────────────────────────
function openNewProjectModal() {
  document.getElementById('new-project-modal')?.remove();
  const m = document.createElement('div');
  m.id = 'new-project-modal';
  m.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(3,11,20,.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:16px';
  m.onclick = e => { if (e.target === m) m.remove(); };
  m.innerHTML = `
    <div style="background:#071220;border:1px solid rgba(0,229,255,.12);border-radius:20px;padding:36px;width:100%;max-width:480px;box-shadow:0 40px 100px rgba(0,0,0,.7),0 0 60px rgba(0,229,255,.04);position:relative;overflow:hidden" onclick="event.stopPropagation()">
      <div style="position:absolute;top:0;left:25%;right:25%;height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.4),transparent)"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px">
        <h2 style="color:#E8F4FD;font-size:20px;font-weight:800;letter-spacing:-.03em;margin:0">New Project</h2>
        <button onclick="document.getElementById('new-project-modal').remove()" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:#94A3B8;cursor:pointer;font-size:18px;line-height:1;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif">&times;</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:18px">
        <div>
          <label style="display:block;color:#374151;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;margin-bottom:7px;font-family:Inter,sans-serif">Project Name</label>
          <input id="new-project-name" type="text" placeholder="My Awesome Page" autofocus class="input-cyber" style="font-size:15px"/>
        </div>
        <div>
          <label style="display:block;color:#374151;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;margin-bottom:7px;font-family:Inter,sans-serif">Description (optional)</label>
          <textarea id="new-project-desc" placeholder="What is this project about?" rows="2" class="input-cyber" style="font-size:15px;resize:none;height:72px"></textarea>
        </div>
        <div id="new-project-error" style="display:none;background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.25);border-radius:8px;padding:10px 14px;color:#ff6b6b;font-size:13px;font-family:Inter,sans-serif"></div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:4px">
          <button onclick="document.getElementById('new-project-modal').remove()"
            style="padding:11px 22px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#94A3B8;border-radius:10px;cursor:pointer;font-family:Inter,sans-serif;font-size:14px;font-weight:500;transition:all .2s"
            onmouseover="this.style.borderColor='rgba(255,255,255,.15)';this.style.color='#E8F4FD'"
            onmouseout="this.style.borderColor='rgba(255,255,255,.08)';this.style.color='#94A3B8'">Cancel</button>
          <button id="create-project-btn" onclick="createProject()" class="btn-neon"
            style="padding:11px 26px;border:none;color:white;border-radius:10px;cursor:pointer;font-family:Inter,sans-serif;font-size:14px;font-weight:700;letter-spacing:-.01em">
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
  const name  = document.getElementById('new-project-name')?.value?.trim();
  const desc  = document.getElementById('new-project-desc')?.value?.trim();
  const errEl = document.getElementById('new-project-error');
  const btn   = document.getElementById('create-project-btn');
  if (!name) { errEl.textContent='Project name is required'; errEl.style.display='block'; return; }
  btn.textContent='Creating…'; btn.disabled=true;
  const data = await projectsAPI.create({ title:name, description:desc||'', layout:{components:[]}, meta:{} });
  if (data?.id) {
    document.getElementById('new-project-modal')?.remove();
    showToast('Project created!','success');
    router.go(`/editor/${data.id}`);
  } else {
    errEl.textContent = parseError(data) || 'Failed to create project';
    errEl.style.display = 'block';
    btn.textContent='Create Project'; btn.disabled=false;
  }
}

function openTemplateGallery() { window.renderTemplateGallery?.(); }

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff<60)    return 'just now';
  if (diff<3600)  return Math.floor(diff/60)+'m ago';
  if (diff<86400) return Math.floor(diff/3600)+'h ago';
  return Math.floor(diff/86400)+'d ago';
}

function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ── Tag sidebar section ───────────────────────────────────────
function buildTagSidebarSection() {
  return `<div id="sidebar-tags" style="margin-top:8px;padding:0 0 4px">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px 4px;margin-bottom:4px">
      <span style="color:#2D3F52;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em">Tags</span>
      <button onclick="openNewTagModal()" style="background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.15);color:#00E5FF;cursor:pointer;font-size:16px;line-height:1;padding:2px 7px;border-radius:6px;font-family:Inter,sans-serif;transition:all .15s" title="New tag"
        onmouseover="this.style.background='rgba(0,229,255,.15)'" onmouseout="this.style.background='rgba(0,229,255,.08)'">+</button>
    </div>
    ${dashTags.length === 0
      ? `<p style="color:#2D3F52;font-size:12px;padding:4px 14px">No tags yet</p>`
      : dashTags.map(tag=>`
        <div onclick="setTagFilter('${tag.id}')" class="sidebar-item"
          style="display:flex;align-items:center;justify-content:space-between;padding:7px 12px;cursor:pointer;border-left:2px solid ${dashTagFilter===tag.id?tag.color:'transparent'};background:${dashTagFilter===tag.id?`${tag.color}10`:'transparent'}">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="width:8px;height:8px;border-radius:50%;background:${tag.color};box-shadow:0 0 8px ${tag.color}60;flex-shrink:0"></span>
            <span style="color:${dashTagFilter===tag.id?'#E8F4FD':'#4B5563'};font-size:13px;font-weight:500">${escHtml(tag.name)}</span>
          </div>
          <button onclick="event.stopPropagation();deleteTag('${tag.id}')"
            style="background:none;border:none;color:#374151;cursor:pointer;font-size:16px;line-height:1;padding:0;opacity:0;transition:opacity .15s;font-family:Inter,sans-serif"
            onmouseover="this.style.opacity=1;this.style.color='#ff6b6b'" onmouseout="this.style.opacity=0;this.style.color='#374151'">×</button>
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
  if (r?.ok === true) {
    if (dashTagFilter === id) { dashTagFilter = null; loadProjects(); }
    await loadTags();
    showToast('Tag deleted','success');
  } else {
    showToast('Failed to delete tag','error');
  }
}

function openNewTagModal() {
  document.getElementById('new-tag-modal')?.remove();
  const COLORS = ['#00E5FF','#4F7CFF','#22C55E','#F59E0B','#EF4444','#8B5CF6','#EC4899'];
  window._tagPickedColor = COLORS[0];
  const m = document.createElement('div');
  m.id = 'new-tag-modal';
  m.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(3,11,20,.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:16px';
  m.onclick = e => { if (e.target === m) m.remove(); };
  m.innerHTML = `
    <div style="background:#071220;border:1px solid rgba(0,229,255,.12);border-radius:18px;padding:32px;width:100%;max-width:380px;box-shadow:0 40px 100px rgba(0,0,0,.7);position:relative;overflow:hidden" onclick="event.stopPropagation()">
      <div style="position:absolute;top:0;left:25%;right:25%;height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.4),transparent)"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px">
        <h2 style="color:#E8F4FD;font-size:18px;font-weight:800;letter-spacing:-.03em;margin:0">New Tag</h2>
        <button onclick="document.getElementById('new-tag-modal').remove()" style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:#94A3B8;cursor:pointer;font-size:18px;line-height:1;width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif">&times;</button>
      </div>
      <label style="display:block;color:#374151;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;margin-bottom:7px;font-family:Inter,sans-serif">Tag Name</label>
      <input id="new-tag-name" type="text" placeholder="e.g. Client Work" autofocus class="input-cyber" style="font-size:14px;margin-bottom:18px"/>
      <label style="display:block;color:#374151;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;margin-bottom:10px;font-family:Inter,sans-serif">Color</label>
      <div id="tag-color-swatches" style="display:flex;gap:8px;margin-bottom:22px">
        ${COLORS.map((c,i)=>`<div onclick="window._pickTagColor('${c}')" id="swatch-${c.slice(1)}"
          style="width:26px;height:26px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${i===0?'white':'transparent'};transition:all .15s;box-shadow:${i===0?`0 0 10px ${c}60`:'none'}"></div>`).join('')}
      </div>
      <div id="new-tag-error" style="display:none;background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.25);border-radius:8px;padding:9px 12px;color:#ff6b6b;font-size:12px;margin-bottom:14px;font-family:Inter,sans-serif"></div>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button onclick="document.getElementById('new-tag-modal').remove()"
          style="padding:10px 20px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#94A3B8;border-radius:9px;cursor:pointer;font-family:Inter,sans-serif;font-size:13px;font-weight:500"
          onmouseover="this.style.color='#E8F4FD'" onmouseout="this.style.color='#94A3B8'">Cancel</button>
        <button id="create-tag-btn" onclick="submitNewTag()" class="btn-neon"
          style="padding:10px 22px;border:none;color:white;border-radius:9px;cursor:pointer;font-family:Inter,sans-serif;font-size:13px;font-weight:700">Create Tag</button>
      </div>
    </div>`;
  document.body.appendChild(m);
  window._pickTagColor = (c) => {
    window._tagPickedColor = c;
    document.querySelectorAll('[id^="swatch-"]').forEach(el => {
      const isSelected = el.id === 'swatch-' + c.slice(1);
      el.style.borderColor = isSelected ? 'white' : 'transparent';
      el.style.boxShadow   = isSelected ? `0 0 10px ${c}60` : 'none';
    });
  };
  document.getElementById('new-tag-name').addEventListener('keydown', e=>{ if(e.key==='Enter') submitNewTag(); });
}

async function submitNewTag() {
  const name  = document.getElementById('new-tag-name')?.value?.trim();
  const errEl = document.getElementById('new-tag-error');
  const btn   = document.getElementById('create-tag-btn');
  if (!name) { errEl.textContent='Tag name is required'; errEl.style.display='block'; return; }
  btn.textContent='Creating…'; btn.disabled=true;
  const data = await tagsAPI.create(name, window._tagPickedColor||'#00E5FF');
  if (data?.id) {
    document.getElementById('new-tag-modal')?.remove();
    showToast('Tag created!','success');
    await loadTags();
  } else {
    errEl.textContent = parseError(data)||'Failed to create tag';
    errEl.style.display='block';
    btn.textContent='Create Tag'; btn.disabled=false;
  }
}
