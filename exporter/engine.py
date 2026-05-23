"""
Motor de export: transforma structura JSON intr-o pagina web completa, profesionala.
Genereaza HTML semantic, CSS responsive cu clase si JS cu interactivitate reala.
"""
from __future__ import annotations
import html as _html

# ── CSS de baza (injectat in styles.css) ─────────────────────────────────────

BASE_CSS = """\
/* === IWB Export — Reset & Base === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: var(--font, 'Inter', system-ui, -apple-system, sans-serif);
       line-height: 1.6; color: var(--text, #1a1a1a); background: var(--bg, #ffffff); }
img, video { max-width: 100%; display: block; }
a { text-decoration: none; color: inherit; }
ul, ol { list-style: none; }
button { cursor: pointer; border: none; background: none; font: inherit; }

/* === Layout Utilities === */
.pb-container { width: 100%; max-width: var(--max-w, 1200px); margin-inline: auto;
                padding-inline: clamp(16px, 4vw, 48px); }
.pb-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--gap, 24px); }
.pb-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--gap, 24px); }
.pb-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--gap, 24px); }
.pb-flex   { display: flex; align-items: center; }
.pb-flex-col { display: flex; flex-direction: column; }
.pb-center { text-align: center; align-items: center; }
.pb-section { padding: var(--section-py, 80px) 0; }

/* === Navbar === */
.pb-navbar { display: flex; align-items: center; justify-content: space-between;
             padding: 16px 32px; position: relative; z-index: 100; }
.pb-navbar.sticky { position: sticky; top: 0; }
.pb-navbar-logo { font-weight: 700; font-size: 1.25rem; }
.pb-navbar-links { display: flex; align-items: center; gap: 32px; }
.pb-navbar-links a { font-size: 15px; font-weight: 500; transition: opacity .2s; }
.pb-navbar-links a:hover { opacity: .7; }
.pb-navbar-cta { display: flex; gap: 12px; }
.pb-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; }
.pb-hamburger span { width: 24px; height: 2px; background: currentColor; border-radius: 2px; transition: .3s; }

/* === Hero === */
.pb-hero { position: relative; overflow: hidden; display: flex; align-items: center; }
.pb-hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
.pb-hero-overlay { position: absolute; inset: 0; }
.pb-hero-content { position: relative; z-index: 1; width: 100%; }
.pb-hero-eyebrow { display: inline-block; font-size: 13px; font-weight: 600;
                   text-transform: uppercase; letter-spacing: .08em; border-radius: 999px;
                   padding: 4px 14px; margin-bottom: 20px; }
.pb-hero-title { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800;
                 line-height: 1.1; letter-spacing: -.02em; margin-bottom: 20px; }
.pb-hero-subtitle { font-size: clamp(1rem, 2vw, 1.25rem); line-height: 1.7;
                    max-width: 580px; margin-bottom: 36px; opacity: .85; }
.pb-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.pb-hero-media { flex-shrink: 0; }

/* === Buttons === */
.pb-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-weight: 600; border-radius: 8px; cursor: pointer; transition: all .2s;
          white-space: nowrap; text-decoration: none; }
.pb-btn-sm  { font-size: 13px; padding: 8px 16px; }
.pb-btn-md  { font-size: 15px; padding: 12px 24px; }
.pb-btn-lg  { font-size: 17px; padding: 16px 32px; }
.pb-btn-xl  { font-size: 19px; padding: 18px 40px; }
.pb-btn-full { width: 100%; }
.pb-btn:hover { transform: translateY(-1px); filter: brightness(1.07); }
.pb-btn:active { transform: scale(.97); }

/* === Features === */
.pb-features-icon { display: flex; align-items: center; justify-content: center;
                    border-radius: 12px; margin-bottom: 18px; flex-shrink: 0; }
.pb-feature-card { padding: 28px; border-radius: 12px; }

/* === Pricing === */
.pb-pricing-card { border-radius: 16px; padding: 36px 32px; position: relative;
                   display: flex; flex-direction: column; }
.pb-pricing-popular-badge { position: absolute; top: -14px; left: 50%;
                             transform: translateX(-50%); padding: 4px 16px;
                             border-radius: 999px; font-size: 12px; font-weight: 700;
                             text-transform: uppercase; white-space: nowrap; }
.pb-pricing-price { font-size: 3rem; font-weight: 800; line-height: 1; margin: 16px 0 4px; }
.pb-pricing-period { font-size: 14px; opacity: .6; margin-bottom: 24px; }
.pb-pricing-features { list-style: none; margin: 24px 0; flex: 1; }
.pb-pricing-features li { display: flex; align-items: center; gap: 10px;
                           padding: 8px 0; font-size: 15px; border-bottom: 1px solid rgba(0,0,0,.06); }
.pb-pricing-features li::before { content: "✓"; font-weight: 700; flex-shrink: 0; }

/* === Testimonials === */
.pb-testimonial-card { padding: 32px; border-radius: 16px; display: flex; flex-direction: column; }
.pb-testimonial-quote { font-size: 1.1rem; line-height: 1.7; margin-bottom: 24px; flex: 1; }
.pb-testimonial-quote::before { content: '"'; font-size: 3rem; line-height: .5;
                                  display: block; margin-bottom: 12px; opacity: .3; }
.pb-testimonial-author { display: flex; align-items: center; gap: 12px; }
.pb-testimonial-avatar { width: 44px; height: 44px; border-radius: 50%;
                          object-fit: cover; background: #e5e7eb; flex-shrink: 0; }
.pb-testimonial-name { font-weight: 600; font-size: 15px; }
.pb-testimonial-role { font-size: 13px; opacity: .6; }
.pb-stars { color: #f59e0b; font-size: 14px; letter-spacing: 1px; margin-bottom: 12px; }

/* === FAQ === */
.pb-faq-item { border-bottom: 1px solid rgba(0,0,0,.1); }
.pb-faq-question { display: flex; align-items: center; justify-content: space-between;
                   padding: 20px 0; cursor: pointer; font-weight: 600; font-size: 16px; gap: 12px; }
.pb-faq-icon { transition: transform .3s; flex-shrink: 0; font-size: 20px; }
.pb-faq-item.open .pb-faq-icon { transform: rotate(45deg); }
.pb-faq-answer { max-height: 0; overflow: hidden; transition: max-height .35s ease, padding .35s ease; }
.pb-faq-answer-inner { padding: 0 0 20px; font-size: 15px; line-height: 1.7; opacity: .8; }
.pb-faq-item.open .pb-faq-answer { max-height: 400px; }

/* === Stats === */
.pb-stat-item { text-align: center; }
.pb-stat-number { font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 800; line-height: 1; }
.pb-stat-label  { font-size: 15px; margin-top: 8px; opacity: .7; }
.pb-stat-icon   { font-size: 2rem; margin-bottom: 12px; }

/* === Team === */
.pb-team-card { text-align: center; }
.pb-team-photo { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 12px;
                  background: #e5e7eb; margin-bottom: 16px; }
.pb-team-name   { font-weight: 700; font-size: 17px; }
.pb-team-role   { font-size: 14px; opacity: .6; margin: 4px 0 12px; }
.pb-team-bio    { font-size: 14px; line-height: 1.6; opacity: .75; }

/* === Cards === */
.pb-card { border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
.pb-card-image { width: 100%; aspect-ratio: 16/9; object-fit: cover; background: #e5e7eb; }
.pb-card-body  { padding: 24px; flex: 1; display: flex; flex-direction: column; }
.pb-card-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.pb-card-text  { font-size: 14px; line-height: 1.6; opacity: .75; flex: 1; margin-bottom: 20px; }
.pb-card-tag   { display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase;
                  letter-spacing: .07em; border-radius: 4px; padding: 2px 8px; margin-bottom: 12px; }

/* === Gallery === */
.pb-gallery { display: grid; gap: 12px; }
.pb-gallery img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }

/* === Form === */
.pb-form { display: flex; flex-direction: column; gap: 16px; }
.pb-form-group { display: flex; flex-direction: column; gap: 6px; }
.pb-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.pb-label { font-size: 14px; font-weight: 500; }
.pb-input, .pb-textarea, .pb-select {
    width: 100%; padding: 12px 14px; border-radius: 8px; font: inherit; font-size: 15px;
    border: 1px solid #d1d5db; background: #ffffff; transition: border-color .2s, box-shadow .2s;
    color: inherit;
}
.pb-input:focus, .pb-textarea:focus, .pb-select:focus {
    outline: none; border-color: var(--primary, #4F7CFF);
    box-shadow: 0 0 0 3px rgba(79,124,255,.15);
}
.pb-textarea { resize: vertical; min-height: 120px; }

/* === Timeline === */
.pb-timeline { position: relative; }
.pb-timeline::before { content: ''; position: absolute; left: 20px; top: 8px; bottom: 8px;
                         width: 2px; background: var(--primary, #4F7CFF); opacity: .25; }
.pb-timeline-item { display: flex; gap: 24px; padding-bottom: 40px; position: relative; }
.pb-timeline-dot  { width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
                     display: flex; align-items: center; justify-content: center;
                     font-weight: 700; position: relative; z-index: 1; }
.pb-timeline-content { padding-top: 8px; }
.pb-timeline-title { font-weight: 700; font-size: 17px; margin-bottom: 6px; }
.pb-timeline-date  { font-size: 13px; opacity: .6; margin-bottom: 8px; }
.pb-timeline-text  { font-size: 15px; line-height: 1.6; opacity: .8; }

/* === Tabs === */
.pb-tabs-nav   { display: flex; border-bottom: 2px solid rgba(0,0,0,.1); gap: 4px; }
.pb-tab-btn    { padding: 12px 20px; font-size: 15px; font-weight: 500; opacity: .6;
                  border-bottom: 2px solid transparent; margin-bottom: -2px; transition: .2s; cursor: pointer; }
.pb-tab-btn.active { opacity: 1; border-bottom-color: var(--primary, #4F7CFF); color: var(--primary, #4F7CFF); }
.pb-tab-panel  { display: none; padding-top: 32px; }
.pb-tab-panel.active { display: block; }

/* === Heading === */
.pb-eyebrow { display: inline-block; font-size: 12px; font-weight: 700; text-transform: uppercase;
               letter-spacing: .1em; border-radius: 999px; padding: 4px 12px; margin-bottom: 14px; }
.pb-section-title    { font-size: clamp(1.75rem, 3.5vw, 2.75rem); font-weight: 800;
                        line-height: 1.15; letter-spacing: -.02em; margin-bottom: 16px; }
.pb-section-subtitle { font-size: clamp(1rem, 1.8vw, 1.15rem); line-height: 1.7;
                        opacity: .7; max-width: 600px; }

/* === Blockquote === */
.pb-blockquote { border-left: 4px solid var(--primary, #4F7CFF); padding: 16px 24px;
                  border-radius: 0 8px 8px 0; font-size: 1.1rem; font-style: italic; }

/* === Code block === */
.pb-code-block { border-radius: 10px; padding: 24px; overflow-x: auto; position: relative; }
.pb-code-block pre { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 14px; line-height: 1.6; }
.pb-code-lang { position: absolute; top: 10px; right: 14px; font-size: 11px; font-weight: 600;
                 text-transform: uppercase; opacity: .5; }

/* === Gallery === */
.pb-gallery-1 { grid-template-columns: 1fr; }
.pb-gallery-2 { grid-template-columns: repeat(2, 1fr); }
.pb-gallery-3 { grid-template-columns: repeat(3, 1fr); }
.pb-gallery-4 { grid-template-columns: repeat(4, 1fr); }
.pb-gallery-masonry { columns: 3; gap: 12px; }
.pb-gallery-masonry img { break-inside: avoid; margin-bottom: 12px; border-radius: 8px; }

/* === Logo strip === */
.pb-logo-strip { display: flex; flex-wrap: wrap; align-items: center;
                  justify-content: center; gap: 40px; opacity: .6; }
.pb-logo-strip img { height: 32px; width: auto; object-fit: contain; filter: grayscale(1); }
.pb-logo-strip span { font-size: 18px; font-weight: 700; }

/* === Social links === */
.pb-social-links { display: flex; gap: 12px; }
.pb-social-link  { display: flex; align-items: center; justify-content: center;
                    width: 40px; height: 40px; border-radius: 8px; font-size: 18px;
                    transition: transform .2s, opacity .2s; }
.pb-social-link:hover { transform: translateY(-2px); opacity: .8; }

/* === Banner === */
.pb-banner { padding: 14px 24px; display: flex; align-items: center;
              justify-content: center; gap: 12px; font-size: 14px; font-weight: 500; }
.pb-banner-close { margin-left: auto; cursor: pointer; opacity: .6; font-size: 18px; }

/* === Contact === */
.pb-contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; }
.pb-contact-item { display: flex; gap: 14px; align-items: flex-start; }
.pb-contact-icon { font-size: 1.5rem; flex-shrink: 0; }

/* === Countdown === */
.pb-countdown { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
.pb-countdown-unit { text-align: center; }
.pb-countdown-num  { font-size: 3rem; font-weight: 800; line-height: 1; display: block; min-width: 80px; }
.pb-countdown-label{ font-size: 12px; text-transform: uppercase; letter-spacing: .1em; opacity: .6; }

/* === Footer === */
.pb-footer { padding: 64px 0 32px; }
.pb-footer-grid { display: grid; gap: 40px; }
.pb-footer-brand { max-width: 280px; }
.pb-footer-logo  { font-size: 1.2rem; font-weight: 700; margin-bottom: 12px; }
.pb-footer-desc  { font-size: 14px; line-height: 1.7; opacity: .65; }
.pb-footer-col-title { font-size: 13px; font-weight: 700; text-transform: uppercase;
                         letter-spacing: .08em; margin-bottom: 16px; opacity: .5; }
.pb-footer-col-links { display: flex; flex-direction: column; gap: 10px; }
.pb-footer-col-links a { font-size: 15px; opacity: .7; transition: opacity .2s; }
.pb-footer-col-links a:hover { opacity: 1; }
.pb-footer-bottom { margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(0,0,0,.08);
                     display: flex; align-items: center; justify-content: space-between;
                     flex-wrap: wrap; gap: 12px; font-size: 13px; opacity: .55; }

/* === Responsive === */
@media (max-width: 1024px) {
  .pb-grid-4 { grid-template-columns: repeat(2, 1fr); }
  .pb-hero { flex-direction: column; text-align: center; }
  .pb-hero-actions { justify-content: center; }
  .pb-hero-subtitle { margin-inline: auto; }
}
@media (max-width: 768px) {
  .pb-grid-2, .pb-grid-3, .pb-grid-4 { grid-template-columns: 1fr; }
  .pb-navbar-links, .pb-navbar-cta { display: none; }
  .pb-navbar-links.open { display: flex; flex-direction: column; position: absolute;
    top: 100%; left: 0; right: 0; padding: 16px 32px; gap: 16px; z-index: 200; }
  .pb-hamburger { display: flex; }
  .pb-pb-section { padding: 48px 0; }
  .pb-form-row { grid-template-columns: 1fr; }
  .pb-gallery-3, .pb-gallery-4 { grid-template-columns: repeat(2, 1fr); }
  .pb-gallery-masonry { columns: 2; }
  .pb-footer-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .pb-footer-grid { grid-template-columns: 1fr; }
  .pb-gallery-2, .pb-gallery-3, .pb-gallery-4 { grid-template-columns: 1fr; }
  .pb-gallery-masonry { columns: 1; }
  .pb-countdown-num { font-size: 2rem; min-width: 60px; }
}
"""

