// ── Editor Page ───────────────────────────────────────────────
let editorProject = null;
let editorLayout = { components: [] };
let selectedId = null;
let isDirty = false;
let undoStack = [];
let redoStack = [];
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
  redoStack = [];

  document.getElementById('app').innerHTML = `
  <div style="background:#030B14;color:#E8F4FD;font-family:Inter,system-ui,sans-serif;height:100vh;width:100vw;overflow:hidden;display:flex;flex-direction:column">

    <!-- ── TOP NAVBAR ─────────────────────────────────────────── -->
    <nav style="background:rgba(5,11,22,0.97);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid rgba(0,229,255,.08);position:fixed;top:0;width:100%;z-index:50;display:flex;justify-content:space-between;align-items:center;height:56px;padding:0 20px;box-shadow:0 4px 24px rgba(0,0,0,.5)">
      <!-- Left: back + title -->
      <div style="display:flex;align-items:center;gap:16px">
        <button onclick="backToDashboard()" style="display:flex;align-items:center;gap:6px;background:none;border:none;color:#64748B;cursor:pointer;font-size:13px;font-family:Inter;padding:6px 10px;border-radius:8px;transition:all .15s" onmouseover="this.style.background='rgba(0,229,255,.06)';this.style.color='#00E5FF'" onmouseout="this.style.background='none';this.style.color='#64748B'">
          <span class="material-symbols-outlined" style="font-size:16px">arrow_back</span> Dashboard
        </button>
        <div style="width:1px;height:20px;background:rgba(255,255,255,.07)"></div>
        <!-- Logo chip -->
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#00C4DD,#006FE8);display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(0,229,255,.3)">
            <span class="material-symbols-outlined" style="color:white;font-size:14px;font-variation-settings:'FILL' 1">architecture</span>
          </div>
          <div id="project-title-display" style="display:flex;align-items:center;gap:6px;cursor:pointer" onclick="editTitle()" onmouseover="this.querySelector('.edit-icon').style.opacity='1'" onmouseout="this.querySelector('.edit-icon').style.opacity='0'">
            <span id="project-title-text" style="color:#E8F4FD;font-weight:700;font-size:14px">Loading…</span>
            <span class="material-symbols-outlined edit-icon" style="font-size:13px;color:#4B5563;opacity:0;transition:opacity .15s">edit</span>
          </div>
        </div>
      </div>

      <!-- Center: device toggle + zoom -->
      <div style="display:flex;align-items:center;background:rgba(6,15,26,.8);border:1px solid rgba(0,229,255,.1);border-radius:10px;padding:3px 6px;gap:2px">
        <button id="dev-desktop" onclick="setDevice('desktop')" title="Desktop (1200px)" style="display:flex;align-items:center;gap:4px;padding:4px 8px;border:none;border-radius:7px;cursor:pointer;background:rgba(0,229,255,.12);color:#00E5FF;transition:all .15s;font-family:Inter">
          <span class="material-symbols-outlined" style="font-size:16px">desktop_windows</span>
        </button>
        <button id="dev-tablet" onclick="setDevice('tablet')" title="Tablet (768px)" style="display:flex;align-items:center;gap:4px;padding:4px 8px;border:none;border-radius:7px;cursor:pointer;background:transparent;color:#4B5563;transition:all .15s;font-family:Inter">
          <span class="material-symbols-outlined" style="font-size:16px">tablet_mac</span>
        </button>
        <button id="dev-mobile" onclick="setDevice('mobile')" title="Mobile (375px)" style="display:flex;align-items:center;gap:4px;padding:4px 8px;border:none;border-radius:7px;cursor:pointer;background:transparent;color:#4B5563;transition:all .15s;font-family:Inter">
          <span class="material-symbols-outlined" style="font-size:16px">smartphone</span>
        </button>
        <div style="width:1px;height:14px;background:rgba(0,229,255,.1);margin:0 4px"></div>
        <span id="device-width-label" style="font-size:11px;color:#4B5563;font-family:JetBrains Mono,monospace">1200px</span>
        <div style="width:1px;height:14px;background:rgba(0,229,255,.1);margin:0 4px"></div>
        <span id="zoom-label" style="font-size:11px;color:#4B5563;font-family:JetBrains Mono,monospace">100%</span>
      </div>

      <!-- Right: actions -->
      <div style="display:flex;align-items:center;gap:6px">
        <button id="undo-btn" onclick="editorUndo()" title="Undo (Ctrl+Z)" disabled style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:none;border:none;color:#2D3F52;cursor:not-allowed;border-radius:8px;transition:all .15s">
          <span class="material-symbols-outlined" style="font-size:18px">undo</span>
        </button>
        <button id="redo-btn" onclick="editorRedo()" title="Redo (Ctrl+Y)" disabled style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:none;border:none;color:#2D3F52;cursor:not-allowed;border-radius:8px;transition:all .15s">
          <span class="material-symbols-outlined" style="font-size:18px">redo</span>
        </button>
        <div style="width:1px;height:20px;background:rgba(255,255,255,.06)"></div>
        <button onclick="openExportModal()" style="display:flex;align-items:center;gap:5px;padding:6px 12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#94A3B8;font-size:13px;font-family:Inter;cursor:pointer;transition:all .15s" onmouseover="this.style.background='rgba(255,255,255,.08)';this.style.color='#E8F4FD'" onmouseout="this.style.background='rgba(255,255,255,.04)';this.style.color='#94A3B8'">
          <span class="material-symbols-outlined" style="font-size:15px">download</span> Export
        </button>
        <button onclick="openSettingsModal()" style="display:flex;align-items:center;gap:5px;padding:6px 12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#94A3B8;font-size:13px;font-family:Inter;cursor:pointer;transition:all .15s" onmouseover="this.style.background='rgba(255,255,255,.08)';this.style.color='#E8F4FD'" onmouseout="this.style.background='rgba(255,255,255,.04)';this.style.color='#94A3B8'">
          <span class="material-symbols-outlined" style="font-size:15px">settings</span>
        </button>
        <button id="save-btn" onclick="saveLayout()" class="btn-neon" style="display:flex;align-items:center;gap:6px;padding:7px 16px;border:none;color:white;font-size:13px;font-weight:700;font-family:Inter;border-radius:8px;cursor:pointer">
          <span class="material-symbols-outlined" style="font-size:15px">save</span> Save
        </button>
        <div id="save-status" style="display:flex;align-items:center;gap:5px;margin-left:4px">
          <span style="width:7px;height:7px;border-radius:50%;background:#374151" id="save-dot"></span>
          <span style="font-size:11px;color:#374151;font-family:JetBrains Mono" id="save-text">Saved</span>
        </div>
      </div>
    </nav>

    <!-- ── WORKSPACE ───────────────────────────────────────────── -->
    <div style="display:flex;flex:1;padding-top:56px;height:100%">

      <!-- ── LEFT SIDEBAR ───────────────────────────────────────── -->
      <aside style="background:#060F1A;border-right:1px solid rgba(0,229,255,.07);position:fixed;left:0;top:56px;bottom:0;width:240px;display:flex;flex-direction:column;z-index:40">
        <!-- Project info -->
        <div style="padding:14px 14px 10px;border-bottom:1px solid rgba(0,229,255,.06)">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,rgba(0,196,221,.15),rgba(0,111,232,.15));border:1px solid rgba(0,229,255,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <span class="material-symbols-outlined" style="font-size:16px;color:#00E5FF">web</span>
            </div>
            <div style="min-width:0">
              <div style="color:#E8F4FD;font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" id="sidebar-project-name">Project</div>
              <div style="color:#374151;font-size:10px;font-family:JetBrains Mono;letter-spacing:.06em">DRAG TO CANVAS</div>
            </div>
          </div>
          <!-- Tab switcher -->
          <div style="display:flex;gap:4px;margin-top:10px;background:#030B14;border:1px solid rgba(0,229,255,.07);border-radius:8px;padding:3px">
            <button id="tab-comp" onclick="switchLibTab('comp')" style="flex:1;padding:6px;font-size:11px;font-weight:600;border-radius:6px;border:1px solid rgba(0,229,255,.2);background:rgba(0,229,255,.1);color:#00E5FF;cursor:pointer;font-family:Inter;transition:all .15s">Components</button>
            <button id="tab-layers" onclick="switchLibTab('layers')" style="flex:1;padding:6px;font-size:11px;font-weight:600;border-radius:6px;border:none;background:transparent;color:#374151;cursor:pointer;font-family:Inter;transition:all .15s">Layers</button>
          </div>
        </div>
        <!-- Component library -->
        <div id="lib-components" style="flex:1;overflow-y:auto;padding:8px">
          ${renderComponentLibrary()}
        </div>
        <div id="lib-layers" style="display:none;flex:1;overflow-y:auto;padding:8px">
        </div>
      </aside>

      <!-- ── CANVAS ─────────────────────────────────────────────── -->
      <main style="margin-left:240px;margin-right:280px;flex:1;display:flex;flex-direction:column;position:relative;overflow:hidden;background:#030B14">
        <!-- Canvas toolbar -->
        <div style="height:38px;border-bottom:1px solid rgba(0,229,255,.06);display:flex;align-items:center;padding:0 16px;justify-content:space-between;background:rgba(6,15,26,.7);backdrop-filter:blur(12px);position:absolute;top:0;width:100%;z-index:10;box-sizing:border-box">
          <div style="display:flex;align-items:center;gap:6px;color:#374151;font-size:11px;font-family:JetBrains Mono">
            <span class="material-symbols-outlined" style="font-size:14px">mouse</span>
            <span id="canvas-hint">Select or drag a component</span>
          </div>
          <span id="grid-toggle-btn" onclick="toggleCanvasGrid()" style="display:flex;align-items:center;gap:4px;cursor:pointer;color:#374151;font-size:11px;font-family:JetBrains Mono;transition:color .15s;user-select:none" onmouseover="this.style.color='#00E5FF'" onmouseout="this.style.color='#374151'">
            <span class="material-symbols-outlined" style="font-size:14px">grid_on</span> GRID
          </span>
        </div>
        <!-- Scrollable canvas area -->
        <div style="flex:1;margin-top:38px;overflow:auto;display:flex;justify-content:center;align-items:flex-start;background:#030B14;background-image:linear-gradient(rgba(0,229,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.018) 1px,transparent 1px);background-size:32px 32px" id="canvas-scroll">
          <div id="canvas-wrapper" style="padding:40px;min-height:100%">
            <div id="canvas-frame" style="background:white;border-radius:4px;box-shadow:0 0 0 1px rgba(0,229,255,.15),0 24px 80px rgba(0,0,0,.7),0 4px 16px rgba(0,0,0,.4);position:relative;transition:width .3s ease;width:1200px;min-height:800px;transform-origin:top center">
              <div id="canvas-empty" style="position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center">
                <div style="border:2px dashed rgba(0,229,255,.2);border-radius:16px;padding:48px 40px;text-align:center">
                  <div style="width:56px;height:56px;border-radius:14px;background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.15);display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
                    <span class="material-symbols-outlined" style="font-size:28px;color:rgba(0,229,255,.4)">add_circle</span>
                  </div>
                  <p style="color:#374151;font-size:14px;font-family:Inter;margin:0">Drag a component from the left panel<br/>or click to add</p>
                </div>
              </div>
              <div id="canvas-components" style="display:flex;flex-wrap:wrap;align-items:flex-start;position:relative;min-height:800px"></div>
            </div>
          </div>
        </div>
      </main>

      <!-- ── RIGHT PANEL ─────────────────────────────────────────── -->
      <aside style="width:280px;background:#060F1A;border-left:1px solid rgba(0,229,255,.07);display:flex;flex-direction:column;position:fixed;right:0;top:56px;bottom:0;z-index:20">
        <div style="display:flex;border-bottom:1px solid rgba(0,229,255,.07);padding:4px 8px 0;gap:2px;background:#060F1A">
          <button style="padding:8px 14px;font-size:12px;font-weight:600;font-family:Inter;border:none;background:transparent;color:#00E5FF;border-bottom:2px solid #00E5FF;cursor:pointer;margin-bottom:-1px">Design</button>
          <button onclick="openExportModal()" style="padding:8px 14px;font-size:12px;font-weight:600;font-family:Inter;border:none;background:transparent;color:#374151;border-bottom:2px solid transparent;cursor:pointer;transition:color .15s" onmouseover="this.style.color='#94A3B8'" onmouseout="this.style.color='#374151'">Export</button>
        </div>
        <div id="properties-panel" style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:12px">
          <div style="text-align:center;color:#374151;font-size:13px;margin-top:32px;display:flex;flex-direction:column;align-items:center;gap:12px">
            <div style="width:48px;height:48px;border-radius:12px;background:rgba(0,229,255,.04);border:1px solid rgba(0,229,255,.08);display:flex;align-items:center;justify-content:center">
              <span class="material-symbols-outlined" style="font-size:24px;color:rgba(0,229,255,.25)">touch_app</span>
            </div>
            <span style="line-height:1.6">Select a component<br/>to edit its properties</span>
          </div>
        </div>
      </aside>
    </div>
  </div>`;

  // Inject cyber animation styles (once per page lifecycle)
  if (!document.getElementById('iwb-editor-styles')) {
    const st = document.createElement('style');
    st.id = 'iwb-editor-styles';
    st.textContent = `
      @keyframes iwb-drop-in {
        0%   { outline: 3px solid rgba(0,229,255,.9); outline-offset:6px; box-shadow: 0 0 0 8px rgba(0,229,255,.14), 0 0 50px rgba(0,229,255,.2); }
        55%  { outline: 2px solid rgba(0,229,255,.4); outline-offset:2px; }
        100% { outline: none; outline-offset:0; }
      }
      .iwb-comp-added { animation: iwb-drop-in .75s cubic-bezier(.2,.9,.2,1) forwards; }
      [data-comp-type] { user-select: none; }
      [data-comp-type]:active { opacity: .75; transform: scale(.98); }
    `;
    document.head.appendChild(st);
  }

  // Load project
  const project = await projectsAPI.get(projectId);
  if (!project) { showToast('Project not found','error'); router.go('/dashboard'); return; }
  editorProject = project;
  editorLayout = project.layout || { components: [] };
  document.getElementById('project-title-text').textContent = project.title;
  document.getElementById('sidebar-project-name').textContent = project.title;
  renderCanvas();
  requestAnimationFrame(fitCanvas);

  // Auto-save every 30s
  autoSaveTimer = setInterval(()=>{ if(isDirty) saveLayout(true); }, 30000);

  // Keyboard shortcuts
  document.addEventListener('keydown', handleEditorKey);
}

