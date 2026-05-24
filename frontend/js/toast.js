// ── Toast Notification System ─────────────────────────────────
function showToast(message, type='success', duration=3500) {
  const palettes = {
    success: { color:'#22C55E', icon:'check_circle',  glow:'rgba(34,197,94,.25)'   },
    error:   { color:'#ff6b6b', icon:'error',          glow:'rgba(255,107,107,.25)' },
    info:    { color:'#00E5FF', icon:'info',            glow:'rgba(0,229,255,.25)'   },
    warning: { color:'#F59E0B', icon:'warning',         glow:'rgba(245,158,11,.25)'  },
  };
  const p = palettes[type] || palettes.info;

  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    min-width:300px; max-width:420px;
    background:rgba(6,15,26,0.97);
    border:1px solid rgba(255,255,255,.07);
    border-left:3px solid ${p.color};
    border-radius:12px; padding:14px 16px;
    display:flex; align-items:flex-start; gap:12px;
    box-shadow:0 12px 40px rgba(0,0,0,.7), 0 0 20px ${p.glow};
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    font-family:Inter,system-ui,sans-serif;
    transform:translateX(120%);
    transition:transform 240ms cubic-bezier(0.23,1,0.32,1);
  `;
  t.innerHTML = `
    <span class="material-symbols-outlined" style="color:${p.color};font-size:20px;flex-shrink:0;margin-top:1px;text-shadow:0 0 12px ${p.color}70">${p.icon}</span>
    <span style="color:#E8F4FD;font-size:14px;line-height:1.55;flex:1">${message}</span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:#374151;cursor:pointer;font-size:20px;line-height:1;padding:0;margin-top:-2px;font-family:Inter,sans-serif;transition:color .15s" onmouseover="this.style.color='#94A3B8'" onmouseout="this.style.color='#374151'">&times;</button>
  `;
  document.body.appendChild(t);
  requestAnimationFrame(()=>{ requestAnimationFrame(()=>{ t.style.transform='translateX(0)'; }); });
  setTimeout(()=>{ t.style.transform='translateX(120%)'; setTimeout(()=>t.remove(),250); }, duration);
}
window.showToast = showToast;

// ── Confirm dialog ────────────────────────────────────────────
function showConfirm(message, onConfirm, danger=true) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(3,11,20,.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:16px';
  overlay.innerHTML = `
    <div style="background:#071220;border:1px solid rgba(${danger?'255,107,107':'0,229,255'},.14);border-radius:18px;padding:36px;max-width:420px;width:100%;box-shadow:0 40px 100px rgba(0,0,0,.8);position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:25%;right:25%;height:1px;background:linear-gradient(90deg,transparent,rgba(${danger?'255,107,107':'0,229,255'},.4),transparent)"></div>
      <p style="color:#E8F4FD;font-size:15px;line-height:1.65;margin:0 0 28px;font-family:Inter,system-ui,sans-serif">${message}</p>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button id="conf-cancel" style="padding:10px 22px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#94A3B8;border-radius:9px;cursor:pointer;font-family:Inter,system-ui,sans-serif;font-size:14px;font-weight:500;transition:all .2s" onmouseover="this.style.color='#E8F4FD'" onmouseout="this.style.color='#94A3B8'">Cancel</button>
        <button id="conf-ok" style="padding:10px 22px;background:${danger?'rgba(255,107,107,.15)':'linear-gradient(135deg,#00C4DD,#006FE8)'};color:${danger?'#ff6b6b':'white'};border:${danger?'1px solid rgba(255,107,107,.3)':'none'};border-radius:9px;cursor:pointer;font-family:Inter,system-ui,sans-serif;font-size:14px;font-weight:700;transition:all .2s;letter-spacing:-.01em" onmouseover="this.style.filter='brightness(1.15)'" onmouseout="this.style.filter=''">Confirm</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#conf-cancel').onclick = ()=>overlay.remove();
  overlay.querySelector('#conf-ok').onclick = ()=>{ overlay.remove(); onConfirm(); };
  overlay.onclick = e=>{ if(e.target===overlay) overlay.remove(); };
}
window.showConfirm = showConfirm;
