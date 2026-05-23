// ── Editor Page ───────────────────────────────────────────────
let editorProject = null;
let editorLayout = { components: [] };
let selectedId = null;
let isDirty = false;
let undoStack = [];
let autoSaveTimer = null;

const COMPONENT_TYPES = [
  {cat:'Layout', items:[
    {type:'navbar',icon:'navigation',label:'Navbar'},
    {type:'section',icon:'rectangle',label:'Section'},
    {type:'container',icon:'view_column',label:'Container'},
    {type:'columns',icon:'view_week',label:'Columns'},
    {type:'footer',icon:'vertical_align_bottom',label:'Footer'},
    {type:'divider',icon:'horizontal_rule',label:'Divider'},
    {type:'spacer',icon:'height',label:'Spacer'},
    {type:'banner',icon:'campaign',label:'Banner'},
  ]},
  {cat:'Content', items:[
    {type:'text',icon:'text_fields',label:'Text'},
    {type:'heading',icon:'title',label:'Heading'},
    {type:'richtext',icon:'article',label:'Rich Text'},
    {type:'blockquote',icon:'format_quote',label:'Quote'},
    {type:'code_block',icon:'code',label:'Code'},
    {type:'icon',icon:'star',label:'Icon'},
    {type:'badge',icon:'label',label:'Badge'},
  ]},
  {cat:'Media', items:[
    {type:'image',icon:'image',label:'Image'},
    {type:'video',icon:'play_circle',label:'Video'},
    {type:'embed',icon:'link',label:'Embed'},
    {type:'gallery',icon:'photo_library',label:'Gallery'},
    {type:'logo_strip',icon:'business',label:'Logos'},
  ]},
  {cat:'Interactive', items:[
    {type:'button',icon:'smart_button',label:'Button'},
    {type:'link',icon:'link',label:'Link'},
    {type:'social_links',icon:'share',label:'Social'},
    {type:'form',icon:'edit_note',label:'Form'},
    {type:'countdown',icon:'timer',label:'Countdown'},
  ]},
  {cat:'Sections', items:[
    {type:'hero',icon:'rocket_launch',label:'Hero'},
    {type:'features',icon:'star',label:'Features'},
    {type:'pricing',icon:'payments',label:'Pricing'},
    {type:'testimonials',icon:'format_quote',label:'Testimonials'},
    {type:'faq',icon:'help',label:'FAQ'},
    {type:'cta',icon:'campaign',label:'CTA'},
    {type:'team',icon:'group',label:'Team'},
    {type:'stats',icon:'bar_chart',label:'Stats'},
    {type:'card',icon:'credit_card',label:'Card'},
    {type:'cards_grid',icon:'grid_view',label:'Cards Grid'},
    {type:'timeline',icon:'timeline',label:'Timeline'},
    {type:'tabs',icon:'tab',label:'Tabs'},
    {type:'contact',icon:'place',label:'Contact'},
  ]},
];

async function renderEditor(params) {
  const projectId = params.id;
  if (!projectId) { router.go('/dashboard'); return; }

  // Reset state from any previous editor session
  clearInterval(autoSaveTimer);
  autoSaveTimer = null;
  document.removeEventListener('keydown', handleEditorKey);
  editorProject = null;
  editorLayout = { components: [] };
  selectedId = null;
  isDirty = false;
  undoStack = [];

  document.getElementById('app').innerHTML = `
  <div class="bg-background text-on-background font-body-md h-screen w-screen overflow-hidden flex flex-col selection:bg-primary-container selection:text-on-primary-container">
    <!-- Top Nav -->
    <nav class="bg-[#111A2E]/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-slate-800 shadow-[0px_10px_20px_rgba(0,0,0,0.5)] flex justify-between items-center h-16 px-6">
      <div class="flex items-center gap-6">
        <button onclick="backToDashboard()" class="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm">
          <span class="material-symbols-outlined text-[18px]">arrow_back</span> Dashboard
        </button>
        <span class="w-px h-5 bg-slate-700"></span>
        <div id="project-title-display" class="flex items-center gap-2 cursor-pointer group" onclick="editTitle()">
          <span id="project-title-text" class="text-white font-semibold text-sm">Loading…</span>
          <span class="material-symbols-outlined text-[14px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
        </div>
      </div>
      <div class="hidden lg:flex items-center bg-surface-container-high rounded-DEFAULT p-1 border border-outline-variant/30">
        <button onclick="setDevice('desktop')" id="dev-desktop" class="w-8 h-8 flex items-center justify-center rounded-DEFAULT bg-surface-variant text-primary shadow-sm">
          <span class="material-symbols-outlined text-[18px]">desktop_windows</span>
        </button>
        <button onclick="setDevice('tablet')" id="dev-tablet" class="w-8 h-8 flex items-center justify-center rounded-DEFAULT text-on-surface-variant hover:text-on-surface transition-colors">
          <span class="material-symbols-outlined text-[18px]">tablet_mac</span>
        </button>
        <button onclick="setDevice('mobile')" id="dev-mobile" class="w-8 h-8 flex items-center justify-center rounded-DEFAULT text-on-surface-variant hover:text-on-surface transition-colors">
          <span class="material-symbols-outlined text-[18px]">smartphone</span>
        </button>
        <div class="w-px h-4 bg-outline-variant/50 mx-1"></div>
        <span id="zoom-label" class="font-code-sm text-code-sm text-on-surface-variant px-2">100%</span>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="editorUndo()" title="Undo" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-DEFAULT transition-all">
          <span class="material-symbols-outlined text-[18px]">undo</span>
        </button>
        <div class="w-px h-5 bg-slate-700 mx-1"></div>
        <button onclick="openExportModal()" class="px-3 py-1.5 rounded-DEFAULT border border-[#1F2937] text-slate-300 text-sm font-medium hover:bg-white/5 transition-all flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">download</span> Export
        </button>
        <button onclick="openSettingsModal()" class="px-3 py-1.5 rounded-DEFAULT border border-[#1F2937] text-slate-300 text-sm font-medium hover:bg-white/5 transition-all flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">settings</span>
        </button>
        <button id="save-btn" onclick="saveLayout()" class="px-4 py-1.5 rounded-DEFAULT bg-[#4F7CFF] text-white text-sm font-medium hover:brightness-110 shadow-[0_0_12px_rgba(79,124,255,0.3)] transition-all active:scale-95 flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">save</span> Save
        </button>
        <div id="save-status" class="flex items-center gap-1 ml-1">
          <span class="w-2 h-2 rounded-full bg-slate-500" id="save-dot"></span>
          <span class="text-xs text-slate-500" id="save-text">Saved</span>
        </div>
      </div>
    </nav>
    <!-- Workspace -->
    <div class="flex flex-1 pt-16 h-full">
      <!-- Left Panel -->
      <aside class="bg-[#111A2E] font-['JetBrains_Mono'] text-xs uppercase tracking-widest h-[calc(100vh-4rem)] w-64 border-r fixed left-0 border-slate-800 flex flex-col py-4 z-40">
        <div class="px-4 mb-4 flex items-center gap-3">
          <div class="w-8 h-8 rounded-DEFAULT bg-primary/20 flex items-center justify-center border border-primary/30">
            <span class="material-symbols-outlined text-primary text-[18px]">web</span>
          </div>
          <div>
            <div class="text-slate-200 font-bold tracking-normal capitalize text-sm" id="sidebar-project-name">Project</div>
            <div class="text-slate-500 text-[10px]">drag to canvas</div>
          </div>
        </div>
        <!-- Tabs -->
        <div class="flex gap-1 px-2 mb-3">
          <button id="tab-comp" onclick="switchLibTab('comp')" class="flex-1 py-1 text-[10px] rounded bg-primary/10 text-primary border border-primary/20 font-semibold">Components</button>
          <button id="tab-layers" onclick="switchLibTab('layers')" class="flex-1 py-1 text-[10px] rounded text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700 transition-all">Layers</button>
        </div>
        <div id="lib-components" class="flex-1 overflow-y-auto px-2 flex flex-col gap-1">
          ${renderComponentLibrary()}
        </div>
        <div id="lib-layers" class="hidden flex-1 overflow-y-auto px-2 flex flex-col gap-0.5">
        </div>
      </aside>
      <!-- Canvas -->
      <main class="ml-64 mr-[300px] flex-1 flex flex-col relative bg-background overflow-hidden">
        <div class="h-10 border-b border-surface-variant flex items-center px-4 justify-between bg-surface-container-lowest/50 backdrop-blur-sm absolute top-0 w-full z-10">
          <div class="flex items-center gap-2 text-on-surface-variant font-code-sm text-code-sm">
            <span class="material-symbols-outlined text-[16px]">mouse</span>
            <span id="canvas-hint">Select or drag a component</span>
          </div>
          <div class="flex items-center gap-4 text-on-surface-variant font-code-sm text-code-sm">
            <span id="grid-toggle-btn" onclick="toggleCanvasGrid()" class="flex items-center gap-1 cursor-pointer hover:text-on-surface select-none">
              <span class="material-symbols-outlined text-[16px]">grid_on</span> Grid
            </span>
          </div>
        </div>
        <div class="flex-1 mt-10 overflow-auto flex justify-center items-start" id="canvas-scroll" style="background:#070E1C;background-image:radial-gradient(circle,rgba(255,255,255,0.025) 1px,transparent 1px);background-size:24px 24px">
          <div id="canvas-wrapper" style="padding:32px;min-height:100%">
            <div id="canvas-frame" class="bg-white rounded-DEFAULT shadow-[0_20px_40px_rgba(0,0,0,0.5),0_2px_4px_rgba(0,0,0,0.3)] relative origin-top transition-all duration-300" style="width:1200px;min-height:800px">
              <div id="canvas-empty" class="absolute inset-0 flex flex-col items-center justify-center" style="display:none">
                <div style="border:2px dashed rgba(79,124,255,0.3);border-radius:12px;padding:40px;text-align:center">
                  <span class="material-symbols-outlined" style="font-size:48px;color:rgba(79,124,255,0.4)">add_box</span>
                  <p style="color:#4B5563;font-size:14px;margin-top:12px;font-family:Inter">Drag a component here to start</p>
                </div>
              </div>
              <div id="canvas-components" style="display:flex;flex-wrap:wrap;align-items:flex-start;position:relative;min-height:800px"></div>
            </div>
          </div>
        </div>
      </main>
      <!-- Right Panel -->
      <aside class="w-[300px] bg-surface-container border-l border-outline-variant flex flex-col h-full fixed right-0 z-20" style="top:64px;bottom:0">
        <div class="flex border-b border-outline-variant px-2 pt-2 gap-1 bg-surface-container-highest">
          <button class="px-4 py-2 font-body-sm text-body-sm text-on-surface border-b-2 border-primary bg-surface-container/50 rounded-t-DEFAULT">Design</button>
          <button onclick="openExportModal()" class="px-4 py-2 font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 rounded-t-DEFAULT transition-colors">Export</button>
        </div>
        <div id="properties-panel" class="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
          <div class="text-center text-on-surface-variant text-sm mt-8 flex flex-col items-center gap-3">
            <span class="material-symbols-outlined text-[40px] opacity-30">touch_app</span>
            <span>Select a component<br/>to edit its properties</span>
          </div>
        </div>
      </aside>
    </div>
  </div>`;

  // Load project
  const project = await projectsAPI.get(projectId);
  if (!project) { showToast('Project not found','error'); router.go('/dashboard'); return; }
  editorProject = project;
  editorLayout = project.layout || { components: [] };
  document.getElementById('project-title-text').textContent = project.title;
  document.getElementById('sidebar-project-name').textContent = project.title;
  renderCanvas();

  // Auto-save every 30s
  autoSaveTimer = setInterval(()=>{ if(isDirty) saveLayout(true); }, 30000);

  // Keyboard shortcuts
  document.addEventListener('keydown', handleEditorKey);
}

function renderComponentLibrary() {
  return COMPONENT_TYPES.map(cat=>`
    <div class="mb-2">
      <div class="text-slate-500 text-[9px] px-2 py-1 uppercase tracking-widest">${cat.cat}</div>
      ${cat.items.map(item=>`
        <div draggable="true" data-comp-type="${item.type}"
          ondragstart="dragCompStart(event,'${item.type}')"
          onclick="addComponent('${item.type}')"
          class="flex items-center gap-2 px-2 py-2 rounded-DEFAULT cursor-pointer hover:bg-slate-800/50 hover:text-slate-200 text-slate-400 group transition-colors">
          <div class="w-7 h-7 rounded bg-[#4F7CFF]/10 flex items-center justify-center group-hover:bg-[#4F7CFF]/20 transition-colors flex-shrink-0">
            <span class="material-symbols-outlined text-[14px] text-[#4F7CFF]">${item.icon}</span>
          </div>
          <span class="text-[11px] capitalize tracking-normal flex-1">${item.label}</span>
          <span class="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-50 transition-opacity">drag_indicator</span>
        </div>`).join('')}
    </div>`).join('');
}

function renderCanvas() {
  const container = document.getElementById('canvas-components');
  const empty = document.getElementById('canvas-empty');
  if (!container) return;
  const comps = editorLayout.components || [];
  if (comps.length === 0) {
    empty.style.display='flex'; container.innerHTML=''; return;
  }
  empty.style.display='none';
  container.innerHTML = comps.map((c,i)=>renderComponentPreview(c,i)).join('');
  updateLayers();
}

// Types that default to full-width in the canvas
const _WIDE_TYPES = new Set(['section','container','columns','footer','navbar','banner','hero','features','pricing','testimonials','faq','cta','team','stats','cards_grid','contact','timeline','tabs','richtext','form','divider','embed','video','gallery','logo_strip','social_links','countdown','spacer','image','text','heading','blockquote','code_block']);

