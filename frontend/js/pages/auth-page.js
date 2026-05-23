// ── Auth Page (Login + Register) ──────────────────────────────
async function renderAuth() {
  document.getElementById('app').innerHTML = `
  <div class="bg-background text-on-surface min-h-screen flex items-center justify-center relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
    <!-- Aurora -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-container/20 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-surface-container-high/40 rounded-full blur-[140px]"></div>
      <div class="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-tertiary-container/10 rounded-full blur-[100px]"></div>
    </div>
    <!-- Card -->
    <main class="z-10 w-full max-w-[440px] mx-lg p-xl bg-[#111A2E]/80 backdrop-blur-xl border border-white/5 shadow-[0px_10px_20px_rgba(0,0,0,0.5)] rounded-xl flex flex-col relative">
      <!-- Header -->
      <header class="flex flex-col items-center mb-xl w-full">
        <div class="w-12 h-12 bg-surface-container rounded-lg border border-outline-variant flex items-center justify-center mb-md shadow-[0px_2px_8px_rgba(0,0,0,0.4)]">
          <span class="material-symbols-outlined text-primary" style="font-variation-settings:'FILL' 1">architecture</span>
        </div>
        <h1 class="font-h3 text-h3 text-on-surface mb-xs" id="auth-title">Welcome back</h1>
        <p class="font-body-md text-body-md text-on-surface-variant text-center" id="auth-subtitle">Sign in to your IWB workspace.</p>
      </header>
      <!-- Tab switcher -->
      <div class="flex p-1 bg-[#080E1A] border border-outline-variant rounded-lg mb-lg gap-1">
        <button id="tab-login" onclick="switchTab('login')" class="flex-1 py-2 text-sm font-medium rounded-md bg-surface-container border border-outline-variant text-on-surface shadow-sm transition-all">Sign In</button>
        <button id="tab-register" onclick="switchTab('register')" class="flex-1 py-2 text-sm font-medium rounded-md text-on-surface-variant hover:text-on-surface transition-all">Register</button>
      </div>
      <!-- Login Form -->
      <form id="login-form" onsubmit="handleLogin(event)" class="flex flex-col gap-lg w-full">
        <div class="flex flex-col gap-xs">
          <label class="font-label-caps text-label-caps text-on-surface-variant" for="login-email">Email Address</label>
          <input id="login-email" type="email" placeholder="name@company.com" required
            class="w-full bg-[#0F1729] border border-outline-variant rounded-lg px-md py-[10px] font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"/>
        </div>
        <div class="flex flex-col gap-xs">
          <div class="flex justify-between items-end">
            <label class="font-label-caps text-label-caps text-on-surface-variant" for="login-password">Password</label>
            <a href="#" class="font-code-sm text-code-sm text-primary hover:text-primary-fixed transition-colors">Forgot?</a>
          </div>
          <input id="login-password" type="password" placeholder="••••••••" required
            class="w-full bg-[#0F1729] border border-outline-variant rounded-lg px-md py-[10px] font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"/>
        </div>
        <div id="login-error" class="hidden text-error text-sm flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">error</span><span id="login-error-msg"></span>
        </div>
        <button type="submit" id="login-btn"
          class="w-full py-[10px] px-md bg-primary text-on-primary rounded-lg font-body-md text-body-md hover:bg-primary-fixed hover:shadow-[0_0_12px_rgba(181,196,255,0.25)] transition-all focus:outline-none">
          Sign In
        </button>
      </form>
      <!-- Register Form -->
      <form id="register-form" onsubmit="handleRegister(event)" class="hidden flex-col gap-lg w-full">
        <div class="flex flex-col gap-xs">
          <label class="font-label-caps text-label-caps text-on-surface-variant">Username</label>
          <input id="reg-username" type="text" placeholder="yourname" required
            class="w-full bg-[#0F1729] border border-outline-variant rounded-lg px-md py-[10px] font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"/>
        </div>
        <div class="flex flex-col gap-xs">
          <label class="font-label-caps text-label-caps text-on-surface-variant">Email Address</label>
          <input id="reg-email" type="email" placeholder="name@company.com" required
            class="w-full bg-[#0F1729] border border-outline-variant rounded-lg px-md py-[10px] font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"/>
        </div>
        <div class="flex flex-col gap-xs">
          <label class="font-label-caps text-label-caps text-on-surface-variant">Password</label>
          <input id="reg-password" type="password" placeholder="Min. 8 characters" required oninput="updateStrength(this.value)"
            class="w-full bg-[#0F1729] border border-outline-variant rounded-lg px-md py-[10px] font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"/>
          <div class="flex gap-1 mt-1" id="strength-bar">
            <div class="h-[3px] flex-1 rounded-full bg-outline-variant" id="s0"></div>
            <div class="h-[3px] flex-1 rounded-full bg-outline-variant" id="s1"></div>
            <div class="h-[3px] flex-1 rounded-full bg-outline-variant" id="s2"></div>
            <div class="h-[3px] flex-1 rounded-full bg-outline-variant" id="s3"></div>
          </div>
        </div>
        <div class="flex flex-col gap-xs">
          <label class="font-label-caps text-label-caps text-on-surface-variant">Confirm Password</label>
          <input id="reg-password2" type="password" placeholder="••••••••" required
            class="w-full bg-[#0F1729] border border-outline-variant rounded-lg px-md py-[10px] font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"/>
        </div>
        <div id="reg-error" class="hidden text-error text-sm flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">error</span><span id="reg-error-msg"></span>
        </div>
        <button type="submit" id="reg-btn"
          class="w-full py-[10px] px-md bg-primary text-on-primary rounded-lg font-body-md text-body-md hover:bg-primary-fixed transition-all">
          Create Account
        </button>
      </form>
      <!-- Footer link -->
      <div class="mt-xl text-center w-full">
        <p class="font-body-sm text-body-sm text-on-surface-variant" id="auth-switch-text">
          Don't have an account? <a href="#" onclick="switchTab('register')" class="text-primary hover:text-primary-fixed transition-colors">Create workspace</a>
        </p>
      </div>
    </main>
  </div>`;

  // If already logged in, redirect
  if (Auth.isLoggedIn()) { router.go('/dashboard'); return; }
}