# ── JS interactiv (injectat in main.js) ───────────────────────────────────────

BASE_JS = """\
// === IWB — Generated JS ===
(function() {
  // --- Navbar mobile toggle ---
  document.querySelectorAll('.pb-hamburger').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var links = btn.closest('.pb-navbar').querySelector('.pb-navbar-links');
      if (links) links.classList.toggle('open');
    });
  });

  // --- Navbar scroll class ---
  var navbars = document.querySelectorAll('.pb-navbar.sticky');
  if (navbars.length) {
    window.addEventListener('scroll', function() {
      navbars.forEach(function(nav) {
        nav.classList.toggle('scrolled', window.scrollY > 40);
      });
    }, { passive: true });
  }

  // --- FAQ Accordion ---
  document.querySelectorAll('.pb-faq-question').forEach(function(q) {
    q.addEventListener('click', function() {
      var item = q.closest('.pb-faq-item');
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.pb-faq-item.open').forEach(function(i) { i.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  // --- Tabs ---
  document.querySelectorAll('.pb-tabs-nav').forEach(function(nav) {
    nav.querySelectorAll('.pb-tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var container = nav.closest('.pb-tabs-wrapper');
        var target = btn.dataset.tab;
        container.querySelectorAll('.pb-tab-btn').forEach(function(b) { b.classList.remove('active'); });
        container.querySelectorAll('.pb-tab-panel').forEach(function(p) { p.classList.remove('active'); });
        btn.classList.add('active');
        var panel = container.querySelector('.pb-tab-panel[data-tab="' + target + '"]');
        if (panel) panel.classList.add('active');
      });
    });
  });

  // --- Banner dismiss ---
  document.querySelectorAll('.pb-banner-close').forEach(function(btn) {
    btn.addEventListener('click', function() {
      btn.closest('.pb-banner').style.display = 'none';
    });
  });

  // --- Countdown timer ---
  document.querySelectorAll('.pb-countdown[data-target]').forEach(function(el) {
    var target = new Date(el.dataset.target).getTime();
    function tick() {
      var now = Date.now(), diff = target - now;
      if (diff <= 0) { el.innerHTML = '<span style="font-size:1.5rem;font-weight:700">Time is up!</span>'; return; }
      var d = Math.floor(diff / 86400000),
          h = Math.floor((diff % 86400000) / 3600000),
          m = Math.floor((diff % 3600000) / 60000),
          s = Math.floor((diff % 60000) / 1000);
      ['days','hours','minutes','seconds'].forEach(function(unit, i) {
        var num = el.querySelector('.pb-countdown-num[data-unit="' + unit + '"]');
        if (num) num.textContent = String([d,h,m,s][i]).padStart(2,'0');
      });
      setTimeout(tick, 1000);
    }
    tick();
  });

  // --- Scroll reveal (subtle fade-in) ---
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none'; io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.pb-section, .pb-feature-card, .pb-pricing-card, .pb-testimonial-card, .pb-card, .pb-team-card, .pb-stat-item').forEach(function(el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
      io.observe(el);
    });
  }

  // --- Form submit handler ---
  document.querySelectorAll('.pb-form').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var original = btn ? btn.textContent : '';
      var action = form.getAttribute('action');
      if (!action) {
        form.innerHTML = '<p style="font-size:1.1rem;font-weight:600;color:var(--primary,#4F7CFF);text-align:center">✓ Message sent successfully!</p>';
        return;
      }
      if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
      var data = {};
      new FormData(form).forEach(function(v, k) { data[k] = v; });
      fetch(action, {
        method: form.getAttribute('method') || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function(res) {
        if (res.ok || res.status === 201) {
          form.innerHTML = '<p style="font-size:1.1rem;font-weight:600;color:var(--primary,#4F7CFF);text-align:center">✓ Message sent successfully!</p>';
        } else {
          if (btn) { btn.textContent = original; btn.disabled = false; }
        }
      }).catch(function() {
        if (btn) { btn.textContent = original; btn.disabled = false; }
      });
    });
  });

  // --- Active nav link highlight ---
  document.querySelectorAll('.pb-navbar-links a').forEach(function(a) {
    if (a.href === window.location.href) a.style.fontWeight = '800';
  });

})();
"""