function renderComponentPreview(c, idx) {
  const isSelected = c.id === selectedId;
  const selStyle = isSelected ? 'outline:2px solid #4F7CFF;outline-offset:2px;' : '';
  const isAbs = !!c.positionAbsolute;

  // Smart default width: layout/content blocks fill the row; interactive items are natural size
  const defaultW = _WIDE_TYPES.has(c.type) ? '100%' : 'auto';
  const compW = (c.compWidth !== undefined && c.compWidth !== '') ? c.compWidth : defaultW;
  const compH = c.compHeight ? `height:${c.compHeight};` : '';

  const posStyle = isAbs
    ? `position:absolute;left:${c.left||0}px;top:${c.top||0}px;z-index:${c.zIndex||1};width:${compW};`
    : `position:relative;width:${compW};`;

  // Label bar — doubles as drag handle for absolutely-positioned components
  const label = isSelected ? `<div
    onmousedown="${isAbs ? `startCompDrag(event,'${c.id}')` : ''}"
    onclick="${isAbs ? 'event.stopPropagation()' : ''}"
    style="position:absolute;top:-22px;left:-2px;background:#4F7CFF;color:white;font-size:10px;padding:2px 8px;border-radius:2px 2px 0 0;font-family:JetBrains Mono;display:flex;align-items:center;gap:4px;z-index:10;cursor:${isAbs?'move':'default'};user-select:none">
    ${isAbs ? '<span class="material-symbols-outlined" style="font-size:11px">drag_pan</span>' : ''}
    <span class="material-symbols-outlined" style="font-size:12px">${getCompIcon(c.type)}</span>${c.type}
  </div>` : '';

  const actions = isSelected ? `<div style="position:absolute;top:-46px;left:50%;transform:translateX(-50%);background:rgba(17,26,46,0.95);border:1px solid rgba(255,255,255,0.07);border-radius:8px;display:flex;gap:4px;padding:4px;z-index:20">
    <button onclick="event.stopPropagation();moveComp('${c.id}',-1)" style="width:28px;height:28px;background:none;border:none;color:#94A3B8;cursor:pointer;border-radius:6px;display:flex;align-items:center;justify-content:center" title="Move up">
      <span class="material-symbols-outlined" style="font-size:16px">arrow_upward</span>
    </button>
    <button onclick="event.stopPropagation();moveComp('${c.id}',1)" style="width:28px;height:28px;background:none;border:none;color:#94A3B8;cursor:pointer;border-radius:6px;display:flex;align-items:center;justify-content:center" title="Move down">
      <span class="material-symbols-outlined" style="font-size:16px">arrow_downward</span>
    </button>
    <button onclick="event.stopPropagation();duplicateComp('${c.id}')" style="width:28px;height:28px;background:none;border:none;color:#94A3B8;cursor:pointer;border-radius:6px;display:flex;align-items:center;justify-content:center" title="Duplicate">
      <span class="material-symbols-outlined" style="font-size:16px">content_copy</span>
    </button>
    <div style="width:1px;height:20px;background:#1F2A44;margin:4px 2px"></div>
    <button onclick="event.stopPropagation();removeComp('${c.id}')" style="width:28px;height:28px;background:none;border:none;color:#EF4444;cursor:pointer;border-radius:6px;display:flex;align-items:center;justify-content:center" title="Delete">
      <span class="material-symbols-outlined" style="font-size:16px">delete</span>
    </button>
  </div>` : '';

  // Right-edge handle → drag to resize width
  const rHandle = isSelected ? `<div onmousedown="startCompResize(event,'${c.id}','w')" onclick="event.stopPropagation()" style="position:absolute;right:-5px;top:15%;bottom:15%;width:10px;cursor:ew-resize;z-index:25;display:flex;align-items:center;justify-content:center">
    <div style="width:4px;height:32px;background:#4F7CFF;border-radius:2px;opacity:.85;box-shadow:0 0 6px rgba(79,124,255,.5)"></div>
  </div>` : '';

  // Bottom-edge handle → drag to resize height
  const bHandle = isSelected ? `<div onmousedown="startCompResize(event,'${c.id}','h')" onclick="event.stopPropagation()" style="position:absolute;bottom:-5px;left:15%;right:15%;height:10px;cursor:ns-resize;z-index:25;display:flex;justify-content:center;align-items:center">
    <div style="height:4px;width:32px;background:#4F7CFF;border-radius:2px;opacity:.85;box-shadow:0 0 6px rgba(79,124,255,.5)"></div>
  </div>` : '';

  return `<div id="comp-${c.id}" onclick="selectComp('${c.id}')" style="${posStyle}${compH}cursor:pointer;${selStyle}min-height:40px;box-sizing:border-box;flex-shrink:0;overflow:visible">
    ${label}${actions}${rHandle}${bHandle}
    ${getCompHTML(c)}
  </div>`;
}

function getCompIcon(type) {
  const m = {navbar:'navigation',hero:'rocket_launch',section:'rectangle',container:'view_column',footer:'vertical_align_bottom',text:'text_fields',heading:'title',image:'image',button:'smart_button',features:'star',pricing:'payments',testimonials:'format_quote',faq:'help',cta:'campaign',team:'group',stats:'bar_chart',gallery:'photo_library',form:'edit_note',divider:'horizontal_rule',spacer:'height',banner:'campaign'};
  return m[type]||'widgets';
}

