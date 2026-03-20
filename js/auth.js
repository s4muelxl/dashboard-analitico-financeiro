const USERS_KEY = 'finance_dashboard_users';
const SESSION_KEY = 'finance_dashboard_session';

const AuthService = {
  getUsers() {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'h_' + Math.abs(hash).toString(36) + '_' + password.length;
  },

  register(name, email, password) {
    const users = this.getUsers();

    if (users.find(u => u.email === email)) {
      return { success: false, message: 'E-mail já cadastrado.' };
    }

    const user = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      name,
      email,
      password: this.hashPassword(password),
      createdAt: new Date().toISOString()
    };

    users.push(user);
    this.saveUsers(users);
    this.setSession(user);

    return { success: true, user };
  },

  login(email, password) {
    const users = this.getUsers();
    const hashed = this.hashPassword(password);
    const user = users.find(u => u.email === email && u.password === hashed);

    if (!user) {
      return { success: false, message: 'E-mail ou senha incorretos.' };
    }

    this.setSession(user);
    return { success: true, user };
  },

  setSession(user) {
    const session = {
      userId: user.id,
      name: user.name,
      email: user.email,
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  getSession() {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  isLoggedIn() {
    return this.getSession() !== null;
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};

if (document.getElementById('form-login')) {
  const tabs = document.querySelectorAll('.tab');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');

  if (AuthService.isLoggedIn()) {
    window.location.href = 'index.html';
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      formLogin.classList.toggle('active', target === 'login');
      formRegister.classList.toggle('active', target === 'register');
      loginError.textContent = '';
      registerError.textContent = '';
    });
  });

  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    loginError.textContent = '';

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const result = AuthService.login(email, password);

    if (result.success) {
      window.location.href = 'index.html';
    } else {
      loginError.textContent = result.message;
    }
  });

  formRegister.addEventListener('submit', (e) => {
    e.preventDefault();
    registerError.textContent = '';

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;

    if (password !== confirm) {
      registerError.textContent = 'As senhas não coincidem.';
      return;
    }

    if (password.length < 6) {
      registerError.textContent = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }

    const result = AuthService.register(name, email, password);

    if (result.success) {
      window.location.href = 'index.html';
    } else {
      registerError.textContent = result.message;
    }
  });
}