# ── Helpers ───────────────────────────────────────────────────────────────────

def _e(text: str) -> str:
    """Escape HTML entities."""
    return _html.escape(str(text)) if text else ''


def _css(props: dict, skip: set = frozenset()) -> str:
    """Convert a dict of CSS-like keys to inline style string."""
    _MAP = {
        'backgroundColor': 'background-color', 'textColor': 'color', 'color': 'color',
        'fontSize': 'font-size', 'fontWeight': 'font-weight', 'lineHeight': 'line-height',
        'letterSpacing': 'letter-spacing', 'textAlign': 'text-align',
        'padding': 'padding', 'paddingTop': 'padding-top', 'paddingBottom': 'padding-bottom',
        'paddingLeft': 'padding-left', 'paddingRight': 'padding-right',
        'margin': 'margin', 'marginTop': 'margin-top', 'marginBottom': 'margin-bottom',
        'borderRadius': 'border-radius', 'border': 'border',
        'maxWidth': 'max-width', 'minHeight': 'min-height', 'width': 'width', 'height': 'height',
        'objectFit': 'object-fit', 'gap': 'gap', 'opacity': 'opacity',
        'backgroundImage': 'background-image',
        'backgroundSize': 'background-size', 'backgroundPosition': 'background-position',
        'boxShadow': 'box-shadow', 'transform': 'transform',
    }
    parts = []
    for key, css_prop in _MAP.items():
        if key in skip:
            continue
        val = props.get(key)
        if val is None:
            continue
        if isinstance(val, (int, float)) and key in ('height', 'minHeight', 'maxWidth', 'width', 'gap'):
            val = f'{val}px'
        parts.append(f'{css_prop}:{val}')
    return ';'.join(parts)


def _sty(props: dict, skip: set = frozenset(), extra: str = '') -> str:
    s = _css(props, skip)
    if extra:
        s = s + ';' + extra if s else extra
    return f' style="{s}"' if s else ''


def _btn_html(c: dict) -> str:
    bg = c.get('backgroundColor', '#4F7CFF')
    tc = c.get('textColor', '#ffffff')
    br = c.get('borderRadius', '8px')
    size_cls = {'sm': 'pb-btn-sm', 'md': 'pb-btn-md', 'lg': 'pb-btn-lg', 'xl': 'pb-btn-xl'}.get(c.get('size', 'md'), 'pb-btn-md')
    fw = ' pb-btn-full' if c.get('fullWidth') else ''
    outline = c.get('variant') == 'outline'
    if outline:
        style = f'border:2px solid {bg};color:{bg};background:transparent;border-radius:{br}'
    else:
        style = f'background:{bg};color:{tc};border-radius:{br}'
    icon = f'<span>{c["icon"]}</span>' if c.get('icon') else ''
    return (f'<a href="{_e(c.get("href","#"))}" '
            f'class="pb-btn {size_cls}{fw}" style="{style}">'
            f'{icon}{_e(c.get("label","Button"))}</a>')


def _section_header(c: dict) -> str:
    """Render eyebrow + title + subtitle header block."""
    align = c.get('align', 'left')
    center = ' pb-center' if align == 'center' else ''
    out = f'<div class="pb-section-header{center}" style="margin-bottom:48px">'
    if c.get('eyebrow'):
        ec = c.get('eyebrowColor', '#4F7CFF')
        out += f'<span class="pb-eyebrow" style="color:{ec};background:rgba(79,124,255,.1)">{_e(c["eyebrow"])}</span>'
    tc = c.get('titleColor', 'inherit')
    out += f'<h2 class="pb-section-title" style="color:{tc}">{_e(c.get("title",""))}</h2>'
    if c.get('subtitle'):
        sc = c.get('subtitleColor', 'inherit')
        if align == 'center':
            out += f'<p class="pb-section-subtitle" style="color:{sc};margin-inline:auto">{_e(c["subtitle"])}</p>'
        else:
            out += f'<p class="pb-section-subtitle" style="color:{sc}">{_e(c["subtitle"])}</p>'
    out += '</div>'
    return out


# ── Component renderers ───────────────────────────────────────────────────────

def _render_navbar(c: dict) -> str:
    sticky_cls = ' sticky' if c.get('sticky') else ''
    scrolled_style = c.get('scrolledBackground', '')
    bg = c.get('backgroundColor', '#ffffff')
    tc = c.get('textColor', '#111111')
    logo_img = c.get('logoImage', '')
    if logo_img:
        logo_html = f'<a href="{_e(c.get("homeHref","#"))}" class="pb-navbar-logo" style="color:{tc}"><img src="{_e(logo_img)}" alt="{_e(c.get("logo",""))}" style="height:32px;width:auto"></a>'
    else:
        logo_html = f'<a href="{_e(c.get("homeHref","#"))}" class="pb-navbar-logo" style="color:{tc}">{_e(c.get("logo","Brand"))}</a>'
    links_html = ''.join(
        f'<a href="{_e(lnk.get("href","#"))}" style="color:{tc}">{_e(lnk.get("label","Link"))}</a>'
        for lnk in c.get('links', [])
    )
    cta_html = ''.join(_btn_html(btn) for btn in c.get('ctaButtons', []))
    cta_div = f'<div class="pb-navbar-cta">{cta_html}</div>' if cta_html else ''
    return (f'<nav class="pb-navbar{sticky_cls}" style="background:{bg};color:{tc}" '
            f'data-scrolled-bg="{_e(scrolled_style)}">'
            f'{logo_html}'
            f'<div class="pb-navbar-links">{links_html}</div>'
            f'{cta_div}'
            f'<button class="pb-hamburger" aria-label="Menu" style="color:{tc}">'
            f'<span></span><span></span><span></span></button>'
            f'</nav>')


