// ── Template Gallery Modal ─────────────────────────────────────
const TEMPLATES = [
  {
    id:'saas-landing', name:'SaaS Landing', cat:'Marketing',
    desc:'Complete SaaS landing page with hero, features, pricing, testimonials.',
    tags:['landing','saas','startup'],
    layout:{ components:[
      {id:'nav',type:'navbar',logo:'Brand',sticky:true,backgroundColor:'#0B1220',textColor:'#f8fafc',links:[{label:'Features',href:'#features'},{label:'Pricing',href:'#pricing'},{label:'About',href:'#about'}],ctaButtons:[{label:'Start free',href:'#',backgroundColor:'#4F7CFF',textColor:'#fff',size:'sm'}]},
      {id:'hero',type:'hero',layout:'centered',backgroundColor:'#0B1220',textColor:'#fff',eyebrow:'✦ Now in Beta — Free forever',eyebrowColor:'#4F7CFF',title:'Build stunning pages.<br><span style="color:#4F7CFF">Ship them today.</span>',subtitle:'The visual builder for people who care about code quality. Drag, drop, export.',subtitleColor:'#94A3B8',buttons:[{label:'Start building free',href:'#',backgroundColor:'#4F7CFF',textColor:'#fff',size:'lg'},{label:'Watch demo →',href:'#',backgroundColor:'transparent',textColor:'#fff',size:'lg',variant:'outline'}],note:'Free forever · No credit card required',minHeight:'90vh'},
      {id:'logos',type:'logo_strip',label:'Trusted by leading teams',logos:[{name:'Vercel'},{name:'Linear'},{name:'Stripe'},{name:'Notion'},{name:'Figma'}]},
      {id:'features',type:'features',backgroundColor:'#f8fafc',eyebrow:'Features',eyebrowColor:'#4F7CFF',title:'Everything you need to succeed',subtitle:'A complete set of tools to help you build, launch, and grow.',align:'center',columns:3,items:[{icon:'⚡',title:'Visual Canvas',description:'Drag 35 component types with live preview.'},{icon:'🎨',title:'Design Tokens',description:'Manage colors and typography globally.'},{icon:'📦',title:'Clean Export',description:'Download production-ready HTML/CSS/JS.'}]},
      {id:'stats',type:'stats',backgroundColor:'#0B1220',textColor:'#fff',accentColor:'#4F7CFF',columns:4,items:[{value:'10K+',label:'Builders'},{value:'99.9%',label:'Uptime'},{value:'35',label:'Components'},{value:'4.9★',label:'Rating'}]},
      {id:'pricing',type:'pricing',backgroundColor:'#fff',eyebrow:'Pricing',title:'Simple pricing',subtitle:'No surprises.',align:'center',plans:[{name:'Starter',price:0,currency:'$',period:'/month',accentColor:'#4F7CFF',features:[{text:'3 projects',included:true},{text:'All components',included:true},{text:'Custom domain',included:false}],cta:'Get started',ctaHref:'#',ctaVariant:'outline'},{name:'Pro',price:29,currency:'$',period:'/month',popular:true,popularLabel:'Most popular',accentColor:'#4F7CFF',features:[{text:'Unlimited projects',included:true},{text:'All components',included:true},{text:'Custom domain',included:true}],cta:'Start free trial',ctaHref:'#',ctaVariant:'solid'},{name:'Enterprise',price:99,currency:'$',period:'/month',accentColor:'#4F7CFF',features:[{text:'Everything in Pro',included:true},{text:'White-label',included:true},{text:'Dedicated support',included:true}],cta:'Contact sales',ctaHref:'#',ctaVariant:'outline'}]},
      {id:'testimonials',type:'testimonials',backgroundColor:'#f8fafc',title:'Loved by builders',align:'center',columns:3,cardBackground:'#fff',items:[{quote:'This changed how our team ships landing pages.',name:'Sarah J.',role:'CEO, TechCorp',rating:5},{quote:'Best investment we made this year.',name:'Mike C.',role:'CTO, StartupXYZ',rating:5},{quote:'I cannot imagine our workflow without it.',name:'Emma W.',role:'Product Manager',rating:5}]},
      {id:'faq',type:'faq',backgroundColor:'#fff',title:'Frequently asked questions',accentColor:'#4F7CFF',items:[{question:'How do I get started?',answer:'Sign up free and create your first project. No credit card required.'},{question:'Can I export my code?',answer:'Yes! Export clean HTML, CSS, and JavaScript ready to deploy anywhere.'},{question:'What components are available?',answer:'35 professional components: hero, features, pricing, testimonials, forms, and more.'}]},
      {id:'cta',type:'cta',backgroundColor:'#0B1220',textColor:'#fff',eyebrow:'Get started today',title:'Ready to build your first page?',subtitle:'Join thousands already using IWB.',align:'center',buttons:[{label:'Start for free',href:'#',backgroundColor:'#4F7CFF',textColor:'#fff',size:'lg'},{label:'Schedule a demo',href:'#',backgroundColor:'transparent',textColor:'#fff',size:'lg',variant:'outline'}],note:'No credit card required'},
      {id:'footer',type:'footer',backgroundColor:'#0B1220',textColor:'#e5e7eb',logo:'Brand',description:'The visual builder for developers.',columns:[{title:'Product',links:[{label:'Features',href:'#'},{label:'Pricing',href:'#'},{label:'Changelog',href:'#'}]},{title:'Company',links:[{label:'About',href:'#'},{label:'Blog',href:'#'},{label:'Careers',href:'#'}]}],copyright:'© 2025 Brand. All rights reserved.',bottomLinks:[{label:'Privacy',href:'#'},{label:'Terms',href:'#'}]}
    ]}
  },
  {
    id:'portfolio', name:'Creative Portfolio', cat:'Portfolio',
    desc:'Personal portfolio with gallery, project cards, and contact form.',
    tags:['portfolio','creative','personal'],
    layout:{ components:[
      {id:'nav',type:'navbar',logo:'Portfolio',sticky:true,backgroundColor:'#111',textColor:'#fff',links:[{label:'Work',href:'#work'},{label:'About',href:'#about'},{label:'Contact',href:'#contact'}]},
      {id:'hero',type:'hero',layout:'left',backgroundColor:'#0f172a',textColor:'#fff',eyebrow:'Creative Designer & Developer',eyebrowColor:'#22C55E',title:'Crafting digital experiences that matter.',subtitle:'I design and build beautiful products that solve real problems.',buttons:[{label:'View my work',href:'#work',backgroundColor:'#22C55E',textColor:'#fff',size:'lg'},{label:'Get in touch',href:'#contact',backgroundColor:'transparent',textColor:'#fff',size:'lg',variant:'outline'}],minHeight:'80vh'},
      {id:'gallery',type:'gallery',galleryLayout:'masonry',columns:3,images:[{src:'',alt:'Project 1'},{src:'',alt:'Project 2'},{src:'',alt:'Project 3'},{src:'',alt:'Project 4'},{src:'',alt:'Project 5'},{src:'',alt:'Project 6'}]},
      {id:'contact',type:'contact',backgroundColor:'#f8fafc',title:'Get in touch',align:'center',items:[{icon:'✉️',label:'Email',value:'hello@portfolio.com'},{icon:'📍',label:'Location',value:'San Francisco, CA'},{icon:'🕐',label:'Availability',value:'Open to new projects'}]},
      {id:'footer',type:'footer',backgroundColor:'#0f172a',textColor:'#e5e7eb',logo:'Portfolio',copyright:'© 2025',social:[{platform:'Twitter',url:'#',icon:'𝕏',label:'Twitter'},{platform:'GitHub',url:'#',icon:'⌥',label:'GitHub'}]}
    ]}
  },
  {
    id:'blog', name:'Blog / Article', cat:'Blog',
    desc:'Clean blog layout with featured image, rich text, and newsletter CTA.',
    tags:['blog','content','article'],
    layout:{ components:[
      {id:'nav',type:'navbar',logo:'The Journal',sticky:true,backgroundColor:'#fff',textColor:'#111',links:[{label:'Articles',href:'#'},{label:'Categories',href:'#'},{label:'Newsletter',href:'#'}]},
      {id:'heading',type:'heading',eyebrow:'Deep Dive · Oct 2025',eyebrowColor:'#4F7CFF',title:'Building Resilient UI Architectures at Scale',subtitle:'An exploration into modular, high-performance interfaces that scale across enterprise applications.',tag:'h1',align:'left',padding:'48px 0 32px'},
      {id:'img',type:'image',src:'',alt:'Article hero image',width:'100%',borderRadius:'12px',margin:'0 0 40px'},
      {id:'text1',type:'richtext',html:'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>'},
      {id:'quote',type:'blockquote',text:'The best interfaces are the ones users never have to think about.',author:'Unknown',accentColor:'#4F7CFF'},
      {id:'text2',type:'richtext',html:'<h2>Why Architecture Matters</h2><p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error.</p>'},
      {id:'cta',type:'cta',backgroundColor:'#0B1220',textColor:'#fff',title:'Enjoy this article?',subtitle:'Subscribe to get weekly deep dives on systems design and interface engineering.',align:'center',buttons:[{label:'Subscribe free',href:'#',backgroundColor:'#4F7CFF',textColor:'#fff',size:'md'}]},
      {id:'footer',type:'footer',backgroundColor:'#0f172a',textColor:'#e5e7eb',logo:'The Journal',copyright:'© 2025'}
    ]}
  },
  {
    id:'coming-soon', name:'Coming Soon', cat:'Special',
    desc:'Launch page with countdown timer and email waitlist form.',
    tags:['coming soon','launch','countdown'],
    layout:{ components:[
      {id:'hero',type:'hero',layout:'centered',backgroundColor:'#0B1220',textColor:'#fff',eyebrow:'Something big is coming',eyebrowColor:'#4F7CFF',title:'We\'re launching soon.',subtitle:'The wait is almost over. Be the first to know when we go live.',buttons:[],minHeight:'40vh'},
      {id:'countdown',type:'countdown',title:'',targetDate:'2026-01-01T00:00:00Z',backgroundColor:'#0B1220',textColor:'#fff',accentColor:'#4F7CFF'},
      {id:'form',type:'form',title:'Get notified on launch',maxWidth:'480px',backgroundColor:'#111A2E',fields:[{type:'email',name:'email',label:'Email Address',placeholder:'your@email.com',required:true}],submitButton:{label:'Notify me',backgroundColor:'#4F7CFF',textColor:'#fff',size:'md',fullWidth:true}},
      {id:'social',type:'social_links',links:[{platform:'Twitter',url:'#',icon:'𝕏',backgroundColor:'rgba(255,255,255,.08)',color:'#fff'},{platform:'GitHub',url:'#',icon:'⌥',backgroundColor:'rgba(255,255,255,.08)',color:'#fff'}],size:'44px',align:'center'}
    ]}
  },
  {
    id:'restaurant', name:'Restaurant', cat:'Restaurant',
    desc:'Restaurant site with hero, menu highlights, gallery, and contact info.',
    tags:['restaurant','food','local'],
    layout:{ components:[
      {id:'nav',type:'navbar',logo:'Bistro',sticky:true,backgroundColor:'rgba(0,0,0,.8)',textColor:'#fff',links:[{label:'Menu',href:'#menu'},{label:'Gallery',href:'#gallery'},{label:'Reservations',href:'#contact'}]},
      {id:'hero',type:'hero',layout:'centered',backgroundColor:'#1a0a00',textColor:'#fff',eyebrow:'Fine Dining Experience',eyebrowColor:'#F59E0B',title:'Food that tells a story.',subtitle:'Fresh ingredients, bold flavors, unforgettable moments.',buttons:[{label:'Reserve a table',href:'#contact',backgroundColor:'#F59E0B',textColor:'#000',size:'lg'}],minHeight:'80vh'},
      {id:'features',type:'features',backgroundColor:'#fff',title:'Our specialties',align:'center',columns:3,iconColor:'#F59E0B',iconBackground:'rgba(245,158,11,.1)',items:[{icon:'🥩',title:'Premium Steaks',description:'Hand-selected, aged to perfection.'},{icon:'🍷',title:'Curated Wine List',description:'Over 200 labels from world-class vineyards.'},{icon:'🎂',title:'House Desserts',description:'Crafted fresh daily by our pastry team.'}]},
      {id:'gallery',type:'gallery',galleryLayout:'grid',columns:3,aspectRatio:'1/1',images:[{src:'',alt:'Dish 1'},{src:'',alt:'Dish 2'},{src:'',alt:'Dish 3'},{src:'',alt:'Ambiance 1'},{src:'',alt:'Ambiance 2'},{src:'',alt:'Ambiance 3'}]},
      {id:'contact',type:'contact',backgroundColor:'#1a0a00',textColor:'#fff',accentColor:'#F59E0B',title:'Find Us',align:'center',items:[{icon:'📍',label:'Address',value:'123 Main Street, Downtown'},{icon:'📞',label:'Phone',value:'+1 (555) 000-0000'},{icon:'🕐',label:'Hours',value:'Tue–Sun, 6pm–11pm'}]},
      {id:'footer',type:'footer',backgroundColor:'#0d0500',textColor:'#d4a47a',logo:'Bistro',copyright:'© 2025 Bistro. Reservations recommended.'}
    ]}
  },
  {
    id:'event', name:'Event / Conference', cat:'Event',
    desc:'Conference page with speakers, schedule, and ticket pricing.',
    tags:['event','conference','webinar'],
    layout:{ components:[
      {id:'banner',type:'banner',text:'Early bird tickets — 40% off until Dec 31',link:'#tickets',linkLabel:'Get tickets →',backgroundColor:'#4F7CFF',textColor:'#fff',closeable:true},
      {id:'nav',type:'navbar',logo:'DevConf 2026',sticky:true,backgroundColor:'#0B1220',textColor:'#fff',links:[{label:'Speakers',href:'#speakers'},{label:'Schedule',href:'#schedule'},{label:'Tickets',href:'#tickets'}],ctaButtons:[{label:'Register now',href:'#tickets',backgroundColor:'#22C55E',textColor:'#fff',size:'sm'}]},
      {id:'hero',type:'hero',layout:'centered',backgroundColor:'#0B1220',textColor:'#fff',eyebrow:'April 12–14, 2026 · San Francisco',eyebrowColor:'#22C55E',title:'DevConf 2026',subtitle:'The world\'s largest developer conference. 3 days, 100+ speakers, infinite possibilities.',buttons:[{label:'Get your ticket',href:'#tickets',backgroundColor:'#22C55E',textColor:'#fff',size:'lg'},{label:'See schedule',href:'#schedule',backgroundColor:'transparent',textColor:'#fff',size:'lg',variant:'outline'}],minHeight:'70vh'},
      {id:'stats',type:'stats',backgroundColor:'#111A2E',textColor:'#fff',accentColor:'#22C55E',columns:4,items:[{value:'3',label:'Days'},{value:'100+',label:'Speakers'},{value:'2,000',label:'Attendees'},{value:'40+',label:'Workshops'}]},
      {id:'speakers',type:'team',backgroundColor:'#f8fafc',title:'Featured Speakers',align:'center',columns:4,members:[{name:'Alex Turner',role:'CTO, BigCo'},{name:'Maria Garcia',role:'VP Eng, MegaCorp'},{name:'James Lee',role:'OSS Lead'},{name:'Sofia Patel',role:'ML Researcher'}]},
      {id:'pricing',type:'pricing',backgroundColor:'#fff',title:'Get your ticket',subtitle:'All passes include access to recordings.',align:'center',plans:[{name:'Community',price:0,currency:'$',period:'',accentColor:'#4F7CFF',features:[{text:'Online stream',included:true},{text:'Q&A access',included:true},{text:'In-person',included:false}],cta:'Register free',ctaHref:'#',ctaVariant:'outline'},{name:'In-Person',price:299,currency:'$',period:'',popular:true,popularLabel:'Best value',accentColor:'#4F7CFF',features:[{text:'All sessions',included:true},{text:'Workshops',included:true},{text:'Networking dinner',included:true}],cta:'Get ticket',ctaHref:'#',ctaVariant:'solid'},{name:'VIP',price:799,currency:'$',period:'',accentColor:'#F59E0B',features:[{text:'Priority seating',included:true},{text:'Speaker dinner',included:true},{text:'1:1 sessions',included:true}],cta:'Get VIP access',ctaHref:'#',ctaVariant:'outline'}]},
      {id:'footer',type:'footer',backgroundColor:'#0B1220',textColor:'#e5e7eb',logo:'DevConf 2026',description:'The premier developer conference.',copyright:'© 2026 DevConf. All rights reserved.'}
    ]}
  },
];

