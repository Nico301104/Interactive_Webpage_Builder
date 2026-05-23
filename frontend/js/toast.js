// ── Toast Notification System ─────────────────────────────────
function showToast(message, type='success', duration=3500) {
  const colors = { success:'#22C55E', error:'#EF4444', info:'#4F7CFF', warning:'#F59E0B' };
  const icons  = { success:'check_circle', error:'error', info:'info', warning:'warning' };
  const color  = colors[type] || colors.info;
  const icon   = icons[type]  || icons.info;

  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    min-width:300px; max-width:420px;
    background:rgba(17,26,46,0.97); border:1px solid #1F2A44;
    border-left:3px solid ${color};
    border-radius:10px; padding:14px 16px;
    display:flex; align-items:flex-start; gap:12px;
    box-shadow:0 8px 32px rgba(0,0,0,0.6);
    backdrop-filter:blur(16px);
    font-family:Inter,system-ui,sans-serif;
    transform:translateX(120%); transition:transform 200ms ease;
  `;
  t.innerHTML = `
    <span class="material-symbols-outlined" style="color:${color};font-size:20px;flex-shrink:0;margin-top:1px">${icon}</span>
    <span style="color:#E5E7EB;font-size:14px;line-height:1.5;flex:1">${message}</span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:#94A3B8;cursor:pointer;font-size:18px;line-height:1;padding:0;margin-top:-2px">&times;</button>
  `;
  document.body.appendChild(t);
  requestAnimationFrame(()=>{ requestAnimationFrame(()=>{ t.style.transform='translateX(0)'; }); });
  setTimeout(()=>{ t.style.transform='translateX(120%)'; setTimeout(()=>t.remove(),200); }, duration);
}
window.showToast = showToast;

// ── Confirm dialog ────────────────────────────────────────────
function showConfirm(message, onConfirm, danger=true) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `
    <div style="background:#111A2E;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:32px;max-width:400px;width:90%;box-shadow:0 32px 80px rgba(0,0,0,0.6)">
      <p style="color:#E5E7EB;font-size:15px;line-height:1.6;margin:0 0 24px;font-family:Inter,sans-serif">${message}</p>
      <div style="display:flex;gap:12px;justify-content:flex-end">
        <button id="conf-cancel" style="padding:8px 20px;border:1px solid #1F2A44;background:transparent;color:#E5E7EB;border-radius:8px;cursor:pointer;font-family:Inter,sans-serif;font-size:14px">Cancel</button>
        <button id="conf-ok" style="padding:8px 20px;background:${danger?'#EF4444':'#4F7CFF'};color:white;border:none;border-radius:8px;cursor:pointer;font-family:Inter,sans-serif;font-size:14px;font-weight:600">Confirm</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#conf-cancel').onclick = ()=>overlay.remove();
  overlay.querySelector('#conf-ok').onclick = ()=>{ overlay.remove(); onConfirm(); };
}
window.showConfirm = showConfirm;