def _render_hero(c: dict) -> str:
    min_h = c.get('minHeight', '90vh')
    bg = c.get('backgroundColor', '#0f172a')
    tc = c.get('textColor', '#ffffff')
    bg_img = c.get('backgroundImage', '')
    overlay_color = c.get('overlayColor', '')
    overlay_opacity = c.get('overlayOpacity', 0.4)
    layout = c.get('layout', 'centered')  # centered | left | right | split
    pad = c.get('padding', 'clamp(64px,10vw,120px) 0')

    bg_style = f'background:{bg};'
    bg_div = ''
    if bg_img:
        bg_div = f'<div class="pb-hero-bg" style="background-image:url({_e(bg_img)});background-size:cover;background-position:{_e(c.get("backgroundPosition","center"))}"></div>'
    overlay_div = ''
    if overlay_color:
        overlay_div = f'<div class="pb-hero-overlay" style="background:{_e(overlay_color)};opacity:{overlay_opacity}"></div>'

    center_cls = ' pb-center' if layout == 'centered' else ''
    content_max = c.get('contentMaxWidth', '700px')

    eyebrow_html = ''
    if c.get('eyebrow'):
        ec = c.get('eyebrowColor', '#4F7CFF')
        eyebrow_html = f'<span class="pb-hero-eyebrow" style="color:{ec};background:rgba(79,124,255,.12)">{_e(c["eyebrow"])}</span>'

    title_html = f'<h1 class="pb-hero-title" style="color:{tc}">{_e(c.get("title",""))}</h1>'

    sub_html = ''
    if c.get('subtitle'):
        sc = c.get('subtitleColor', tc)
        sub_html = f'<p class="pb-hero-subtitle" style="color:{sc};opacity:.85">{_e(c["subtitle"])}</p>'

    btns_html = ''
    if c.get('buttons'):
        btns = ''.join(_btn_html(b) for b in c['buttons'])
        btns_html = f'<div class="pb-hero-actions">{btns}</div>'

    note_html = ''
    if c.get('note'):
        note_html = f'<p style="font-size:13px;opacity:.6;margin-top:14px;color:{tc}">{_e(c["note"])}</p>'

    media_html = ''
    if c.get('image'):
        br = c.get('imageRadius', '12px')
        shadow = c.get('imageShadow', '0 24px 80px rgba(0,0,0,.3)')
        media_html = (f'<div class="pb-hero-media" style="max-width:{c.get("imageMaxWidth","560px")}">'
                      f'<img src="{_e(c["image"])}" alt="{_e(c.get("imageAlt",""))}" '
                      f'style="border-radius:{br};box-shadow:{shadow};width:100%"></div>')
    if c.get('video'):
        media_html = (f'<div class="pb-hero-media" style="max-width:{c.get("videoMaxWidth","560px")}">'
                      f'<video src="{_e(c["video"])}" autoplay muted loop playsinline '
                      f'style="border-radius:{c.get("videoRadius","12px")};width:100%"></video></div>')

    if layout == 'split' and media_html:
        inner = (f'<div class="pb-container"><div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center">'
                 f'<div class="pb-hero-content">{eyebrow_html}{title_html}{sub_html}{btns_html}{note_html}</div>'
                 f'{media_html}</div></div>')
    else:
        align = 'center' if layout == 'centered' else 'left'
        inner = (f'<div class="pb-container{center_cls}">'
                 f'<div class="pb-hero-content" style="max-width:{content_max};{"margin-inline:auto;" if layout=="centered" else ""}'
                 f'text-align:{align}">'
                 f'{eyebrow_html}{title_html}{sub_html}{btns_html}{note_html}</div>'
                 f'{media_html}</div>')

    return (f'<section class="pb-hero" style="{bg_style}padding:{pad};min-height:{min_h}">'
            f'{bg_div}{overlay_div}{inner}</section>')


def _render_features(c: dict) -> str:
    bg = c.get('backgroundColor', '#ffffff')
    cols = c.get('columns', 3)
    icon_bg = c.get('iconBackground', 'rgba(79,124,255,.1)')
    icon_color = c.get('iconColor', '#4F7CFF')
    icon_size = c.get('iconSize', '48px')
    card_bg = c.get('cardBackground', 'transparent')
    card_border = c.get('cardBorder', '')
    tc = c.get('textColor', '#1a1a1a')
    header = _section_header(c) if c.get('title') else ''
    items = c.get('items', [])
    cards = ''
    for item in items:
        icon_html = ''
        if item.get('icon'):
            icon_html = (f'<div class="pb-features-icon" style="width:{icon_size};height:{icon_size};'
                         f'background:{icon_bg}">'
                         f'<span style="font-size:calc({icon_size} * .5);color:{icon_color}">{item["icon"]}</span></div>')
        elif item.get('iconImage'):
            icon_html = f'<img src="{_e(item["iconImage"])}" alt="" style="width:{icon_size};height:{icon_size};margin-bottom:18px">'
        bd = f'border:1px solid {card_border};' if card_border else ''
        shadow = f'box-shadow:{item.get("shadow","")};' if item.get('shadow') else ''
        cards += (f'<div class="pb-feature-card" style="background:{card_bg};{bd}{shadow}">'
                  f'{icon_html}'
                  f'<h3 style="font-size:18px;font-weight:700;margin-bottom:10px;color:{tc}">{_e(item.get("title",""))}</h3>'
                  f'<p style="font-size:15px;line-height:1.7;opacity:.75;color:{tc}">{_e(item.get("description",""))}</p>'
                  f'{"<a href=" + chr(34) + _e(item["link"]) + chr(34) + " style=color:" + _e(item.get("linkColor","#4F7CFF")) + ";font-weight:600;font-size:14px;margin-top:14px;display:inline-block>" + _e(item.get("linkLabel","Learn more →")) + "</a>" if item.get("link") else ""}'
                  f'</div>')
    pad = c.get('padding', '80px 0')
    grid_cls = f'pb-grid-{min(max(cols,1),4)}'
    return (f'<section class="pb-section" style="background:{bg};padding:{pad}">'
            f'<div class="pb-container">{header}'
            f'<div class="{grid_cls}" style="--gap:{c.get("gap","24px")}">{cards}</div></div></section>')


def _render_pricing(c: dict) -> str:
    bg = c.get('backgroundColor', '#f8fafc')
    tc = c.get('textColor', '#1a1a1a')
    header = _section_header(c) if c.get('title') else ''
    plans = c.get('plans', [])
    cards = ''
    for plan in plans:
        popular = plan.get('popular', False)
        card_bg = plan.get('backgroundColor', '#ffffff')
        card_tc = plan.get('textColor', tc)
        border = f'border:2px solid {plan.get("accentColor","#4F7CFF")};' if popular else f'border:1px solid #e5e7eb;'
        badge = (f'<div class="pb-pricing-popular-badge" style="background:{plan.get("accentColor","#4F7CFF")};color:#fff">'
                 f'{_e(plan.get("popularLabel","Most popular"))}</div>') if popular else ''
        features = ''.join(
            f'<li style="color:{card_tc}" {"" if feat.get("included",True) else "style=opacity:.4"}>'
            f'<span style="color:{"#22C55E" if feat.get("included",True) else "#94A3B8"}">'
            f'{"✓" if feat.get("included",True) else "✕"}</span>{_e(feat.get("text",""))}</li>'
            for feat in plan.get('features', [])
        )
        btn = _btn_html({**plan.get('button', {}), 'backgroundColor': plan.get('accentColor', '#4F7CFF')}) if plan.get('button') else ''
        currency = _e(plan.get('currency', '$'))
        price = _e(str(plan.get('price', '0')))
        period = _e(plan.get('period', '/month'))
        cards += (f'<div class="pb-pricing-card" style="background:{card_bg};{border}">'
                  f'{badge}'
                  f'<div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;opacity:.5;color:{card_tc}">{_e(plan.get("name","Plan"))}</div>'
                  f'<div class="pb-pricing-price" style="color:{card_tc}">{currency}{price}</div>'
                  f'<div class="pb-pricing-period" style="color:{card_tc}">{period}</div>'
                  f'{"<p style=font-size:14px;opacity:.7;margin-bottom:20px;color:" + card_tc + ">" + _e(plan.get("description","")) + "</p>" if plan.get("description") else ""}'
                  f'<ul class="pb-pricing-features" style="color:{card_tc}">{features}</ul>'
                  f'{btn}</div>')
    cols = min(len(plans), 3) if plans else 3
    return (f'<section class="pb-section" style="background:{bg};padding:{c.get("padding","80px 0")}">'
            f'<div class="pb-container">{header}'
            f'<div class="pb-grid-{cols}" style="--gap:24px;align-items:start">{cards}</div></div></section>')


