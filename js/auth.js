const API_BASE_URL = window.location.origin;

const AuthService = {
  getToken() {
    return sessionStorage.getItem('strong_finance_token') || localStorage.getItem('strong_finance_token');
  },

  getUser() {
    const data = sessionStorage.getItem('strong_finance_user') || localStorage.getItem('strong_finance_user');
    return data ? JSON.parse(data) : null;
  },

  async register(nome, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, password })
      });
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, message: data.error || 'Erro no cadastro.' };
      }

      this.setSession(data.user, data.token);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Erro na requisição de cadastro:', error);
      return { success: false, message: 'Não foi possível conectar ao servidor.' };
    }
  },

  async login(email, password, rememberMe = false) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.error || 'Erro no login.' };
      }

      this.setSession(data.user, data.token, rememberMe);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Erro na requisição de login:', error);
      return { success: false, message: 'Não foi possível conectar ao servidor.' };
    }
  },

  async forgotPassword(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.error || 'Erro ao solicitar recuperação.' };
      }
      return { success: true, message: data.message, debug_token: data.debug_token };
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      return { success: false, message: 'Erro de conexão com o servidor.' };
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.error || 'Erro ao resetar senha.' };
      }
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return { success: false, message: 'Erro de conexão com o servidor.' };
    }
  },

  setSession(user, token, rememberMe = false) {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('strong_finance_token', token);
    storage.setItem('strong_finance_user', JSON.stringify(user));
  },

  async logout() {
    const token = this.getToken();
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.warn('Erro ao notificar logout no servidor:', error);
      }
    }
    
    sessionStorage.removeItem('strong_finance_token');
    sessionStorage.removeItem('strong_finance_user');
    localStorage.removeItem('strong_finance_token');
    localStorage.removeItem('strong_finance_user');
    
    window.location.href = 'login.html';
  },

  isLoggedIn() {
    return this.getToken() !== null;
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};

// Gerenciamento de formulários na página de login
if (document.getElementById('form-login')) {
  const tabs = document.querySelectorAll('.tab');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const formRecover = document.getElementById('form-recover');
  
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');
  const recoverError = document.getElementById('recover-error');
  const recoverSuccess = document.getElementById('recover-success');

  if (AuthService.isLoggedIn()) {
    const user = AuthService.getUser();
    if (user && user.cargo === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'index.html';
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      
      formLogin.classList.toggle('active', target === 'login');
      formRegister.classList.toggle('active', target === 'register');
      formRecover.classList.remove('active');
      
      loginError.textContent = '';
      registerError.textContent = '';
      if (recoverError) recoverError.textContent = '';
    });
  });

  // Mostrar formulário de recuperação
  window.showRecoverForm = function() {
    tabs.forEach(t => t.classList.remove('active'));
    formLogin.classList.remove('active');
    formRegister.classList.remove('active');
    formRecover.classList.add('active');
    recoverError.textContent = '';
    recoverSuccess.textContent = '';
  };

  // Voltar para o login
  window.showLoginForm = function() {
    const loginTab = document.querySelector('.tab[data-tab="login"]');
    if (loginTab) loginTab.click();
  };

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    loginError.style.color = 'var(--danger)';

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = formLogin.querySelector('button[type="submit"]');

    btn.disabled = true;
    btn.textContent = 'Autenticando...';

    const result = await AuthService.login(email, password, true);

    btn.disabled = false;
    btn.textContent = 'Entrar';

    if (result.success) {
      if (result.user.cargo === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'index.html';
      }
    } else {
      loginError.textContent = result.message;
    }
  });

  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.textContent = '';
    registerError.style.color = 'var(--danger)';

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    const btn = formRegister.querySelector('button[type="submit"]');

    if (password !== confirm) {
      registerError.textContent = 'As senhas não coincidem.';
      return;
    }

    if (password.length < 6) {
      registerError.textContent = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Criando Conta...';

    const result = await AuthService.register(name, email, password);

    btn.disabled = false;
    btn.textContent = 'Criar Conta';

    if (result.success) {
      window.location.href = 'index.html';
    } else {
      registerError.textContent = result.message;
    }
  });

  if (formRecover) {
    formRecover.addEventListener('submit', async (e) => {
      e.preventDefault();
      recoverError.textContent = '';
      recoverSuccess.textContent = '';
      
      const email = document.getElementById('recover-email').value.trim();
      const btn = formRecover.querySelector('button[type="submit"]');
      
      btn.disabled = true;
      btn.textContent = 'Enviando...';
      
      const result = await AuthService.forgotPassword(email);
      
      btn.disabled = false;
      btn.textContent = 'Recuperar Senha';
      
      if (result.success) {
        recoverSuccess.innerHTML = `${result.message}<br><br><small style="color: var(--primary)">Código de teste: <code>${result.debug_token}</code></small>`;
        
        // Exibir formulário de redefinição
        document.getElementById('recover-step-1').style.display = 'none';
        document.getElementById('recover-step-2').style.display = 'block';
      } else {
        recoverError.textContent = result.message;
      }
    });

    const formReset = document.getElementById('form-reset-pw');
    if (formReset) {
      formReset.addEventListener('click', async (e) => {
        e.preventDefault();
        const token = document.getElementById('reset-token').value.trim();
        const newPassword = document.getElementById('reset-password').value;
        const confirmPassword = document.getElementById('reset-confirm').value;
        const resetMsg = document.getElementById('reset-error');
        
        resetMsg.textContent = '';
        
        if (newPassword !== confirmPassword) {
          resetMsg.textContent = 'As senhas não coincidem.';
          return;
        }
        if (newPassword.length < 6) {
          resetMsg.textContent = 'Mínimo 6 caracteres.';
          return;
        }
        
        const result = await AuthService.resetPassword(token, newPassword);
        if (result.success) {
          alert('Senha redefinida com sucesso!');
          showLoginForm();
          // Resetar inputs
          document.getElementById('recover-step-1').style.display = 'block';
          document.getElementById('recover-step-2').style.display = 'none';
          document.getElementById('recover-email').value = '';
          document.getElementById('reset-token').value = '';
          document.getElementById('reset-password').value = '';
          document.getElementById('reset-confirm').value = '';
        } else {
          resetMsg.textContent = result.message;
        }
      });
    }
  }
}