// ── Render Template Gallery ────────────────────────────────────
window.renderTemplateGallery = function() {
  const cats = ['All', ...new Set(TEMPLATES.map(t=>t.cat))];
  let activeCat = 'All';
  let search = '';

  const overlay = document.createElement('div');
  overlay.id = 'template-gallery-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px';

  function render() {
    const filtered = TEMPLATES.filter(t =>
      (activeCat === 'All' || t.cat === activeCat) &&
      (!search || t.name.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag=>tag.includes(search.toLowerCase())))
    );

    overlay.innerHTML = `
    <div style="background:#111A2E;border:1px solid rgba(255,255,255,.07);border-radius:18px;width:900px;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 40px 100px rgba(0,0,0,.7);overflow:hidden">
      <!-- Header -->
      <div style="padding:20px 24px 0;border-bottom:1px solid #1F2A44">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <h2 style="color:#E5E7EB;font-size:22px;font-weight:700;font-family:Inter;margin:0">Choose a Template</h2>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="position:relative">
              <input id="tmpl-search" type="text" placeholder="Search templates..." value="${search}"
                oninput="window._tmplSearch(this.value)"
                style="background:#0F1729;border:1px solid #1F2A44;border-radius:8px;padding:8px 14px 8px 36px;color:#E5E7EB;font-size:14px;width:220px;outline:none;font-family:Inter">
              <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#4B5563;font-family:'Material Symbols Outlined';font-size:18px;pointer-events:none">search</span>
            </div>
            <button onclick="document.getElementById('template-gallery-overlay').remove()"
              style="background:none;border:none;color:#94A3B8;cursor:pointer;font-size:22px;line-height:1;padding:4px">×</button>
          </div>
        </div>
        <!-- Category pills -->
        <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:16px">
          ${cats.map(cat=>`<button onclick="window._tmplCat('${cat}')"
            style="padding:6px 16px;border-radius:999px;border:1px solid ${cat===activeCat?'#4F7CFF':'#1F2A44'};background:${cat===activeCat?'rgba(79,124,255,.15)':'transparent'};color:${cat===activeCat?'#4F7CFF':'#94A3B8'};font-family:Inter;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;cursor:pointer;white-space:nowrap">${cat}</button>`).join('')}
        </div>
      </div>
      <!-- Grid -->
      <div style="flex:1;overflow-y:auto;padding:20px 24px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
        ${filtered.length ? filtered.map(t=>`
          <div onclick="window._selectTemplate('${t.id}')"
            style="background:linear-gradient(145deg,#131D33,#111A2E);border:1px solid #1F2A44;border-radius:12px;overflow:hidden;cursor:pointer;transition:all .2s"
            onmouseover="this.style.borderColor='#4F7CFF';this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(79,124,255,.15)'"
            onmouseout="this.style.borderColor='#1F2A44';this.style.transform='none';this.style.boxShadow='none'">
            <!-- Thumbnail -->
            <div style="height:140px;background:#080E1A;display:flex;flex-direction:column;overflow:hidden;position:relative">
              <div style="height:20px;background:#0F1729;border-bottom:1px solid #1F2A44;display:flex;align-items:center;padding:0 10px;gap:4px">
                <div style="width:6px;height:6px;border-radius:50%;background:#EF4444;opacity:.5"></div>
                <div style="width:6px;height:6px;border-radius:50%;background:#F59E0B;opacity:.5"></div>
                <div style="width:6px;height:6px;border-radius:50%;background:#22C55E;opacity:.5"></div>
              </div>
              <div style="flex:1;display:flex;flex-direction:column;gap:4px;padding:8px;overflow:hidden">
                ${t.layout.components.slice(0,4).map(c=>renderTemplateThumbnailRow(c)).join('')}
              </div>
            </div>
            <!-- Info -->
            <div style="padding:14px">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                <span style="color:#E5E7EB;font-size:14px;font-weight:600;font-family:Inter">${t.name}</span>
                <span style="background:rgba(79,124,255,.1);color:#4F7CFF;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;padding:2px 8px;border-radius:4px">${t.cat}</span>
              </div>
              <p style="color:#94A3B8;font-size:12px;line-height:1.5;margin:0 0 10px;font-family:Inter">${t.desc}</p>
              <div style="display:flex;gap:4px;flex-wrap:wrap">
                ${t.tags.map(tag=>`<span style="background:#1F2A44;color:#4B5563;font-size:10px;padding:2px 8px;border-radius:4px">${tag}</span>`).join('')}
              </div>
            </div>
          </div>`).join('')
          : `<div style="grid-column:span 3;text-align:center;padding:60px;color:#4B5563;font-family:Inter">
              <span style="font-size:48px;display:block;margin-bottom:12px">🔍</span>
              <p style="font-size:15px">No templates found for "<strong>${search}</strong>"</p>
            </div>`}
      </div>
    </div>`;
  }

  window._tmplSearch = (v)=>{ search=v; render(); };
  window._tmplCat = (cat)=>{ activeCat=cat; render(); };
  window._selectTemplate = async (id)=>{
    const tmpl = TEMPLATES.find(t=>t.id===id);
    if (!tmpl) return;
    overlay.remove();

    // Open new project modal with template pre-loaded
    openNewProjectModalWithTemplate(tmpl);
  };

  document.body.appendChild(overlay);
  render();
};