def _render_testimonials(c: dict) -> str:
    bg = c.get('backgroundColor', '#ffffff')
    tc = c.get('textColor', '#1a1a1a')
    card_bg = c.get('cardBackground', '#f8fafc')
    header = _section_header(c) if c.get('title') else ''
    items = c.get('items', [])
    cols = min(c.get('columns', 3), len(items)) if items else 3
    cards = ''
    for item in items:
        stars = '★' * int(item.get('rating', 5))
        avatar = (f'<img class="pb-testimonial-avatar" src="{_e(item["avatar"])}" alt="{_e(item.get("name",""))}">'
                  if item.get('avatar') else
                  f'<div class="pb-testimonial-avatar" style="background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px">{_e(item.get("name","?")[:1])}</div>')
        cards += (f'<div class="pb-testimonial-card" style="background:{card_bg};color:{tc}">'
                  f'<div class="pb-stars">{stars}</div>'
                  f'<p class="pb-testimonial-quote">{_e(item.get("quote",""))}</p>'
                  f'<div class="pb-testimonial-author">{avatar}'
                  f'<div><div class="pb-testimonial-name">{_e(item.get("name",""))}</div>'
                  f'<div class="pb-testimonial-role">{_e(item.get("role",""))}</div></div></div></div>')
    return (f'<section class="pb-section" style="background:{bg};padding:{c.get("padding","80px 0")}">'
            f'<div class="pb-container">{header}'
            f'<div class="pb-grid-{min(cols,3)}" style="--gap:24px">{cards}</div></div></section>')


def _render_faq(c: dict) -> str:
    bg = c.get('backgroundColor', '#ffffff')
    tc = c.get('textColor', '#1a1a1a')
    accent = c.get('accentColor', '#4F7CFF')
    header = _section_header(c) if c.get('title') else ''
    items = c.get('items', [])
    faq_items = ''
    for item in items:
        faq_items += (f'<div class="pb-faq-item" style="color:{tc}">'
                      f'<div class="pb-faq-question">{_e(item.get("question",""))}'
                      f'<span class="pb-faq-icon" style="color:{accent}">+</span></div>'
                      f'<div class="pb-faq-answer"><div class="pb-faq-answer-inner">{_e(item.get("answer",""))}</div></div></div>')
    max_w = c.get('maxWidth', '760px')
    return (f'<section class="pb-section" style="background:{bg};padding:{c.get("padding","80px 0")}">'
            f'<div class="pb-container">'
            f'<div style="max-width:{max_w};margin-inline:auto">'
            f'{header}<div>{faq_items}</div></div></div></section>')


def _render_cta(c: dict) -> str:
    bg = c.get('backgroundColor', '#0f172a')
    tc = c.get('textColor', '#ffffff')
    bg_img = c.get('backgroundImage', '')
    overlay = f'background-image:url({_e(bg_img)});background-size:cover;background-position:center;' if bg_img else ''
    pad = c.get('padding', '96px 0')
    align = c.get('align', 'center')
    center_cls = ' pb-center' if align == 'center' else ''
    btns = ''.join(_btn_html(b) for b in c.get('buttons', []))
    btns_html = f'<div class="pb-hero-actions" style="{"justify-content:center;" if align=="center" else ""}">{btns}</div>' if btns else ''
    eyebrow_html = f'<span class="pb-eyebrow" style="color:{c.get("eyebrowColor","#4F7CFF")};background:rgba(79,124,255,.12)">{_e(c["eyebrow"])}</span>' if c.get('eyebrow') else ''
    return (f'<section class="pb-section{center_cls}" style="background:{bg};{overlay}padding:{pad}">'
            f'<div class="pb-container"><div style="max-width:{c.get("maxWidth","700px")};{"margin-inline:auto;" if align=="center" else ""}">'
            f'{eyebrow_html}'
            f'<h2 class="pb-section-title" style="color:{tc}">{_e(c.get("title",""))}</h2>'
            f'{"<p style=font-size:1.1rem;opacity:.8;margin-bottom:32px;color:" + tc + ">" + _e(c.get("subtitle","")) + "</p>" if c.get("subtitle") else ""}'
            f'{btns_html}'
            f'{"<p style=font-size:13px;margin-top:14px;opacity:.5;color:" + tc + ">" + _e(c.get("note","")) + "</p>" if c.get("note") else ""}'
            f'</div></div></section>')


def _render_stats(c: dict) -> str:
    bg = c.get('backgroundColor', '#ffffff')
    tc = c.get('textColor', '#1a1a1a')
    accent = c.get('accentColor', '#4F7CFF')
    header = _section_header(c) if c.get('title') else ''
    items = c.get('items', [])
    cols = min(c.get('columns', 4), max(len(items), 1))
    stats_html = ''
    for item in items:
        icon_html = f'<div class="pb-stat-icon">{item["icon"]}</div>' if item.get('icon') else ''
        stats_html += (f'<div class="pb-stat-item">{icon_html}'
                       f'<div class="pb-stat-number" style="color:{accent}">{_e(str(item.get("value","")))}</div>'
                       f'<div class="pb-stat-label" style="color:{tc}">{_e(item.get("label",""))}</div></div>')
    return (f'<section class="pb-section" style="background:{bg};padding:{c.get("padding","80px 0")}">'
            f'<div class="pb-container">{header}'
            f'<div class="pb-grid-{min(cols,4)}" style="--gap:32px">{stats_html}</div></div></section>')


def _render_team(c: dict) -> str:
    bg = c.get('backgroundColor', '#ffffff')
    tc = c.get('textColor', '#1a1a1a')
    header = _section_header(c) if c.get('title') else ''
    members = c.get('members', [])
    cols = min(c.get('columns', 4), max(len(members), 1))
    cards_html = ''
    for m in members:
        photo = (f'<img class="pb-team-photo" src="{_e(m["photo"])}" alt="{_e(m.get("name",""))}">'
                 if m.get('photo') else
                 f'<div class="pb-team-photo" style="display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;background:#e5e7eb">{_e(m.get("name","?")[:1])}</div>')
        social = ''.join(
            f'<a href="{_e(s["url"])}" style="color:{c.get("socialColor","#4F7CFF")};font-size:14px;font-weight:500">{_e(s.get("label",""))}</a>'
            for s in m.get('social', [])
        )
        cards_html += (f'<div class="pb-team-card" style="color:{tc}">'
                       f'{photo}'
                       f'<div class="pb-team-name">{_e(m.get("name",""))}</div>'
                       f'<div class="pb-team-role">{_e(m.get("role",""))}</div>'
                       f'{"<p class=pb-team-bio>" + _e(m.get("bio","")) + "</p>" if m.get("bio") else ""}'
                       f'{"<div style=display:flex;gap:12px;justify-content:center;margin-top:12px>" + social + "</div>" if social else ""}'
                       f'</div>')
    return (f'<section class="pb-section" style="background:{bg};padding:{c.get("padding","80px 0")}">'
            f'<div class="pb-container">{header}'
            f'<div class="pb-grid-{min(cols,4)}" style="--gap:28px">{cards_html}</div></div></section>')


def _render_card(c: dict) -> str:
    bg = c.get('backgroundColor', '#ffffff')
    tc = c.get('textColor', '#1a1a1a')
    border = c.get('border', '1px solid #e5e7eb')
    shadow = c.get('shadow', '0 2px 12px rgba(0,0,0,.08)')
    tag_html = (f'<span class="pb-card-tag" style="background:rgba(79,124,255,.1);color:#4F7CFF">{_e(c["tag"])}</span>'
                if c.get('tag') else '')
    img_html = (f'<img class="pb-card-image" src="{_e(c["image"])}" alt="{_e(c.get("imageAlt",""))}">'
                if c.get('image') else '')
    btn_html = _btn_html(c['button']) if c.get('button') else ''
    return (f'<div class="pb-card" style="background:{bg};border:{border};box-shadow:{shadow};color:{tc}">'
            f'{img_html}<div class="pb-card-body">{tag_html}'
            f'<h3 class="pb-card-title">{_e(c.get("title",""))}</h3>'
            f'<p class="pb-card-text">{_e(c.get("text",""))}</p>'
            f'{btn_html}</div></div>')


def _render_cards_grid(c: dict) -> str:
    bg = c.get('backgroundColor', '#ffffff')
    header = _section_header(c) if c.get('title') else ''
    cols = c.get('columns', 3)

    def _adapt_card(card):
        a = dict(card)
        if not a.get('button') and (a.get('link') or a.get('cta')):
            a['button'] = {'href': a.get('link', '#'), 'label': a.get('cta', 'Read more')}
        return a

    cards_html = ''.join(_render_card({**_adapt_card(card), 'id': card.get('id', '')}) for card in c.get('cards', []))
    return (f'<section class="pb-section" style="background:{bg};padding:{c.get("padding","80px 0")}">'
            f'<div class="pb-container">{header}'
            f'<div class="pb-grid-{min(cols,4)}" style="--gap:24px">{cards_html}</div></div></section>')