function renderComponentLibrary() {
  const catColors = {Layout:'#4F7CFF',Content:'#00E5FF',Media:'#8B5CF6',Interactive:'#F59E0B',Sections:'#22C55E'};
  return COMPONENT_TYPES.map(cat=>`
    <div style="margin-bottom:12px">
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${catColors[cat.cat]||'#4B5563'};padding:4px 6px 6px;font-family:JetBrains Mono">${cat.cat}</div>
      <div style="display:flex;flex-direction:column;gap:2px">
        ${cat.items.map(item=>`
          <div draggable="true" data-comp-type="${item.type}"
            ondragstart="this.style.background='rgba(0,229,255,.12)';this.style.borderColor='rgba(0,229,255,.45)';this.style.boxShadow='0 0 14px rgba(0,229,255,.18)';this.style.color='#00E5FF';dragCompStart(event,'${item.type}')"
            ondragend="this.style.background='transparent';this.style.borderColor='transparent';this.style.boxShadow='none';this.style.color='#64748B'"
            onclick="addComponent('${item.type}')"
            style="display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:8px;cursor:grab;color:#64748B;transition:all .15s;border:1px solid transparent"
            onmouseover="this.style.background='rgba(0,229,255,.05)';this.style.borderColor='rgba(0,229,255,.1)';this.style.color='#E8F4FD';this.querySelector('.drag-hint').style.opacity='0.6'"
            onmouseout="this.style.background='transparent';this.style.borderColor='transparent';this.style.color='#64748B';this.querySelector('.drag-hint').style.opacity='0.2'">
            <div style="width:26px;height:26px;border-radius:7px;background:rgba(${catColors[cat.cat]==='#4F7CFF'?'79,124,255':catColors[cat.cat]==='#00E5FF'?'0,229,255':catColors[cat.cat]==='#8B5CF6'?'139,92,246':catColors[cat.cat]==='#F59E0B'?'245,158,11':'34,197,94'},.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s">
              <span class="material-symbols-outlined" style="font-size:13px;color:${catColors[cat.cat]||'#4F7CFF'}">${item.icon}</span>
            </div>
            <span style="font-size:12px;font-family:Inter;flex:1">${item.label}</span>
            <span class="material-symbols-outlined drag-hint" style="font-size:11px;opacity:0.2;transition:opacity .15s">drag_indicator</span>
          </div>`).join('')}
      </div>
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
  requestAnimationFrame(fitCanvas);
}

// Auto-scale canvas to fit the available viewport width (like Figma/Webflow)
function fitCanvas() {
  const scroll   = document.getElementById('canvas-scroll');
  const frame    = document.getElementById('canvas-frame');
  const wrapper  = document.getElementById('canvas-wrapper');
  const zoomEl   = document.getElementById('zoom-label');
  if (!scroll || !frame || !wrapper) return;

  const pad      = 80;                          // 40px padding each side in canvas-wrapper
  const avail    = scroll.clientWidth - pad;
  const scale    = Math.min(1, avail / 1200);

  frame.style.transform       = `scale(${scale.toFixed(4)})`;
  frame.style.transformOrigin = 'top center';

  // Compensate for height loss caused by scale (transform doesn't affect flow)
  const scaledH = frame.scrollHeight * scale;
  wrapper.style.minHeight = (scaledH + pad) + 'px';

  if (zoomEl) zoomEl.textContent = Math.round(scale * 100) + '%';
}

// Keep canvas fitted on window resize
let _fitTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_fitTimer);
  _fitTimer = setTimeout(fitCanvas, 80);
});

// Types that default to full-width in the canvas
const _WIDE_TYPES = new Set(['section','container','columns','footer','navbar','banner','hero','features','pricing','testimonials','faq','cta','team','stats','cards_grid','contact','timeline','tabs','richtext','form','divider','embed','video','gallery','logo_strip','social_links','countdown','spacer','image','text','heading','blockquote','code_block']);

function renderComponentPreview(c, idx) {
  const isSelected = c.id === selectedId;
  const selStyle = isSelected ? 'outline:2px solid rgba(0,229,255,.8);outline-offset:2px;box-shadow:0 0 0 4px rgba(0,229,255,.06);' : '';
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
    style="position:absolute;top:-22px;left:-2px;background:linear-gradient(90deg,#00C4DD,#006FE8);color:white;font-size:10px;padding:2px 10px;border-radius:4px 4px 0 0;font-family:JetBrains Mono;display:flex;align-items:center;gap:4px;z-index:10;cursor:${isAbs?'move':'default'};user-select:none;box-shadow:0 0 8px rgba(0,229,255,.3)">
    ${isAbs ? '<span class="material-symbols-outlined" style="font-size:11px">drag_pan</span>' : ''}
    <span class="material-symbols-outlined" style="font-size:12px">${getCompIcon(c.type)}</span>${c.type}
  </div>` : '';

  const actions = isSelected ? `<div style="position:absolute;top:-50px;left:50%;transform:translateX(-50%);background:rgba(5,11,22,0.97);backdrop-filter:blur(12px);border:1px solid rgba(0,229,255,.15);border-radius:10px;display:flex;gap:2px;padding:4px;z-index:20;box-shadow:0 8px 24px rgba(0,0,0,.6),0 0 0 1px rgba(0,229,255,.06)">
    <button onclick="event.stopPropagation();moveComp('${c.id}',-1)" style="width:28px;height:28px;background:none;border:none;color:#64748B;cursor:pointer;border-radius:7px;display:flex;align-items:center;justify-content:center;transition:all .12s" title="Move up" onmouseover="this.style.background='rgba(0,229,255,.08)';this.style.color='#00E5FF'" onmouseout="this.style.background='none';this.style.color='#64748B'">
      <span class="material-symbols-outlined" style="font-size:16px">arrow_upward</span>
    </button>
    <button onclick="event.stopPropagation();moveComp('${c.id}',1)" style="width:28px;height:28px;background:none;border:none;color:#64748B;cursor:pointer;border-radius:7px;display:flex;align-items:center;justify-content:center;transition:all .12s" title="Move down" onmouseover="this.style.background='rgba(0,229,255,.08)';this.style.color='#00E5FF'" onmouseout="this.style.background='none';this.style.color='#64748B'">
      <span class="material-symbols-outlined" style="font-size:16px">arrow_downward</span>
    </button>
    <button onclick="event.stopPropagation();duplicateComp('${c.id}')" style="width:28px;height:28px;background:none;border:none;color:#64748B;cursor:pointer;border-radius:7px;display:flex;align-items:center;justify-content:center;transition:all .12s" title="Duplicate" onmouseover="this.style.background='rgba(0,229,255,.08)';this.style.color='#00E5FF'" onmouseout="this.style.background='none';this.style.color='#64748B'">
      <span class="material-symbols-outlined" style="font-size:16px">content_copy</span>
    </button>
    <div style="width:1px;height:20px;background:rgba(0,229,255,.1);margin:4px 2px"></div>
    <button onclick="event.stopPropagation();removeComp('${c.id}')" style="width:28px;height:28px;background:none;border:none;color:#EF4444;cursor:pointer;border-radius:7px;display:flex;align-items:center;justify-content:center;transition:all .12s" title="Delete" onmouseover="this.style.background='rgba(239,68,68,.1)'" onmouseout="this.style.background='none'">
      <span class="material-symbols-outlined" style="font-size:16px">delete</span>
    </button>
  </div>` : '';

  // Right-edge handle → drag to resize width
  const rHandle = isSelected ? `<div onmousedown="startCompResize(event,'${c.id}','w')" onclick="event.stopPropagation()" style="position:absolute;right:-5px;top:15%;bottom:15%;width:10px;cursor:ew-resize;z-index:25;display:flex;align-items:center;justify-content:center">
    <div style="width:4px;height:32px;background:#00E5FF;border-radius:2px;opacity:.9;box-shadow:0 0 8px rgba(0,229,255,.6)"></div>
  </div>` : '';

  // Bottom-edge handle → drag to resize height
  const bHandle = isSelected ? `<div onmousedown="startCompResize(event,'${c.id}','h')" onclick="event.stopPropagation()" style="position:absolute;bottom:-5px;left:15%;right:15%;height:10px;cursor:ns-resize;z-index:25;display:flex;justify-content:center;align-items:center">
    <div style="height:4px;width:32px;background:#00E5FF;border-radius:2px;opacity:.9;box-shadow:0 0 8px rgba(0,229,255,.6)"></div>
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
  switch(c.type) {
    case 'navbar': return `<nav style="display:flex;align-items:center;justify-content:space-between;padding:16px 32px;background:${c.backgroundColor||'rgba(5,11,22,.97)'};backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,229,255,.08);${c.sticky?'position:sticky;top:0;z-index:100':''}">
      <a href="${c.homeHref||'#'}" style="font-weight:800;font-size:1.2rem;color:${c.textColor||'#E8F4FD'};text-decoration:none;letter-spacing:-.02em">${c.logo||'Brand'}</a>
      <div style="display:flex;align-items:center;gap:28px">${(c.links||[]).map(l=>`<a href="${l.href||'#'}" style="color:${c.textColor||'#94A3B8'};font-size:14px;text-decoration:none">${l.label||'Link'}</a>`).join('')}</div>
      ${(c.ctaButtons||[]).length?`<div style="display:flex;gap:10px">${(c.ctaButtons||[]).map(b=>`<a href="${b.href||'#'}" style="padding:8px 18px;background:${(b.variant||'solid')==='outline'?'transparent':'linear-gradient(135deg,#00C4DD,#006FE8)'};color:white;border:${(b.variant||'solid')==='outline'?'1px solid rgba(0,229,255,.35)':'none'};border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;box-shadow:${(b.variant||'solid')!=='outline'?'0 0 16px rgba(0,229,255,.25)':'none'}">${b.label||'CTA'}</a>`).join('')}</div>`:''}
    </nav>`;
    case 'hero': return `<section style="min-height:${c.minHeight||'480px'};padding:${c.padding||'100px 48px'};background:${c.backgroundColor||'#030B14'};${c.backgroundImage?'background-image:url('+c.backgroundImage+');background-size:cover;background-position:center;':''}display:flex;align-items:center;justify-content:center;text-align:${c.layout==='centered'?'center':'left'};position:relative;overflow:hidden">
      ${!c.backgroundImage?`<div style="position:absolute;inset:0;background-image:linear-gradient(rgba(0,229,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.018) 1px,transparent 1px);background-size:40px 40px;pointer-events:none"></div><div style="position:absolute;top:20%;left:10%;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(0,229,255,.06),transparent 70%);filter:blur(60px);pointer-events:none"></div><div style="position:absolute;bottom:10%;right:5%;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(79,124,255,.08),transparent 70%);filter:blur(50px);pointer-events:none"></div>`:''}
      <div style="max-width:780px;position:relative;z-index:1">
        ${c.eyebrow?`<div style="display:inline-flex;align-items:center;gap:8px;background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.2);border-radius:999px;padding:5px 16px;margin-bottom:24px"><span style="width:6px;height:6px;border-radius:50%;background:#00E5FF;box-shadow:0 0 6px #00E5FF"></span><span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:${c.eyebrowColor||'#00E5FF'}">${c.eyebrow}</span></div>`:''}
        <h1 style="font-size:clamp(2.2rem,5vw,3.8rem);font-weight:900;line-height:1.08;color:${c.textColor||'#E8F4FD'};margin:0 0 20px;letter-spacing:-.03em">${c.title||'Your Headline Here'}</h1>
        ${c.subtitle?`<p style="font-size:1.15rem;color:${c.subtitleColor||'#64748B'};line-height:1.75;margin:0 0 36px${c.layout==='centered'?';max-width:560px;margin-left:auto;margin-right:auto':''}">${c.subtitle}</p>`:''}
        <div style="display:flex;flex-wrap:wrap;gap:12px;${c.layout==='centered'?'justify-content:center':''}">
          ${(c.buttons||[]).map(b=>`<a href="${b.href||'#'}" style="display:inline-block;padding:${{sm:'9px 20px',md:'13px 28px',lg:'16px 36px'}[b.size||'md']||'13px 28px'};background:${b.variant==='outline'?'transparent':b.backgroundColor?b.backgroundColor:'linear-gradient(135deg,#00C4DD,#006FE8)'};color:${b.textColor||'white'};border-radius:10px;font-weight:700;text-decoration:none;font-size:15px;${b.variant==='outline'?'border:1px solid rgba(0,229,255,.4);color:#00E5FF;':'border:none;box-shadow:0 0 24px rgba(0,229,255,.25)'}">${b.label||'Get Started'}</a>`).join('')}
        </div>
      </div>
    </section>`;
    case 'section': return `<section style="padding:${c.padding||'64px 40px'};background:${c.backgroundColor||'#030B14'};${c.backgroundImage?'background-image:url('+c.backgroundImage+');background-size:cover;background-position:center':''}${c.width?';width:'+c.width:''}${c.maxWidth?';max-width:'+c.maxWidth+';margin-left:auto;margin-right:auto':''}${c.minHeight?';min-height:'+c.minHeight:''}${c.height?';height:'+c.height:''}">
      ${(c.children||[]).map(getCompHTML).join('')}
    </section>`;
    case 'container': return `<div style="display:flex;flex-direction:${c.direction||'row'};gap:${c.gap||'16px'};padding:${c.padding||'0'};flex-wrap:wrap${c.width?';width:'+c.width:''}${c.maxWidth?';max-width:'+c.maxWidth+';margin-left:auto;margin-right:auto':''}${c.minHeight?';min-height:'+c.minHeight:''}${c.height?';height:'+c.height:''}">
      ${(c.children||[]).map(getCompHTML).join('')}
    </div>`;
    case 'text': return `<${c.tag||'p'} style="font-size:${c.fontSize||'16px'};font-weight:${c.fontWeight||'400'};color:${c.color||'#94A3B8'};text-align:${c.align||'left'};padding:${c.padding||'8px 0'};margin:${c.margin||'0'};line-height:1.7;font-family:Inter,sans-serif">${c.content||'Your text here'}</${c.tag||'p'}>`;
    case 'heading': return `<div style="padding:${c.padding||'16px 0'};text-align:${c.align||'left'}">
      ${c.eyebrow?`<div style="display:inline-flex;align-items:center;gap:7px;background:rgba(0,229,255,.07);border:1px solid rgba(0,229,255,.18);border-radius:999px;padding:4px 14px;margin-bottom:14px"><span style="width:5px;height:5px;border-radius:50%;background:#00E5FF"></span><span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.eyebrowColor||'#00E5FF'}">${c.eyebrow}</span></div>`:''}
      <${c.tag||'h2'} style="font-size:clamp(1.75rem,3.5vw,2.75rem);font-weight:900;line-height:1.12;color:${c.titleColor||'#E8F4FD'};margin:0 0 12px;letter-spacing:-.025em;font-family:Inter,sans-serif">${c.title||'Section Title'}</${c.tag||'h2'}>
      ${c.subtitle?`<p style="font-size:1.1rem;color:${c.subtitleColor||'#64748B'};line-height:1.7;max-width:600px;margin:0${c.align==='center'?';margin-left:auto;margin-right:auto':''};font-family:Inter,sans-serif">${c.subtitle}</p>`:''}
    </div>`;
    case 'image': return `<div style="padding:${c.margin||'0'}">
      ${c.src?`<img src="${c.src}" alt="${c.alt||''}" style="width:${c.width||'100%'};border-radius:${c.borderRadius||'8px'};display:block;box-shadow:0 0 0 1px rgba(0,229,255,.1),0 8px 32px rgba(0,0,0,.4)" loading="lazy">`:`<div style="background:#060F1A;border:1px dashed rgba(0,229,255,.2);border-radius:${c.borderRadius||'8px'};width:${c.width||'100%'};height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#374151"><span class="material-symbols-outlined" style="font-size:40px;color:rgba(0,229,255,.3)">image</span><span style="font-size:12px;font-family:Inter">Add image URL in properties</span></div>`}
      ${c.caption?`<p style="text-align:center;font-size:13px;color:#4B5563;margin-top:8px;font-family:Inter">${c.caption}</p>`:''}
    </div>`;
    case 'button': return `<div style="padding:10px 0"><a href="${c.href||'#'}" style="display:inline-block;padding:${{sm:'9px 18px',md:'13px 26px',lg:'16px 34px',xl:'18px 42px'}[c.size||'md']||'13px 26px'};background:${c.variant==='outline'?'transparent':c.backgroundColor?c.backgroundColor:'linear-gradient(135deg,#00C4DD,#006FE8)'};color:${c.textColor||'white'};border-radius:${c.borderRadius||'9px'};border:${c.variant==='outline'?'1px solid rgba(0,229,255,.4)':'none'};font-weight:700;text-decoration:none;font-family:Inter,sans-serif;font-size:15px;letter-spacing:-.01em;${c.variant!=='outline'&&!c.backgroundColor?'box-shadow:0 0 22px rgba(0,229,255,.25),0 4px 16px rgba(0,100,220,.25)':''}${c.fullWidth?';display:block;text-align:center':''}">${c.label||'Button'}</a></div>`;
    case 'divider': return `<div style="height:${c.thickness||1}px;background:${c.style==='dashed'?'none':c.color?c.color:'linear-gradient(90deg,transparent,rgba(0,229,255,.3),transparent)'};${c.style==='dashed'?'border-top:1px dashed '+(c.color||'rgba(0,229,255,.25)'):''}margin:${c.margin||'16px 0'}"></div>`;
    case 'spacer': return `<div style="height:${c.height||32}px"></div>`;
    case 'features': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#030B14'}">
      ${c.title?`<div style="text-align:${c.align||'left'};margin-bottom:52px">
        <h2 style="font-size:clamp(1.8rem,3vw,2.5rem);font-weight:900;color:#E8F4FD;margin:0 0 12px;letter-spacing:-.025em;font-family:Inter,sans-serif">${c.title}</h2>
        ${c.subtitle?`<p style="color:#64748B;font-size:1.1rem;font-family:Inter;line-height:1.7;max-width:560px;margin:0${c.align==='center'?';margin-left:auto;margin-right:auto':''}">${c.subtitle}</p>`:''}
      </div>`:''}
      <div style="display:grid;grid-template-columns:repeat(${c.columns||3},1fr);gap:${c.gap||'20px'}">
        ${(c.items||[]).map(item=>`<div style="padding:28px;background:${c.cardBackground||'#060F1A'};border-radius:16px;border:${c.cardBorder?'1px solid '+c.cardBorder:'1px solid rgba(0,229,255,.08)'};transition:border-color .2s;position:relative;overflow:hidden">
          <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.2),transparent)"></div>
          ${item.icon?`<div style="width:48px;height:48px;background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.15);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:18px;font-size:22px">${item.icon}</div>`:''}
          <h3 style="font-size:17px;font-weight:700;margin:0 0 10px;color:#E8F4FD;font-family:Inter,sans-serif;letter-spacing:-.01em">${item.title||''}</h3>
          <p style="font-size:14px;color:#64748B;line-height:1.7;margin:0;font-family:Inter,sans-serif">${item.description||''}</p>
        </div>`).join('')}
      </div>
    </section>`;
    case 'footer': return `<footer style="padding:56px 40px 32px;background:${c.backgroundColor||'#030B14'};border-top:1px solid rgba(0,229,255,.08);position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.3),transparent)"></div>
      <div style="max-width:1200px;margin:0 auto">
        <div style="font-size:1.3rem;font-weight:800;color:${c.logoColor||c.textColor||'#E8F4FD'};margin-bottom:10px;letter-spacing:-.02em;font-family:Inter,sans-serif">${c.logo||'Brand'}</div>
        ${c.description?`<p style="font-size:14px;color:${c.textColor||'#4B5563'};max-width:280px;line-height:1.7;margin:0 0 32px;font-family:Inter,sans-serif">${c.description}</p>`:''}
        <div style="display:flex;gap:48px;margin-top:${c.description?'0':'32px'};flex-wrap:wrap">
          ${(c.columns||[]).map(col=>`<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#00E5FF;margin-bottom:16px;font-family:JetBrains Mono,monospace">${col.title||''}</div>
          <div style="display:flex;flex-direction:column;gap:10px">${(col.links||[]).map(l=>`<a href="${l.href||'#'}" style="color:${c.textColor||'#4B5563'};font-size:14px;text-decoration:none;font-family:Inter;transition:color .15s">${l.label||''}</a>`).join('')}</div></div>`).join('')}
        </div>
        <div style="border-top:1px solid rgba(0,229,255,.07);margin-top:40px;padding-top:24px;font-size:13px;color:#374151;font-family:Inter,sans-serif">${c.copyright||'© 2025 All rights reserved.'}</div>
      </div>
    </footer>`;
    case 'pricing': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#030B14'}">
      ${c.title?`<div style="text-align:${c.align||'center'};margin-bottom:52px">
        <h2 style="font-size:clamp(1.8rem,3vw,2.5rem);font-weight:900;color:#E8F4FD;margin:0 0 12px;letter-spacing:-.025em;font-family:Inter,sans-serif">${c.title}</h2>
        ${c.subtitle?`<p style="color:#64748B;font-size:1.05rem;margin:0;font-family:Inter,sans-serif;line-height:1.7">${c.subtitle}</p>`:''}
      </div>`:''}
      <div style="display:grid;grid-template-columns:repeat(${Math.min((c.plans||[]).length,3)||1},1fr);gap:20px;max-width:960px;margin:0 auto">
        ${(c.plans||[]).map(p=>`<div style="padding:32px;border-radius:18px;background:#060F1A;border:${(p.popular||p.highlighted)?'1px solid '+(p.accentColor||'#00E5FF'):'1px solid rgba(0,229,255,.08)'};position:relative;${(p.popular||p.highlighted)?'box-shadow:0 0 40px rgba(0,229,255,.08);':''}overflow:hidden">
          ${(p.popular||p.highlighted)?`<div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${p.accentColor||'#00E5FF'},transparent)"></div><div style="position:absolute;top:16px;right:16px;background:linear-gradient(135deg,#00C4DD,#006FE8);color:white;padding:3px 12px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.05em">${p.popularLabel||'POPULAR'}</div>`:''}
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${p.accentColor||'#00E5FF'};font-family:JetBrains Mono;margin-bottom:12px">${p.name||'Plan'}</div>
          <div style="font-size:3rem;font-weight:900;color:#E8F4FD;line-height:1;letter-spacing:-.03em;font-family:Inter,sans-serif">${p.currency||'$'}${p.price||'0'}<span style="font-size:1rem;font-weight:400;color:#374151">${p.period||'/mo'}</span></div>
          ${p.description?`<p style="font-size:14px;color:#4B5563;margin:12px 0 0;font-family:Inter;line-height:1.6">${p.description}</p>`:''}
          <div style="border-top:1px solid rgba(0,229,255,.06);margin:20px 0"></div>
          <ul style="list-style:none;padding:0;margin:0 0 24px;display:flex;flex-direction:column;gap:10px">
            ${(p.features||[]).filter(f=>typeof f==='string'||f.included!==false).map(f=>`<li style="display:flex;align-items:flex-start;gap:10px;font-size:14px;color:#64748B;font-family:Inter"><span style="color:#00E5FF;font-weight:700;flex-shrink:0;margin-top:1px">✓</span>${typeof f==='string'?f:(f.text||f.label||'')}</li>`).join('')}
          </ul>
          ${(p.cta||(p.button&&p.button.label))?`<a href="${p.ctaHref||(p.button&&p.button.href)||'#'}" style="display:block;text-align:center;padding:12px;background:${(p.popular||p.highlighted)?'linear-gradient(135deg,#00C4DD,#006FE8)':'rgba(0,229,255,.08)'};color:${(p.popular||p.highlighted)?'white':(p.accentColor||'#00E5FF')};border:${(p.popular||p.highlighted)?'none':'1px solid rgba(0,229,255,.15)'};border-radius:10px;font-weight:700;text-decoration:none;font-family:Inter;font-size:14px">${p.cta||(p.button&&p.button.label)||'Get started'}</a>`:''}
        </div>`).join('')}
      </div>
    </section>`;
    case 'cta': return `<section style="padding:${c.padding||'100px 48px'};background:${c.backgroundColor||'#030B14'};text-align:${c.align||'center'};position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(0,229,255,.06),transparent 65%);pointer-events:none"></div>
      <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.25),transparent)"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.15),transparent)"></div>
      <div style="position:relative;z-index:1;max-width:700px;${c.align==='center'?'margin:0 auto':''}">
        ${c.eyebrow?`<div style="display:inline-flex;align-items:center;gap:7px;background:rgba(0,229,255,.07);border:1px solid rgba(0,229,255,.18);border-radius:999px;padding:5px 16px;margin-bottom:20px"><span style="width:5px;height:5px;border-radius:50%;background:#00E5FF"></span><span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${c.eyebrowColor||'#00E5FF'}">${c.eyebrow}</span></div>`:''}
        <h2 style="font-size:clamp(1.9rem,3.5vw,2.8rem);font-weight:900;color:${c.textColor||'#E8F4FD'};margin:0 0 18px;letter-spacing:-.03em;line-height:1.1;font-family:Inter,sans-serif">${c.title||'Ready to get started?'}</h2>
        ${c.subtitle?`<p style="font-size:1.1rem;color:#64748B;line-height:1.75;max-width:520px;margin:0 auto 36px;font-family:Inter,sans-serif">${c.subtitle}</p>`:''}
        <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:${c.align==='center'?'center':'flex-start'}">
          ${(c.buttons||[]).map(b=>`<a href="${b.href||'#'}" style="display:inline-block;padding:14px 32px;background:${b.variant==='outline'?'transparent':b.backgroundColor?b.backgroundColor:'linear-gradient(135deg,#00C4DD,#006FE8)'};color:${b.textColor||'white'};border-radius:10px;font-weight:700;text-decoration:none;font-family:Inter;font-size:15px;${b.variant==='outline'?'border:1px solid rgba(0,229,255,.35);color:#00E5FF;':'border:none;box-shadow:0 0 24px rgba(0,229,255,.25);'}">${b.label||'Get started'}</a>`).join('')}
        </div>
      </div>
    </section>`;
    case 'testimonials': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#030B14'}">
      ${c.title?`<div style="text-align:center;margin-bottom:52px"><h2 style="font-size:clamp(1.8rem,3vw,2.5rem);font-weight:900;color:#E8F4FD;margin:0;letter-spacing:-.025em;font-family:Inter,sans-serif">${c.title}</h2></div>`:''}
      <div style="display:grid;grid-template-columns:repeat(${c.columns||3},1fr);gap:20px">
        ${(c.items||[]).map(t=>`<div style="padding:28px;background:${c.cardBackground||'#060F1A'};border-radius:16px;border:1px solid rgba(0,229,255,.08);position:relative;overflow:hidden">
          <div style="color:#F59E0B;margin-bottom:14px;letter-spacing:2px;font-size:14px">${'★'.repeat(t.rating||5)}</div>
          <p style="font-size:1rem;line-height:1.75;color:#94A3B8;margin:0 0 24px;font-family:Inter,sans-serif;font-style:italic">"${t.quote||''}"</p>
          <div style="display:flex;align-items:center;gap:12px;border-top:1px solid rgba(0,229,255,.06);padding-top:20px">
            ${(t.avatar||t.image)?`<img src="${t.avatar||t.image}" alt="${t.author||t.name||''}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(0,229,255,.2)">`:`<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,rgba(0,196,221,.2),rgba(79,124,255,.2));border:1px solid rgba(0,229,255,.2);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;color:#00E5FF">${(t.author||t.name||'?').charAt(0)}</div>`}
            <div><div style="font-weight:600;font-size:14px;color:#E8F4FD;font-family:Inter">${t.author||t.name||''}</div><div style="font-size:12px;color:#374151;font-family:Inter;margin-top:2px">${t.role||''}</div></div>
          </div>
        </div>`).join('')}
      </div>
    </section>`;
    case 'faq': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#030B14'}">
      ${c.title?`<div style="text-align:center;margin-bottom:52px"><h2 style="font-size:clamp(1.8rem,3vw,2.5rem);font-weight:900;color:#E8F4FD;margin:0;letter-spacing:-.025em;font-family:Inter,sans-serif">${c.title}</h2></div>`:''}
      <div style="max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:8px">
        ${(c.items||[]).map(f=>`<div style="background:#060F1A;border:1px solid rgba(0,229,255,.08);border-radius:12px;overflow:hidden">
          <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;padding:20px 24px" onclick="const a=this.nextElementSibling;a.style.display=a.style.display==='block'?'none':'block';this.querySelector('.faq-icon').textContent=a.style.display==='block'?'−':'+'">
            <span style="font-size:15px;font-weight:600;color:#E8F4FD;font-family:Inter;letter-spacing:-.01em">${f.question||''}</span>
            <span class="faq-icon" style="font-size:22px;color:${c.accentColor||'#00E5FF'};font-weight:300;flex-shrink:0;margin-left:16px;line-height:1">+</span>
          </div>
          <div style="display:none;padding:0 24px 20px;font-size:14px;line-height:1.75;color:#64748B;font-family:Inter,sans-serif">${f.answer||''}</div>
        </div>`).join('')}
      </div>
    </section>`;
    case 'stats': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#030B14'};text-align:center;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 100%,rgba(0,229,255,.05),transparent 60%);pointer-events:none"></div>
      ${c.title?`<h2 style="font-size:clamp(1.8rem,3vw,2.5rem);font-weight:900;color:${c.textColor||'#E8F4FD'};margin:0 0 52px;letter-spacing:-.025em;font-family:Inter,sans-serif;position:relative">${c.title}</h2>`:''}
      <div style="display:grid;grid-template-columns:repeat(${c.columns||4},1fr);gap:2px;max-width:960px;margin:0 auto;position:relative">
        ${(c.items||[]).map((s,i)=>`<div style="padding:32px 20px;background:#060F1A;${i===0?'border-radius:16px 0 0 16px':''}${i===(c.items||[]).length-1?'border-radius:0 16px 16px 0':''}border:1px solid rgba(0,229,255,.08)">
          ${s.icon?`<div style="font-size:1.8rem;margin-bottom:12px">${s.icon}</div>`:''}
          <div style="font-size:clamp(2.2rem,4vw,3.5rem);font-weight:900;color:${c.accentColor||'#00E5FF'};line-height:1;letter-spacing:-.04em;font-family:Inter,sans-serif;text-shadow:0 0 30px rgba(0,229,255,.3)">${s.prefix||''}${s.value||'0'}${s.suffix||''}</div>
          <div style="font-size:14px;color:${c.textColor||'#4B5563'};margin-top:10px;font-family:Inter,sans-serif;font-weight:500">${s.label||''}</div>
        </div>`).join('')}
      </div>
    </section>`;
    case 'richtext': return `<div style="padding:${c.padding||'0'};color:${c.textColor||'#94A3B8'};font-family:Inter,sans-serif;line-height:1.75">${c.html||'<p>Rich text content here.</p>'}</div>`;
    case 'blockquote': return `<blockquote style="border-left:3px solid ${c.accentColor||'#00E5FF'};padding:20px 28px;background:${c.backgroundColor||'rgba(0,229,255,.04)'};border-radius:0 12px 12px 0;font-size:1.1rem;font-style:italic;color:${c.textColor||'#94A3B8'};margin:0;font-family:Inter,sans-serif;line-height:1.75;box-shadow:inset 0 0 0 1px rgba(0,229,255,.06)">
      ${c.text||'Quote text'}<cite style="display:block;font-size:13px;margin-top:14px;color:${c.accentColor||'#00E5FF'};font-style:normal;font-weight:600;letter-spacing:.02em">— ${c.author||'Author'}</cite>
    </blockquote>`;
    case 'embed': return `<div style="border-radius:${c.borderRadius||'12px'};overflow:hidden;height:${c.height||'400px'};background:#060F1A;border:1px solid rgba(0,229,255,.1);display:flex;align-items:center;justify-content:center;color:#374151">
      ${c.url?`<iframe src="${c.url}" width="100%" height="100%" frameborder="0" allowfullscreen style="border:none"></iframe>`:`<div style="text-align:center"><span class="material-symbols-outlined" style="font-size:40px;color:rgba(0,229,255,.3)">embed_code</span><p style="font-size:13px;margin-top:8px;font-family:Inter">Add URL in properties</p></div>`}
    </div>`;
    case 'gallery': return `<div style="display:grid;grid-template-columns:repeat(${c.columns||3},1fr);gap:${c.gap||10}px">
      ${(c.images||[]).map(img=>img.src?`<img src="${img.src}" alt="${img.alt||''}" style="width:100%;aspect-ratio:${c.aspectRatio||'16/9'};object-fit:cover;border-radius:8px;border:1px solid rgba(0,229,255,.08)" loading="lazy">`:`<div style="background:#060F1A;border:1px dashed rgba(0,229,255,.15);aspect-ratio:${c.aspectRatio||'16/9'};border-radius:8px;display:flex;align-items:center;justify-content:center"><span class="material-symbols-outlined" style="color:rgba(0,229,255,.3)">image</span></div>`).join('')}
    </div>`;
    case 'form': return `<div style="max-width:${c.maxWidth||'560px'};padding:${c.padding||'0'}">
      ${c.title?`<h3 style="font-size:1.4rem;font-weight:800;color:#E8F4FD;margin:0 0 24px;letter-spacing:-.02em;font-family:Inter,sans-serif">${c.title}</h3>`:''}
      <form style="display:flex;flex-direction:column;gap:16px">
        ${(c.fields||[]).map(f=>`<div><label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#374151;margin-bottom:7px;font-family:Inter">${f.label||''}</label>
          ${f.type==='textarea'?`<textarea rows="${f.rows||4}" placeholder="${f.placeholder||''}" style="width:100%;padding:12px 14px;background:#060F1A;border:1px solid rgba(0,229,255,.1);border-radius:9px;font-size:14px;resize:vertical;box-sizing:border-box;color:#E8F4FD;font-family:Inter;outline:none"></textarea>`:`<input type="${f.type||'text'}" placeholder="${f.placeholder||''}" style="width:100%;padding:12px 14px;background:#060F1A;border:1px solid rgba(0,229,255,.1);border-radius:9px;font-size:14px;box-sizing:border-box;color:#E8F4FD;font-family:Inter;outline:none">`}
        </div>`).join('')}
        ${c.submitButton?`<button type="button" style="padding:13px 28px;background:${c.submitButton.backgroundColor||'linear-gradient(135deg,#00C4DD,#006FE8)'};color:${c.submitButton.textColor||'#fff'};border:none;border-radius:9px;font-weight:700;font-size:15px;cursor:pointer;font-family:Inter;${c.submitButton.fullWidth?'width:100%':''}box-shadow:0 0 20px rgba(0,229,255,.2)">${c.submitButton.label||'Submit'}</button>`:''}
      </form>
    </div>`;
    case 'countdown': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#030B14'};text-align:center;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(0,229,255,.05),transparent 60%);pointer-events:none"></div>
      ${c.title?`<h2 style="font-size:clamp(1.6rem,3vw,2.2rem);font-weight:900;color:${c.textColor||'#E8F4FD'};margin:0 0 40px;letter-spacing:-.025em;font-family:Inter,sans-serif;position:relative">${c.title}</h2>`:''}
      <div style="display:flex;gap:16px;justify-content:center;position:relative">
        ${['Days','Hours','Minutes','Seconds'].map((u,i)=>`<div style="background:#060F1A;border:1px solid rgba(0,229,255,.12);border-radius:14px;padding:24px 20px;min-width:90px">
          <span style="display:block;font-size:clamp(2.5rem,5vw,3.5rem);font-weight:900;color:${c.accentColor||'#00E5FF'};line-height:1;letter-spacing:-.04em;font-family:Inter,sans-serif;text-shadow:0 0 24px rgba(0,229,255,.4)">${['00','04','45','12'][i]}</span>
          <span style="font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:${c.textColor||'#374151'};margin-top:8px;display:block;font-family:JetBrains Mono">${u}</span>
        </div>`).join('')}
      </div>
    </section>`;
    case 'team': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#030B14'}">
      ${c.title?`<div style="text-align:center;margin-bottom:52px"><h2 style="font-size:clamp(1.8rem,3vw,2.5rem);font-weight:900;color:#E8F4FD;margin:0;letter-spacing:-.025em;font-family:Inter,sans-serif">${c.title}</h2></div>`:''}
      <div style="display:grid;grid-template-columns:repeat(${c.columns||4},1fr);gap:24px">
        ${(c.members||[]).map(m=>`<div style="text-align:center;background:#060F1A;border:1px solid rgba(0,229,255,.08);border-radius:16px;padding:28px 20px;position:relative;overflow:hidden">
          <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.2),transparent)"></div>
          ${(m.photo||m.image)?`<img src="${m.photo||m.image}" alt="${m.name||''}" style="width:80px;height:80px;object-fit:cover;border-radius:50%;margin:0 auto 16px;display:block;border:2px solid rgba(0,229,255,.2)">`:`<div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,rgba(0,196,221,.15),rgba(79,124,255,.15));border:2px solid rgba(0,229,255,.2);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:800;color:#00E5FF">${(m.name||'?').charAt(0)}</div>`}
          <div style="font-weight:700;font-size:16px;color:#E8F4FD;font-family:Inter,sans-serif">${m.name||''}</div>
          <div style="font-size:13px;color:#00E5FF;margin:4px 0 10px;font-family:JetBrains Mono;letter-spacing:.04em">${m.role||''}</div>
          ${m.bio?`<p style="font-size:13px;line-height:1.6;color:#4B5563;margin:0;font-family:Inter">${m.bio}</p>`:''}
        </div>`).join('')}
      </div>
    </section>`;
    case 'timeline': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#030B14'}">
      ${c.title?`<h2 style="font-size:clamp(1.8rem,3vw,2.5rem);font-weight:900;color:#E8F4FD;margin:0 0 52px;letter-spacing:-.025em;font-family:Inter,sans-serif">${c.title}</h2>`:''}
      <div style="max-width:680px;margin:0 auto">
        ${(c.items||[]).map((item,i)=>`<div style="display:flex;gap:24px;padding-bottom:36px;position:relative">
          ${i<(c.items||[]).length-1?`<div style="position:absolute;left:20px;top:42px;bottom:0;width:1px;background:linear-gradient(180deg,rgba(0,229,255,.3),transparent)"></div>`:''}
          <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#00C4DD,#006FE8);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0;font-size:15px;box-shadow:0 0 16px rgba(0,229,255,.3)">${i+1}</div>
          <div style="padding-top:8px">
            ${item.date?`<div style="font-size:11px;font-weight:700;color:${c.accentColor||'#00E5FF'};margin-bottom:5px;font-family:JetBrains Mono;letter-spacing:.06em;text-transform:uppercase">${item.date}</div>`:''}
            <div style="font-weight:700;font-size:16px;color:#E8F4FD;margin-bottom:6px;font-family:Inter;letter-spacing:-.01em">${item.title||''}</div>
            <div style="font-size:14px;line-height:1.7;color:#64748B;font-family:Inter">${item.text||item.description||''}</div>
          </div>
        </div>`).join('')}
      </div>
    </section>`;
    case 'contact': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#030B14'}">
      ${c.title?`<div style="text-align:${c.align||'center'};margin-bottom:52px"><h2 style="font-size:clamp(1.8rem,3vw,2.5rem);font-weight:900;color:#E8F4FD;margin:0;letter-spacing:-.025em;font-family:Inter,sans-serif">${c.title}</h2></div>`:''}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px">
        ${(c.items||[]).map(item=>`<div style="display:flex;gap:16px;align-items:flex-start;background:#060F1A;border:1px solid rgba(0,229,255,.08);border-radius:14px;padding:24px">
          <div style="width:42px;height:42px;border-radius:11px;background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.2rem">${item.icon||'📍'}</div>
          <div><strong style="display:block;margin-bottom:4px;color:#E8F4FD;font-size:14px;font-family:Inter;font-weight:600">${item.label||''}</strong>${item.link?`<a href="${item.link}" style="font-size:14px;color:#64748B;text-decoration:none;font-family:Inter">${item.value||''}</a>`:`<span style="font-size:14px;color:#64748B;font-family:Inter">${item.value||''}</span>`}</div>
        </div>`).join('')}
      </div>
    </section>`;
    case 'cards_grid': return `<section style="padding:${c.padding||'80px 40px'};background:${c.backgroundColor||'#030B14'}">
      ${c.title?`<div style="margin-bottom:40px"><h2 style="font-size:clamp(1.8rem,3vw,2.5rem);font-weight:900;color:#E8F4FD;margin:0;letter-spacing:-.025em;font-family:Inter,sans-serif">${c.title}</h2></div>`:''}
      <div style="display:grid;grid-template-columns:repeat(${c.columns||3},1fr);gap:20px">
        ${(c.cards||[]).map(card=>`<div style="background:${card.backgroundColor||'#060F1A'};border:1px solid rgba(0,229,255,.08);border-radius:16px;overflow:hidden;position:relative">
          ${card.image?`<img src="${card.image}" alt="${card.imageAlt||''}" style="width:100%;aspect-ratio:16/9;object-fit:cover">`:``}
          <div style="padding:24px">
            ${card.tag?`<span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;background:rgba(0,229,255,.08);color:#00E5FF;border-radius:6px;padding:3px 10px;margin-bottom:12px;display:inline-block;font-family:JetBrains Mono">${card.tag}</span>`:''}
            <h3 style="font-size:17px;font-weight:700;margin:0 0 8px;color:#E8F4FD;font-family:Inter;letter-spacing:-.01em">${card.title||''}</h3>
            <p style="font-size:14px;line-height:1.65;color:#64748B;margin:0 0 20px;font-family:Inter">${card.text||''}</p>
            ${(card.link||card.cta)?`<a href="${card.link||'#'}" style="display:inline-block;padding:8px 18px;background:rgba(0,229,255,.08);color:#00E5FF;border:1px solid rgba(0,229,255,.2);border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;font-family:Inter">${card.cta||'Read more'}</a>`:''}
          </div>
        </div>`).join('')}
      </div>
    </section>`;
    case 'banner': return `<div style="padding:13px 28px;background:${c.backgroundColor||'linear-gradient(90deg,rgba(0,196,221,.12),rgba(79,124,255,.1))'};border-bottom:1px solid rgba(0,229,255,.15);display:flex;align-items:center;justify-content:center;gap:12px;font-size:14px;font-weight:500;font-family:Inter,sans-serif;position:relative;overflow:hidden">
      <div style="position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.3),transparent)"></div>
      ${c.icon?`<span style="font-size:16px">${c.icon}</span>`:'<span style="width:6px;height:6px;border-radius:50%;background:#00E5FF;box-shadow:0 0 6px #00E5FF;flex-shrink:0"></span>'}
      <span style="color:${c.textColor||'#E8F4FD'}">${c.text||'Announcement text'}</span>
      ${c.link?`<a href="${c.link}" style="color:#00E5FF;font-weight:700;text-decoration:none;padding:4px 12px;border:1px solid rgba(0,229,255,.3);border-radius:6px;font-size:12px;margin-left:4px">${c.linkLabel||'Learn more'}</a>`:''}
    </div>`;
    case 'logo_strip': return `<section style="padding:${c.padding||'48px 40px'};background:${c.backgroundColor||'#030B14'};border-top:1px solid rgba(0,229,255,.06);border-bottom:1px solid rgba(0,229,255,.06)">
      ${c.label?`<p style="text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#374151;margin:0 0 32px;font-family:JetBrains Mono">${c.label}</p>`:''}
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:48px">
        ${(c.logos||[]).map(l=>{const inner=l.src?`<img src="${l.src}" alt="${l.alt||l.name||''}" style="height:28px;width:auto;object-fit:contain;filter:grayscale(1) brightness(1.5);opacity:.5">`:`<span style="font-size:18px;font-weight:700;color:#374151;font-family:Inter,sans-serif;letter-spacing:-.01em">${l.name||''}</span>`;return l.url?`<a href="${l.url}" target="_blank" style="display:inline-flex;align-items:center">${inner}</a>`:inner;}).join('')}
      </div>
    </section>`;
    case 'social_links': return `<div style="display:flex;gap:${c.gap||'10px'};justify-content:${c.align||'flex-start'};padding:8px 0;flex-wrap:wrap">
      ${(c.links||[]).map(l=>`<a href="${l.url||'#'}" style="width:${c.size||'42px'};height:${c.size||'42px'};border-radius:10px;background:${l.backgroundColor||'rgba(0,229,255,.08)'};color:${l.color||'#00E5FF'};border:1px solid rgba(0,229,255,.15);display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:18px;transition:all .15s">${l.icon||'🔗'}</a>`).join('')}
    </div>`;
    case 'icon': return `<div style="text-align:${c.align||'left'};padding:${c.padding||'8px 0'}">
      <span style="width:${c.size||'52px'};height:${c.size||'52px'};background:${c.backgroundColor||'rgba(0,229,255,.08)'};border:1px solid rgba(0,229,255,.15);border-radius:${c.borderRadius||'14px'};color:${c.color||'#00E5FF'};display:inline-flex;align-items:center;justify-content:center;font-size:calc(${c.size||'52px'} * .48)">${c.icon||'⚡'}</span>
      ${c.text?`<div style="font-size:14px;margin-top:10px;color:${c.textColor||'#94A3B8'};font-family:Inter,sans-serif">${c.text}</div>`:''}
    </div>`;
    case 'badge': return `<span style="display:inline-flex;align-items:center;gap:5px;padding:${c.padding||'4px 12px'};background:${c.backgroundColor||'rgba(0,229,255,.08)'};color:${c.textColor||'#00E5FF'};border-radius:${c.borderRadius||'6px'};font-size:${c.fontSize||'12px'};font-weight:700;letter-spacing:.04em;font-family:JetBrains Mono;${c.border?'border:1px solid '+c.border:'border:1px solid rgba(0,229,255,.2)'}">${c.text||'Badge'}</span>`;
    case 'link': return `<a href="${c.href||'#'}" target="${c.target||'_self'}" style="color:${c.color||'#00E5FF'};text-decoration:${c.underline!==false?'underline':'none'};font-size:${c.fontSize||'16px'};font-weight:${c.fontWeight||'500'};font-family:Inter,sans-serif">${c.label||'Link'}</a>`;
    case 'code_block': return `<div style="background:${c.backgroundColor||'#030B14'};border-radius:12px;border:1px solid rgba(0,229,255,.1);overflow:hidden">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid rgba(0,229,255,.08);background:rgba(0,229,255,.03)">
        <div style="display:flex;gap:6px"><span style="width:10px;height:10px;border-radius:50%;background:#EF4444"></span><span style="width:10px;height:10px;border-radius:50%;background:#F59E0B"></span><span style="width:10px;height:10px;border-radius:50%;background:#22C55E"></span></div>
        ${c.language?`<span style="font-size:11px;font-weight:600;text-transform:uppercase;color:rgba(0,229,255,.4);font-family:JetBrains Mono;letter-spacing:.06em">${c.language}</span>`:''}
      </div>
      <div style="padding:20px 24px;overflow-x:auto"><pre style="font-family:JetBrains Mono,monospace;font-size:13px;line-height:1.7;color:${c.textColor||'#94A3B8'};white-space:pre-wrap;margin:0">${escH(c.code||'// your code here')}</pre></div>
    </div>`;
    case 'tabs': {
      const tabs = c.tabs||[];
      if(!tabs.length) return '<div style="padding:32px;color:#4F7CFF;text-align:center;background:#060F1A;border:1px solid rgba(0,229,255,.08);border-radius:12px;font-size:13px;font-family:JetBrains Mono">Add tabs in properties →</div>';
      return `<div style="background:${c.backgroundColor||'#030B14'};border-radius:12px;border:1px solid rgba(0,229,255,.1);overflow:hidden;padding:${c.padding||'0'}">
        <div style="display:flex;border-bottom:1px solid rgba(0,229,255,.1);gap:2px;padding:4px 4px 0;background:rgba(0,229,255,.02)">
          ${tabs.map((t,i)=>`<button onclick="this.closest('[data-tabs]').querySelectorAll('[data-panel]').forEach((p,j)=>{p.style.display=j===${i}?'block':'none'});this.closest('[data-tabs]').querySelectorAll('[data-tbtn]').forEach((b,j)=>{b.style.borderBottom=j===${i}?'2px solid #00E5FF':'2px solid transparent';b.style.color=j===${i}?'#00E5FF':'#4B5563';b.style.background=j===${i}?'rgba(0,229,255,.06)':'transparent'})" data-tbtn
            style="padding:10px 20px;font-size:13px;font-weight:600;border:none;background:${i===0?'rgba(0,229,255,.06)':'transparent'};cursor:pointer;border-bottom:${i===0?'2px solid #00E5FF':'2px solid transparent'};color:${i===0?'#00E5FF':'#4B5563'};margin-bottom:-1px;border-radius:8px 8px 0 0;font-family:Inter;transition:all .15s">${t.label||'Tab '+(i+1)}</button>`).join('')}
        </div>
        <div data-tabs style="padding:24px">
          ${tabs.map((t,i)=>`<div data-panel style="display:${i===0?'block':'none'}">${
            t.content
              ? `<div style="line-height:1.7;color:#94A3B8;font-size:15px">${t.content}</div>`
              : ((t.children||[]).map(getCompHTML).join('') || '<p style="color:#4B5563;font-size:13px;font-family:JetBrains Mono">No content in this tab</p>')
          }</div>`).join('')}
        </div>
      </div>`;
    }
    case 'columns': {
      const cols = c.columns||[];
      const tpl = c.gridTemplate || cols.map(()=>'1fr').join(' ');
      return `<div style="display:grid;grid-template-columns:${tpl};gap:${c.gap||'24px'};padding:${c.padding||'0'}">
        ${cols.map((col,ci)=>`<div style="min-height:80px;border:1px dashed rgba(0,229,255,.12);border-radius:8px;padding:12px;background:rgba(0,229,255,.015);${Object.entries(col).filter(([k])=>!['children','type','id'].includes(k)).map(([k,v])=>k+':'+v).join(';')}">${(col.children||[]).map(getCompHTML).join('') || `<div style="height:100%;display:flex;align-items:center;justify-content:center;color:rgba(0,229,255,.2);font-size:11px;font-family:JetBrains Mono">col ${ci+1}</div>`}</div>`).join('')}
      </div>`;
    }
    case 'video': return `<div style="border-radius:${c.borderRadius||'12px'};overflow:hidden;height:${c.height||'400px'};background:${c.backgroundColor||'#030B14'};border:1px solid rgba(0,229,255,.1);position:relative">
      ${c.src
        ?`<video src="${c.src}" ${c.poster?`poster="${c.poster}"`:''}${c.autoplay?' autoplay muted loop':''}${c.controls!==false?' controls':''} style="width:100%;height:100%;object-fit:cover"></video>`
        :`<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
            <div style="width:64px;height:64px;border-radius:50%;background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.2);display:flex;align-items:center;justify-content:center">
              <span class="material-symbols-outlined" style="font-size:32px;color:#4F7CFF;font-variation-settings:'FILL' 1">play_circle</span>
            </div>
            <span style="font-size:12px;color:rgba(0,229,255,.3);font-family:JetBrains Mono">Add video URL in properties</span>
          </div>`
      }
    </div>`;
    case 'card': return `<div style="background:${c.backgroundColor||'#060F1A'};border:${c.border||'1px solid rgba(0,229,255,.1)'};border-radius:${c.borderRadius||'16px'};overflow:hidden;position:relative;max-width:${c.maxWidth||'400px'}">
      <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.25),transparent)"></div>
      ${c.image?`<img src="${c.image}" alt="${c.imageAlt||''}" style="width:100%;aspect-ratio:16/9;object-fit:cover">`:``}
      <div style="padding:${c.padding||'24px'}">
        ${c.tag?`<span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;background:rgba(0,229,255,.08);color:#00E5FF;border-radius:6px;padding:3px 10px;margin-bottom:12px;display:inline-block;font-family:JetBrains Mono">${c.tag}</span>`:''}
        <h3 style="font-size:18px;font-weight:800;margin:${c.tag?'8px':'0'} 0 8px;color:${c.titleColor||'#E8F4FD'};font-family:Inter,sans-serif;letter-spacing:-.01em">${c.title||'Card Title'}</h3>
        ${c.text?`<p style="font-size:14px;line-height:1.7;color:${c.textColor||'#64748B'};margin:0 0 ${c.cta?'18px':'0'};font-family:Inter,sans-serif">${c.text}</p>`:''}
        ${c.cta?`<a href="${c.ctaHref||'#'}" style="display:inline-block;padding:9px 18px;background:rgba(0,229,255,.08);color:#00E5FF;border:1px solid rgba(0,229,255,.2);border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;font-family:Inter,sans-serif">${c.cta}</a>`:''}
      </div>
    </div>`;
    default: return `<div style="padding:28px;border:1px dashed rgba(0,229,255,.2);border-radius:10px;text-align:center;background:rgba(0,229,255,.015)">
      <span style="display:block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(0,229,255,.4);font-family:JetBrains Mono">${c.type||'unknown'}</span>
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

  // Flash the newly added component with a neon drop-in animation
  requestAnimationFrame(() => {
    const el = document.getElementById(`comp-${defaults.id}`);
    if (el) {
      el.classList.add('iwb-comp-added');
      setTimeout(() => el.classList.remove('iwb-comp-added'), 800);
    }
  });

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
  document.getElementById('properties-panel').innerHTML = `<div style="text-align:center;color:#374151;font-size:13px;margin-top:32px;display:flex;flex-direction:column;align-items:center;gap:12px"><div style="width:48px;height:48px;border-radius:12px;background:rgba(0,229,255,.04);border:1px solid rgba(0,229,255,.08);display:flex;align-items:center;justify-content:center"><span class="material-symbols-outlined" style="font-size:24px;color:rgba(0,229,255,.25)">touch_app</span></div><span style="line-height:1.6">Select a component<br/>to edit its properties</span></div>`;

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