function renderTemplateThumbnailRow(c) {
  const colors = {
    navbar:'#0F1729', hero:'#111A2E', section:'#fff', features:'#f8fafc',
    cta:'#0B1220', footer:'#0f172a', pricing:'#fff', testimonials:'#f8fafc',
    stats:'#111A2E', team:'#fff', contact:'#f8fafc', faq:'#fff',
    text:'transparent', heading:'transparent', banner:'#4F7CFF'
  };
  const heights = {
    navbar:'12px', hero:'40px', banner:'10px', stats:'24px', footer:'20px',
    features:'28px', pricing:'32px', testimonials:'28px',
  };
  const bg = colors[c.type] || '#f3f4f6';
  const h = heights[c.type] || '16px';
  return `<div style="height:${h};background:${bg};border-radius:3px;width:100%;flex-shrink:0;opacity:.9"></div>`;
}

async function openNewProjectModalWithTemplate(tmpl) {
  const m = document.createElement('div');
  m.id = 'new-project-from-template';
  m.style.cssText = 'position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center';
  m.innerHTML = `
    <div style="background:#111A2E;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:32px;width:460px;box-shadow:0 32px 80px rgba(0,0,0,.6)">
      <h2 style="color:#E5E7EB;font-size:18px;font-weight:600;font-family:Inter;margin:0 0 8px">Create from template</h2>
      <p style="color:#94A3B8;font-size:14px;margin:0 0 24px;font-family:Inter">Starting with: <strong style="color:#4F7CFF">${tmpl.name}</strong></p>
      <div style="margin-bottom:16px">
        <label style="display:block;color:#94A3B8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;font-family:Inter">Project Name</label>
        <input id="tmpl-project-name" type="text" value="${tmpl.name}" autofocus
          style="width:100%;background:#0F1729;border:1px solid #1F2A44;border-radius:8px;padding:10px 14px;color:#E5E7EB;font-size:15px;font-family:Inter;outline:none;box-sizing:border-box"
          onfocus="this.style.borderColor='#4F7CFF'" onblur="this.style.borderColor='#1F2A44'">
      </div>
      <div id="tmpl-create-error" style="display:none;color:#EF4444;font-size:13px;margin-bottom:12px;font-family:Inter"></div>
      <div style="display:flex;gap:12px;justify-content:flex-end">
        <button onclick="document.getElementById('new-project-from-template').remove()"
          style="padding:10px 20px;border:1px solid #1F2A44;background:transparent;color:#E5E7EB;border-radius:8px;cursor:pointer;font-family:Inter;font-size:14px">Cancel</button>
        <button id="tmpl-create-btn" onclick="createProjectFromTemplate('${tmpl.id}')"
          style="padding:10px 24px;background:linear-gradient(135deg,#5A84FF,#4F7CFF);color:white;border:none;border-radius:8px;cursor:pointer;font-family:Inter;font-size:14px;font-weight:600">
          Create Project
        </button>
      </div>
    </div>`;
  document.body.appendChild(m);
  document.getElementById('tmpl-project-name').focus();
  document.getElementById('tmpl-project-name').addEventListener('keydown', e=>{ if(e.key==='Enter') createProjectFromTemplate(tmpl.id); });
}

async function createProjectFromTemplate(templateId) {
  const tmpl = TEMPLATES.find(t=>t.id===templateId);
  if (!tmpl) return;
  const name = document.getElementById('tmpl-project-name')?.value?.trim();
  const errEl = document.getElementById('tmpl-create-error');
  const btn = document.getElementById('tmpl-create-btn');
  if (!name) { errEl.textContent='Project name is required'; errEl.style.display='block'; return; }
  btn.textContent = 'Creating…'; btn.disabled = true;

  const data = await projectsAPI.create({
    title: name,
    layout: tmpl.layout,
    meta: { title: name },
  });

  if (data?.id) {
    document.getElementById('new-project-from-template')?.remove();
    showToast(`Project created from "${tmpl.name}" template!`, 'success');
    router.go(`/editor/${data.id}`);
  } else {
    errEl.textContent = parseError(data) || 'Failed to create project';
    errEl.style.display = 'block';
    btn.textContent = 'Create Project'; btn.disabled = false;
  }
}
