// ── Auth Page (Login + Register) ──────────────────────────────
async function renderAuth() {
  // If already logged in, redirect
  if (Auth.isLoggedIn()) { router.go('/dashboard'); return; }

  document.getElementById('app').innerHTML = `
  <div style="background:#030B14;min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;font-family:Inter,system-ui,sans-serif">

    <!-- ── AMBIENT BG ──────────────────────────────────── -->
    <div style="position:absolute;inset:0;pointer-events:none">
      <div class="cyber-grid" style="position:absolute;inset:0;opacity:.5"></div>
      <div style="position:absolute;top:-15%;left:-10%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(79,124,255,.1),transparent 70%);filter:blur(60px);animation:float-orb 8s ease-in-out infinite"></div>
      <div style="position:absolute;bottom:-20%;right:-10%;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(0,229,255,.07),transparent 70%);filter:blur(70px);animation:float-orb 10s ease-in-out infinite 3s"></div>
      <div style="position:absolute;top:25%;right:8%;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,.08),transparent 70%);filter:blur(50px);animation:float-orb 7s ease-in-out infinite 1.5s"></div>
    </div>

    <!-- ── AUTH CARD ───────────────────────────────────── -->
    <main style="position:relative;z-index:10;width:100%;max-width:440px;margin:24px;background:rgba(6,15,26,.85);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(0,229,255,.1);border-radius:20px;padding:40px;box-shadow:0 40px 100px rgba(0,0,0,.7),0 0 60px rgba(0,229,255,.04)">
      <!-- Top edge glow -->
      <div style="position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.5),transparent);border-radius:1px"></div>

      <!-- Header -->
      <header style="display:flex;flex-direction:column;align-items:center;margin-bottom:36px">
        <div style="width:52px;height:52px;border-radius:13px;background:linear-gradient(135deg,#00C4DD,#006FE8);display:flex;align-items:center;justify-content:center;margin-bottom:20px;box-shadow:0 0 24px rgba(0,229,255,.4)">
          <span class="material-symbols-outlined" style="color:white;font-size:26px;font-variation-settings:'FILL' 1">architecture</span>
        </div>
        <h1 style="font-size:24px;font-weight:800;color:#E8F4FD;margin:0 0 8px;letter-spacing:-.03em" id="auth-title">Welcome back</h1>
        <p style="font-size:14px;color:#4B5563;margin:0;text-align:center" id="auth-subtitle">Sign in to your IWB workspace.</p>
      </header>

      <!-- Tab switcher -->
      <div style="display:flex;padding:4px;background:#030B14;border:1px solid rgba(255,255,255,.06);border-radius:12px;margin-bottom:28px;gap:4px">
        <button id="tab-login" onclick="switchTab('login')"
          style="flex:1;padding:9px;font-size:13px;font-weight:600;border-radius:9px;border:none;cursor:pointer;transition:all .2s;font-family:Inter,sans-serif;background:rgba(0,229,255,.1);color:#00E5FF;border:1px solid rgba(0,229,255,.2);box-shadow:0 0 12px rgba(0,229,255,.1)">
          Sign In
        </button>
        <button id="tab-register" onclick="switchTab('register')"
          style="flex:1;padding:9px;font-size:13px;font-weight:600;border-radius:9px;border:none;cursor:pointer;transition:all .2s;font-family:Inter,sans-serif;background:transparent;color:#374151">
          Register
        </button>
      </div>

      <!-- ── LOGIN FORM ──────────────────────────────── -->
      <form id="login-form" onsubmit="handleLogin(event)" style="display:flex;flex-direction:column;gap:18px">
        <div style="display:flex;flex-direction:column;gap:6px">
          <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#374151" for="login-email">Email Address</label>
          <input id="login-email" type="email" placeholder="name@company.com" required class="input-cyber"/>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#374151" for="login-password">Password</label>
            <a onclick="showToast('Password reset coming soon — contact support for now.','info');return false;" href="#" style="font-size:12px;color:#4F7CFF;text-decoration:none;font-family:JetBrains Mono,monospace;cursor:pointer" onmouseover="this.style.color='#00E5FF'" onmouseout="this.style.color='#4F7CFF'">Forgot?</a>
          </div>
          <input id="login-password" type="password" placeholder="••••••••" required class="input-cyber"/>
        </div>
        <div id="login-error" style="display:none;background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.25);border-radius:8px;padding:10px 14px;color:#ff6b6b;font-size:13px;align-items:center;gap:8px">
          <span class="material-symbols-outlined" style="font-size:16px;flex-shrink:0">error</span>
          <span id="login-error-msg"></span>
        </div>
        <button type="submit" id="login-btn" class="btn-neon"
          style="border:none;color:white;font-size:15px;font-weight:700;padding:13px;border-radius:11px;letter-spacing:-.01em;font-family:Inter,sans-serif;width:100%">
          Sign In
        </button>
      </form>

      <!-- ── REGISTER FORM ──────────────────────────────── -->
      <form id="register-form" onsubmit="handleRegister(event)" style="display:none;flex-direction:column;gap:16px">
        <div style="display:flex;flex-direction:column;gap:6px">
          <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#374151">Username</label>
          <input id="reg-username" type="text" placeholder="yourname" required class="input-cyber"/>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#374151">Email Address</label>
          <input id="reg-email" type="email" placeholder="name@company.com" required class="input-cyber"/>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#374151">Password</label>
          <input id="reg-password" type="password" placeholder="Min. 8 characters" required oninput="updateStrength(this.value)" class="input-cyber"/>
          <!-- Strength bar -->
          <div style="display:flex;gap:4px;margin-top:2px" id="strength-bar">
            <div style="height:3px;flex:1;border-radius:3px;background:#1F2D3D;transition:background .3s" id="s0"></div>
            <div style="height:3px;flex:1;border-radius:3px;background:#1F2D3D;transition:background .3s" id="s1"></div>
            <div style="height:3px;flex:1;border-radius:3px;background:#1F2D3D;transition:background .3s" id="s2"></div>
            <div style="height:3px;flex:1;border-radius:3px;background:#1F2D3D;transition:background .3s" id="s3"></div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#374151">Confirm Password</label>
          <input id="reg-password2" type="password" placeholder="••••••••" required class="input-cyber"/>
        </div>
        <div id="reg-error" style="display:none;background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.25);border-radius:8px;padding:10px 14px;color:#ff6b6b;font-size:13px;align-items:center;gap:8px">
          <span class="material-symbols-outlined" style="font-size:16px;flex-shrink:0">error</span>
          <span id="reg-error-msg"></span>
        </div>
        <button type="submit" id="reg-btn" class="btn-neon"
          style="border:none;color:white;font-size:15px;font-weight:700;padding:13px;border-radius:11px;letter-spacing:-.01em;font-family:Inter,sans-serif;width:100%">
          Create Account
        </button>
      </form>

      <!-- Switch link -->
      <div style="margin-top:28px;text-align:center">
        <p style="font-size:13px;color:#374151;margin:0" id="auth-switch-text">
          Don't have an account? <a href="#" onclick="switchTab('register');return false;" style="color:#00E5FF;text-decoration:none" onmouseover="this.style.color='#4F7CFF'" onmouseout="this.style.color='#00E5FF'">Create workspace</a>
        </p>
      </div>
    </main>
  </div>`;
}