// ── Undo / Redo ───────────────────────────────────────────────
function pushUndo() {
  undoStack.push(JSON.stringify(editorLayout));
  if (undoStack.length > 50) undoStack.shift();
  redoStack = [];
  _syncUndoRedoBtns();
}

function editorUndo() {
  if (!undoStack.length) return;
  redoStack.push(JSON.stringify(editorLayout));
  editorLayout = JSON.parse(undoStack.pop());
  markDirty(); renderCanvas(); _syncUndoRedoBtns();
}

function editorRedo() {
  if (!redoStack.length) return;
  undoStack.push(JSON.stringify(editorLayout));
  editorLayout = JSON.parse(redoStack.pop());
  markDirty(); renderCanvas(); _syncUndoRedoBtns();
}

function _syncUndoRedoBtns() {
  const u = document.getElementById('undo-btn');
  const r = document.getElementById('redo-btn');
  if (!u || !r) return;
  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;
  u.disabled = !canUndo;
  u.style.color = canUndo ? '#64748B' : '#2D3F52';
  u.style.cursor = canUndo ? 'pointer' : 'not-allowed';
  u.onmouseover = canUndo ? ()=>{ u.style.background='rgba(255,255,255,.05)'; u.style.color='#E8F4FD'; } : null;
  u.onmouseout  = canUndo ? ()=>{ u.style.background='none'; u.style.color='#64748B'; } : null;
  r.disabled = !canRedo;
  r.style.color = canRedo ? '#64748B' : '#2D3F52';
  r.style.cursor = canRedo ? 'pointer' : 'not-allowed';
  r.onmouseover = canRedo ? ()=>{ r.style.background='rgba(255,255,255,.05)'; r.style.color='#E8F4FD'; } : null;
  r.onmouseout  = canRedo ? ()=>{ r.style.background='none'; r.style.color='#64748B'; } : null;
}