function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('tab-login').className = `flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin?'bg-surface-container border border-outline-variant text-on-surface shadow-sm':'text-on-surface-variant hover:text-on-surface'}`;
  document.getElementById('tab-register').className = `flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin?'bg-surface-container border border-outline-variant text-on-surface shadow-sm':'text-on-surface-variant hover:text-on-surface'}`;
  document.getElementById('login-form').className = isLogin ? 'flex flex-col gap-lg w-full' : 'hidden';
  document.getElementById('register-form').className = !isLogin ? 'flex flex-col gap-lg w-full' : 'hidden';
  document.getElementById('auth-title').textContent = isLogin ? 'Welcome back' : 'Create workspace';
  document.getElementById('auth-subtitle').textContent = isLogin ? 'Sign in to your IWB workspace.' : 'Start building for free today.';
  document.getElementById('auth-switch-text').innerHTML = isLogin
    ? `Don't have an account? <a href="#" onclick="switchTab('register')" class="text-primary hover:text-primary-fixed transition-colors">Create workspace</a>`
    : `Already have an account? <a href="#" onclick="switchTab('login')" class="text-primary hover:text-primary-fixed transition-colors">Sign in</a>`;
}

function updateStrength(pw) {
  const score = [pw.length>=8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const colors = ['','#EF4444','#F59E0B','#22C55E','#22C55E'];
  for (let i=0;i<4;i++) {
    const el = document.getElementById('s'+i);
    if (el) el.style.background = i < score ? colors[score] : '#434654';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const errDiv = document.getElementById('login-error');
  const errMsg = document.getElementById('login-error-msg');
  btn.textContent = 'Signing in…'; btn.disabled = true;
  errDiv.classList.add('hidden');

  const { ok, data } = await authAPI.login(
    document.getElementById('login-email').value,
    document.getElementById('login-password').value
  );

  if (ok) {
    showToast('Welcome back!', 'success');
    router.go('/dashboard');
  } else {
    errMsg.textContent = parseError(data);
    errDiv.classList.remove('hidden');
    btn.textContent = 'Sign In'; btn.disabled = false;
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('reg-btn');
  const errDiv = document.getElementById('reg-error');
  const errMsg = document.getElementById('reg-error-msg');
  btn.textContent = 'Creating…'; btn.disabled = true;
  errDiv.classList.add('hidden');

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
    errDiv.classList.remove('hidden');
    btn.textContent = 'Create Account'; btn.disabled = false;
  }
}