function switchTab(tab) {
  const isLogin = tab === 'login';

  // Tab button styles
  const activeStyle  = 'flex:1;padding:9px;font-size:13px;font-weight:600;border-radius:9px;border:1px solid rgba(0,229,255,.2);cursor:pointer;transition:all .2s;font-family:Inter,sans-serif;background:rgba(0,229,255,.1);color:#00E5FF;box-shadow:0 0 12px rgba(0,229,255,.1)';
  const inactiveStyle = 'flex:1;padding:9px;font-size:13px;font-weight:600;border-radius:9px;border:none;cursor:pointer;transition:all .2s;font-family:Inter,sans-serif;background:transparent;color:#374151';

  document.getElementById('tab-login').style.cssText    = isLogin  ? activeStyle : inactiveStyle;
  document.getElementById('tab-register').style.cssText = !isLogin ? activeStyle : inactiveStyle;

  const lf = document.getElementById('login-form');
  const rf = document.getElementById('register-form');
  if (isLogin) {
    lf.style.display = 'flex'; rf.style.display = 'none';
  } else {
    lf.style.display = 'none'; rf.style.display = 'flex';
  }

  document.getElementById('auth-title').textContent    = isLogin ? 'Welcome back'      : 'Create workspace';
  document.getElementById('auth-subtitle').textContent = isLogin ? 'Sign in to your IWB workspace.' : 'Start building for free today.';
  document.getElementById('auth-switch-text').innerHTML = isLogin
    ? `Don't have an account? <a href="#" onclick="switchTab('register');return false;" style="color:#00E5FF;text-decoration:none">Create workspace</a>`
    : `Already have an account? <a href="#" onclick="switchTab('login');return false;" style="color:#00E5FF;text-decoration:none">Sign in</a>`;
}

function updateStrength(pw) {
  const score = [pw.length>=8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const colors = ['','#EF4444','#F59E0B','#22C55E','#00E5FF'];
  for (let i=0;i<4;i++) {
    const el = document.getElementById('s'+i);
    if (el) el.style.background = i < score ? colors[score] : '#1F2D3D';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const btn    = document.getElementById('login-btn');
  const errDiv = document.getElementById('login-error');
  const errMsg = document.getElementById('login-error-msg');
  btn.textContent = 'Signing in…'; btn.disabled = true;
  errDiv.style.display = 'none';

  const { ok, data } = await authAPI.login(
    document.getElementById('login-email').value,
    document.getElementById('login-password').value
  );

  if (ok) {
    showToast('Welcome back!', 'success');
    router.go('/dashboard');
  } else {
    errMsg.textContent = parseError(data);
    errDiv.style.display = 'flex'; errDiv.style.alignItems = 'center'; errDiv.style.gap = '8px';
    btn.textContent = 'Sign In'; btn.disabled = false;
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const btn    = document.getElementById('reg-btn');
  const errDiv = document.getElementById('reg-error');
  const errMsg = document.getElementById('reg-error-msg');
  btn.textContent = 'Creating…'; btn.disabled = true;
  errDiv.style.display = 'none';

  const { ok, data } = await authAPI.register(
    document.getElementById('reg-username').value,
    document.getElementById('reg-email').value,
    document.getElementById('reg-password').value,
    document.getElementById('reg-password2').value
  );

  if (ok) {
    showToast('Account created! Welcome!', 'success');
    router.go('/dashboard');
  } else {
    errMsg.textContent = parseError(data);
    errDiv.style.display = 'flex'; errDiv.style.alignItems = 'center'; errDiv.style.gap = '8px';
    btn.textContent = 'Create Account'; btn.disabled = false;
  }
}