// ── Device ────────────────────────────────────────────────────
const deviceWidths = {desktop:'1200px',tablet:'768px',mobile:'375px'};
function setDevice(d) {
  const frame = document.getElementById('canvas-frame');
  if(frame) frame.style.width=deviceWidths[d]||'1200px';
  const wLabel = document.getElementById('device-width-label');
  if(wLabel) wLabel.textContent = deviceWidths[d]||'1200px';
  ['desktop','tablet','mobile'].forEach(k=>{
    const btn = document.getElementById('dev-'+k);
    if(!btn) return;
    btn.style.background = k===d ? 'rgba(0,229,255,.12)' : 'transparent';
    btn.style.color      = k===d ? '#00E5FF' : '#4B5563';
  });
  fitCanvas();
}

// ── Layers ────────────────────────────────────────────────────
function updateLayers() {
  const panel = document.getElementById('lib-layers');
  if(!panel) return;
  const comps = editorLayout.components||[];
  panel.innerHTML = comps.length===0
    ? '<p style="color:#4B5563;font-size:12px;padding:12px">No components yet</p>'
    : comps.map(c=>`<div onclick="selectComp('${c.id}')" style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;background:${c.id===selectedId?'rgba(0,229,255,.08)':'transparent'};border:1px solid ${c.id===selectedId?'rgba(0,229,255,.15)':'transparent'};transition:all .12s" onmouseover="if(this.style.borderColor!=='rgba(0,229,255,.15)'){this.style.background='rgba(255,255,255,.03)'}" onmouseout="if(this.style.borderColor!=='rgba(0,229,255,.15)'){this.style.background='transparent'}">
      <span class="material-symbols-outlined" style="font-size:14px;color:${c.id===selectedId?'#00E5FF':'#4B5563'}">${getCompIcon(c.type)}</span>
      <span style="font-size:12px;font-family:Inter;color:${c.id===selectedId?'#E8F4FD':'#64748B'}">${c.type}</span>
      <span style="font-size:10px;color:#374151;margin-left:auto;font-family:JetBrains Mono">${c.id?.split('-').pop()||''}</span>
    </div>`).join('');
}