def _render_gallery(c: dict) -> str:
    bg = c.get('backgroundColor', '#ffffff')
    images = c.get('images', [])
    layout = c.get('galleryLayout', 'grid')
    cols = c.get('columns', 3)
    if layout == 'masonry':
        items_html = ''.join(
            f'<img src="{_e(img.get("src",""))}" alt="{_e(img.get("alt",""))}" loading="lazy">'
            for img in images
        )
        gallery_html = f'<div class="pb-gallery pb-gallery-masonry">{items_html}</div>'
    else:
        items_html = ''.join(
            f'<img src="{_e(img.get("src",""))}" alt="{_e(img.get("alt",""))}" loading="lazy" style="aspect-ratio:{c.get("aspectRatio","16/9")};object-fit:cover">'
            for img in images
        )
        gallery_html = f'<div class="pb-gallery pb-gallery-{min(cols,4)}">{items_html}</div>'
    header = _section_header(c) if c.get('title') else ''
    return (f'<section class="pb-section" style="background:{bg};padding:{c.get("padding","80px 0")}">'
            f'<div class="pb-container">{header}{gallery_html}</div></section>')


def _render_form(c: dict) -> str:
    bg = c.get('backgroundColor', '#ffffff')
    tc = c.get('textColor', '#1a1a1a')
    accent = c.get('accentColor', '#4F7CFF')
    header = _section_header(c) if c.get('title') else ''
    fields = c.get('fields', [])
    fields_html = ''
    for field in fields:
        ftype = field.get('type', 'text')
        label = field.get('label', '')
        placeholder = field.get('placeholder', '')
        required = 'required' if field.get('required') else ''
        if ftype == 'textarea':
            inp = f'<textarea class="pb-textarea" name="{_e(field.get("name","field"))}" placeholder="{_e(placeholder)}" {required} rows="{field.get("rows",4)}"></textarea>'
        elif ftype == 'select':
            opts = ''.join(f'<option value="{_e(o.get("value",""))}">{_e(o.get("label",""))}</option>' for o in field.get('options', []))
            inp = f'<select class="pb-select" name="{_e(field.get("name","field"))}" {required}><option value="">Select...</option>{opts}</select>'
        elif ftype == 'checkbox':
            inp = f'<label style="display:flex;align-items:center;gap:10px;cursor:pointer"><input type="checkbox" name="{_e(field.get("name",""))}" {required}> {_e(label)}</label>'
            fields_html += f'<div class="pb-form-group">{inp}</div>'
            continue
        else:
            inp = f'<input class="pb-input" type="{_e(ftype)}" name="{_e(field.get("name","field"))}" placeholder="{_e(placeholder)}" {required}>'
        fields_html += f'<div class="pb-form-group"><label class="pb-label" style="color:{tc}">{_e(label)}</label>{inp}</div>'

    btn_data = c.get('submitButton', {'label': 'Send Message', 'backgroundColor': accent, 'textColor': '#fff', 'size': 'md'})
    btn_html = _btn_html(btn_data).replace('<a ', '<button type="submit" ').replace('</a>', '</button>')
    action = c.get('action', '')
    method = c.get('method', 'POST')
    max_w = c.get('maxWidth', '560px')
    return (f'<section class="pb-section" style="background:{bg};padding:{c.get("padding","80px 0")}">'
            f'<div class="pb-container">'
            f'<div style="max-width:{max_w};margin-inline:auto">'
            f'{header}'
            f'<form class="pb-form" action="{_e(action)}" method="{_e(method)}">'
            f'{fields_html}{btn_html}</form></div></div></section>')


def _render_footer(c: dict) -> str:
    bg = c.get('backgroundColor', '#0f172a')
    tc = c.get('textColor', '#e5e7eb')
    border_color = c.get('borderColor', 'rgba(255,255,255,.08)')
    logo = c.get('logo', 'Brand')
    logo_color = c.get('logoColor', tc)
    desc = c.get('description', '')
    cols = c.get('columns', [])
    col_count = len(cols) + 1  # +1 for brand
    grid_cols = f'2fr {"1fr " * len(cols)}'.strip() if cols else '1fr'

    col_html = ''
    for col in cols:
        links = ''.join(
            f'<a href="{_e(lnk.get("href","#"))}" style="color:{tc}">{_e(lnk.get("label",""))}</a>'
            for lnk in col.get('links', [])
        )
        col_html += (f'<div><div class="pb-footer-col-title" style="color:{tc}">{_e(col.get("title",""))}</div>'
                     f'<div class="pb-footer-col-links">{links}</div></div>')

    social = c.get('social', [])
    social_html = ''
    for s in social:
        social_html += f'<a href="{_e(s.get("url","#"))}" aria-label="{_e(s.get("label",""))}" style="color:{tc};font-size:20px">{s.get("icon","")}</a>'
    social_div = f'<div style="display:flex;gap:16px;margin-top:16px">{social_html}</div>' if social_html else ''

    copyright = c.get('copyright', '© 2025')
    bottom_links = ''.join(
        f'<a href="{_e(lnk.get("href","#"))}" style="color:{tc}">{_e(lnk.get("label",""))}</a>'
        for lnk in c.get('bottomLinks', [])
    )
    return (f'<footer class="pb-footer" style="background:{bg};color:{tc}">'
            f'<div class="pb-container">'
            f'<div class="pb-footer-grid" style="grid-template-columns:{grid_cols}">'
            f'<div class="pb-footer-brand">'
            f'<div class="pb-footer-logo" style="color:{logo_color}">{_e(logo)}</div>'
            f'{"<p class=pb-footer-desc>" + _e(desc) + "</p>" if desc else ""}'
            f'{social_div}</div>{col_html}</div>'
            f'<div class="pb-footer-bottom" style="border-top-color:{border_color}">'
            f'<span style="color:{tc}">{_e(copyright)}</span>'
            f'<div style="display:flex;gap:20px">{bottom_links}</div></div>'
            f'</div></footer>')


def _render_timeline(c: dict) -> str:
    bg = c.get('backgroundColor', '#ffffff')
    tc = c.get('textColor', '#1a1a1a')
    accent = c.get('accentColor', '#4F7CFF')
    header = _section_header(c) if c.get('title') else ''
    items = c.get('items', [])
    items_html = ''
    for i, item in enumerate(items):
        num = str(i + 1)
        items_html += (f'<div class="pb-timeline-item">'
                       f'<div class="pb-timeline-dot" style="background:{accent};color:#fff">{num}</div>'
                       f'<div class="pb-timeline-content">'
                       f'{"<div class=pb-timeline-date style=color:" + _e(item.get("dateColor",accent)) + ">" + _e(item.get("date","")) + "</div>" if item.get("date") else ""}'
                       f'<div class="pb-timeline-title" style="color:{tc}">{_e(item.get("title",""))}</div>'
                       f'<div class="pb-timeline-text" style="color:{tc}">{_e(item.get("text",""))}</div>'
                       f'</div></div>')
    max_w = c.get('maxWidth', '680px')
    return (f'<section class="pb-section" style="background:{bg};padding:{c.get("padding","80px 0")}">'
            f'<div class="pb-container"><div style="max-width:{max_w};margin-inline:auto">'
            f'{header}<div class="pb-timeline">{items_html}</div></div></div></section>')


def _render_tabs(c: dict) -> str:
    bg = c.get('backgroundColor', '#ffffff')
    tc = c.get('textColor', '#1a1a1a')
    accent = c.get('accentColor', '#4F7CFF')
    tabs = c.get('tabs', [])
    nav_html = ''
    panels_html = ''
    for i, tab in enumerate(tabs):
        tid = f'tab-{c.get("id","")}-{i}'
        active = ' active' if i == 0 else ''
        nav_html += f'<button class="pb-tab-btn{active}" data-tab="{tid}" style="{"color:" + accent if i==0 else ""}">{_e(tab.get("label",""))}</button>'
        content_html = _render_list(tab.get('children', []))
        panels_html += f'<div class="pb-tab-panel{active}" data-tab="{tid}">{content_html}</div>'
    return (f'<section style="background:{bg};padding:{c.get("padding","80px 0")};color:{tc}">'
            f'<div class="pb-container"><div class="pb-tabs-wrapper">'
            f'<div class="pb-tabs-nav">{nav_html}</div>'
            f'{panels_html}</div></div></section>')