function getCompHTML(c) {
  const bg = c.backgroundColor||'';
  const tc = c.textColor||'#111';
  const pad = c.padding||'';
  switch(c.type) {
    case 'navbar': return `<nav style="display:flex;align-items:center;justify-content:space-between;padding:16px 32px;background:${c.backgroundColor||'#fff'};${c.sticky?'position:sticky;top:0;z-index:100':''}">
      <a href="${c.homeHref||'#'}" style="font-weight:700;font-size:1.2rem;color:${c.textColor||'#111'};text-decoration:none">${c.logo||'Brand'}</a>
      <div style="display:flex;align-items:center;gap:24px">${(c.links||[]).map(l=>`<a href="${l.href||'#'}" style="color:${c.textColor||'#111'};font-size:15px;text-decoration:none">${l.label||'Link'}</a>`).join('')}</div>
      ${(c.ctaButtons||[]).length?`<div style="display:flex;gap:10px">${(c.ctaButtons||[]).map(b=>`<a href="${b.href||'#'}" style="padding:8px 18px;background:${(b.variant||'solid')==='outline'?'transparent':'#4F7CFF'};color:${(b.variant||'solid')==='outline'?'#4F7CFF':'#fff'};border:${(b.variant||'solid')==='outline'?'2px solid #4F7CFF':'none'};border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">${b.label||'CTA'}</a>`).join('')}</div>`:''}
    </nav>`;
    case 'hero': return `<section style="min-height:${c.minHeight||'400px'};padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#0f172a'};display:flex;align-items:center;justify-content:center;text-align:${c.layout==='centered'?'center':'left'}">
      <div style="max-width:700px">
        ${c.eyebrow?`<span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:${c.eyebrowColor||'#4F7CFF'};background:rgba(79,124,255,.1);border-radius:999px;padding:4px 14px;display:inline-block;margin-bottom:16px">${c.eyebrow}</span>`:''}
        <h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:800;line-height:1.1;color:${c.textColor||'#fff'};margin-bottom:16px">${c.title||'Your Headline Here'}</h1>
        ${c.subtitle?`<p style="font-size:1.1rem;color:${c.subtitleColor||c.textColor||'#94A3B8'};opacity:.85;line-height:1.7;margin-bottom:32px">${c.subtitle}</p>`:''}
        ${(c.buttons||[]).map(b=>`<a href="${b.href||'#'}" style="display:inline-block;padding:${{sm:'8px 16px',md:'12px 24px',lg:'16px 32px'}[b.size||'md']||'12px 24px'};background:${b.backgroundColor||'#4F7CFF'};color:${b.textColor||'#fff'};border-radius:8px;font-weight:600;text-decoration:none;margin-right:10px;${b.variant==='outline'?'background:transparent;border:2px solid '+(b.backgroundColor||'#4F7CFF')+';color:'+(b.backgroundColor||'#4F7CFF'):''}">${b.label||'CTA'}</a>`).join('')}
      </div>
    </section>`;
    case 'section': return `<section style="padding:${c.padding||'64px 40px'};background:${c.backgroundColor||'#fff'};${c.backgroundImage?'background-image:url('+c.backgroundImage+');background-size:cover;background-position:center':''}${c.width?';width:'+c.width:''}${c.maxWidth?';max-width:'+c.maxWidth+';margin-left:auto;margin-right:auto':''}${c.minHeight?';min-height:'+c.minHeight:''}${c.height?';height:'+c.height:''}">
      ${(c.children||[]).map(getCompHTML).join('')}
    </section>`;
    case 'container': return `<div style="display:flex;flex-direction:${c.direction||'row'};gap:${c.gap||'16px'};padding:${c.padding||'0'};flex-wrap:wrap${c.width?';width:'+c.width:''}${c.maxWidth?';max-width:'+c.maxWidth+';margin-left:auto;margin-right:auto':''}${c.minHeight?';min-height:'+c.minHeight:''}${c.height?';height:'+c.height:''}">
      ${(c.children||[]).map(getCompHTML).join('')}
    </div>`;
    case 'text': return `<${c.tag||'p'} style="font-size:${c.fontSize||'16px'};font-weight:${c.fontWeight||'400'};color:${c.color||'#374151'};text-align:${c.align||'left'};padding:${c.padding||'8px 0'};margin:${c.margin||'0'}">${c.content||'Your text here'}</${c.tag||'p'}>`;
    case 'heading': return `<div style="padding:${c.padding||'16px 0'};text-align:${c.align||'left'}">
      ${c.eyebrow?`<span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:${c.eyebrowColor||'#4F7CFF'};background:rgba(79,124,255,.1);border-radius:999px;padding:4px 12px;display:inline-block;margin-bottom:12px">${c.eyebrow}</span>`:''}
      <${c.tag||'h2'} style="font-size:clamp(1.75rem,3.5vw,2.75rem);font-weight:800;line-height:1.15;color:${c.titleColor||'#111827'};margin-bottom:12px">${c.title||'Section Title'}</${c.tag||'h2'}>
      ${c.subtitle?`<p style="font-size:1.1rem;color:${c.subtitleColor||'#6B7280'};line-height:1.7;max-width:600px;${c.align==='center'?'margin:0 auto':''}">${c.subtitle}</p>`:''}
    </div>`;
    case 'image': return `<div style="padding:${c.margin||'0'}">
      ${c.src?`<img src="${c.src}" alt="${c.alt||''}" style="width:${c.width||'100%'};border-radius:${c.borderRadius||'0'};display:block" loading="lazy">`:`<div style="background:#e5e7eb;border-radius:${c.borderRadius||'0'};width:${c.width||'100%'};height:200px;display:flex;align-items:center;justify-content:center;color:#9CA3AF"><span class="material-symbols-outlined" style="font-size:48px">image</span></div>`}
      ${c.caption?`<p style="text-align:center;font-size:13px;color:#9CA3AF;margin-top:8px">${c.caption}</p>`:''}
    </div>`;
    case 'button': return `<div style="padding:8px 0"><a href="${c.href||'#'}" style="display:inline-block;padding:${{sm:'8px 16px',md:'12px 24px',lg:'16px 32px',xl:'18px 40px'}[c.size||'md']||'12px 24px'};background:${c.variant==='outline'?'transparent':c.backgroundColor||'#4F7CFF'};color:${c.variant==='outline'?c.backgroundColor||'#4F7CFF':c.textColor||'#fff'};border-radius:${c.borderRadius||'8px'};border:${c.variant==='outline'?'2px solid '+(c.backgroundColor||'#4F7CFF'):'none'};font-weight:600;text-decoration:none${c.fullWidth?';width:100%;text-align:center':''}">${c.label||'Button'}</a></div>`;
    case 'divider': return `<hr style="border:none;border-top:${c.thickness||1}px ${c.style||'solid'} ${c.color||'#e5e7eb'};margin:${c.margin||'16px 0'}">`;
    case 'spacer': return `<div style="height:${c.height||32}px"></div>`;
    case 'features': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#f8fafc'}">
      ${c.title?`<div style="text-align:${c.align||'left'};margin-bottom:48px"><h2 style="font-size:2.5rem;font-weight:800;color:#111827;margin-bottom:12px">${c.title}</h2>${c.subtitle?`<p style="color:#6B7280;font-size:1.1rem">${c.subtitle}</p>`:''}</div>`:''}
      <div style="display:grid;grid-template-columns:repeat(${c.columns||3},1fr);gap:${c.gap||'24px'}">
        ${(c.items||[]).map(item=>`<div style="padding:28px;background:${c.cardBackground||'#fff'};border-radius:12px;${c.cardBorder?'border:1px solid '+c.cardBorder:''}">
          ${item.icon?`<div style="width:52px;height:52px;background:rgba(79,124,255,.1);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:18px;font-size:28px">${item.icon}</div>`:''}
          <h3 style="font-size:18px;font-weight:700;margin-bottom:10px;color:#111827">${item.title||''}</h3>
          <p style="font-size:15px;color:#6B7280;line-height:1.7">${item.description||''}</p>
        </div>`).join('')}
      </div>
    </section>`;
    case 'footer': return `<footer style="padding:48px 40px;background:${c.backgroundColor||'#0f172a'}">
      <div style="max-width:1200px;margin:0 auto">
        <div style="font-size:1.2rem;font-weight:700;color:${c.logoColor||c.textColor||'#e5e7eb'};margin-bottom:12px">${c.logo||'Brand'}</div>
        ${c.description?`<p style="font-size:14px;color:${c.textColor||'#94A3B8'};opacity:.65;max-width:280px;line-height:1.7">${c.description}</p>`:''}
        <div style="display:flex;gap:40px;margin-top:32px;flex-wrap:wrap">
          ${(c.columns||[]).map(col=>`<div><div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${c.textColor||'#e5e7eb'};opacity:.5;margin-bottom:14px">${col.title||''}</div>
          <div style="display:flex;flex-direction:column;gap:10px">${(col.links||[]).map(l=>`<a href="${l.href||'#'}" style="color:${c.textColor||'#e5e7eb'};opacity:.7;font-size:15px;text-decoration:none">${l.label||''}</a>`).join('')}</div></div>`).join('')}
        </div>
        <div style="border-top:1px solid rgba(255,255,255,.08);margin-top:40px;padding-top:24px;font-size:13px;color:${c.textColor||'#e5e7eb'};opacity:.5">${c.copyright||'© 2025'}</div>
      </div>
    </footer>`;
    case 'pricing': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#fff'}">
      ${c.title?`<div style="text-align:${c.align||'center'};margin-bottom:48px"><h2 style="font-size:2.5rem;font-weight:800;color:#111827">${c.title}</h2>${c.subtitle?`<p style="color:#6B7280;font-size:1.1rem;margin-top:12px">${c.subtitle}</p>`:''}</div>`:''}
      <div style="display:grid;grid-template-columns:repeat(${Math.min((c.plans||[]).length,3)},1fr);gap:24px;max-width:900px;margin:0 auto">
        ${(c.plans||[]).map(p=>`<div style="padding:32px;border-radius:16px;background:#fff;border:${(p.popular||p.highlighted)?'2px solid '+(p.accentColor||'#4F7CFF'):'1px solid #e5e7eb'};position:relative">
          ${(p.popular||p.highlighted)?`<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:${p.accentColor||'#4F7CFF'};color:white;padding:3px 14px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap">${p.popularLabel||'Popular'}</div>`:''}
          <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${p.accentColor||'#4F7CFF'};opacity:.7">${p.name||'Plan'}</div>
          <div style="font-size:3rem;font-weight:800;color:#111827;margin:12px 0 4px">${p.currency||'$'}${p.price||'0'}</div>
          <div style="font-size:14px;color:#9CA3AF;margin-bottom:24px">${p.period||'/month'}</div>
          <ul style="list-style:none;padding:0;margin:0 0 24px">
            ${(p.features||[]).filter(f=>typeof f==='string'||f.included!==false).map(f=>`<li style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:15px;color:#374151"><span style="color:#22C55E;font-weight:700">✓</span>${typeof f==='string'?f:(f.text||f.label||'')}</li>`).join('')}
          </ul>
          ${(p.cta||(p.button&&p.button.label))?`<a href="${p.ctaHref||(p.button&&p.button.href)||'#'}" style="display:block;text-align:center;padding:12px;background:${((p.ctaVariant||(p.button&&p.button.variant)||'solid')==='outline')?'transparent':p.accentColor||'#4F7CFF'};color:${((p.ctaVariant||(p.button&&p.button.variant)||'solid')==='outline')?p.accentColor||'#4F7CFF':'white'};border:${((p.ctaVariant||(p.button&&p.button.variant)||'solid')==='outline')?'2px solid '+(p.accentColor||'#4F7CFF'):'none'};border-radius:10px;font-weight:600;text-decoration:none">${p.cta||(p.button&&p.button.label)||'Get started'}</a>`:''}
        </div>`).join('')}
      </div>
    </section>`;
    case 'cta': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#0f172a'};text-align:${c.align||'center'}">
      ${c.eyebrow?`<span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:${c.eyebrowColor||'#4F7CFF'};background:rgba(79,124,255,.1);border-radius:999px;padding:4px 14px;display:inline-block;margin-bottom:16px">${c.eyebrow}</span>`:''}
      <h2 style="font-size:clamp(1.75rem,3vw,2.5rem);font-weight:800;color:${c.textColor||'#fff'};margin-bottom:16px">${c.title||'Ready to get started?'}</h2>
      ${c.subtitle?`<p style="font-size:1.1rem;color:${c.textColor||'#fff'};opacity:.8;line-height:1.7;max-width:560px;${c.align==='center'?'margin:0 auto':''}margin-bottom:32px">${c.subtitle}</p>`:''}
      ${(c.buttons||[]).map(b=>`<a href="${b.href||'#'}" style="display:inline-block;padding:16px 32px;background:${b.variant==='outline'?'transparent':b.backgroundColor||'#4F7CFF'};color:${b.variant==='outline'?b.backgroundColor||'#4F7CFF':b.textColor||'#fff'};border-radius:8px;font-weight:600;text-decoration:none;margin:0 6px;border:${b.variant==='outline'?'2px solid '+(b.backgroundColor||'#4F7CFF'):'none'}">${b.label||'CTA'}</a>`).join('')}
    </section>`;
    case 'testimonials': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#fff'}">
      ${c.title?`<div style="text-align:center;margin-bottom:48px"><h2 style="font-size:2.5rem;font-weight:800;color:#111827">${c.title}</h2></div>`:''}
      <div style="display:grid;grid-template-columns:repeat(${c.columns||3},1fr);gap:24px">
        ${(c.items||[]).map(t=>`<div style="padding:32px;background:${c.cardBackground||'#f8fafc'};border-radius:16px">
          <div style="color:#f59e0b;margin-bottom:12px">${'★'.repeat(t.rating||5)}</div>
          <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin-bottom:24px">"${t.quote||''}"</p>
          <div style="display:flex;align-items:center;gap:12px">
            ${(t.avatar||t.image)?`<img src="${t.avatar||t.image}" alt="${t.author||t.name||''}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`:`<div style="width:40px;height:40px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#6B7280">${(t.author||t.name||'?').charAt(0)}</div>`}
            <div><div style="font-weight:600;font-size:15px;color:#111827">${t.author||t.name||''}</div><div style="font-size:13px;color:#9CA3AF">${t.role||''}</div></div>
          </div>
        </div>`).join('')}
      </div>
    </section>`;
    case 'faq': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#fff'}">
      ${c.title?`<div style="text-align:center;margin-bottom:48px"><h2 style="font-size:2.5rem;font-weight:800;color:#111827">${c.title}</h2></div>`:''}
      <div style="max-width:760px;margin:0 auto">
        ${(c.items||[]).map(f=>`<div style="border-bottom:1px solid #e5e7eb;padding:20px 0">
          <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='block'?'none':'block'">
            <span style="font-size:16px;font-weight:600;color:#111827">${f.question||''}</span>
            <span style="font-size:20px;color:${c.accentColor||'#4F7CFF'}">+</span>
          </div>
          <div style="display:none;padding-top:12px;font-size:15px;line-height:1.7;color:#6B7280">${f.answer||''}</div>
        </div>`).join('')}
      </div>
    </section>`;
    case 'stats': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#0f172a'};text-align:center">
      ${c.title?`<h2 style="font-size:2.5rem;font-weight:800;color:${c.textColor||'#fff'};margin-bottom:48px">${c.title}</h2>`:''}
      <div style="display:grid;grid-template-columns:repeat(${c.columns||4},1fr);gap:32px;max-width:900px;margin:0 auto">
        ${(c.items||[]).map(s=>`<div>
          ${s.icon?`<div style="font-size:2rem;margin-bottom:12px">${s.icon}</div>`:''}
          <div style="font-size:clamp(2rem,4vw,3.5rem);font-weight:800;color:${c.accentColor||'#4F7CFF'};line-height:1">${s.prefix||''}${s.value||'0'}${s.suffix||''}</div>
          <div style="font-size:15px;color:${c.textColor||'#fff'};opacity:.7;margin-top:8px">${s.label||''}</div>
        </div>`).join('')}
      </div>
    </section>`;
    case 'richtext': return `<div style="padding:${c.padding||'0'};color:${c.textColor||'inherit'}">${c.html||'<p>Rich text content here.</p>'}</div>`;
    case 'blockquote': return `<blockquote style="border-left:4px solid ${c.accentColor||'#4F7CFF'};padding:16px 24px;background:${c.backgroundColor||'rgba(79,124,255,.05)'};border-radius:0 8px 8px 0;font-size:1.1rem;font-style:italic;color:${c.textColor||'#111827'}">
      ${c.text||'Quote text'}<cite style="display:block;font-size:14px;margin-top:12px;opacity:.7;font-style:normal">— ${c.author||'Author'}</cite>
    </blockquote>`;
    case 'embed': return `<div style="border-radius:${c.borderRadius||'8px'};overflow:hidden;height:${c.height||'400px'};background:#e5e7eb;display:flex;align-items:center;justify-content:center;color:#9CA3AF">
      ${c.url?`<iframe src="${c.url}" width="100%" height="100%" frameborder="0" allowfullscreen style="border:none"></iframe>`:`<span class="material-symbols-outlined" style="font-size:48px">embed_code</span>`}
    </div>`;
    case 'gallery': return `<div style="display:grid;grid-template-columns:repeat(${c.columns||3},1fr);gap:${c.gap||12}px">
      ${(c.images||[]).map(img=>img.src?`<img src="${img.src}" alt="${img.alt||''}" style="width:100%;aspect-ratio:${c.aspectRatio||'16/9'};object-fit:cover;border-radius:8px" loading="lazy">`:`<div style="background:#e5e7eb;aspect-ratio:${c.aspectRatio||'16/9'};border-radius:8px;display:flex;align-items:center;justify-content:center;color:#9CA3AF"><span class="material-symbols-outlined">image</span></div>`).join('')}
    </div>`;
    case 'form': return `<div style="max-width:${c.maxWidth||'560px'};padding:${c.padding||'0'}">
      ${c.title?`<h3 style="font-size:1.5rem;font-weight:700;color:#111827;margin-bottom:24px">${c.title}</h3>`:''}
      <form style="display:flex;flex-direction:column;gap:16px">
        ${(c.fields||[]).map(f=>`<div><label style="display:block;font-size:14px;font-weight:500;color:#374151;margin-bottom:6px">${f.label||''}</label>
          ${f.type==='textarea'?`<textarea rows="${f.rows||4}" placeholder="${f.placeholder||''}" style="width:100%;padding:12px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:15px;resize:vertical;box-sizing:border-box">${''}</textarea>`:`<input type="${f.type||'text'}" placeholder="${f.placeholder||''}" style="width:100%;padding:12px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:15px;box-sizing:border-box">`}
        </div>`).join('')}
        ${c.submitButton?`<button type="submit" style="padding:12px 24px;background:${c.submitButton.backgroundColor||'#4F7CFF'};color:${c.submitButton.textColor||'#fff'};border:none;border-radius:8px;font-weight:600;font-size:15px;cursor:pointer${c.submitButton.fullWidth?';width:100%':''}">${c.submitButton.label||'Submit'}</button>`:''}
      </form>
    </div>`;
    case 'countdown': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#0f172a'};text-align:center">
      ${c.title?`<h2 style="font-size:2rem;font-weight:800;color:${c.textColor||'#fff'};margin-bottom:32px">${c.title}</h2>`:''}
      <div style="display:flex;gap:20px;justify-content:center">
        ${['Days','Hours','Minutes','Seconds'].map((u,i)=>`<div><span style="display:block;font-size:3rem;font-weight:800;color:${c.accentColor||'#4F7CFF'};line-height:1;min-width:80px">${['00','04','45','12'][i]}</span><span style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:${c.textColor||'#fff'};opacity:.6">${u}</span></div>`).join('')}
      </div>
    </section>`;
    case 'team': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#fff'}">
      ${c.title?`<div style="text-align:center;margin-bottom:48px"><h2 style="font-size:2.5rem;font-weight:800;color:#111827">${c.title}</h2></div>`:''}
      <div style="display:grid;grid-template-columns:repeat(${c.columns||4},1fr);gap:28px">
        ${(c.members||[]).map(m=>`<div style="text-align:center">
          ${(m.photo||m.image)?`<img src="${m.photo||m.image}" alt="${m.name||''}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;margin-bottom:16px">`:`<div style="background:#e5e7eb;aspect-ratio:1;border-radius:12px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;color:#9CA3AF">${(m.name||'?').charAt(0)}</div>`}
          <div style="font-weight:700;font-size:17px;color:#111827">${m.name||''}</div>
          <div style="font-size:14px;color:#6B7280;margin:4px 0 12px">${m.role||''}</div>
          ${m.bio?`<p style="font-size:14px;line-height:1.6;color:#9CA3AF">${m.bio}</p>`:''}
        </div>`).join('')}
      </div>
    </section>`;
    case 'timeline': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#fff'}">
      ${c.title?`<h2 style="font-size:2.5rem;font-weight:800;color:#111827;margin-bottom:48px">${c.title}</h2>`:''}
      <div style="max-width:680px;margin:0 auto">
        ${(c.items||[]).map((item,i)=>`<div style="display:flex;gap:24px;padding-bottom:40px">
          <div style="width:42px;height:42px;border-radius:50%;background:${c.accentColor||'#4F7CFF'};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">${i+1}</div>
          <div>
            ${item.date?`<div style="font-size:13px;color:${c.accentColor||'#4F7CFF'};margin-bottom:4px">${item.date}</div>`:''}
            <div style="font-weight:700;font-size:17px;color:#111827;margin-bottom:6px">${item.title||''}</div>
            <div style="font-size:15px;line-height:1.6;color:#6B7280">${item.text||item.description||''}</div>
          </div>
        </div>`).join('')}
      </div>
    </section>`;
    case 'contact': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#fff'}">
      ${c.title?`<div style="text-align:${c.align||'center'};margin-bottom:48px"><h2 style="font-size:2.5rem;font-weight:800;color:#111827">${c.title}</h2></div>`:''}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:32px">
        ${(c.items||[]).map(item=>`<div style="display:flex;gap:14px;align-items:flex-start">
          <div style="font-size:1.5rem">${item.icon||'📍'}</div>
          <div><strong style="display:block;margin-bottom:4px;color:#111827">${item.label||''}</strong>${item.link?`<a href="${item.link}" style="font-size:15px;color:#6B7280;text-decoration:none">${item.value||''}</a>`:`<span style="font-size:15px;color:#6B7280">${item.value||''}</span>`}</div>
        </div>`).join('')}
      </div>
    </section>`;
    case 'cards_grid': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#fff'}">
      ${c.title?`<div style="margin-bottom:40px"><h2 style="font-size:2.5rem;font-weight:800;color:#111827">${c.title}</h2></div>`:''}
      <div style="display:grid;grid-template-columns:repeat(${c.columns||3},1fr);gap:24px">
        ${(c.cards||[]).map(card=>`<div style="background:${card.backgroundColor||'#fff'};border:${card.border||'1px solid #e5e7eb'};border-radius:12px;overflow:hidden">
          ${card.image?`<img src="${card.image}" alt="${card.imageAlt||''}" style="width:100%;aspect-ratio:16/9;object-fit:cover">`:``}
          <div style="padding:24px">
            ${card.tag?`<span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;background:rgba(79,124,255,.1);color:#4F7CFF;border-radius:4px;padding:2px 8px;margin-bottom:12px;display:inline-block">${card.tag}</span>`:''}
            <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#111827">${card.title||''}</h3>
            <p style="font-size:14px;line-height:1.6;color:#6B7280;margin-bottom:20px">${card.text||''}</p>
            ${(card.link||card.cta)?`<a href="${card.link||'#'}" style="display:inline-block;padding:8px 16px;background:#4F7CFF;color:#fff;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none">${card.cta||'Read more'}</a>`:''}
          </div>
        </div>`).join('')}
      </div>
    </section>`;
    case 'banner': return `<div style="padding:14px 24px;background:${c.backgroundColor||'#4F7CFF'};color:${c.textColor||'#fff'};display:flex;align-items:center;justify-content:center;gap:12px;font-size:14px;font-weight:500">
      ${c.icon?`<span>${c.icon}</span>`:''}
      <span>${c.text||'Announcement text'}</span>
      ${c.link?`<a href="${c.link}" style="color:${c.textColor||'#fff'};font-weight:700;text-decoration:underline;margin-left:8px">${c.linkLabel||'Learn more'}</a>`:''}
    </div>`;
    case 'logo_strip': return `<section style="padding:${c.padding||'48px 40px'};background:${c.backgroundColor||'#fff'}">
      ${c.label?`<p style="text-align:center;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:#9CA3AF;margin-bottom:32px">${c.label}</p>`:''}
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:40px;opacity:.6">
        ${(c.logos||[]).map(l=>{const inner=l.src?`<img src="${l.src}" alt="${l.alt||l.name||''}" style="height:32px;width:auto;object-fit:contain;filter:grayscale(1)">`:`<span style="font-size:18px;font-weight:700;color:#9CA3AF">${l.name||''}</span>`;return l.url?`<a href="${l.url}" target="_blank" style="display:inline-flex;align-items:center">${inner}</a>`:inner;}).join('')}
      </div>
    </section>`;
    case 'social_links': return `<div style="display:flex;gap:${c.gap||'12px'};justify-content:${c.align||'flex-start'};padding:8px 0">
      ${(c.links||[]).map(l=>`<a href="${l.url||'#'}" style="width:${c.size||'40px'};height:${c.size||'40px'};border-radius:8px;background:${l.backgroundColor||'rgba(0,0,0,.08)'};color:${l.color||'#111'};display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:18px">${l.icon||'🔗'}</a>`).join('')}
    </div>`;
    case 'icon': return `<div style="text-align:${c.align||'left'};padding:${c.padding||'8px 0'}">
      <span style="width:${c.size||'48px'};height:${c.size||'48px'};background:${c.backgroundColor||''};border-radius:${c.borderRadius||'12px'};color:${c.color||'#4F7CFF'};display:inline-flex;align-items:center;justify-content:center;font-size:calc(${c.size||'48px'} * .55)">${c.icon||'⚡'}</span>
      ${c.text?`<div style="font-size:14px;margin-top:8px;color:${c.textColor||'#374151'}">${c.text}</div>`:''}
    </div>`;
    case 'badge': return `<span style="display:inline-block;padding:${c.padding||'4px 12px'};background:${c.backgroundColor||'rgba(79,124,255,.1)'};color:${c.textColor||'#4F7CFF'};border-radius:${c.borderRadius||'6px'};font-size:${c.fontSize||'13px'};font-weight:600;${c.border?'border:1px solid '+c.border:''}">${c.text||'Badge'}</span>`;
    case 'link': return `<a href="${c.href||'#'}" target="${c.target||'_self'}" style="color:${c.color||'#4F7CFF'};text-decoration:${c.underline!==false?'underline':'none'};font-size:${c.fontSize||'16px'};font-weight:${c.fontWeight||'400'}">${c.label||'Link'}</a>`;
    case 'code_block': return `<div style="background:${c.backgroundColor||'#0f172a'};border-radius:10px;padding:24px;position:relative;overflow-x:auto">
      ${c.language?`<span style="position:absolute;top:10px;right:14px;font-size:11px;font-weight:600;text-transform:uppercase;color:rgba(255,255,255,.4);font-family:JetBrains Mono">${c.language}</span>`:''}
      <pre style="font-family:JetBrains Mono,monospace;font-size:14px;line-height:1.6;color:${c.textColor||'#e5e7eb'};white-space:pre-wrap;margin:0">${escH(c.code||'// code here')}</pre>
    </div>`;
    case 'tabs': {
      const tabs = c.tabs||[];
      if(!tabs.length) return '<div style="padding:20px;color:#9CA3AF;text-align:center">Add tabs in properties</div>';
      return `<div style="padding:${c.padding||'0'}">
        <div style="display:flex;border-bottom:2px solid rgba(0,0,0,.1);gap:4px">
          ${tabs.map((t,i)=>`<button onclick="this.closest('[data-tabs]').querySelectorAll('[data-panel]').forEach((p,j)=>{p.style.display=j===${i}?'block':'none'});this.closest('[data-tabs]').querySelectorAll('[data-tbtn]').forEach((b,j)=>{b.style.borderBottom=j===${i}?'2px solid #4F7CFF':'2px solid transparent';b.style.color=j===${i}?'#4F7CFF':'#94A3B8'})" data-tbtn
            style="padding:12px 20px;font-size:15px;font-weight:500;border:none;background:none;cursor:pointer;border-bottom:${i===0?'2px solid #4F7CFF':'2px solid transparent'};color:${i===0?'#4F7CFF':'#94A3B8'};margin-bottom:-2px">${t.label||'Tab '+(i+1)}</button>`).join('')}
        </div>
        <div data-tabs style="padding-top:24px">
          ${tabs.map((t,i)=>`<div data-panel style="display:${i===0?'block':'none'}">${
            t.content
              ? `<div style="line-height:1.6">${t.content}</div>`
              : ((t.children||[]).map(getCompHTML).join('') || '<p style="color:#9CA3AF;padding:16px">No content in this tab</p>')
          }</div>`).join('')}
        </div>
      </div>`;
    }
    case 'columns': {
      const cols = c.columns||[];
      const tpl = c.gridTemplate || cols.map(()=>'1fr').join(' ');
      return `<div style="display:grid;grid-template-columns:${tpl};gap:${c.gap||'24px'};padding:${c.padding||'0'}">
        ${cols.map(col=>`<div style="${Object.entries(col).filter(([k])=>!['children','type','id'].includes(k)).map(([k,v])=>k+':'+v).join(';')}">${(col.children||[]).map(getCompHTML).join('')}</div>`).join('')}
      </div>`;
    }
    case 'video': return `<div style="border-radius:${c.borderRadius||'8px'};overflow:hidden;height:${c.height||'400px'};background:${c.backgroundColor||'#0f172a'}">
      ${c.src?`<video src="${c.src}" ${c.poster?`poster="${c.poster}"`:''}${c.autoplay?' autoplay muted loop':''}${c.controls!==false?' controls':''} style="width:100%;height:100%;object-fit:cover"></video>`:`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#9CA3AF"><span class="material-symbols-outlined" style="font-size:48px">play_circle</span></div>`}
    </div>`;
    default: return `<div style="padding:20px;border:1px dashed #e5e7eb;border-radius:8px;text-align:center;color:#9CA3AF;font-size:14px">
      ${c.type||'unknown'} component
    </div>`;
  }
}

function escH(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// ── Selection ─────────────────────────────────────────────────
function selectComp(id) {
  selectedId = id;
  renderCanvas();
  const comp = findComp(id);
  if (comp) renderPropertiesPanel(comp);
}

function findComp(id, comps) {
  const list = comps || editorLayout.components || [];
  for (const c of list) {
    if (c.id === id) return c;
    if (c.children) { const f = findComp(id, c.children); if(f) return f; }
    if (c.columns) for(const col of c.columns){const f=findComp(id,col.children||[]);if(f)return f;}
    if (c.tabs) for(const t of c.tabs){const f=findComp(id,t.children||[]);if(f)return f;}
  }
  return null;
}

// ── Add / Remove ──────────────────────────────────────────────
async function addComponent(type) {
  let defaults = { id: `${type}-${Date.now()}`, type };
  try {
    const d = await editorAPI.getDefaults(type);
    if (d?.defaults) defaults = { ...defaults, ...d.defaults };
  } catch {}

  pushUndo();
  editorLayout.components = [...(editorLayout.components||[]), defaults];
  selectedId = defaults.id;
  markDirty();
  renderCanvas();
  renderPropertiesPanel(defaults);

  try {
    await editorAPI.upsertComponent(editorProject.id, defaults);
  } catch {
    showToast('Failed to sync component', 'error');
  }
}

async function removeComp(id) {
  pushUndo();
  editorLayout.components = editorLayout.components.filter(c=>c.id!==id);
  selectedId = null;
  markDirty();
  renderCanvas();
  document.getElementById('properties-panel').innerHTML = `<div class="text-center text-on-surface-variant text-sm mt-8 flex flex-col items-center gap-3"><span class="material-symbols-outlined text-[40px] opacity-30">touch_app</span><span>Select a component<br/>to edit its properties</span></div>`;

  try {
    await editorAPI.deleteComponent(editorProject.id, id);
  } catch {
    showToast('Failed to delete component', 'error');
  }
}

async function duplicateComp(id) {
  const comp = findComp(id);
  if (!comp) return;
  const dup = JSON.parse(JSON.stringify(comp));
  dup.id = `${comp.type}-${Date.now()}`;
  pushUndo();
  const idx = editorLayout.components.findIndex(c=>c.id===id);
  if (idx < 0) { editorLayout.components.push(dup); } else { editorLayout.components.splice(idx+1,0,dup); }
  markDirty();
  renderCanvas();
  try {
    await editorAPI.upsertComponent(editorProject.id, dup);
  } catch {
    showToast('Failed to sync duplicate', 'error');
  }
}

function moveComp(id, dir) {
  const comps = editorLayout.components;
  const idx = comps.findIndex(c=>c.id===id);
  if (idx<0) return;
  const newIdx = idx+dir;
  if (newIdx<0||newIdx>=comps.length) return;
  pushUndo();
  [comps[idx],comps[newIdx]] = [comps[newIdx],comps[idx]];
  markDirty();
  renderCanvas();
  _syncOrder();
}

// ── Drag to move (absolute components) ───────────────────────
function startCompDrag(e, compId) {
  e.preventDefault();
  e.stopPropagation();
  const comp = findComp(compId);
  if (!comp) return;
  const startX = e.clientX, startY = e.clientY;
  const startLeft = parseFloat(comp.left) || 0;
  const startTop  = parseFloat(comp.top)  || 0;
  const el = document.getElementById(`comp-${compId}`);
  let moved = false;

  const onMove = (mv) => {
    moved = true;
    comp.left = Math.max(0, startLeft + (mv.clientX - startX));
    comp.top  = Math.max(0, startTop  + (mv.clientY - startY));
    if (el) { el.style.left = comp.left + 'px'; el.style.top = comp.top + 'px'; }
  };
  const onUp = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    if (!moved) return;
    markDirty();
    renderPropertiesPanel(comp);
    _syncComp(comp);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// ── Drag to resize (right handle = width, bottom handle = height) ─
function startCompResize(e, compId, dir) {
  e.preventDefault();
  e.stopPropagation();
  const comp = findComp(compId);
  if (!comp) return;
  const el = document.getElementById(`comp-${compId}`);
  if (!el) return;
  const startX = e.clientX, startY = e.clientY;
  const startW = el.offsetWidth, startH = el.offsetHeight;

  const onMove = (mv) => {
    if (dir === 'w') {
      const newW = Math.max(40, startW + (mv.clientX - startX));
      comp.compWidth = newW + 'px';
      el.style.width = newW + 'px';
    } else {
      const newH = Math.max(40, startH + (mv.clientY - startY));
      comp.compHeight = newH + 'px';
      el.style.height = newH + 'px';
    }
  };
  const onUp = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    markDirty();
    renderCanvas();
    const c = findComp(compId);
    if (c) { renderPropertiesPanel(c); _syncComp(c); }
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// ── Save ──────────────────────────────────────────────────────
async function saveLayout(silent=false) {
  const btn = document.getElementById('save-btn');
  const dot = document.getElementById('save-dot');
  const txt = document.getElementById('save-text');
  if(btn) {btn.textContent='Saving…';btn.disabled=true;}
  const data = await editorAPI.saveLayout(editorProject.id, editorLayout);
  if (data) {
    isDirty=false;
    if(dot){dot.style.background='#22C55E';}
    if(txt){txt.textContent='Saved';txt.style.color='#22C55E';}
    if(!silent) showToast('Layout saved!','success');
    setTimeout(()=>{if(dot)dot.style.background='#4B5563';if(txt){txt.textContent='Saved';txt.style.color='#4B5563';}},2000);
  } else {
    if(!silent) showToast('Failed to save','error');
  }
  if(btn){btn.innerHTML='<span class="material-symbols-outlined text-[16px]">save</span> Save';btn.disabled=false;}
}

function markDirty() {
  isDirty=true;
  const dot=document.getElementById('save-dot');
  const txt=document.getElementById('save-text');
  if(dot){dot.style.background='#F59E0B';}
  if(txt){txt.textContent='Unsaved';txt.style.color='#F59E0B';}
}

// ── Undo ──────────────────────────────────────────────────────
function pushUndo() { undoStack.push(JSON.stringify(editorLayout)); if(undoStack.length>30) undoStack.shift(); }
function editorUndo() {
  if(!undoStack.length) return;
  editorLayout = JSON.parse(undoStack.pop());
  markDirty(); renderCanvas();
}

// ── Device ────────────────────────────────────────────────────
const deviceWidths = {desktop:'1200px',tablet:'768px',mobile:'375px'};
function setDevice(d) {
  const frame = document.getElementById('canvas-frame');
  if(frame) frame.style.width=deviceWidths[d]||'1200px';
  ['desktop','tablet','mobile'].forEach(k=>{
    const btn = document.getElementById('dev-'+k);
    if(btn) btn.className = `w-8 h-8 flex items-center justify-center rounded-DEFAULT transition-colors ${k===d?'bg-surface-variant text-primary shadow-sm':'text-on-surface-variant hover:text-on-surface'}`;
  });
}

// ── Layers ────────────────────────────────────────────────────
function updateLayers() {
  const panel = document.getElementById('lib-layers');
  if(!panel) return;
  const comps = editorLayout.components||[];
  panel.innerHTML = comps.length===0
    ? '<p style="color:#4B5563;font-size:12px;padding:12px">No components yet</p>'
    : comps.map(c=>`<div onclick="selectComp('${c.id}')" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:6px;cursor:pointer;background:${c.id===selectedId?'rgba(79,124,255,.1)':'transparent'};${c.id===selectedId?'border-left:2px solid #4F7CFF;':''}" class="hover:bg-slate-800/50 transition-colors">
      <span class="material-symbols-outlined" style="font-size:14px;color:${c.id===selectedId?'#4F7CFF':'#94A3B8'}">${getCompIcon(c.type)}</span>
      <span style="font-size:11px;color:${c.id===selectedId?'#E5E7EB':'#94A3B8'}">${c.type}</span>
      <span style="font-size:10px;color:#4B5563;margin-left:auto;font-family:monospace">${c.id?.split('-').pop()||''}</span>
    </div>`).join('');
}

function switchLibTab(tab) {
  const isComp = tab==='comp';
  document.getElementById('tab-comp').className = `flex-1 py-1 text-[10px] rounded font-semibold ${isComp?'bg-primary/10 text-primary border border-primary/20':'text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700'} transition-all`;
  document.getElementById('tab-layers').className = `flex-1 py-1 text-[10px] rounded font-semibold ${!isComp?'bg-primary/10 text-primary border border-primary/20':'text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700'} transition-all`;
  document.getElementById('lib-components').style.display = isComp?'flex':'none';
  document.getElementById('lib-layers').style.display = !isComp?'flex':'none';
  if(!isComp) updateLayers();
}

// ── Canvas grid toggle ────────────────────────────────────────
let _gridVisible = true;
function toggleCanvasGrid() {
  _gridVisible = !_gridVisible;
  const scroll = document.getElementById('canvas-scroll');
  if (scroll) scroll.style.backgroundImage = _gridVisible ? 'radial-gradient(circle,rgba(255,255,255,0.025) 1px,transparent 1px)' : 'none';
  const btn = document.getElementById('grid-toggle-btn');
  if (btn) btn.style.opacity = _gridVisible ? '1' : '0.4';
}

// ── Drag from library ─────────────────────────────────────────
let dragType = null;
function dragCompStart(e, type) { dragType=type; e.dataTransfer.effectAllowed='copy'; }
document.addEventListener('dragover', e=>{ if(dragType) e.preventDefault(); });
document.addEventListener('dragend', ()=>{ dragType=null; });
document.addEventListener('drop', e=>{
  if(dragType && document.getElementById('canvas-frame')?.contains(e.target)) {
    addComponent(dragType);
  }
  dragType=null;
});

// ── Keyboard shortcuts ────────────────────────────────────────
function handleEditorKey(e) {
  if((e.ctrlKey||e.metaKey)&&e.key==='s') { e.preventDefault(); saveLayout(); }
  if((e.ctrlKey||e.metaKey)&&e.key==='z') { e.preventDefault(); editorUndo(); }
  if(e.key==='Escape') { selectedId=null; renderCanvas(); }
  if((e.key==='Delete'||e.key==='Backspace')&&selectedId&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!document.activeElement.isContentEditable) {
    removeComp(selectedId);
  }
}

// ── Back to dashboard ─────────────────────────────────────────
function backToDashboard() {
  if(isDirty) {
    showConfirm('You have unsaved changes. Leave without saving?', ()=>{ document.removeEventListener('keydown',handleEditorKey); clearInterval(autoSaveTimer); router.go('/dashboard'); }, false);
  } else {
    document.removeEventListener('keydown',handleEditorKey);
    clearInterval(autoSaveTimer);
    router.go('/dashboard');
  }
}

// ── Edit title ────────────────────────────────────────────────
function editTitle() {
  const el = document.getElementById('project-title-text');
  const cur = el.textContent;
  el.contentEditable='true'; el.focus();
  document.execCommand('selectAll');
  el.onblur = async ()=>{
    el.contentEditable='false';
    const newTitle = el.textContent.trim();
    if(newTitle && newTitle!==cur) {
      try {
        await projectsAPI.update(editorProject.id, {title:newTitle});
        editorProject.title=newTitle;
        showToast('Title updated','success');
      } catch {
        el.textContent=cur;
        showToast('Failed to update title','error');
      }
    } else el.textContent=cur;
  };
  el.onkeydown = e=>{ if(e.key==='Enter'){e.preventDefault();el.blur();} if(e.key==='Escape'){el.textContent=cur;el.blur();} };
}

// ── Properties Panel ──────────────────────────────────────────
function renderPropertiesPanel(c) {
  const panel = document.getElementById('properties-panel');
  if(!panel) return;

  const field = (label,key,type='text',placeholder='')=>`
    <div class="flex flex-col gap-xs">
      <label class="font-label-caps text-label-caps text-on-surface-variant">${label}</label>
      <input type="${type}" value="${escA(c[key]||'')}" placeholder="${placeholder}"
        onchange="updateCompProp('${c.id}','${key}',this.value)"
        class="bg-[#080E1A] border border-outline-variant rounded-lg px-md py-[8px] font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"/>
    </div>`;

  const colorField = (label,key)=>`
    <div class="flex items-center gap-sm justify-between">
      <label class="font-label-caps text-label-caps text-on-surface-variant">${label}</label>
      <div class="flex items-center gap-1">
        <input type="color" value="${c[key]||'#ffffff'}" onchange="updateCompProp('${c.id}','${key}',this.value)" class="w-8 h-8 rounded border border-outline-variant cursor-pointer bg-transparent"/>
        <input type="text" value="${escA(c[key]||'')}" onchange="updateCompProp('${c.id}','${key}',this.value)"
          class="bg-[#080E1A] border border-outline-variant rounded px-2 py-1 font-code-sm text-code-sm text-on-surface w-24 focus:border-primary outline-none"/>
      </div>
    </div>`;

  const textarea = (label,key,rows=3)=>{
    const val = c[key];
    const isJSON = val !== null && typeof val === 'object';
    const display = isJSON ? JSON.stringify(val, null, 2) : (val||'');
    const handler = isJSON ? `updateCompPropJSON('${c.id}','${key}',this.value)` : `updateCompProp('${c.id}','${key}',this.value)`;
    return `<div class="flex flex-col gap-xs">
      <label class="font-label-caps text-label-caps text-on-surface-variant">${label}${isJSON?' <span style="opacity:.5;font-size:9px">(JSON)</span>':''}</label>
      <textarea rows="${rows}" onchange="${handler}"
        class="bg-[#080E1A] border border-outline-variant rounded-lg px-md py-[8px] font-code-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y">${escA(String(display))}</textarea>
    </div>`;
  };

  const select = (label,key,opts)=>`
    <div class="flex items-center justify-between gap-sm">
      <label class="font-label-caps text-label-caps text-on-surface-variant">${label}</label>
      <select onchange="updateCompProp('${c.id}','${key}',this.value)"
        class="bg-[#080E1A] border border-outline-variant rounded-lg px-sm py-1 font-body-sm text-body-sm text-on-surface focus:border-primary outline-none">
        ${opts.map(([v,l])=>`<option value="${v}"${c[key]===v?' selected':''}>${l}</option>`).join('')}
      </select>
    </div>`;

  const section = (title,content)=>`
    <div class="border-b border-surface-variant pb-3">
      <div class="font-label-caps text-label-caps text-on-surface-variant mb-2 uppercase tracking-wider">${title}</div>
      <div class="flex flex-col gap-2">${content}</div>
    </div>`;

  let html = `<div class="flex items-center gap-2 mb-3 p-2 bg-surface-container-highest rounded-lg">
    <span class="material-symbols-outlined text-primary text-[18px]">${getCompIcon(c.type)}</span>
    <span class="font-body-sm text-body-sm text-on-surface font-medium capitalize">${c.type}</span>
    <span class="font-code-sm text-[10px] text-on-surface-variant ml-auto opacity-60">${c.id?.split('-')[0]}</span>
  </div>`;

  // Common spacing
  const spacing = section('Spacing',`${field('Padding','padding','text','8px 16px')}${field('Margin','margin','text','0')}`);
  const appearance = section('Appearance',`${colorField('Background','backgroundColor')}${colorField('Text Color','textColor')}`);

  // Item array editor — renders collapsible per-item cards instead of a raw JSON textarea
  const itemEditor = (key, fields, addDefs, itemLabel = 'Item') => {
    window._arrDefs = window._arrDefs || {};
    window._arrDefs[`${c.id}:${key}`] = addDefs;
    const items = c[key] || [];
    const iSt = 'width:100%;background:#080E1A;border:1px solid #1F2A44;border-radius:6px;padding:5px 8px;color:#E5E7EB;font-size:12px;box-sizing:border-box;outline:none';
    const lSt = 'font-size:10px;color:#94A3B8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px;display:block';
    const renderF = (item, i, [label, fkey, ftype='text']) => {
      const raw = item[fkey];
      const val = (raw === undefined || raw === null) ? '' : raw;
      if (ftype === 'color') {
        const cv = String(val || '#ffffff');
        return `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">
          <span style="${lSt};margin-bottom:0">${label}</span>
          <div style="display:flex;gap:4px;align-items:center">
            <input type="color" value="${escA(cv)}" onchange="updateArrayItem('${c.id}','${key}',${i},'${fkey}',this.value)" style="width:28px;height:28px;border:1px solid #1F2A44;border-radius:4px;cursor:pointer;background:transparent"/>
            <input type="text" value="${escA(cv)}" onchange="updateArrayItem('${c.id}','${key}',${i},'${fkey}',this.value)" style="${iSt};width:80px;padding:3px 6px"/>
          </div></div>`;
      }
      if (ftype === 'checkbox') {
        return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <span style="${lSt};margin-bottom:0">${label}</span>
          <input type="checkbox" ${val?'checked':''} onchange="updateArrayItem('${c.id}','${key}',${i},'${fkey}',this.checked)" style="width:16px;height:16px;cursor:pointer"/>
        </div>`;
      }
      if (ftype === 'textarea') {
        return `<div style="margin-bottom:6px"><span style="${lSt}">${label}</span>
          <textarea rows="3" onchange="updateArrayItem('${c.id}','${key}',${i},'${fkey}',this.value)" style="${iSt};resize:vertical">${escA(String(val))}</textarea></div>`;
      }
      if (ftype === 'json') {
        const display = (val && typeof val === 'object') ? JSON.stringify(val, null, 2) : String(val);
        return `<div style="margin-bottom:6px"><span style="${lSt}">${label} <span style="opacity:.5">(JSON)</span></span>
          <textarea rows="3" onchange="updateArrayItemJSON('${c.id}','${key}',${i},'${fkey}',this.value)" style="${iSt};resize:vertical">${escA(display)}</textarea></div>`;
      }
      return `<div style="margin-bottom:6px"><span style="${lSt}">${label}</span>
        <input type="${ftype}" value="${escA(String(val))}" onchange="updateArrayItem('${c.id}','${key}',${i},'${fkey}',this.value)" style="${iSt}"/></div>`;
    };
    const getLabel = (item) => {
      const f = fields.find(([,,t]) => !t || t === 'text' || t === 'number');
      return f ? escH(String(item[f[1]] || itemLabel)) : itemLabel;
    };
    return `<div style="display:flex;flex-direction:column;gap:6px">
      ${items.map((item, i) => `<details style="background:#0D1526;border:1px solid #1F2A44;border-radius:6px;overflow:hidden">
        <summary style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;cursor:pointer;list-style:none;font-size:12px;color:#CBD5E1;user-select:none">
          <span style="display:flex;align-items:center;gap:6px;overflow:hidden">
            <span style="font-size:10px;color:#4F6080;font-weight:600;flex-shrink:0">#${i+1}</span>
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${getLabel(item)}</span>
          </span>
          <button onclick="event.preventDefault();removeArrayItem('${c.id}','${key}',${i})" style="background:none;border:none;cursor:pointer;color:#EF4444;font-size:18px;padding:0 0 0 8px;line-height:1;flex-shrink:0">&#215;</button>
        </summary>
        <div style="padding:10px;border-top:1px solid #1F2A44">
          ${fields.map(f => renderF(item, i, f)).join('')}
        </div>
      </details>`).join('')}
      <button onclick="addArrayItem('${c.id}','${key}')" style="background:none;border:1px dashed #1F2A44;border-radius:6px;padding:8px;color:#4F7CFF;font-size:12px;cursor:pointer;width:100%;transition:border-color .15s" onmouseover="this.style.borderColor='#4F7CFF'" onmouseout="this.style.borderColor='#1F2A44'">+ Add ${itemLabel}</button>
    </div>`;
  };

  switch(c.type) {
    case 'navbar':
      html += section('Brand',`${field('Logo Text','logo')}${field('Home URL','homeHref')}${colorField('Background','backgroundColor')}${colorField('Text Color','textColor')}`) + spacing;
      html += `<div class="border-b border-surface-variant pb-3">
        <div class="flex items-center justify-between mb-2"><span class="font-label-caps text-label-caps text-on-surface-variant">Sticky</span>
        <label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" ${c.sticky?'checked':''} onchange="updateCompProp('${c.id}','sticky',this.checked)" class="sr-only peer">
        <div class="w-9 h-5 bg-outline-variant peer-checked:bg-green-500 rounded-full transition-colors"></div></label></div></div>`;
      html += section('Nav Links', itemEditor('links',[['Label','label'],['URL','href']],{label:'Link',href:'#'},'Link'));
      html += section('CTA Buttons', itemEditor('ctaButtons',[['Label','label'],['URL','href'],['Variant','variant']],{label:'Sign up',href:'#',variant:'solid'},'Button'));
      break;
    case 'hero':
      html += section('Content',`${field('Eyebrow','eyebrow')}${colorField('Eyebrow Color','eyebrowColor')}${textarea('Title (HTML ok)','title',2)}${textarea('Subtitle','subtitle',2)}${field('Note','note')}`);
      html += section('Layout',`${select('Layout','layout',[['centered','Centered'],['left','Left'],['split','Split']])}${field('Min Height','minHeight','text','90vh')}${field('Padding','padding','text','80px 40px')}`);
      html += section('Appearance',`${colorField('Background','backgroundColor')}${colorField('Text Color','textColor')}${field('Background Image','backgroundImage')}`);
      html += section('Buttons', itemEditor('buttons',[['Label','label'],['URL','href'],['Variant (solid/outline/ghost)','variant']],{label:'Get started',href:'#',variant:'solid'},'Button'));
      break;
    case 'text':
      html += section('Content',`${select('Tag','tag',[['p','Paragraph'],['h1','H1'],['h2','H2'],['h3','H3'],['h4','H4'],['span','Span']])}${textarea('Content','content',4)}`);
      html += section('Typography',`${field('Font Size','fontSize','text','16px')}${select('Font Weight','fontWeight',[['400','Regular'],['500','Medium'],['600','Semi-bold'],['700','Bold'],['800','Extra-bold']])}${colorField('Color','color')}${select('Align','align',[['left','Left'],['center','Center'],['right','Right']])}`);
      html += spacing;
      break;
    case 'heading':
      html += section('Content',`${field('Eyebrow','eyebrow')}${colorField('Eyebrow Color','eyebrowColor')}${field('Title','title')}${field('Subtitle','subtitle')}${select('Tag','tag',[['h1','H1'],['h2','H2'],['h3','H3'],['h4','H4']])}${select('Align','align',[['left','Left'],['center','Center']])}`);
      html += section('Colors',`${colorField('Title Color','titleColor')}${colorField('Subtitle Color','subtitleColor')}`);
      break;
    case 'image':
      html += section('Media',`${field('Image URL','src')}${field('Alt Text','alt')}${field('Caption','caption')}${field('Link URL','link')}`);
      html += section('Dimensions',`${field('Width','width','text','100%')}${field('Border Radius','borderRadius','text','0px')}`);
      break;
    case 'button':
      html += section('Content',`${field('Label','label')}${field('URL','href')}${select('Size','size',[['sm','Small'],['md','Medium'],['lg','Large'],['xl','Extra Large']])}${select('Variant','variant',[['solid','Solid'],['outline','Outline'],['ghost','Ghost']])}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${colorField('Text Color','textColor')}${field('Border Radius','borderRadius','text','8px')}`);
      html += `<div class="flex items-center justify-between mt-2"><span class="font-label-caps text-label-caps text-on-surface-variant">Full Width</span><label class="relative inline-flex cursor-pointer"><input type="checkbox" ${c.fullWidth?'checked':''} onchange="updateCompProp('${c.id}','fullWidth',this.checked)" class="sr-only peer"><div class="w-9 h-5 bg-outline-variant peer-checked:bg-green-500 rounded-full transition-colors"></div></label></div>`;
      break;
    case 'section':
    case 'container':
      html += appearance + spacing;
      html += section('Size',`${field('Width','width','text','e.g. 800px or 100%')}${field('Max Width','maxWidth','text','e.g. 1200px')}${field('Min Height','minHeight','text','e.g. 400px')}${field('Height','height','text','e.g. 600px')}`);
      if(c.type==='container') html += section('Flex',`${select('Direction','direction',[['row','Row'],['column','Column']])}${field('Gap','gap','text','16px')}`);
      html += section('Background',`${field('Background Image','backgroundImage')}`);
      break;
    case 'richtext':
      html += section('Content',`${textarea('HTML Content','html',8)}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${field('Padding','padding')}`);
      break;
    case 'features':
      html += section('Content',`${field('Eyebrow','eyebrow')}${colorField('Eyebrow Color','eyebrowColor')}${field('Title','title')}${field('Subtitle','subtitle')}${select('Align','align',[['left','Left'],['center','Center']])}${field('Columns','columns','number')}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${colorField('Card Background','cardBackground')}${field('Padding','padding')}`);
      html += section('Feature Items', itemEditor('items',[
        ['Icon (material symbol or emoji)','icon'],
        ['Title','title'],
        ['Description','description','textarea'],
      ],{icon:'star',title:'Feature',description:'Description'},'Feature'));
      break;
    case 'pricing':
      html += section('Content',`${field('Title','title')}${field('Subtitle','subtitle')}${select('Align','align',[['left','Left'],['center','Center']])}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${field('Padding','padding')}`);
      html += section('Plans', itemEditor('plans',[
        ['Name','name'],
        ['Price','price'],
        ['Currency symbol','currency'],
        ['Period','period'],
        ['Description','description','textarea'],
        ['Accent Color','accentColor','color'],
        ['Features (JSON: ["feat1","feat2"])','features','json'],
        ['CTA Label','cta'],
        ['CTA URL','ctaHref'],
        ['CTA Variant (solid/outline)','ctaVariant'],
        ['Popular badge','highlighted','checkbox'],
        ['Popular Label','popularLabel'],
      ],{name:'Plan',price:'0',currency:'$',period:'/ month',description:'',accentColor:'#4F7CFF',features:[],cta:'Get started',ctaHref:'#',ctaVariant:'solid',highlighted:false,popularLabel:'Popular'},'Plan'));
      break;
    case 'testimonials':
      html += section('Content',`${field('Title','title')}${field('Columns','columns','number')}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${colorField('Card Background','cardBackground')}${field('Padding','padding')}`);
      html += section('Testimonials', itemEditor('items',[
        ['Quote text','quote','textarea'],
        ['Author name','author'],
        ['Role / Company','role'],
        ['Avatar URL','avatar'],
        ['Rating (1-5)','rating','number'],
      ],{quote:'',author:'Name',role:'Title',avatar:'',rating:5},'Testimonial'));
      break;
    case 'stats':
      html += section('Content',`${field('Title','title')}${field('Columns','columns','number')}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${colorField('Text Color','textColor')}${colorField('Accent Color','accentColor')}${field('Padding','padding')}`);
      html += section('Stats', itemEditor('items',[
        ['Value','value'],
        ['Label','label'],
        ['Prefix','prefix'],
        ['Suffix','suffix'],
      ],{value:'100',label:'Metric',prefix:'',suffix:''},'Stat'));
      break;
    case 'team':
      html += section('Content',`${field('Title','title')}${field('Columns','columns','number')}${select('Align','align',[['left','Left'],['center','Center']])}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${field('Padding','padding')}`);
      html += section('Members', itemEditor('members',[
        ['Name','name'],
        ['Role','role'],
        ['Bio','bio','textarea'],
        ['Image URL','image'],
      ],{name:'Name',role:'Role',bio:'',image:''},'Member'));
      break;
    case 'faq':
      html += section('Content',`${field('Title','title')}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${colorField('Accent Color','accentColor')}${field('Padding','padding')}`);
      html += section('FAQ Items', itemEditor('items',[
        ['Question','question'],
        ['Answer','answer','textarea'],
      ],{question:'Question?',answer:'Answer.'},'FAQ Item'));
      break;
    case 'cta':
      html += section('Content',`${field('Eyebrow','eyebrow')}${colorField('Eyebrow Color','eyebrowColor')}${field('Title','title')}${field('Subtitle','subtitle')}${field('Note','note')}${select('Align','align',[['left','Left'],['center','Center']])}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${colorField('Text Color','textColor')}${field('Padding','padding')}`);
      html += section('Buttons', itemEditor('buttons',[
        ['Label','label'],
        ['URL','href'],
        ['Variant (solid/outline/ghost)','variant'],
      ],{label:'Get started',href:'#',variant:'solid'},'Button'));
      break;
    case 'footer':
      html += section('Brand',`${field('Logo','logo')}${field('Description','description')}${field('Copyright','copyright')}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${colorField('Text Color','textColor')}${colorField('Logo Color','logoColor')}`);
      html += section('Columns', itemEditor('columns',[
        ['Column Title','title'],
        ['Links (JSON: [{label,href}])','links','json'],
      ],{title:'Column',links:[{label:'Link',href:'#'}]},'Column'));
      break;
    case 'contact':
      html += section('Content',`${field('Title','title')}${select('Align','align',[['left','Left'],['center','Center']])}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${colorField('Text Color','textColor')}${field('Padding','padding')}`);
      html += section('Contact Items', itemEditor('items',[
        ['Icon (material symbol)','icon'],
        ['Label','label'],
        ['Value','value'],
        ['Link URL','link'],
      ],{icon:'email',label:'Email',value:'',link:''},'Contact Item'));
      break;
    case 'banner':
      html += section('Content',`${textarea('Text','text',2)}${field('Link URL','link')}${field('Link Label','linkLabel')}${field('Icon','icon')}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${colorField('Text Color','textColor')}`);
      break;
    case 'countdown':
      html += section('Content',`${field('Title','title')}${field('Target Date','targetDate','text','2026-01-01T00:00:00Z')}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${colorField('Text Color','textColor')}${colorField('Accent Color','accentColor')}${field('Padding','padding')}`);
      break;
    case 'logo_strip':
      html += section('Content',`${field('Label','label')}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${field('Padding','padding')}`);
      html += section('Logos', itemEditor('logos',[
        ['Brand Name','name'],
        ['Image URL','src'],
        ['Link URL','url'],
      ],{name:'Brand',src:'',url:'#'},'Logo'));
      break;
    case 'gallery':
      html += section('Layout',`${field('Columns','columns','number')}${field('Gap (px)','gap','number')}${select('Aspect Ratio','aspectRatio',[['16/9','16:9'],['4/3','4:3'],['1/1','Square'],['3/2','3:2']])}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${field('Padding','padding')}`);
      html += section('Images', itemEditor('images',[
        ['Image URL','src'],
        ['Alt Text','alt'],
        ['Caption','caption'],
        ['Link URL','link'],
      ],{src:'',alt:'',caption:'',link:''},'Image'));
      break;
    case 'cards_grid':
      html += section('Content',`${field('Title','title')}${field('Columns','columns','number')}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${field('Padding','padding')}`);
      html += section('Cards', itemEditor('cards',[
        ['Title','title'],
        ['Description','text','textarea'],
        ['Image URL','image'],
        ['Link URL','link'],
        ['CTA Label','cta'],
      ],{title:'Card',text:'',image:'',link:'',cta:''},'Card'));
      break;
    case 'social_links':
      html += section('Layout',`${select('Align','align',[['flex-start','Left'],['center','Center'],['flex-end','Right']])}${field('Icon Size','size','text','40px')}${field('Gap','gap','text','12px')}`);
      html += section('Links', itemEditor('links',[
        ['URL','url'],
        ['Icon (emoji or text)','icon'],
        ['Icon Color','color','color'],
        ['Background','backgroundColor','color'],
      ],{url:'#',icon:'🔗',color:'#111111',backgroundColor:'rgba(0,0,0,0.08)'},'Link'));
      break;
    case 'divider':
      html += section('Style',`${colorField('Color','color')}${field('Thickness (px)','thickness','number')}${select('Style','style',[['solid','Solid'],['dashed','Dashed'],['dotted','Dotted']])}${field('Margin','margin','text','16px 0')}`);
      break;
    case 'spacer':
      html += section('Size',`${field('Height (px)','height','number')}`);
      break;
    case 'blockquote':
      html += section('Content',`${textarea('Quote Text','text',3)}${field('Author','author')}`);
      html += section('Style',`${colorField('Accent Color','accentColor')}${colorField('Background','backgroundColor')}${colorField('Text Color','textColor')}`);
      break;
    case 'code_block':
      html += section('Content',`${textarea('Code','code',8)}${field('Language','language','text','javascript')}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${colorField('Text Color','textColor')}`);
      break;
    case 'badge':
      html += section('Content',`${field('Text','text')}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${colorField('Text Color','textColor')}${field('Border Radius','borderRadius','text','6px')}${field('Font Size','fontSize','text','13px')}`);
      break;
    case 'icon':
      html += section('Content',`${field('Icon (emoji or text)','icon')}${field('Text','text')}`);
      html += section('Style',`${colorField('Color','color')}${colorField('Background','backgroundColor')}${field('Size','size','text','48px')}${select('Align','align',[['left','Left'],['center','Center'],['right','Right']])}`);
      break;
    case 'link':
      html += section('Content',`${field('Label','label')}${field('URL','href')}${select('Target','target',[['_self','Same tab'],['_blank','New tab']])}`);
      html += section('Style',`${colorField('Color','color')}${field('Font Size','fontSize','text','16px')}`);
      break;
    case 'timeline':
      html += section('Content',`${field('Title','title')}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${colorField('Accent Color','accentColor')}${field('Padding','padding')}`);
      html += section('Events', itemEditor('items',[
        ['Date','date'],
        ['Title','title'],
        ['Description','description','textarea'],
      ],{date:'2024',title:'Event',description:''},'Event'));
      break;
    case 'tabs':
      html += section('Style',`${colorField('Background','backgroundColor')}${field('Padding','padding')}`);
      html += section('Tabs', itemEditor('tabs',[
        ['Tab Label','label'],
        ['Content (HTML)','content','textarea'],
      ],{label:'Tab',content:''},'Tab'));
      break;
    case 'form':
      html += section('Content',`${field('Title','title')}${field('Max Width','maxWidth','text','560px')}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${field('Padding','padding')}`);
      html += section('Fields', itemEditor('fields',[
        ['Type (text/email/textarea/select)','type'],
        ['Name (HTML name attr)','name'],
        ['Label','label'],
        ['Placeholder','placeholder'],
        ['Required','required','checkbox'],
      ],{type:'text',name:'field',label:'Field',placeholder:'',required:false},'Field'));
      break;
    case 'video':
      html += section('Media',`${field('Video URL','src')}${field('Poster Image URL','poster')}${field('Height','height','text','400px')}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${field('Border Radius','borderRadius','text','8px')}`);
      html += `<div class="flex flex-col gap-2">
        <div class="flex items-center justify-between"><span class="font-label-caps text-label-caps text-on-surface-variant">Show Controls</span><label class="relative inline-flex cursor-pointer"><input type="checkbox" ${c.controls!==false?'checked':''} onchange="updateCompProp('${c.id}','controls',this.checked)" class="sr-only peer"><div class="w-9 h-5 bg-outline-variant peer-checked:bg-green-500 rounded-full transition-colors"></div></label></div>
        <div class="flex items-center justify-between"><span class="font-label-caps text-label-caps text-on-surface-variant">Autoplay (muted loop)</span><label class="relative inline-flex cursor-pointer"><input type="checkbox" ${c.autoplay?'checked':''} onchange="updateCompProp('${c.id}','autoplay',this.checked)" class="sr-only peer"><div class="w-9 h-5 bg-outline-variant peer-checked:bg-primary rounded-full transition-colors"></div></label></div>
      </div>`;
      break;
    case 'embed':
      html += section('Embed',`${field('URL','url')}${field('Height','height','text','400px')}${field('Border Radius','borderRadius','text','8px')}`);
      break;
    default:
      html += appearance + spacing;
      if(c.title!==undefined) html += section('Content',`${field('Title','title')}${c.subtitle!==undefined?field('Subtitle','subtitle'):''}${colorField('Text Color','textColor')}`);
  }

  html += section('Size & Position',
    `${field('Width (e.g. 100%, 320px, auto)','compWidth','text')}
    ${field('Height (e.g. 400px — blank = auto)','compHeight','text')}
    <div class="flex items-center justify-between mt-2">
      <span class="font-label-caps text-label-caps text-on-surface-variant">Absolute (overlap)</span>
      <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" ${c.positionAbsolute?'checked':''} onchange="updateCompProp('${c.id}','positionAbsolute',this.checked)" class="sr-only peer">
        <div class="w-9 h-5 bg-outline-variant peer-checked:bg-primary rounded-full transition-colors"></div>
      </label>
    </div>
    ${c.positionAbsolute ? field('Left (px)','left','number') + field('Top (px)','top','number') + field('Z-Index','zIndex','number') : ''}`
  );

  html += `<button onclick="removeComp('${c.id}')" class="w-full mt-2 py-2 text-error border border-error/20 rounded-lg hover:bg-error/10 transition-colors font-body-sm text-body-sm flex items-center justify-center gap-2">
    <span class="material-symbols-outlined text-[16px]">delete</span> Delete component
  </button>`;

  panel.innerHTML = html;
}

function updateCompProp(id, key, value) {
  const comp = findComp(id);
  if(!comp) return;
  pushUndo();
  comp[key] = value;
  markDirty();
  renderCanvas();
  _syncComp(comp);
}

function escA(s){return String(s||'').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

// ── Async sync helpers ────────────────────────────────────────
function _syncComp(comp, delay=600) {
  clearTimeout(window._propDebounce);
  window._propDebounce = setTimeout(async () => {
    try {
      await editorAPI.upsertComponent(editorProject.id, comp);
    } catch {
      showToast('Auto-sync failed', 'error');
    }
  }, delay);
}

function _syncOrder(delay=600) {
  clearTimeout(window._orderDebounce);
  window._orderDebounce = setTimeout(async () => {
    try {
      await editorAPI.reorderComponents(editorProject.id, editorLayout.components.map(c=>c.id));
    } catch {
      showToast('Reorder sync failed', 'error');
    }
  }, delay);
}

function updateCompPropJSON(id, key, value) {
  try { updateCompProp(id, key, JSON.parse(value)); }
  catch { showToast('Invalid JSON — changes not applied', 'error'); }
}

function updateArrayItem(id, key, idx, field, value) {
  const comp = findComp(id);
  if (!comp) return;
  pushUndo();
  const arr = JSON.parse(JSON.stringify(comp[key] || []));
  arr[idx] = { ...arr[idx], [field]: value };
  comp[key] = arr;
  markDirty(); renderCanvas(); renderPropertiesPanel(comp);
  _syncComp(comp);
}

function updateArrayItemJSON(id, key, idx, field, value) {
  try { updateArrayItem(id, key, idx, field, JSON.parse(value)); }
  catch { showToast('Invalid JSON', 'error'); }
}

function addArrayItem(id, key) {
  const comp = findComp(id);
  if (!comp) return;
  const defs = ((window._arrDefs||{})[id+':'+key]) || {};
  pushUndo();
  comp[key] = [...(comp[key]||[]), JSON.parse(JSON.stringify(defs))];
  markDirty(); renderCanvas(); renderPropertiesPanel(comp);
  _syncComp(comp);
}

function removeArrayItem(id, key, idx) {
  const comp = findComp(id);
  if (!comp) return;
  pushUndo();
  comp[key] = (comp[key]||[]).filter((_,i)=>i!==idx);
  markDirty(); renderCanvas(); renderPropertiesPanel(comp);
  _syncComp(comp);
}

// ── Export Modal ──────────────────────────────────────────────
async function openExportModal() {
  const m = document.createElement('div');
  m.id='export-modal';
  m.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center';
  m.innerHTML=`<div style="background:#111A2E;border:1px solid rgba(255,255,255,0.07);border-radius:18px;width:500px;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,0.7)">
    <div style="background:linear-gradient(135deg,rgba(79,124,255,.12),rgba(34,197,94,.06));padding:20px 28px;border-bottom:1px solid #1F2A44;display:flex;align-items:center;gap:12px">
      <span class="material-symbols-outlined" style="color:#4F7CFF;font-size:22px">download</span>
      <span style="color:#E5E7EB;font-size:16px;font-weight:600;font-family:Inter">Export Project</span>
      <button onclick="document.getElementById('export-modal').remove()" style="margin-left:auto;background:none;border:none;color:#94A3B8;cursor:pointer;font-size:20px">&times;</button>
    </div>
    <div style="padding:28px">
      <p style="color:#94A3B8;font-size:14px;margin-bottom:24px;font-family:Inter">Your page will be exported as clean HTML, CSS, and JavaScript.</p>
      <div style="display:flex;gap:12px;margin-bottom:24px">
        <div style="flex:1;background:#080E1A;border:1px solid #1F2A44;border-radius:10px;padding:14px 16px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#4F7CFF;background:rgba(79,124,255,.1);padding:2px 8px;border-radius:4px;display:inline-block;margin-bottom:8px">HTML</div>
          <div style="color:#E5E7EB;font-size:13px;font-family:JetBrains Mono;font-weight:600">index.html</div>
        </div>
        <div style="flex:1;background:#080E1A;border:1px solid #1F2A44;border-radius:10px;padding:14px 16px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#4F7CFF;background:rgba(79,124,255,.1);padding:2px 8px;border-radius:4px;display:inline-block;margin-bottom:8px">CSS</div>
          <div style="color:#E5E7EB;font-size:13px;font-family:JetBrains Mono;font-weight:600">styles.css</div>
        </div>
        <div style="flex:1;background:#080E1A;border:1px solid #1F2A44;border-radius:10px;padding:14px 16px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#F59E0B;background:rgba(245,158,11,.1);padding:2px 8px;border-radius:4px;display:inline-block;margin-bottom:8px">JS</div>
          <div style="color:#E5E7EB;font-size:13px;font-family:JetBrains Mono;font-weight:600">main.js</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button onclick="doExportZip()" style="width:100%;padding:14px;background:linear-gradient(135deg,#5A84FF,#4F7CFF);color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;font-family:Inter;display:flex;align-items:center;justify-content:center;gap:8px">
          <span class="material-symbols-outlined" style="font-size:20px">download</span> Download export.zip
        </button>
        <button onclick="doExportJSON()" style="width:100%;padding:12px;background:transparent;color:#94A3B8;border:1px solid #1F2A44;border-radius:10px;font-size:14px;cursor:pointer;font-family:Inter">Preview as JSON</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(m);
}

async function doExportZip() {
  document.getElementById('export-modal')?.remove();
  showToast('Preparing export…','info');
  await exportAPI.downloadZip(editorProject.id, editorProject.slug||editorProject.id);
}

async function doExportJSON() {
  document.getElementById('export-modal')?.remove();
  showToast('Fetching export…','info');
  const data = await exportAPI.getJSON(editorProject.id);
  if(!data){showToast('Export failed','error');return;}
  const modal = document.createElement('div');
  modal.id = 'json-preview-modal';
  modal.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px';
  modal.innerHTML=`<div style="background:#111A2E;border:1px solid rgba(255,255,255,0.07);border-radius:16px;width:600px;max-height:80vh;overflow:hidden;display:flex;flex-direction:column">
    <div style="display:flex;border-bottom:1px solid #1F2A44;padding:12px 16px 0">
      ${['html','css','js'].map((t,i)=>`<button onclick="switchExportTab(this,'${t}')" style="padding:8px 16px;background:none;border:none;border-bottom:2px solid ${i===0?'#4F7CFF':'transparent'};color:${i===0?'#4F7CFF':'#94A3B8'};cursor:pointer;font-family:Inter;font-size:14px;font-weight:500;margin-bottom:-1px">${t.toUpperCase()}</button>`).join('')}
      <button onclick="document.getElementById('json-preview-modal').remove()" style="margin-left:auto;background:none;border:none;color:#94A3B8;cursor:pointer;font-size:20px;padding:8px">&times;</button>
    </div>
    <div style="flex:1;overflow:auto;background:#050B14;padding:16px">
      <pre id="export-html" style="font-family:JetBrains Mono,monospace;font-size:12px;color:#E5E7EB;line-height:1.6;white-space:pre-wrap;margin:0">${escH(data.html||'')}</pre>
      <pre id="export-css" style="display:none;font-family:JetBrains Mono,monospace;font-size:12px;color:#E5E7EB;line-height:1.6;white-space:pre-wrap;margin:0">${escH(data.css||'')}</pre>
      <pre id="export-js" style="display:none;font-family:JetBrains Mono,monospace;font-size:12px;color:#E5E7EB;line-height:1.6;white-space:pre-wrap;margin:0">${escH(data.js||'')}</pre>
    </div>
    <div style="padding:12px 16px;border-top:1px solid #1F2A44;text-align:right">
      <button onclick="copyActiveExportTab()" style="padding:8px 16px;background:#1F2A44;color:#E5E7EB;border:none;border-radius:8px;cursor:pointer;font-family:Inter;font-size:13px">Copy</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function switchExportTab(btn, tab) {
  window._activeExportTab = tab;
  btn.closest('[style]').querySelectorAll('button').forEach(b=>{ b.style.borderBottomColor='transparent';b.style.color='#94A3B8'; });
  btn.style.borderBottomColor='#4F7CFF'; btn.style.color='#4F7CFF';
  ['html','css','js'].forEach(t=>{ const el=document.getElementById('export-'+t); if(el) el.style.display=t===tab?'block':'none'; });
}

function copyActiveExportTab() {
  const tab = window._activeExportTab || 'html';
  const el = document.getElementById('export-' + tab);
  const text = el ? el.textContent : '';
  navigator.clipboard.writeText(text).then(()=>showToast('Copied!','success')).catch(()=>showToast('Copy failed','error'));
}

// ── Settings Modal ────────────────────────────────────────────
async function openSettingsModal() {
  if (!editorProject) return;
  if (document.getElementById('settings-modal')) return;
  const p = editorProject;
  const modal = document.createElement('div');
  modal.id='settings-modal';
  modal.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px';
  modal.innerHTML=`
  <div style="background:rgba(17,26,46,.95);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.07);border-radius:18px;width:600px;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 40px 100px rgba(0,0,0,0.7);overflow:hidden">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #1F2A44">
      <div style="display:flex;align-items:center;gap:10px">
        <span class="material-symbols-outlined" style="color:#4F7CFF;font-size:20px;font-variation-settings:'FILL' 1">settings</span>
        <span style="color:#E5E7EB;font-size:18px;font-weight:600;font-family:Inter">Project Settings</span>
      </div>
      <button onclick="document.getElementById('settings-modal').remove()" style="background:none;border:none;color:#94A3B8;cursor:pointer;font-size:20px">&times;</button>
    </div>
    <div style="display:flex;flex:1;overflow:hidden">
      <!-- Sidebar tabs -->
      <div style="width:180px;border-right:1px solid #1F2A44;padding:12px;display:flex;flex-direction:column;gap:4px;background:rgba(8,14,26,.3)">
        ${[['general','settings','General'],['seo','search','SEO'],['sharing','share','Sharing'],['theme','palette','Theme'],['danger','report_problem','Danger Zone']].map(([k,icon,label],i)=>`
        <button onclick="switchSettingsTab('${k}')" id="stab-${k}" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;border:none;background:${i===0?'rgba(79,124,255,.1)':'transparent'};color:${i===0?'#4F7CFF':k==='danger'?'#EF4444':'#94A3B8'};cursor:pointer;font-family:Inter;font-size:14px;text-align:left;width:100%;${i===0?'font-weight:500':''}">
          <span class="material-symbols-outlined" style="font-size:18px">${icon}</span>${label}
        </button>`).join('')}
      </div>
      <!-- Content -->
      <div style="flex:1;overflow-y:auto;padding:24px" id="settings-content">
        ${renderSettingsTab('general', p)}
      </div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid #1F2A44">
      <button onclick="document.getElementById('settings-modal').remove()" style="padding:10px 20px;border:1px solid #1F2A44;background:transparent;color:#E5E7EB;border-radius:8px;cursor:pointer;font-family:Inter;font-size:14px">Cancel</button>
      <button onclick="saveSettings()" style="padding:10px 24px;background:#4F7CFF;color:white;border:none;border-radius:8px;cursor:pointer;font-family:Inter;font-size:14px;font-weight:600">Save Changes</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function switchSettingsTab(tab) {
  document.querySelectorAll('[id^="stab-"]').forEach(b=>{
    const k=b.id.replace('stab-','');
    b.style.background=k===tab?'rgba(79,124,255,.1)':'transparent';
    b.style.color=k===tab?'#4F7CFF':k==='danger'?'#EF4444':'#94A3B8';
    b.style.fontWeight=k===tab?'500':'400';
  });
  document.getElementById('settings-content').innerHTML=renderSettingsTab(tab, editorProject);
}

function renderSettingsTab(tab, p) {
  const inp=(id,label,val,type='text',note='')=>`<div style="margin-bottom:16px"><label style="display:block;color:#94A3B8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;font-family:Inter">${label}</label><input id="${id}" type="${type}" value="${escA(val||'')}" style="width:100%;background:#0F1729;border:1px solid #1F2A44;border-radius:8px;padding:10px 14px;color:#E5E7EB;font-size:14px;font-family:Inter;outline:none;box-sizing:border-box" onfocus="this.style.borderColor='#4F7CFF'" onblur="this.style.borderColor='#1F2A44'">${note?`<p style="color:#94A3B8;font-size:12px;margin-top:4px">${note}</p>`:''}</div>`;
  const ta=(id,label,val,rows=3)=>`<div style="margin-bottom:16px"><label style="display:block;color:#94A3B8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;font-family:Inter">${label}</label><textarea id="${id}" rows="${rows}" style="width:100%;background:#0F1729;border:1px solid #1F2A44;border-radius:8px;padding:10px 14px;color:#E5E7EB;font-size:14px;font-family:Inter;outline:none;resize:none;box-sizing:border-box" onfocus="this.style.borderColor='#4F7CFF'" onblur="this.style.borderColor='#1F2A44'">${escA(val||'')}</textarea></div>`;
  const meta = p.meta||{};

  if(tab==='general') return `
    ${inp('s-title','Project Name',p.title)}
    ${ta('s-desc','Description',p.description)}
    <div style="margin-bottom:16px"><label style="display:block;color:#94A3B8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;font-family:Inter">Status</label>
    <div style="display:flex;background:#080E1A;border:1px solid #1F2A44;border-radius:8px;padding:3px;gap:2px">
      ${['draft','published','archived'].map(s=>`<button onclick="document.querySelectorAll('[data-status]').forEach(b=>{b.style.background='transparent';b.style.color='#94A3B8'});this.style.background='#1F2A44';this.style.color='#E5E7EB';document.getElementById('s-status').value=this.dataset.status" data-status="${s}" style="flex:1;padding:7px;background:${p.status===s?'#1F2A44':'transparent'};color:${p.status===s?'#E5E7EB':'#94A3B8'};border:none;border-radius:6px;cursor:pointer;font-family:Inter;font-size:13px;text-transform:capitalize">${s}</button>`).join('')}
    </div>
    <input type="hidden" id="s-status" value="${p.status}">
    </div>`;

  if(tab==='seo') return `
    ${inp('s-meta-title','Page Title (SEO)',meta.title,'text','Shown in browser tab and search results')}
    ${ta('s-meta-desc','Meta Description',meta.description)}
    ${inp('s-meta-lang','Language',meta.lang||'en','text','e.g. en, ro, fr')}
    ${inp('s-meta-author','Author',meta.author)}
    ${inp('s-meta-og','OG Image URL',meta.ogImage,'url')}
    <div style="margin-bottom:16px"><label style="display:block;color:#94A3B8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;font-family:Inter">Custom CSS</label>
    <textarea id="s-custom-css" rows="5" style="width:100%;background:#0F1729;border:1px solid #1F2A44;border-radius:8px;padding:10px 14px;color:#E5E7EB;font-size:13px;font-family:JetBrains Mono,monospace;outline:none;resize:vertical;box-sizing:border-box">${escA(meta.customCSS||'')}</textarea></div>
    <div style="margin-bottom:16px"><label style="display:block;color:#94A3B8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;font-family:Inter">Custom JS</label>
    <textarea id="s-custom-js" rows="4" style="width:100%;background:#0F1729;border:1px solid #1F2A44;border-radius:8px;padding:10px 14px;color:#E5E7EB;font-size:13px;font-family:JetBrains Mono,monospace;outline:none;resize:vertical;box-sizing:border-box">${escA(meta.customJS||'')}</textarea></div>`;

  if(tab==='sharing') {
    const isPublic = p.is_public;
    const shareUrl = `${window.location.origin}/#/share/${p.share_token}`;
    return `<div style="margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div><span style="color:#E5E7EB;font-size:15px;font-weight:600;font-family:Inter">Enable public sharing</span><p style="color:#94A3B8;font-size:13px;margin-top:4px">Anyone with the link can view a read-only version</p></div>
        <label style="position:relative;display:inline-flex;align-items:center;cursor:pointer">
          <input type="checkbox" id="s-public" ${isPublic?'checked':''} onchange="togglePublicShare(this)" style="opacity:0;width:0;height:0;position:absolute">
          <div id="toggle-track" style="width:44px;height:24px;background:${isPublic?'#22C55E':'#1F2A44'};border-radius:999px;transition:.2s;position:relative">
            <div style="position:absolute;top:3px;left:${isPublic?'23px':'3px'};width:18px;height:18px;background:white;border-radius:50%;transition:.2s"></div>
          </div>
        </label>
      </div>
      ${isPublic?`<div style="background:#122131;border:1px solid #1F2A44;border-radius:8px;padding:14px">
        <label style="color:#94A3B8;font-size:12px;font-weight:600;text-transform:uppercase;margin-bottom:8px;display:block">Public Link</label>
        <div style="display:flex;gap:8px">
          <input readonly value="${shareUrl}" id="share-url-input" style="flex:1;background:#0F1729;border:1px solid #1F2A44;border-radius:6px;padding:8px 12px;color:#E5E7EB;font-size:13px;font-family:JetBrains Mono;outline:none">
          <button onclick="navigator.clipboard.writeText('${shareUrl}');showToast('Copied!','success')" style="padding:8px 14px;background:#1F2A44;border:none;border-radius:6px;color:#E5E7EB;cursor:pointer;font-family:Inter;font-size:13px">Copy</button>
        </div>
        <button onclick="doRegenerateToken()" style="margin-top:10px;background:none;border:none;color:#94A3B8;cursor:pointer;font-family:Inter;font-size:13px;display:flex;align-items:center;gap:6px">
          <span class="material-symbols-outlined" style="font-size:16px">refresh</span> Regenerate link (invalidates old)
        </button>
      </div>`:``}
    </div>`;
  }

  if(tab==='theme') return `
    <p style="color:#94A3B8;font-size:13px;margin-bottom:20px;font-family:Inter;display:flex;align-items:center;gap:6px"><span class="material-symbols-outlined" style="font-size:16px">info</span>These settings affect CSS variables in the exported page.</p>
    ${inp('s-primary','Primary Color',meta.primaryColor||'#4F7CFF','color')}
    ${inp('s-text-color','Text Color',meta.textColor||'#1a1a1a','color')}
    ${inp('s-bg-color','Background Color',meta.bgColor||'#ffffff','color')}
    ${inp('s-font','Font Family',meta.fontFamily||"'Inter', sans-serif",'text')}
    ${inp('s-font-url','Google Fonts URL',meta.fontUrl||'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap')}
    ${inp('s-max-w','Max Width',meta.maxWidth||'1200px')}
    ${inp('s-section-py','Section Padding',meta.sectionPadding||'80px')}`;

  if(tab==='danger') return `
    <div style="border:1px solid rgba(239,68,68,.25);background:rgba(239,68,68,.03);border-radius:12px;padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px">
        <div><span style="color:#EF4444;font-size:15px;font-weight:500;font-family:Inter">Delete project</span><p style="color:#94A3B8;font-size:13px;margin-top:4px">Permanently removes all versions and data. Cannot be undone.</p></div>
        <button onclick="confirmDeleteProject()" style="padding:10px 16px;border:1px solid rgba(239,68,68,.4);background:transparent;color:#EF4444;border-radius:8px;cursor:pointer;font-family:Inter;font-size:13px;font-weight:600;white-space:nowrap">Delete project</button>
      </div>
    </div>`;

  return '';
}

async function saveSettings() {
  const payload = {};
  const metaPayload = {};
  const tv = id=>document.getElementById(id)?.value;

  if(tv('s-title')) payload.title = tv('s-title');
  if(tv('s-desc')!==undefined) payload.description = tv('s-desc');
  if(tv('s-status')) payload.status = tv('s-status');

  // SEO
  if(tv('s-meta-title')) metaPayload.title=tv('s-meta-title');
  if(tv('s-meta-desc')!==undefined) metaPayload.description=tv('s-meta-desc');
  if(tv('s-meta-lang')) metaPayload.lang=tv('s-meta-lang');
  if(tv('s-meta-author')) metaPayload.author=tv('s-meta-author');
  if(tv('s-meta-og')) metaPayload.ogImage=tv('s-meta-og');
  if(tv('s-custom-css')!==undefined) metaPayload.customCSS=tv('s-custom-css');
  if(tv('s-custom-js')!==undefined) metaPayload.customJS=tv('s-custom-js');

  // Theme
  if(tv('s-primary')) metaPayload.primaryColor=tv('s-primary');
  if(tv('s-text-color')) metaPayload.textColor=tv('s-text-color');
  if(tv('s-bg-color')) metaPayload.bgColor=tv('s-bg-color');
  if(tv('s-font')) metaPayload.fontFamily=tv('s-font');
  if(tv('s-font-url')) metaPayload.fontUrl=tv('s-font-url');
  if(tv('s-max-w')) metaPayload.maxWidth=tv('s-max-w');
  if(tv('s-section-py')) metaPayload.sectionPadding=tv('s-section-py');

  if(Object.keys(metaPayload).length) payload.meta={...(editorProject.meta||{}),...metaPayload};

  if(Object.keys(payload).length) {
    const data = await projectsAPI.update(editorProject.id, payload);
    if(data?.id) {
      Object.assign(editorProject, data);
      document.getElementById('project-title-text').textContent = editorProject.title;
      showToast('Settings saved!','success');
      document.getElementById('settings-modal')?.remove();
    } else {
      showToast('Failed to save settings','error');
    }
  } else {
    document.getElementById('settings-modal')?.remove();
  }
}

async function togglePublicShare(checkbox) {
  const data = await projectsAPI.togglePublic(editorProject.id);
  if(data) { editorProject.is_public=data.is_public; editorProject.share_token=data.share_token; showToast(data.is_public?'Sharing enabled':'Sharing disabled','success'); switchSettingsTab('sharing'); }
  else { checkbox.checked=!checkbox.checked; showToast('Failed to update sharing','error'); }
}

async function doRegenerateToken() {
  showConfirm('This will invalidate the existing share link. Continue?', async ()=>{
    const data = await projectsAPI.regenerateToken(editorProject.id);
    if(data) { editorProject.share_token=data.share_token; showToast('New link generated','success'); switchSettingsTab('sharing'); }
    else showToast('Failed','error');
  }, false);
}

async function confirmDeleteProject() {
  showConfirm(`Permanently delete "<strong>${editorProject.title}</strong>"? This cannot be undone.`, async ()=>{
    try {
      await projectsAPI.delete(editorProject.id);
      document.getElementById('settings-modal')?.remove();
      showToast('Project deleted','success');
      router.go('/dashboard');
    } catch {
      showToast('Failed to delete project','error');
    }
  }, true);
}