function switchLibTab(tab) {
  const isComp = tab==='comp';
  const activeStyle  = 'flex:1;padding:6px;font-size:11px;font-weight:600;border-radius:6px;border:1px solid rgba(0,229,255,.2);background:rgba(0,229,255,.1);color:#00E5FF;cursor:pointer;font-family:Inter;transition:all .15s';
  const inactiveStyle = 'flex:1;padding:6px;font-size:11px;font-weight:600;border-radius:6px;border:none;background:transparent;color:#374151;cursor:pointer;font-family:Inter;transition:all .15s';
  document.getElementById('tab-comp').style.cssText    = isComp  ? activeStyle : inactiveStyle;
  document.getElementById('tab-layers').style.cssText  = !isComp ? activeStyle : inactiveStyle;
  document.getElementById('lib-components').style.display = isComp?'block':'none';
  document.getElementById('lib-layers').style.display = !isComp?'block':'none';
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
let _dropIndicator = null;

function dragCompStart(e, type) {
  dragType = type;
  e.dataTransfer.effectAllowed = 'copy';

  // Cyber-styled ghost image
  const ghost = document.createElement('div');
  ghost.style.cssText = 'position:fixed;top:-999px;left:0;display:flex;align-items:center;gap:8px;padding:8px 16px;background:#030B14;border:1px solid rgba(0,229,255,.7);border-radius:10px;color:#00E5FF;font-size:12px;font-weight:700;font-family:Inter,sans-serif;box-shadow:0 0 20px rgba(0,229,255,.4),0 4px 20px rgba(0,0,0,.6);white-space:nowrap;letter-spacing:.03em';
  ghost.innerHTML = `<span style="font-size:16px;line-height:1;opacity:.7">+</span><span style="text-transform:capitalize">${type.replace(/_/g,' ')}</span>`;
  document.body.appendChild(ghost);
  e.dataTransfer.setDragImage(ghost, -14, ghost.offsetHeight / 2);
  requestAnimationFrame(() => ghost.remove());
}

function _getCanvasFrame() { return document.getElementById('canvas-frame'); }

function _setCanvasDropActive(active) {
  const frame = _getCanvasFrame();
  if (!frame) return;
  if (active) {
    frame.style.boxShadow = '0 0 0 2px rgba(0,229,255,.7),0 0 60px rgba(0,229,255,.12),0 24px 80px rgba(0,0,0,.7)';
    frame.style.outline = '2px dashed rgba(0,229,255,.3)';
    frame.style.outlineOffset = '6px';
  } else {
    frame.style.boxShadow = '0 0 0 1px rgba(0,229,255,.15),0 24px 80px rgba(0,0,0,.7),0 4px 16px rgba(0,0,0,.4)';
    frame.style.outline = 'none';
    frame.style.outlineOffset = '0';
  }
}

function _showDropIndicator(e) {
  const frame = _getCanvasFrame();
  if (!frame) return;
  if (!_dropIndicator) {
    _dropIndicator = document.createElement('div');
    _dropIndicator.style.cssText = 'position:absolute;left:8px;right:8px;height:3px;background:linear-gradient(90deg,transparent,#00E5FF 15%,#00E5FF 85%,transparent);box-shadow:0 0 12px rgba(0,229,255,.9),0 0 30px rgba(0,229,255,.5);pointer-events:none;z-index:1000;border-radius:2px;transition:top .07s ease';
    frame.appendChild(_dropIndicator);
  }
  const frameRect = frame.getBoundingClientRect();
  const mouseY = e.clientY - frameRect.top;
  const comps = document.getElementById('canvas-components');
  const children = comps ? Array.from(comps.children) : [];
  let insertY = 38;
  for (const child of children) {
    const rect = child.getBoundingClientRect();
    const midY = rect.top - frameRect.top + rect.height / 2;
    if (mouseY < midY) { insertY = rect.top - frameRect.top; break; }
    insertY = rect.bottom - frameRect.top;
  }
  _dropIndicator.style.top = Math.max(0, insertY - 1) + 'px';
}

function _hideDropIndicator() {
  if (_dropIndicator) { _dropIndicator.remove(); _dropIndicator = null; }
}

document.addEventListener('dragover', e => {
  if (!dragType) return;
  e.preventDefault();
  const frame = _getCanvasFrame();
  if (frame?.contains(e.target)) {
    _setCanvasDropActive(true);
    _showDropIndicator(e);
  } else {
    _setCanvasDropActive(false);
    _hideDropIndicator();
  }
});

document.addEventListener('dragleave', e => {
  if (!dragType) return;
  const frame = _getCanvasFrame();
  if (frame && !frame.contains(e.relatedTarget)) {
    _setCanvasDropActive(false);
    _hideDropIndicator();
  }
});

document.addEventListener('dragend', () => {
  dragType = null;
  _setCanvasDropActive(false);
  _hideDropIndicator();
});

document.addEventListener('drop', e => {
  _setCanvasDropActive(false);
  _hideDropIndicator();
  if (dragType && _getCanvasFrame()?.contains(e.target)) {
    addComponent(dragType);
  }
  dragType=null;
});

// ── Keyboard shortcuts ────────────────────────────────────────
function handleEditorKey(e) {
  if((e.ctrlKey||e.metaKey)&&e.key==='s') { e.preventDefault(); saveLayout(); }
  if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!e.shiftKey) { e.preventDefault(); editorUndo(); }
  if((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.key==='z'&&e.shiftKey))) { e.preventDefault(); editorRedo(); }
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

  const _iSt = 'width:100%;background:#030B14;border:1px solid rgba(0,229,255,.1);color:#E8F4FD;border-radius:8px;padding:8px 10px;font-size:13px;font-family:Inter;outline:none;box-sizing:border-box;transition:border-color .15s';
  const _iSt2 = _iSt + ';resize:vertical';

  const field = (label,key,type='text',placeholder='')=>`
    <div style="display:flex;flex-direction:column;gap:4px">
      <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#374151;font-family:Inter">${label}</label>
      <input type="${type}" value="${escA(c[key]||'')}" placeholder="${placeholder}"
        onchange="updateCompProp('${c.id}','${key}',this.value)"
        onfocus="this.style.borderColor='#00E5FF'" onblur="this.style.borderColor='rgba(0,229,255,.1)'"
        style="${_iSt}"/>
    </div>`;

  const colorField = (label,key)=>`
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
      <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#374151;font-family:Inter;white-space:nowrap">${label}</label>
      <div style="display:flex;align-items:center;gap:4px">
        <input type="color" value="${c[key]||'#ffffff'}" onchange="updateCompProp('${c.id}','${key}',this.value)" style="width:28px;height:28px;border:1px solid rgba(0,229,255,.12);border-radius:6px;cursor:pointer;background:transparent;padding:2px"/>
        <input type="text" value="${escA(c[key]||'')}" onchange="updateCompProp('${c.id}','${key}',this.value)"
          onfocus="this.style.borderColor='#00E5FF'" onblur="this.style.borderColor='rgba(0,229,255,.1)'"
          style="background:#030B14;border:1px solid rgba(0,229,255,.1);color:#E8F4FD;border-radius:6px;padding:5px 7px;font-size:12px;font-family:JetBrains Mono;width:84px;outline:none;transition:border-color .15s"/>
      </div>
    </div>`;

  const textarea = (label,key,rows=3)=>{
    const val = c[key];
    const isJSON = val !== null && typeof val === 'object';
    const display = isJSON ? JSON.stringify(val, null, 2) : (val||'');
    const handler = isJSON ? `updateCompPropJSON('${c.id}','${key}',this.value)` : `updateCompProp('${c.id}','${key}',this.value)`;
    return `<div style="display:flex;flex-direction:column;gap:4px">
      <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#374151;font-family:Inter">${label}${isJSON?' <span style="opacity:.4;font-size:9px">(JSON)</span>':''}</label>
      <textarea rows="${rows}" onchange="${handler}"
        onfocus="this.style.borderColor='#00E5FF'" onblur="this.style.borderColor='rgba(0,229,255,.1)'"
        style="${_iSt2};font-family:${isJSON?'JetBrains Mono,monospace':'Inter'};font-size:12px">${escA(String(display))}</textarea>
    </div>`;
  };

  const select = (label,key,opts)=>`
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
      <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#374151;font-family:Inter;white-space:nowrap">${label}</label>
      <select onchange="updateCompProp('${c.id}','${key}',this.value)"
        style="background:#030B14;border:1px solid rgba(0,229,255,.1);color:#E8F4FD;border-radius:8px;padding:6px 8px;font-size:12px;font-family:Inter;outline:none;cursor:pointer">
        ${opts.map(([v,l])=>`<option value="${v}"${c[key]===v?' selected':''}>${l}</option>`).join('')}
      </select>
    </div>`;

  const section = (title,content)=>`
    <div style="border-bottom:1px solid rgba(0,229,255,.06);padding-bottom:12px">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#00E5FF;margin-bottom:8px;font-family:JetBrains Mono">${title}</div>
      <div style="display:flex;flex-direction:column;gap:8px">${content}</div>
    </div>`;

  let html = `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(0,229,255,.05);border:1px solid rgba(0,229,255,.1);border-radius:10px;margin-bottom:4px">
    <div style="width:28px;height:28px;border-radius:8px;background:rgba(0,229,255,.1);display:flex;align-items:center;justify-content:center">
      <span class="material-symbols-outlined" style="font-size:16px;color:#00E5FF">${getCompIcon(c.type)}</span>
    </div>
    <span style="font-size:13px;font-weight:600;color:#E8F4FD;font-family:Inter;text-transform:capitalize">${c.type}</span>
    <span style="font-size:10px;color:#374151;margin-left:auto;font-family:JetBrains Mono">${c.id?.split('-')[0]}</span>
  </div>`;

  const _toggle = (label,key,greenOn=true)=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0">
      <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#374151;font-family:Inter">${label}</span>
      <label style="position:relative;display:inline-flex;align-items:center;cursor:pointer">
        <input type="checkbox" ${c[key]?'checked':''} onchange="updateCompProp('${c.id}','${key}',this.checked)" style="opacity:0;width:0;height:0;position:absolute">
        <div style="width:36px;height:20px;background:${c[key]?(greenOn?'#22C55E':'#00E5FF'):'rgba(255,255,255,.1)'};border-radius:999px;position:relative;transition:background .2s">
          <div style="position:absolute;top:2px;left:${c[key]?'18px':'2px'};width:16px;height:16px;background:white;border-radius:50%;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>
        </div>
      </label>
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
      html += section('Options', _toggle('Sticky navbar','sticky'));
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
      html += section('Style',`${colorField('Background','backgroundColor')}${colorField('Text Color','textColor')}${field('Border Radius','borderRadius','text','8px')}${_toggle('Full Width','fullWidth')}`);
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
      html += section('Style',`${colorField('Background','backgroundColor')}${field('Border Radius','borderRadius','text','8px')}${_toggle('Show Controls','controls')}${_toggle('Autoplay (muted loop)','autoplay',false)}`);
      break;
    case 'embed':
      html += section('Embed',`${field('URL','url')}${field('Height','height','text','400px')}${field('Border Radius','borderRadius','text','8px')}`);
      break;
    case 'columns': {
      const numCols = (c.columns||[]).length || 2;
      html += section('Layout',`${field('Gap','gap','text','24px')}${field('Padding','padding','text','0')}${field('Grid Template (e.g. 2fr 1fr)','gridTemplate','text','1fr 1fr')}`);
      html += section('Columns',`<p style="font-size:11px;color:#374151;font-family:Inter;line-height:1.5">This component has ${numCols} column${numCols!==1?'s':''} side by side. Edit column count by adjusting the grid template above.<br><br>Each column&apos;s children can be added from the component library.</p>`);
      break;
    }
    case 'card':
      html += section('Content',`${field('Title','title')}${textarea('Text/Body','text',3)}${field('Tag/Badge','tag')}${field('Image URL','image')}${field('Image Alt','imageAlt')}${field('Link URL','link')}${field('CTA Label','cta')}`);
      html += section('Style',`${colorField('Background','backgroundColor')}${field('Border','border','text','1px solid #e5e7eb')}${field('Border Radius','borderRadius','text','12px')}${field('Padding','padding','text','24px')}`);
      break;
    default:
      html += appearance + spacing;
      if(c.title!==undefined) html += section('Content',`${field('Title','title')}${c.subtitle!==undefined?field('Subtitle','subtitle'):''}${colorField('Text Color','textColor')}`);
  }

  html += section('Size & Position',
    `${field('Width (e.g. 100%, 320px, auto)','compWidth','text')}
    ${field('Height (e.g. 400px — blank = auto)','compHeight','text')}
    ${_toggle('Absolute position (overlap)','positionAbsolute',false)}
    ${c.positionAbsolute ? field('Left (px)','left','number') + field('Top (px)','top','number') + field('Z-Index','zIndex','number') : ''}`
  );

  html += `<button onclick="removeComp('${c.id}')" style="width:100%;margin-top:4px;padding:9px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2);color:#EF4444;border-radius:10px;cursor:pointer;font-size:13px;font-family:Inter;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .15s" onmouseover="this.style.background='rgba(239,68,68,.12)'" onmouseout="this.style.background='rgba(239,68,68,.06)'">
    <span class="material-symbols-outlined" style="font-size:16px">delete</span> Delete component
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
  document.getElementById('export-modal')?.remove();
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