def _render_countdown(c: dict) -> str:
    bg = c.get('backgroundColor', '#0f172a')
    tc = c.get('textColor', '#ffffff')
    accent = c.get('accentColor', '#4F7CFF')
    target = c.get('targetDate', '')
    title_html = f'<h2 style="color:{tc};font-size:2rem;font-weight:800;margin-bottom:32px;text-align:center">{_e(c.get("title",""))}</h2>' if c.get('title') else ''
    units = [('days', 'Days'), ('hours', 'Hours'), ('minutes', 'Minutes'), ('seconds', 'Seconds')]
    units_html = ''.join(
        f'<div class="pb-countdown-unit"><span class="pb-countdown-num" data-unit="{u}" style="color:{accent}">00</span><span class="pb-countdown-label" style="color:{tc}">{label}</span></div>'
        for u, label in units
    )
    return (f'<section style="background:{bg};padding:{c.get("padding","80px 0")};text-align:center">'
            f'<div class="pb-container">{title_html}'
            f'<div class="pb-countdown" data-target="{_e(target)}">{units_html}</div></div></section>')


def _render_logo_strip(c: dict) -> str:
    bg = c.get('backgroundColor', '#ffffff')
    label_html = f'<p style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;opacity:.4;margin-bottom:32px;text-align:center">{_e(c.get("label","Trusted by"))}</p>' if c.get('label') else ''
    logos = c.get('logos', [])
    logos_html = ''.join(
        f'<img src="{_e(logo.get("src",""))}" alt="{_e(logo.get("alt",""))}" title="{_e(logo.get("alt",""))}">'
        if logo.get('src') else
        f'<span>{_e(logo.get("name",""))}</span>'
        for logo in logos
    )
    return (f'<section style="background:{bg};padding:{c.get("padding","48px 0")}">'
            f'<div class="pb-container">{label_html}'
            f'<div class="pb-logo-strip">{logos_html}</div></div></section>')


def _render_social_links(c: dict) -> str:
    links = c.get('links', [])
    size = c.get('size', '40px')
    links_html = ''.join(
        f'<a href="{_e(l.get("url","#"))}" aria-label="{_e(l.get("platform",""))}" class="pb-social-link" '
        f'style="width:{size};height:{size};background:{l.get("backgroundColor","rgba(0,0,0,.08)")};color:{l.get("color","#1a1a1a")}">'
        f'{l.get("icon","")}</a>'
        for l in links
    )
    align = c.get('align', 'left')
    return f'<div class="pb-social-links" style="justify-content:{align};{_css(c, skip={"links","size","align"})}">{links_html}</div>'


def _render_banner(c: dict) -> str:
    bg = c.get('backgroundColor', '#4F7CFF')
    tc = c.get('textColor', '#ffffff')
    closeable = c.get('closeable', True)
    close_btn = '<span class="pb-banner-close" onclick="this.closest(\'.pb-banner\').style.display=\'none\'" aria-label="Close">×</span>' if closeable else ''
    link_html = ''
    if c.get('link'):
        link_html = f'<a href="{_e(c["link"])}" style="color:{tc};font-weight:700;text-decoration:underline;margin-left:8px">{_e(c.get("linkLabel","Learn more"))}</a>'
    icon_html = f'<span>{c["icon"]}</span>' if c.get('icon') else ''
    return (f'<div class="pb-banner" style="background:{bg};color:{tc}">'
            f'{icon_html}<span>{_e(c.get("text",""))}</span>{link_html}{close_btn}</div>')


def _render_contact(c: dict) -> str:
    bg = c.get('backgroundColor', '#ffffff')
    tc = c.get('textColor', '#1a1a1a')
    accent = c.get('accentColor', '#4F7CFF')
    header = _section_header(c) if c.get('title') else ''
    items = c.get('items', [])
    items_html = ''.join(
        f'<div class="pb-contact-item">'
        f'<div class="pb-contact-icon" style="color:{accent}">{item.get("icon","📍")}</div>'
        f'<div><strong style="display:block;margin-bottom:4px">{_e(item.get("label",""))}</strong>'
        f'<span style="opacity:.7;font-size:15px">{_e(item.get("value",""))}</span></div></div>'
        for item in items
    )
    return (f'<section class="pb-section" style="background:{bg};color:{tc};padding:{c.get("padding","80px 0")}">'
            f'<div class="pb-container">{header}'
            f'<div class="pb-contact-grid">{items_html}</div></div></section>')


def _render_heading(c: dict) -> str:
    align = c.get('align', 'left')
    center = 'margin-inline:auto;' if align == 'center' else ''
    max_w = c.get('maxWidth', '700px')
    tc = c.get('textColor', 'inherit')
    eyebrow_html = ''
    if c.get('eyebrow'):
        ec = c.get('eyebrowColor', '#4F7CFF')
        eyebrow_html = f'<span class="pb-eyebrow" style="color:{ec};background:rgba(79,124,255,.1)">{_e(c["eyebrow"])}</span>'
    tag = c.get('tag', 'h2')
    if tag not in ('h1','h2','h3','h4','h5','h6'):
        tag = 'h2'
    title_html = f'<{tag} class="pb-section-title" style="color:{tc};text-align:{align}">{_e(c.get("title",""))}</{tag}>'
    sub_html = ''
    if c.get('subtitle'):
        sc = c.get('subtitleColor', tc)
        sub_html = f'<p class="pb-section-subtitle" style="color:{sc};text-align:{align}">{_e(c["subtitle"])}</p>'
    pad = c.get('padding', '0')
    return (f'<div style="padding:{pad};max-width:{max_w};{center}text-align:{align}">'
            f'{eyebrow_html}{title_html}{sub_html}</div>')


def _render_text(c: dict) -> str:
    tag = c.get('tag', 'p')
    if tag not in {'h1','h2','h3','h4','h5','h6','p','span','div'}:
        tag = 'p'
    align = c.get('align', 'left')
    style = _css({**c, 'textAlign': align})
    return f'<{tag} style="{style}">{_e(c.get("content",""))}</{tag}>'


def _render_richtext(c: dict) -> str:
    bg = c.get('backgroundColor', '')
    tc = c.get('textColor', 'inherit')
    pad = c.get('padding', '0')
    max_w = c.get('maxWidth', '')
    style = f'color:{tc};padding:{pad};{"max-width:" + max_w + ";" if max_w else ""}{"background:" + bg + ";" if bg else ""}'
    return f'<div class="pb-richtext" style="{style}">{c.get("html","")}</div>'


def _render_blockquote(c: dict) -> str:
    bg = c.get('backgroundColor', 'rgba(79,124,255,.05)')
    tc = c.get('textColor', '#1a1a1a')
    border_color = c.get('accentColor', '#4F7CFF')
    author_html = ''
    if c.get('author'):
        author_html = f'<cite style="display:block;font-size:14px;margin-top:12px;opacity:.7;font-style:normal">— {_e(c["author"])}</cite>'
    return (f'<blockquote class="pb-blockquote" style="background:{bg};color:{tc};border-left-color:{border_color}">'
            f'{_e(c.get("text",""))}{author_html}</blockquote>')


def _render_code_block(c: dict) -> str:
    bg = c.get('backgroundColor', '#0f172a')
    tc = c.get('textColor', '#e5e7eb')
    lang = c.get('language', '')
    code = _e(c.get('code', ''))
    lang_badge = f'<span class="pb-code-lang">{_e(lang)}</span>' if lang else ''
    return (f'<div class="pb-code-block" style="background:{bg};color:{tc}">'
            f'{lang_badge}<pre><code>{code}</code></pre></div>')


def _render_image(c: dict) -> str:
    src = c.get('src', '')
    alt = c.get('alt', '')
    style = _css(c, skip={'src','alt','link','caption'})
    img = f'<img src="{_e(src)}" alt="{_e(alt)}" loading="lazy" style="{style}">'
    if c.get('caption'):
        img = f'<figure>{img}<figcaption style="font-size:13px;opacity:.6;margin-top:8px;text-align:center">{_e(c["caption"])}</figcaption></figure>'
    return f'<a href="{_e(c["link"])}">{img}</a>' if c.get('link') else img


def _render_video(c: dict) -> str:
    attrs = ' '.join(a for a in ('autoplay','controls','loop','muted','playsinline') if c.get(a))
    poster = f'poster="{_e(c["poster"])}"' if c.get('poster') else ''
    style = _css(c, skip={'src','poster'})
    return f'<video src="{_e(c.get("src",""))}" {attrs} {poster} style="{style}"></video>'


def _render_embed(c: dict) -> str:
    url = c.get('url', '')
    h = c.get('height', '400px')
    br = c.get('borderRadius', '8px')
    title = c.get('title', 'Embedded content')
    return (f'<div style="position:relative;border-radius:{br};overflow:hidden;height:{h}">'
            f'<iframe src="{_e(url)}" title="{_e(title)}" width="100%" height="100%" '
            f'frameborder="0" allowfullscreen loading="lazy" '
            f'style="position:absolute;inset:0;border:0;border-radius:{br}"></iframe></div>')


def _render_icon(c: dict) -> str:
    size = c.get('size', '48px')
    color = c.get('color', '#4F7CFF')
    bg = c.get('backgroundColor', '')
    br = c.get('borderRadius', '12px')
    align = c.get('align', 'left')
    icon_style = (f'width:{size};height:{size};font-size:calc({size}*.55);display:inline-flex;'
                  f'align-items:center;justify-content:center;border-radius:{br};'
                  f'{"background:" + bg + ";" if bg else ""}color:{color}')
    text_html = ''
    if c.get('text'):
        text_html = f'<div style="font-size:14px;margin-top:8px;color:{c.get("textColor","inherit")}">{_e(c["text"])}</div>'
    return (f'<div style="text-align:{align}">'
            f'<span style="{icon_style}">{c.get("icon","★")}</span>'
            f'{text_html}</div>')


def _render_badge(c: dict) -> str:
    bg = c.get('backgroundColor', 'rgba(79,124,255,.1)')
    tc = c.get('textColor', '#4F7CFF')
    br = c.get('borderRadius', '6px')
    border = c.get('border', '')
    return (f'<span style="display:inline-block;padding:{c.get("padding","4px 12px")};'
            f'background:{bg};color:{tc};border-radius:{br};font-size:{c.get("fontSize","13px")};'
            f'font-weight:600;{"border:1px solid " + border + ";" if border else ""}">'
            f'{_e(c.get("text",""))}</span>')


def _render_button(c: dict) -> str:
    return _btn_html(c)


def _render_link(c: dict) -> str:
    ul = 'underline' if c.get('underline', True) else 'none'
    return (f'<a href="{_e(c.get("href","#"))}" target="{_e(c.get("target","_self"))}" '
            f'style="color:{c.get("color","#4F7CFF")};text-decoration:{ul};'
            f'font-size:{c.get("fontSize","inherit")};font-weight:{c.get("fontWeight","400")}">'
            f'{_e(c.get("label","Link"))}</a>')


def _render_divider(c: dict) -> str:
    color = c.get('color', '#e5e7eb')
    thick = c.get('thickness', 1)
    margin = c.get('margin', '16px 0')
    style = c.get('style', 'solid')
    return f'<hr style="border:none;border-top:{thick}px {style} {color};margin:{margin}">'


def _render_spacer(c: dict) -> str:
    h = c.get('height', 32)
    return f'<div style="height:{h}px" aria-hidden="true"></div>' if isinstance(h, int) else f'<div style="height:{h}" aria-hidden="true"></div>'


def _render_section(c: dict) -> str:
    bg_img = (f'background-image:url({_e(c["backgroundImage"])});background-size:{c.get("backgroundSize","cover")};background-position:{c.get("backgroundPosition","center")};'
              if c.get('backgroundImage') else '')
    skip_keys = {'backgroundImage','backgroundSize','backgroundPosition','children','type','id'}
    style = _css(c, skip=skip_keys) + (';' if _css(c, skip=skip_keys) else '') + bg_img
    inner = _render_list(c.get('children', []))
    tag = c.get('htmlTag', 'section')
    return f'<{tag} style="{style}">{inner}</{tag}>'


def _render_container(c: dict) -> str:
    direction = c.get('direction', 'row')
    wrap = 'wrap' if c.get('wrap', True) else 'nowrap'
    align_items = c.get('alignItems', 'stretch')
    justify = c.get('justifyContent', 'flex-start')
    skip = {'direction','wrap','alignItems','justifyContent','children','type','id'}
    style = (f'display:flex;flex-direction:{direction};flex-wrap:{wrap};'
             f'align-items:{align_items};justify-content:{justify};'
             + _css(c, skip=skip))
    inner = _render_list(c.get('children', []))
    return f'<div style="{style}">{inner}</div>'


def _render_columns(c: dict) -> str:
    cols = c.get('columns', [])
    col_count = len(cols) if cols else 2
    gap = c.get('gap', '24px')
    bg = c.get('backgroundColor', '')
    pad = c.get('padding', '0')
    template = c.get('gridTemplate', ' '.join(['1fr'] * col_count))
    outer_style = f'{"background:" + bg + ";" if bg else ""}padding:{pad}'
    grid_style = f'display:grid;grid-template-columns:{template};gap:{gap}'
    cols_html = ''.join(
        f'<div style="{_css(col, skip={"children","type","id"})}">{_render_list(col.get("children", []))}</div>'
        for col in cols
    )
    return (f'<div style="{outer_style}">'
            f'<div class="pb-container"><div style="{grid_style}">{cols_html}</div></div></div>')


def _render_navbar_wrapped(c: dict) -> str:
    return _render_navbar(c)


# ── Dispatch table ────────────────────────────────────────────────────────────

_RENDERERS = {
    # Layout
    'navbar':       _render_navbar_wrapped,
    'section':      _render_section,
    'container':    _render_container,
    'columns':      _render_columns,
    'footer':       _render_footer,
    'divider':      _render_divider,
    'spacer':       _render_spacer,
    'banner':       _render_banner,
    # Content
    'text':         _render_text,
    'heading':      _render_heading,
    'richtext':     _render_richtext,
    'blockquote':   _render_blockquote,
    'code_block':   _render_code_block,
    'icon':         _render_icon,
    'badge':        _render_badge,
    # Media
    'image':        _render_image,
    'video':        _render_video,
    'embed':        _render_embed,
    'gallery':      _render_gallery,
    'logo_strip':   _render_logo_strip,
    # Interactive
    'button':       _render_button,
    'link':         _render_link,
    'social_links': _render_social_links,
    'form':         _render_form,
    'countdown':    _render_countdown,
    # Sections
    'hero':         _render_hero,
    'features':     _render_features,
    'pricing':      _render_pricing,
    'testimonials': _render_testimonials,
    'faq':          _render_faq,
    'cta':          _render_cta,
    'team':         _render_team,
    'stats':        _render_stats,
    'card':         _render_card,
    'cards_grid':   _render_cards_grid,
    'timeline':     _render_timeline,
    'tabs':         _render_tabs,
    'contact':      _render_contact,
}


def _render(c: dict) -> str:
    ctype = c.get('type', '')
    fn = _RENDERERS.get(ctype)
    return fn(c) if fn else f'<!-- unknown component: {_e(ctype)} -->'


def _render_list(components: list) -> str:
    return '\n'.join(_render(c) for c in components if isinstance(c, dict))


# ── API public ────────────────────────────────────────────────────────────────

def build_html(project) -> str:
    meta = project.meta or {}
    title = meta.get('title', project.title)
    desc = meta.get('description', '')
    lang = meta.get('lang', 'en')
    author = meta.get('author', '')
    og_image = meta.get('ogImage', '')
    favicon = meta.get('favicon', '')
    font_url = meta.get('fontUrl', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap')
    body = _render_list(project.layout.get('components', []))

    extra_meta = ''
    if desc:
        extra_meta += f'  <meta name="description" content="{_e(desc)}">\n'
    if author:
        extra_meta += f'  <meta name="author" content="{_e(author)}">\n'
    if og_image:
        extra_meta += f'  <meta property="og:image" content="{_e(og_image)}">\n'
    if title:
        extra_meta += f'  <meta property="og:title" content="{_e(title)}">\n'
    if desc:
        extra_meta += f'  <meta property="og:description" content="{_e(desc)}">\n'
    favicon_tag = f'  <link rel="icon" href="{_e(favicon)}">\n' if favicon else ''
    font_tag = f'  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="stylesheet" href="{_e(font_url)}">\n' if font_url else ''

    return f"""<!DOCTYPE html>
<html lang="{_e(lang)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{_e(title)}</title>
{extra_meta}{favicon_tag}{font_tag}  <link rel="stylesheet" href="styles.css">
</head>
<body>
{body}
<script src="main.js"></script>
</body>
</html>"""


def build_css(project) -> str:
    meta = project.meta or {}
    custom = meta.get('customCSS', '')
    font_family = meta.get('fontFamily', "'Inter', system-ui, -apple-system, sans-serif")
    primary = meta.get('primaryColor', '#4F7CFF')
    text_color = meta.get('textColor', '#1a1a1a')
    bg_color = meta.get('bgColor', '#ffffff')
    vars_css = f""":root {{
  --font: {font_family};
  --primary: {primary};
  --text: {text_color};
  --bg: {bg_color};
  --max-w: {meta.get('maxWidth', '1200px')};
  --section-py: {meta.get('sectionPadding', '80px')};
}}
"""
    return vars_css + BASE_CSS + ('\n/* Custom CSS */\n' + custom if custom else '')


def build_js(project) -> str:
    custom = (project.meta or {}).get('customJS', '')
    return BASE_JS + ('\n\n// Custom JS\n' + custom if custom else '')
